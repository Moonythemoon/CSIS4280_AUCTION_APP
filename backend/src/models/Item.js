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
  // Simple auction timing
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
  // Simple status
  status: {
    type: String,
    enum: ['active', 'ended', 'cancelled'],
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
  }
}, {
  timestamps: true
});

// Simple virtual for days/hours left
itemSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const endDate = new Date(this.auctionEndDate);
  const timeDiff = endDate - now;
  
  if (timeDiff <= 0) {
    return { days: 0, hours: 0, expired: true };
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  return { days, hours, expired: false };
});

// Static method to find active auctions
itemSchema.statics.findActiveAuctions = function(filters = {}) {
  return this.find({
    status: 'active',
    auctionEndDate: { $gt: new Date() },
    ...filters
  }).populate('seller', 'name');
};

// Instance method to check if auction is active
itemSchema.methods.isActive = function() {
  return this.status === 'active' && this.auctionEndDate > new Date();
};

module.exports = mongoose.model('Item', itemSchema);