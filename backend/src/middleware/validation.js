const { body, param, query } = require('express-validator');

// User validation rules
const userValidation = {
  // Sign up validation
  signup: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],

  // Sign in validation
  signin: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Email verification
  verifyEmail: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('code')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Verification code must be exactly 6 digits')
  ],

  // Profile update
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    
    body('bio')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Bio cannot exceed 200 characters')
  ]
};

// Item validation rules
const itemValidation = {
  // Create/update item
  createUpdate: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Item name must be between 1 and 100 characters'),
    
    body('description')
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    
    body('startingPrice')
      .isFloat({ min: 0.01, max: 100000 })
      .withMessage('Starting price must be between $0.01 and $100,000'),
    
    body('category')
      .isIn(['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Art', 'Collectibles'])
      .withMessage('Please select a valid category'),
    
    body('auctionEndDate')
      .isISO8601()
      .withMessage('Please provide a valid end date')
      .custom((value) => {
        const endDate = new Date(value);
        const now = new Date();
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30); // Max 30 days

        if (endDate <= now) {
          throw new Error('Auction end date must be in the future');
        }
        if (endDate > maxDate) {
          throw new Error('Auction cannot run for more than 30 days');
        }
        return true;
      }),
    
    body('photo')
      .optional()
      .isURL()
      .withMessage('Photo must be a valid URL'),
    
    body('condition')
      .optional()
      .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
      .withMessage('Please select a valid condition')
  ],

  // Get items query validation
  getItems: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('category')
      .optional()
      .isIn(['ALL', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Art', 'Collectibles'])
      .withMessage('Invalid category'),
    
    query('sort')
      .optional()
      .isIn(['newest', 'oldest', 'price-low', 'price-high', 'ending-soon', 'most-bids'])
      .withMessage('Invalid sort option'),
    
    query('search')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Search query cannot exceed 100 characters')
  ]
};

// Bid validation rules
const bidValidation = {
  // Place bid
  placeBid: [
    body('amount')
      .isFloat({ min: 0.01, max: 1000000 })
      .withMessage('Bid amount must be between $0.01 and $1,000,000'),
    
    body('itemId')
      .isMongoId()
      .withMessage('Valid item ID is required'),
    
    body('bidderId')
      .optional()
      .isMongoId()
      .withMessage('Valid bidder ID is required')
  ],

  // Get bids query validation
  getBids: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ]
};

// Parameter validation
const paramValidation = {
  // MongoDB ObjectId parameter
  mongoId: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format'),
  ],
  
  // Item ID parameter
  itemId: [
    param('itemId')
      .isMongoId()
      .withMessage('Invalid item ID format'),
  ],
  
  // User ID parameter
  userId: [
    param('userId')
      .isMongoId()
      .withMessage('Invalid user ID format'),
  ],
  
  // Bid ID parameter
  bidId: [
    param('bidId')
      .isMongoId()
      .withMessage('Invalid bid ID format'),
  ]
};

// File upload validation
const fileValidation = {
  // Image upload validation
  imageUpload: [
    body('image')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Image file is required');
        }
        
        // Check file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
          throw new Error('Image file size cannot exceed 5MB');
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }
        
        return true;
      })
  ]
};

// Sanitization helpers
const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  cleanText: (text) => {
    if (typeof text !== 'string') return text;
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  },
  
  // Clean search query
  cleanSearchQuery: (query) => {
    if (typeof query !== 'string') return query;
    return query
      .replace(/[^\w\s-]/gi, '') // Only allow word characters, spaces, and hyphens
      .trim()
      .substring(0, 100); // Limit length
  }
};

module.exports = {
  userValidation,
  itemValidation,
  bidValidation,
  paramValidation,
  fileValidation,
  sanitizeInput
};