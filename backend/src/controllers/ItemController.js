const { validationResult } = require('express-validator');
const Item = require('../models/Item');
const User = require('../models/User');

// @desc    Get all active items with optional filtering
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = 'newest' } = req.query;
    
    // Build filter object
    let filter = { status: 'active', auctionEndDate: { $gt: new Date() } };
    
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'price-low':
        sortObj = { currentBid: 1 };
        break;
      case 'price-high':
        sortObj = { currentBid: -1 };
        break;
      case 'ending-soon':
        sortObj = { auctionEndDate: 1 };
        break;
      case 'most-bids':
        sortObj = { bidCount: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get items
    const items = await Item.find(filter)
      .populate('seller', 'name profileImage rating')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Item.countDocuments(filter);
    
    // Add timeLeft to each item
    const itemsWithTimeLeft = items.map(item => ({
      ...item.toObject(),
      timeLeft: item.timeLeft
    }));
    
    res.json({
      success: true,
      data: {
        items: itemsWithTimeLeft,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: items.length,
          totalItems: total
        },
        filters: {
          category,
          search,
          sort
        }
      }
    });
    
  } catch (error) {
    console.error('💥 Get items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items'
    });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name rating memberSince profileImage')
      .populate('winner', 'name');
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Increment view count
    item.views += 1;
    await item.save();
    
    // Add timeLeft
    const itemData = {
      ...item.toObject(),
      timeLeft: item.timeLeft,
      minimumNextBid: item.minimumNextBid
    };
    
    res.json({
      success: true,
      data: { item: itemData }
    });
    
  } catch (error) {
    console.error('💥 Get item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching item'
    });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private (requires authentication)
const createItem = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { name, description, startingPrice, category, auctionEndDate, photo } = req.body;
    
    // Get seller from authenticated user
    const sellerId = req.user ? req.user.id : req.body.sellerId;
    
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }
    
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    // Create item
    const item = new Item({
      name,
      description,
      startingPrice,
      category,
      auctionEndDate: new Date(auctionEndDate),
      photo: photo || 'https://via.placeholder.com/300x300?text=No+Image',
      seller: sellerId
    });
    
    await item.save();
    
    // Populate seller info for response
    await item.populate('seller', 'name profileImage');
    
    console.log('✅ Item created:', item._id);
    
    res.status(201).json({
      success: true,
      message: 'Item listed successfully!',
      data: { item }
    });
    
  } catch (error) {
    console.error('💥 Create item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating item'
    });
  }
};

// @desc    Update item (seller only)
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Check if user is the seller
    if (req.user && item.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    // Check if auction is still active and no bids
    if (item.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit item that has bids'
      });
    }
    
    // Update allowed fields
    const { name, description, startingPrice, category, auctionEndDate, photo } = req.body;
    
    item.name = name || item.name;
    item.description = description || item.description;
    item.startingPrice = startingPrice || item.startingPrice;
    item.currentBid = startingPrice || item.currentBid; // Reset current bid
    item.category = category || item.category;
    if (auctionEndDate) item.auctionEndDate = new Date(auctionEndDate);
    if (photo) item.photo = photo;
    
    await item.save();
    await item.populate('seller', 'name profileImage');
    
    res.json({
      success: true,
      message: 'Item updated successfully',
      data: { item }
    });
    
  } catch (error) {
    console.error('💥 Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating item'
    });
  }
};

// @desc    Delete item (seller only, no bids)
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    
    // Check if user is the seller
    if (req.user && item.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    // Check if item has bids
    if (item.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item that has bids'
      });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
    
  } catch (error) {
    console.error('💥 Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item'
    });
  }
};

// @desc    Get featured items
// @route   GET /api/items/featured
// @access  Public
const getFeaturedItems = async (req, res) => {
  try {
    const items = await Item.find({
      status: 'active',
      auctionEndDate: { $gt: new Date() },
      isFeatured: true
    })
    .populate('seller', 'name profileImage rating')
    .sort({ createdAt: -1 })
    .limit(10);

    const itemsWithTimeLeft = items.map(item => ({
      ...item.toObject(),
      timeLeft: item.timeLeft
    }));

    res.json({
      success: true,
      data: { items: itemsWithTimeLeft }
    });
  } catch (error) {
    console.error('💥 Get featured items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured items'
    });
  }
};

// @desc    Get ending soon items
// @route   GET /api/items/ending-soon
// @access  Public
const getEndingSoon = async (req, res) => {
  try {
    const items = await Item.findEndingSoon(24) // 24 hours
      .populate('seller', 'name profileImage')
      .limit(10);

    const itemsWithTimeLeft = items.map(item => ({
      ...item.toObject(),
      timeLeft: item.timeLeft
    }));

    res.json({
      success: true,
      data: { items: itemsWithTimeLeft }
    });
  } catch (error) {
    console.error('💥 Get ending soon items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ending soon items'
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getFeaturedItems,
  getEndingSoon
};