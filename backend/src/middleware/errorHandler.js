// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      message,
      error: 'INVALID_ID'
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    // Customize message based on field
    if (field === 'email') {
      message = `Email '${value}' is already registered`;
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: 'DUPLICATE_FIELD',
      field
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: 'VALIDATION_ERROR',
      errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token',
      error: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired',
      error: 'TOKEN_EXPIRED'
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large',
      error: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field',
      error: 'UNEXPECTED_FILE'
    });
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'DB_CONNECTION_ERROR'
    });
  }

  // Custom application errors
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      error: err.errorCode || 'OPERATIONAL_ERROR'
    });
  }

  // Default server error
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err
    } : 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const message = `Route ${req.method} ${req.originalUrl} not found`;
  console.log('🔍 404 Error:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    message,
    error: 'ROUTE_NOT_FOUND',
    availableRoutes: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/signin',
        'POST /api/auth/verify-email',
        'POST /api/auth/resend-verification'
      ],
      items: [
        'GET /api/items',
        'GET /api/items/:id',
        'POST /api/items',
        'PUT /api/items/:id',
        'DELETE /api/items/:id'
      ],
      bids: [
        'POST /api/bids',
        'GET /api/bids/item/:itemId',
        'GET /api/bids/user/:userId'
      ],
      general: [
        'GET /',
        'GET /api/health',
        'GET /api/test-db'
      ]
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create custom error class
class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle unhandled promise rejections
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (err, promise) => {
    console.error('🚨 Unhandled Promise Rejection:', {
      error: err.message,
      stack: err.stack,
      promise,
      timestamp: new Date().toISOString()
    });
    
    // Close server gracefully
    process.exit(1);
  });
};

// Handle uncaught exceptions
const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Close server gracefully
    process.exit(1);
  });
};

// Validation error helper
const createValidationError = (field, message, value = null) => {
  const error = new AppError(`Validation failed for field '${field}': ${message}`, 400, 'VALIDATION_ERROR');
  error.field = field;
  error.value = value;
  return error;
};

// Authentication error helper
const createAuthError = (message = 'Authentication failed') => {
  return new AppError(message, 401, 'AUTH_ERROR');
};

// Authorization error helper
const createAuthorizationError = (message = 'Access denied') => {
  return new AppError(message, 403, 'AUTHORIZATION_ERROR');
};

// Not found error helper
const createNotFoundError = (resource = 'Resource') => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Conflict error helper
const createConflictError = (message) => {
  return new AppError(message, 409, 'CONFLICT_ERROR');
};

// Rate limit error helper
const createRateLimitError = (retryAfter = null) => {
  const error = new AppError('Too many requests. Please try again later.', 429, 'RATE_LIMIT_ERROR');
  if (retryAfter) error.retryAfter = retryAfter;
  return error;
};

// Database error helper
const createDatabaseError = (message = 'Database operation failed') => {
  return new AppError(message, 500, 'DATABASE_ERROR');
};

// File upload error helper
const createFileUploadError = (message) => {
  return new AppError(message, 400, 'FILE_UPLOAD_ERROR');
};

// Business logic error helper
const createBusinessError = (message, statusCode = 400) => {
  return new AppError(message, statusCode, 'BUSINESS_LOGIC_ERROR');
};

// Error response formatter
const formatErrorResponse = (error, req) => {
  const response = {
    success: false,
    message: error.message || 'An error occurred',
    error: error.errorCode || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = {
      statusCode: error.statusCode,
      isOperational: error.isOperational
    };
  }

  // Add specific error fields if available
  if (error.field) response.field = error.field;
  if (error.value) response.value = error.value;
  if (error.retryAfter) response.retryAfter = error.retryAfter;

  return response;
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  handleUnhandledRejection,
  handleUncaughtException,
  createValidationError,
  createAuthError,
  createAuthorizationError,
  createNotFoundError,
  createConflictError,
  createRateLimitError,
  createDatabaseError,
  createFileUploadError,
  createBusinessError,
  formatErrorResponse
};