const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0.01, 'Bid amount must be at least $0.01']
  },
  // Simple status tracking
  status: {
    type: String,
    enum: ['active', 'outbid', 'winning', 'won', 'lost'],
    default: 'active'
  },
  // For tracking bid time
  bidTime: {
    type: Date,
    default: Date.now
  },
  // Auto bid flag (for future auto-bidding feature)
  isAutoBid: {
    type: Boolean,
    default: false
  },
  // Bid increment amount
  increment: {
    type: Number,
    default: 1.00
  }
}, {
  timestamps: true // This gives us bidTime automatically as createdAt
});

// Index for better performance
bidSchema.index({ item: 1, amount: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });
bidSchema.index({ status: 1 });

// Static method to find user's bids
bidSchema.statics.findUserBids = function(userId) {
  return this.find({ bidder: userId })
    .populate('item', 'name photo currentBid auctionEndDate status category')
    .populate('bidder', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find item's bids
bidSchema.statics.findItemBids = function(itemId) {
  return this.find({ item: itemId })
    .populate('bidder', 'name profileImage')
    .sort({ amount: -1 });
};

// Static method to find highest bid for an item
bidSchema.statics.findHighestBid = function(itemId) {
  return this.findOne({ item: itemId })
    .sort({ amount: -1 })
    .populate('bidder', 'name');
};

// Static method to get bid history for an item
bidSchema.statics.getBidHistory = function(itemId, limit = 10) {
  return this.find({ item: itemId })
    .populate('bidder', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to check if bid is winning
bidSchema.methods.isWinning = function() {
  return this.status === 'active' || this.status === 'winning';
};

// Pre save middleware to update previous bids
bidSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Mark all previous bids for this item as outbid
    await this.constructor.updateMany(
      { 
        item: this.item, 
        _id: { $ne: this._id },
        status: 'active' 
      },
      { status: 'outbid' }
    );
  }
  next();
});

module.exports = mongoose.model('Bid', bidSchema);