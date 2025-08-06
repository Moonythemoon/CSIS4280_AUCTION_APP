// src/scripts/seedDatabase.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Bid = require('../models/Bid');
require('dotenv').config();

const seedData = {
  users: [
    {
      name: 'John Seller',
      email: 'seller@example.com',
      password: 'password123',
      isEmailVerified: true,
      totalSpent: 0,
      itemsSold: 5,
      successfulBids: 2,
      rating: 4.8,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      bio: 'Professional seller with 5+ years experience'
    },
    {
      name: 'Jane Bidder',
      email: 'bidder@example.com', 
      password: 'password123',
      isEmailVerified: true,
      totalSpent: 450.00,
      successfulBids: 8,
      rating: 4.9,
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      bio: 'Art collector and vintage enthusiast'
    },
    {
      name: 'Mike Collector',
      email: 'collector@example.com',
      password: 'password123', 
      isEmailVerified: true,
      totalSpent: 1200.00,
      successfulBids: 15,
      itemsSold: 3,
      rating: 5.0,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Electronics and gadget collector'
    },
    {
      name: 'Sarah Fashion',
      email: 'sarah@example.com',
      password: 'password123',
      isEmailVerified: true,
      totalSpent: 300.00,
      successfulBids: 6,
      itemsSold: 2,
      rating: 4.7,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=150',
      bio: 'Fashion lover and style consultant'
    },
    {
      name: 'David Home',
      email: 'david@example.com',
      password: 'password123',
      isEmailVerified: true,
      totalSpent: 800.00,
      successfulBids: 12,
      itemsSold: 1,
      rating: 4.6,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Home decorator and furniture enthusiast'
    }
  ],

  items: [
    {
      name: 'Vintage Polaroid Camera',
      description: 'Beautiful vintage Polaroid camera from the 1970s. Fully functional with original leather case. Perfect for film photography enthusiasts. Includes original manual and strap.',
      category: 'Electronics',
      startingPrice: 45.00,
      currentBid: 85.00,
      bidCount: 7,
      photo: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      status: 'active',
      views: 124,
      condition: 'good',
      location: 'New York, NY',
      isFeatured: true
    },
    {
      name: 'Swiss Designer Watch',
      description: 'Luxury Swiss-made designer watch in excellent condition. Automatic movement, leather band, sapphire crystal. Originally $800, starting low for quick sale.',
      category: 'Fashion',
      startingPrice: 200.00,
      currentBid: 320.00,
      bidCount: 12,
      photo: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'active',
      views: 89,
      condition: 'like-new',
      location: 'Los Angeles, CA',
      isFeatured: true
    },
    {
      name: 'Ming Dynasty Vase Replica',
      description: 'Beautiful Ming Dynasty style vase replica. Hand-painted ceramic with traditional blue and white design. Perfect centerpiece for any home. Height: 12 inches.',
      category: 'Home',
      startingPrice: 80.00,
      currentBid: 140.00,
      bidCount: 9,
      photo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'active',
      views: 67,
      condition: 'new',
      location: 'Chicago, IL'
    },
    {
      name: 'Gaming Laptop - RTX 4060',
      description: 'High-performance gaming laptop with NVIDIA RTX 4060, Intel i7, 16GB RAM, 1TB SSD. Perfect for gaming, streaming, and content creation. Barely used, like new condition.',
      category: 'Electronics',
      startingPrice: 900.00,
      currentBid: 1150.00,
      bidCount: 18,
      photo: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      status: 'active',
      views: 203,
      condition: 'like-new',
      location: 'Seattle, WA',
      isFeatured: true
    },
    {
      name: 'Beatles Vinyl Collection',
      description: 'Rare Beatles vinyl record collection including Abbey Road, Sgt. Pepper\'s, and White Album. All in mint condition. A must-have for any music collector.',
      category: 'Electronics',
      startingPrice: 120.00,
      currentBid: 180.00,
      bidCount: 14,
      photo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
      status: 'active',
      views: 156,
      condition: 'good',
      location: 'Nashville, TN'
    },
    {
      name: 'Designer Leather Handbag',
      description: 'Authentic designer leather handbag in perfect condition. Beautiful craftsmanship, multiple compartments, comes with dust bag and authenticity certificate.',
      category: 'Fashion',
      startingPrice: 150.00,
      currentBid: 225.00,
      bidCount: 11,
      photo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
      status: 'active',
      views: 98,
      condition: 'like-new',
      location: 'Miami, FL'
    },
    {
      name: 'Antique Wooden Coffee Table',
      description: 'Beautiful antique wooden coffee table from the 1950s. Solid oak construction, recently refinished. Perfect for vintage or modern homes. 48" x 24" x 16".',
      category: 'Home',
      startingPrice: 200.00,
      currentBid: 275.00,
      bidCount: 8,
      photo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
      status: 'active',
      views: 76,
      condition: 'good',
      location: 'Portland, OR'
    },
    {
      name: 'Professional DSLR Camera',
      description: 'Canon EOS R5 professional camera with 24-105mm lens. Excellent for photography and videography. Low shutter count, includes extra batteries and memory cards.',
      category: 'Electronics',
      startingPrice: 1500.00,
      currentBid: 1750.00,
      bidCount: 6,
      photo: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days
      status: 'active',
      views: 145,
      condition: 'like-new',
      location: 'Denver, CO',
      isFeatured: true
    },
    {
      name: 'Vintage Band T-Shirt Collection',
      description: 'Authentic vintage band t-shirt collection from the 80s and 90s. Includes Led Zeppelin, Pink Floyd, The Rolling Stones. All original, no reproductions. Size L.',
      category: 'Fashion',
      startingPrice: 60.00,
      currentBid: 95.00,
      bidCount: 13,
      photo: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'active',
      views: 87,
      condition: 'good',
      location: 'Austin, TX'
    },
    {
      name: 'Modern Art Sculpture',
      description: 'Contemporary metal sculpture by local artist. Abstract design, perfect conversation piece. Dimensions: 18" x 12" x 8". Signed and numbered limited edition.',
      category: 'Home',
      startingPrice: 300.00,
      currentBid: 420.00,
      bidCount: 5,
      photo: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
      auctionEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
      status: 'active',
      views: 54,
      condition: 'new',
      location: 'San Francisco, CA'
    }
  ]
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Bid.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (let userData of seedData.users) {
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Create items with sellers
    console.log('📦 Creating items...');
    const items = [];
    for (let i = 0; i < seedData.items.length; i++) {
      const itemData = {
        ...seedData.items[i],
        seller: users[i % users.length]._id // Rotate through users as sellers
      };
      
      const item = new Item(itemData);
      await item.save();
      items.push(item);
      console.log(`✅ Created item: ${item.name} - Seller: ${users[i % users.length].name}`);
    }

    // Create realistic bids
    console.log('🔨 Creating sample bids...');
    let totalBidsCreated = 0;

    for (let item of items) {
      const numBids = Math.floor(Math.random() * 15) + 1; // 1-15 bids per item
      let currentPrice = item.startingPrice;
      
      // Create bids with realistic increments
      for (let j = 0; j < numBids; j++) {
        const bidder = users[Math.floor(Math.random() * users.length)];
        
        // Don't let users bid on their own items
        if (bidder._id.toString() === item.seller.toString()) {
          continue;
        }

        // Calculate realistic bid increment (5-25% increase)
        const increment = currentPrice * (0.05 + Math.random() * 0.20);
        const bidAmount = currentPrice + increment;
        
        // Mark previous bids as outbid
        await Bid.updateMany(
          { item: item._id, status: 'active' },
          { status: 'outbid' }
        );

        // Create new bid
        const bid = new Bid({
          item: item._id,
          bidder: bidder._id,
          amount: Math.round(bidAmount * 100) / 100, // Round to 2 decimal places
          status: 'active',
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
        });

        await bid.save();
        currentPrice = bidAmount;
        totalBidsCreated++;
      }

      // Update item with final bid amount and count
      item.currentBid = Math.round(currentPrice * 100) / 100;
      item.bidCount = await Bid.countDocuments({ item: item._id });
      await item.save();
    }

    console.log(`✅ Created ${totalBidsCreated} total bids`);

    // Update user statistics
    console.log('📊 Updating user statistics...');
    for (let user of users) {
      const userBids = await Bid.countDocuments({ bidder: user._id });
      const userItems = await Item.countDocuments({ seller: user._id });
      const wonBids = await Bid.countDocuments({ bidder: user._id, status: 'active' });
      
      user.successfulBids = userBids;
      user.itemsSold = userItems;
      await user.save();
      
      console.log(`✅ Updated stats for ${user.name}: ${userBids} bids, ${userItems} items, ${wonBids} winning`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${await User.countDocuments()}`);
    console.log(`   📦 Items: ${await Item.countDocuments()}`);
    console.log(`   🔨 Bids: ${await Bid.countDocuments()}`);
    console.log(`   ⭐ Featured Items: ${await Item.countDocuments({ isFeatured: true })}`);
    console.log(`   🏃 Active Auctions: ${await Item.countDocuments({ status: 'active' })}`);

    // Show some sample data
    console.log('\n📋 Sample Data Created:');
    const sampleItems = await Item.find().populate('seller', 'name').limit(3);
    for (let item of sampleItems) {
      console.log(`   📦 ${item.name} by ${item.seller.name} - Current bid: $${item.currentBid}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Allow running script directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedData };