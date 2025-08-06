const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electronics', 'Fashion', 'Home'],
    default: 'Home'
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0.01, 'Starting price must be at least $0.01']
  },
  currentBid: {
    type: Number,
    default: function() {
      return this.startingPrice;
    }
  },
  bidCount: {
    type: Number,
    default: 0
  },
  // Minimum bid increment
  minBidIncrement: {
    type: Number,
    default: 1.00
  },
  // Single photo URL (simplified - no multiple photos)
  photo: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=No+Image'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Auction timing
  auctionStartDate: {
    type: Date,
    default: Date.now
  },
  auctionEndDate: {
    type: Date,
    required: [true, 'Auction end date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Auction end date must be in the future'
    }
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled', 'sold'],
    default: 'active'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winningBid: {
    type: Number,
    default: null
  },
  // Basic tracking
  views: {
    type: Number,
    default: 0
  },
  // Featured item flag
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Condition of the item
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  // Location
  location: {
    type: String,
    default: 'Not specified'
  }
}, {
  timestamps: true
});

// Indexes for better performance
itemSchema.index({ status: 1, auctionEndDate: 1 });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ seller: 1 });
itemSchema.index({ name: 'text', description: 'text' });

// Virtual for time left calculation
itemSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const endDate = new Date(this.auctionEndDate);
  const timeDiff = endDate - now;
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, expired: false };
});

// Virtual for minimum next bid
itemSchema.virtual('minimumNextBid').get(function() {
  return this.currentBid + this.minBidIncrement;
});

// Static method to find active auctions
itemSchema.statics.findActiveAuctions = function(filters = {}) {
  return this.find({
    status: 'active',
    auctionEndDate: { $gt: new Date() },
    ...filters
  }).populate('seller', 'name profileImage rating');
};

// Static method to find ending soon auctions
itemSchema.statics.findEndingSoon = function(hours = 24) {
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + hours);
  
  return this.find({
    status: 'active',
    auctionEndDate: { 
      $gt: new Date(),
      $lte: endTime 
    }
  }).populate('seller', 'name');
};

// Static method to search items
itemSchema.statics.searchItems = function(query, filters = {}) {
  const searchFilter = {
    status: 'active',
    auctionEndDate: { $gt: new Date() },
    ...filters
  };

  if (query) {
    searchFilter.$text = { $search: query };
  }

  return this.find(searchFilter)
    .populate('seller', 'name')
    .sort(query ? { score: { $meta: 'textScore' } } : { createdAt: -1 });
};

// Instance method to check if auction is active
itemSchema.methods.isActive = function() {
  return this.status === 'active' && this.auctionEndDate > new Date();
};

// Instance method to end auction
itemSchema.methods.endAuction = async function() {
  this.status = 'ended';
  
  // Find the winning bid
  const Bid = mongoose.model('Bid');
  const winningBid = await Bid.findOne({ item: this._id })
    .sort({ amount: -1 })
    .populate('bidder');
  
  if (winningBid) {
    this.winner = winningBid.bidder._id;
    this.winningBid = winningBid.amount;
    this.status = 'sold';
    
    // Update winning bid status
    winningBid.status = 'won';
    await winningBid.save();
    
    // Update other bids as lost
    await Bid.updateMany(
      { item: this._id, _id: { $ne: winningBid._id } },
      { status: 'lost' }
    );
  }
  
  return this.save();
};

// Pre save middleware
itemSchema.pre('save', function(next) {
  // Set auction start date if not set
  if (!this.auctionStartDate) {
    this.auctionStartDate = new Date();
  }
  
  // Initialize currentBid with startingPrice if not set
  if (!this.currentBid) {
    this.currentBid = this.startingPrice;
  }
  
  next();
});

// Method to update current bid
itemSchema.methods.updateBid = async function(newBidAmount) {
  this.currentBid = newBidAmount;
  this.bidCount += 1;
  return this.save();
};

module.exports = mongoose.model('Item', itemSchema);