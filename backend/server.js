const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./src/routes/auth');
const itemRoutes = require('./src/routes/items');
const bidRoutes = require('./src/routes/bids');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/bids', bidRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🎉 CSIS 4280 Auction App Backend is working!',
    status: 'Server running successfully',
    project: 'Auction App',
    database: 'MongoDB Atlas',
    features: [
      '✅ User Authentication',
      '🔄 Email Verification',
      '🔐 JWT Tokens',
      '🛡️  Password Hashing'
    ],
    endpoints: {
      auth: {
        signup: 'POST /api/auth/signup',
        signin: 'POST /api/auth/signin',
        verifyEmail: 'POST /api/auth/verify-email',
        resendVerification: 'POST /api/auth/resend-verification'
      },
      items: {
        getAll: 'GET /api/items',
        getOne: 'GET /api/items/:id',
        create: 'POST /api/items',
        update: 'PUT /api/items/:id',
        delete: 'DELETE /api/items/:id'
      },
      bids: {
        placeBid: 'POST /api/bids',
        getItemBids: 'GET /api/bids/item/:itemId',
        getUserBids: 'GET /api/bids/user/:userId',
        getWinningBids: 'GET /api/bids/user/:userId/winning'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    project: 'CSIS 4280 Auction App',
    authSystem: 'Active ✅'
  });
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
  try {
    // Simple database test
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Count users in database
    const User = require('./src/models/User');
    const userCount = await User.countDocuments();
    
    res.json({
      message: '✅ Database connection successful!',
      database: mongoose.connection.name,
      user: 'testuser01',
      cluster: 'AuctionCluster',
      collections: collections.map(col => col.name),
      userCount: userCount,
      readyState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({
      message: '❌ Database connection failed',
      error: error.message
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in .env file');
      console.error('💡 Make sure your .env file contains the MongoDB connection string');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('👤 User: testuser01');
    console.log('🏗️  Cluster: AuctionCluster');
    
    // Connect to MongoDB (removed deprecated options)
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log('🎓 CSIS 4280 Auction App Project');
    console.log('🔐 Authentication System: Ready');

    // Start the server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('📋 Available API Endpoints:');
      console.log('   🏠 GET  /                     - Welcome message');
      console.log('   ❤️  GET  /api/health          - Health check');
      console.log('   🧪 GET  /api/test-db         - Database test');
      console.log('   📝 POST /api/auth/signup     - Create account');
      console.log('   🔑 POST /api/auth/signin     - Login');
      console.log('   📧 POST /api/auth/verify-email - Verify email');
      console.log('   🔄 POST /api/auth/resend-verification - Resend code');
      console.log('   📦 GET  /api/items           - Get all items');
      console.log('   📦 GET  /api/items/:id       - Get single item');
      console.log('   📦 POST /api/items           - Create item');
      console.log('   📦 PUT  /api/items/:id       - Update item');
      console.log('   📦 DEL  /api/items/:id       - Delete item');
      console.log('   🔨 POST /api/bids            - Place bid');
      console.log('   🔨 GET  /api/bids/item/:id   - Get item bids');
      console.log('   🔨 GET  /api/bids/user/:id   - Get user bids');
      console.log('🛑 Press Ctrl+C to stop the server');
      console.log('='.repeat(60));
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('💡 Possible issues:');
    console.error('   - Check your internet connection');
    console.error('   - Verify MongoDB Atlas credentials (testuser01/csis4280)');
    console.error('   - Check if IP address is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  console.log('👋 Goodbye!');
  process.exit(0);
});

// Start the server
startServer();