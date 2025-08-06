const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }
  next();
};

// Middleware to check if user is admin (for future admin features)
const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Optional authentication (for routes that work both with and without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting for sensitive routes
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 5) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const requestData = requests.get(key);
    
    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
      return next();
    }

    if (requestData.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
    }

    requestData.count++;
    next();
  };
};

// Validate user ownership (for updating/deleting resources)
const validateOwnership = (resourceModel, foreignKey = 'user') => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Check ownership
      const ownerId = resource[foreignKey];
      if (ownerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this resource'
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      console.error('Ownership validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error validating ownership'
      });
    }
  };
};

// Log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      console.log(`📊 User Activity: ${req.user.email} - ${action} - ${new Date().toISOString()}`);
    }
    next();
  };
};

// Check user permissions for specific actions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Basic permission checks (expand as needed)
    const permissions = {
      'create_item': req.user.isEmailVerified,
      'place_bid': req.user.isEmailVerified,
      'delete_item': req.user.isEmailVerified,
      'admin_access': req.user.isAdmin,
      'moderate_content': req.user.isAdmin || req.user.isModerator
    };

    if (!permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireVerification,
  requireAdmin,
  optionalAuth,
  createRateLimit,
  validateOwnership,
  logActivity,
  checkPermission
};