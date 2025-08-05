const express = require('express');
const { body, validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Item = require('../models/Item');
const User = require('../models/User');

const router = express.Router();

// Validation rules
const bidValidation = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Bid amount must be at least $0.01'),
  body('itemId')
    .isMongoId()
    .withMessage('Valid item ID is required'),
  body('bidderId')
    .isMongoId()
    .withMessage('Valid bidder ID is required')
];

// @route   POST /api/bids
// @desc    Place a new bid
// @access  Public (should be private with auth)
router.post('/', bidValidation, async (req, res) => {
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

    const { amount, itemId, bidderId } = req.body;

    // Check if item exists and is active
    const item = await Item.findById(itemId);
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
    if (item.seller.toString() === bidderId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own item'
      });
    }

    // Check if bid amount is higher than current bid
    if (amount <= item.currentBid) {
      return res.status(400).json({
        success: false,
        message: `Bid must be higher than current bid of $${item.currentBid}`
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
    item.currentBid = amount;
    item.bidCount += 1;
    await item.save();

    // 4. Update user's successful bids count
    bidder.successfulBids += 1;
    await bidder.save();

    console.log('✅ Bid placed successfully:', bid._id);

    // Populate bid data for response
    await bid.populate('bidder', 'name');
    await bid.populate('item', 'name photo');

    res.status(201).json({
      success: true,
      message: 'Bid placed successfully!',
      data: { bid }
    });

  } catch (error) {
    console.error('💥 Place bid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing bid'
    });
  }
});

// @route   GET /api/bids/item/:itemId
// @desc    Get all bids for an item
// @access  Public
router.get('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Get bids for the item
    const bids = await Bid.findItemBids(itemId);

    res.json({
      success: true,
      data: { 
        bids,
        itemName: item.name,
        currentBid: item.currentBid,
        bidCount: item.bidCount
      }
    });

  } catch (error) {
    console.error('💥 Get item bids error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item bids'
    });
  }
});

// @route   GET /api/bids/user/:userId
// @desc    Get all bids by a user
// @access  Public (should be private)
router.get('/user/:userId', async (req, res) => {
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

    // Get user's bids
    const bids = await Bid.findUserBids(userId);

    // Separate active and past bids
    const activeBids = bids.filter(bid => 
      bid.item.status === 'active' && bid.item.auctionEndDate > new Date()
    );
    
    const pastBids = bids.filter(bid => 
      bid.item.status !== 'active' || bid.item.auctionEndDate <= new Date()
    );

    res.json({
      success: true,
      data: { 
        activeBids,
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
});

// @route   GET /api/bids/user/:userId/winning
// @desc    Get items user is currently winning
// @access  Public (should be private)
router.get('/user/:userId/winning', async (req, res) => {
  try {
    const { userId } = req.params;

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
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });

    // Filter out null items (where populate didn't match)
    const validWinningBids = winningBids.filter(bid => bid.item !== null);

    res.json({
      success: true,
      data: { 
        winningBids: validWinningBids,
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
});

module.exports = router;