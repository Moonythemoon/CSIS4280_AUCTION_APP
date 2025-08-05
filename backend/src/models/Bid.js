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
  }
}, {
  timestamps: true // This gives us bidTime automatically as createdAt
});

// Index for better performance
bidSchema.index({ item: 1, amount: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });

// Static method to find user's bids
bidSchema.statics.findUserBids = function(userId) {
  return this.find({ bidder: userId })
    .populate('item', 'name photo currentBid auctionEndDate status')
    .sort({ createdAt: -1 });
};

// Static method to find item's bids
bidSchema.statics.findItemBids = function(itemId) {
  return this.find({ item: itemId })
    .populate('bidder', 'name')
    .sort({ amount: -1 });
};

module.exports = mongoose.model('Bid', bidSchema);