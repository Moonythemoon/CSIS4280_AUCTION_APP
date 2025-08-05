const express = require('express');
const { body, validationResult } = require('express-validator');
const Item = require('../models/Item');
const User = require('../models/User');

const router = express.Router();

// Validation rules
const itemValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('startingPrice')
    .isFloat({ min: 0.01 })
    .withMessage('Starting price must be at least $0.01'),
  body('category')
    .isIn(['Electronics', 'Fashion', 'Home'])
    .withMessage('Category must be Electronics, Fashion, or Home'),
  body('auctionEndDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
];

// @route   GET /api/items
// @desc    Get all active items with optional filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
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
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get items
    const items = await Item.find(filter)
      .populate('seller', 'name')
      .sort({ createdAt: -1 })
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
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'name rating memberSince')
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
      timeLeft: item.timeLeft
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
});

// @route   POST /api/items
// @desc    Create new item (requires authentication - simplified for now)
// @access  Public (should be private with auth middleware)
router.post('/', itemValidation, async (req, res) => {
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
    
    const { name, description, startingPrice, category, auctionEndDate, photo, sellerId } = req.body;
    
    // Validate seller exists (simplified - normally from auth token)
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
    await item.populate('seller', 'name');
    
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
});

// @route   PUT /api/items/:id
// @desc    Update item (seller only)
// @access  Public (should be private)
router.put('/:id', itemValidation, async (req, res) => {
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
    
    // Check if auction is still active and no bids
    if (item.bidCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit item that has bids'
      });
    }
    
    // Update allowed fields
    const { name, description, startingPrice, category, auctionEndDate, photo } = req.body;
    
    item.name = name;
    item.description = description;
    item.startingPrice = startingPrice;
    item.currentBid = startingPrice; // Reset current bid
    item.category = category;
    item.auctionEndDate = new Date(auctionEndDate);
    if (photo) item.photo = photo;
    
    await item.save();
    await item.populate('seller', 'name');
    
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
});

// @route   DELETE /api/items/:id
// @desc    Delete item (seller only, no bids)
// @access  Public (should be private)
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
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
});

module.exports = router;