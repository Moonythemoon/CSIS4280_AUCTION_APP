const { validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Place a new bid
// @route   POST /api/bids
// @access  Private (requires authentication)
const placeBid = async (req, res) => {
  try {
    console.log('🔨 Bid attempt:', req.body);

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount, itemId } = req.body;
    const bidderId = req.user ? req.user.id : req.body.bidderId;

    if (!bidderId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to place bids'
      });
    }

    // Check if item exists and is active
    const item = await Item.findById(itemId).populate('seller', 'name');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    if (!item.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Auction has ended or item is not active'
      });
    }

    // Check if bidder exists
    const bidder = await User.findById(bidderId);
    if (!bidder) {
      return res.status(404).json({
        success: false,
        message: 'Bidder not found'
      });
    }

    // Check if bidder is not the seller
    if (item.seller._id.toString() === bidderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own item'
      });
    }

    // Check if bid amount is higher than current bid
    const minimumBid = item.currentBid + item.minBidIncrement;
    if (amount < minimumBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be at least $${minimumBid.toFixed(2)} (current bid + $${item.minBidIncrement} increment)`
      });
    }

    // Start transaction-like operation
    // 1. Mark previous highest bids as outbid
    await Bid.updateMany(
      { item: itemId, status: 'active' },
      { status: 'outbid' }
    );

    // 2. Create new bid
    const bid = new Bid({
      item: itemId,
      bidder: bidderId,
      amount: amount,
      status: 'active'
    });

    await bid.save();

    // 3. Update item with new current bid
    await item.updateBid(amount);

    // 4. Update user's successful bids count (only increment if this is their first bid on this item)
    const userPreviousBids = await Bid.countDocuments({ 
      item: itemId, 
      bidder: bidderId, 
      _id: { $ne: bid._id } 
    });
    
    if (userPreviousBids === 0) {
      bidder.successfulBids += 1;
      await bidder.save();
    }

    console.log('✅ Bid placed successfully:', bid._id);

    // Populate bid data for response
    await bid.populate('bidder', 'name profileImage');
    await bid.populate('item', 'name photo currentBid');

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully!',
      data: { 
        bid,
        newCurrentBid: item.currentBid,
        bidCount: item.bidCount,
        minimumNextBid: item.minimumNextBid
      }
    });

  } catch (error) {
    console.error('💥 Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing bid'
    });
  }
};

// @desc    Get all bids for an item
// @route   GET /api/bids/item/:itemId
// @access  Public
const getItemBids = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get bids for the item
    const bids = await Bid.find({ item: itemId })
      .populate('bidder', 'name profileImage')
      .sort({ amount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBids = await Bid.countDocuments({ item: itemId });

    res.json({
      success: true,
      data: { 
        bids,
        itemName: item.name,
        currentBid: item.currentBid,
        bidCount: item.bidCount,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalBids / limit),
          count: bids.length,
          totalBids
        }
      }
    });

  } catch (error) {
    console.error('💥 Get item bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item bids'
    });
  }
};

// @desc    Get all bids by a user
// @route   GET /api/bids/user/:userId
// @access  Private (should check if user is requesting their own bids)
const getUserBids = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Authorization check (user can only see their own bids unless admin)
    if (req.user && req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these bids'
      });
    }

    // Get user's bids
    const bids = await Bid.findUserBids(userId);

    // Separate active and past bids
    const now = new Date();
    const activeBids = bids.filter(bid => 
      bid.item && bid.item.status === 'active' && bid.item.auctionEndDate > now
    );
    
    const pastBids = bids.filter(bid => 
      !bid.item || bid.item.status !== 'active' || bid.item.auctionEndDate <= now
    );

    // Add time left to active bids
    const activeBidsWithTimeLeft = activeBids.map(bid => ({
      ...bid.toObject(),
      item: {
        ...bid.item.toObject(),
        timeLeft: bid.item.timeLeft
      }
    }));

    res.json({
      success: true,
      data: { 
        activeBids: activeBidsWithTimeLeft,
        pastBids,
        totalBids: bids.length,
        userName: user.name
      }
    });

  } catch (error) {
    console.error('💥 Get user bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user bids'
    });
  }
};

// @desc    Get items user is currently winning
// @route   GET /api/bids/user/:userId/winning
// @access  Private
const getWinningBids = async (req, res) => {
  try {
    const { userId } = req.params;

    // Authorization check
    if (req.user && req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these bids'
      });
    }

    // Find items where user has the highest bid and auction is active
    const winningBids = await Bid.find({ 
      bidder: userId, 
      status: 'active' 
    })
    .populate({
      path: 'item',
      match: { 
        status: 'active', 
        auctionEndDate: { $gt: new Date() } 
      },
      populate: {
        path: 'seller',
        select: 'name profileImage'
      }
    })
    .sort({ createdAt: -1 });

    // Filter out null items (where populate didn't match)
    const validWinningBids = winningBids.filter(bid => bid.item !== null);

    // Add time left to items
    const winningBidsWithTimeLeft = validWinningBids.map(bid => ({
      ...bid.toObject(),
      item: {
        ...bid.item.toObject(),
        timeLeft: bid.item.timeLeft
      }
    }));

    res.json({
      success: true,
      data: { 
        winningBids: winningBidsWithTimeLeft,
        count: validWinningBids.length
      }
    });

  } catch (error) {
    console.error('💥 Get winning bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching winning bids'
    });
  }
};

// @desc    Get bid history for an item
// @route   GET /api/bids/item/:itemId/history
// @access  Public
const getBidHistory = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { limit = 20 } = req.query;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get bid history
    const bidHistory = await Bid.getBidHistory(itemId, parseInt(limit));

    res.json({
      success: true,
      data: {
        bidHistory,
        itemName: item.name,
        totalBids: await Bid.countDocuments({ item: itemId })
      }
    });

  } catch (error) {
    console.error('💥 Get bid history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bid history'
    });
  }
};

// @desc    Delete/Cancel a bid (only if it's the latest and within time limit)
// @route   DELETE /api/bids/:bidId
// @access  Private
const deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('item');
    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check if user owns the bid
    if (req.user && bid.bidder.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this bid'
      });
    }

    // Check if bid is still active
    if (bid.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel active bids'
      });
    }

    // Check if bid was placed within last 5 minutes (configurable)
    const timeSinceBid = Date.now() - bid.createdAt.getTime();
    const maxCancelTime = 5 * 60 * 1000; // 5 minutes

    if (timeSinceBid > maxCancelTime) {
      return res.status(400).json({
        success: false,
        message: 'Bid can only be cancelled within 5 minutes of placement'
      });
    }

    // Find the previous highest bid
    const previousBid = await Bid.findOne({
      item: bid.item._id,
      _id: { $ne: bid._id },
      createdAt: { $lt: bid.createdAt }
    }).sort({ amount: -1 });

    // Delete the current bid
    await Bid.findByIdAndDelete(bidId);

    // Update item with previous bid or starting price
    const item = bid.item;
    if (previousBid) {
      item.currentBid = previousBid.amount;
      previousBid.status = 'active';
      await previousBid.save();
    } else {
      item.currentBid = item.startingPrice;
    }
    
    item.bidCount = Math.max(0, item.bidCount - 1);
    await item.save();

    res.json({
      success: true,
      message: 'Bid cancelled successfully',
      data: {
        newCurrentBid: item.currentBid,
        newBidCount: item.bidCount
      }
    });

  } catch (error) {
    console.error('💥 Delete bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling bid'
    });
  }
};

module.exports = {
  placeBid,
  getItemBids,
  getUserBids,
  getWinningBids,
  getBidHistory,
  deleteBid
};