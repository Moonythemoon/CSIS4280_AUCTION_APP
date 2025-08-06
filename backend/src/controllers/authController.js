const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token helper function
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    console.log('📝 Signup attempt:', { name: req.body.name, email: req.body.email });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    // Generate email verification code
    const verificationCode = user.generateEmailVerificationCode();
    console.log('📧 Generated verification code:', verificationCode);
    
    await user.save();
    console.log('✅ User created successfully:', user._id);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isEmailVerified: user.isEmailVerified,
      memberSince: user.memberSince
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email for verification code.',
      data: {
        user: userResponse,
        token,
        verificationCode // In production, send via email instead
      }
    });

  } catch (error) {
    console.error('💥 Signup error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
};

// @desc    Authenticate user and get token
// @route   POST /api/auth/signin
// @access  Public
const signin = async (req, res) => {
  try {
    console.log('🔐 Signin attempt:', { email: req.body.email });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password for comparison
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      console.log('❌ Inactive account:', email);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ Signin successful for:', email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (exclude password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      phone: user.phone,
      address: user.address,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified,
      totalSpent: user.totalSpent,
      itemsSold: user.itemsSold,
      successfulBids: user.successfulBids,
      rating: user.rating,
      memberSince: user.memberSince
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('💥 Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signin'
    });
  }
};

// @desc    Verify user email with code
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    console.log('📧 Email verification attempt:', { email: req.body.email, code: req.body.code });

    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Find user with verification code
    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationCode +emailVerificationExpires');

    if (!user) {
      console.log('❌ Invalid or expired verification code for:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log('✅ Email verified successfully for:', email);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.'
    });

  } catch (error) {
    console.error('💥 Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend email verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    console.log('📧 Resend verification attempt:', { email: req.body.email });

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      console.log('❌ User not found for resend:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = user.generateEmailVerificationCode();
    await user.save();

    console.log('✅ New verification code generated for:', email);

    res.json({
      success: true,
      message: 'New verification code sent successfully',
      data: {
        verificationCode // In production, send via email instead
      }
    });

  } catch (error) {
    console.error('💥 Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification code'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('💥 Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

module.exports = {
  signup,
  signin,
  verifyEmail,
  resendVerification,
  getProfile
};