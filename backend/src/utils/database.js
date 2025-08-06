const mongoose = require('mongoose');

// Database connection utility
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('📊 Already connected to MongoDB');
      return;
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options (they're now default in Mongoose 6+)
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// Close database connection
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
    throw error;
  }
};

// Check database connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    port: mongoose.connection.port
  };
};

// Database health check
const healthCheck = async () => {
  try {
    // Simple ping to test connection
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      connection: getConnectionStatus(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: getConnectionStatus(),
      timestamp: new Date().toISOString()
    };
  }
};

// Get database statistics
const getStats = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection names and counts
    const collections = await db.listCollections().toArray();
    const collectionStats = {};
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats[collection.name] = count;
      } catch (error) {
        collectionStats[collection.name] = 'Error getting count';
      }
    }
    
    return {
      database: {
        name: dbStats.db,
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        indexSize: dbStats.indexSize
      },
      collections: collectionStats,
      connection: getConnectionStatus(),
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    throw new Error(`Error getting database stats: ${error.message}`);
  }
};

// Clean up expired data
const cleanupExpiredData = async () => {
  try {
    const Item = require('../models/Item');
    const User = require('../models/User');
    
    console.log('🧹 Starting database cleanup...');
    
    // Find and end expired auctions
    const expiredItems = await Item.find({
      status: 'active',
      auctionEndDate: { $lte: new Date() }
    });
    
    let endedCount = 0;
    for (const item of expiredItems) {
      await item.endAuction();
      endedCount++;
    }
    
    // Clean up expired verification codes
    const expiredCodes = await User.updateMany(
      {
        emailVerificationCode: { $exists: true },
        emailVerificationExpires: { $lte: new Date() }
      },
      {
        $unset: {
          emailVerificationCode: 1,
          emailVerificationExpires: 1
        }
      }
    );
    
    console.log(`✅ Cleanup completed:`);
    console.log(`   - Ended ${endedCount} expired auctions`);
    console.log(`   - Cleaned ${expiredCodes.modifiedCount} expired verification codes`);
    
    return {
      endedAuctions: endedCount,
      cleanedCodes: expiredCodes.modifiedCount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    throw error;
  }
};

// Create database indexes for better performance
const createIndexes = async () => {
  try {
    console.log('📊 Creating database indexes...');
    
    const User = require('../models/User');
    const Item = require('../models/Item');
    const Bid = require('../models/Bid');
    
    // User indexes
    await User.createIndexes();
    
    // Item indexes
    await Item.createIndexes();
    
    // Bid indexes  
    await Bid.createIndexes();
    
    // Custom compound indexes
    await Item.collection.createIndex(
      { status: 1, auctionEndDate: 1 },
      { name: 'status_enddate_idx' }
    );
    
    await Item.collection.createIndex(
      { category: 1, status: 1, createdAt: -1 },
      { name: 'category_status_created_idx' }
    );
    
    await Bid.collection.createIndex(
      { item: 1, amount: -1, createdAt: -1 },
      { name: 'item_amount_created_idx' }
    );
    
    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    throw error;
  }
};

// Backup database (basic implementation)
const backupData = async () => {
  try {
    console.log('💾 Creating database backup...');
    
    const User = require('../models/User');
    const Item = require('../models/Item');
    const Bid = require('../models/Bid');
    
    const backup = {
      timestamp: new Date().toISOString(),
      users: await User.find({}).select('-password'),
      items: await Item.find({}),
      bids: await Bid.find({})
    };
    
    // In a real application, you would save this to a file or cloud storage
    console.log(`✅ Backup created with ${backup.users.length} users, ${backup.items.length} items, ${backup.bids.length} bids`);
    
    return backup;
    
  } catch (error) {
    console.error('❌ Backup error:', error.message);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  healthCheck,
  getStats,
  cleanupExpiredData,
  createIndexes,
  backupData
};