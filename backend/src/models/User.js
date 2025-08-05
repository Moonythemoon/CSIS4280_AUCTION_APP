const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/100x100?text=User'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  // Auction-specific fields for your CSIS 4280 project
  totalSpent: {
    type: Number,
    default: 0
  },
  itemsSold: {
    type: Number,
    default: 0
  },
  successfulBids: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12 (very secure)
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if entered password matches hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate email verification code
userSchema.methods.generateEmailVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.emailVerificationCode = code;
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Convert schema to model and export
module.exports = mongoose.model('User', userSchema);