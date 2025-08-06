const crypto = require('crypto');

// Helper functions for the auction app
const helpers = {
  // Generate random verification code
  generateVerificationCode: (length = 6) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)).toString();
  },

  // Generate secure random token
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Format time remaining
  formatTimeRemaining: (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;

    if (timeDiff <= 0) {
      return { expired: true, text: 'Auction ended' };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h left`, days, hours, minutes };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m left`, days, hours, minutes };
    } else {
      return { expired: false, text: `${minutes}m left`, days, hours, minutes };
    }
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePassword: (password) => {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasLowercase && hasNumbers,
      feedback: {
        minLength: password.length >= minLength,
        hasUppercase,
        hasLowercase,
        hasNumbers,
        hasSpecialChar
      }
    };
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .substring(0, 1000); // Limit length
  },

  // Generate slug from text
  generateSlug: (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  },

  // Calculate bid increment based on current price
  calculateBidIncrement: (currentBid) => {
    if (currentBid < 100) return 1.00;
    if (currentBid < 500) return 5.00;
    if (currentBid < 1000) return 10.00;
    if (currentBid < 5000) return 25.00;
    return 50.00;
  },

  // Paginate results
  paginate: (query, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return {
      ...query,
      skip: offset,
      limit: parseInt(limit)
    };
  },

  // Build search query with filters
  buildSearchQuery: (filters = {}) => {
    const query = {};

    // Text search
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Category filter
    if (filters.category && filters.category !== 'ALL') {
      query.category = filters.category;
    }

    // Price range
    if (filters.minPrice || filters.maxPrice) {
      query.currentBid = {};
      if (filters.minPrice) query.currentBid.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.currentBid.$lte = parseFloat(filters.maxPrice);
    }

    // Condition filter
    if (filters.condition) {
      query.condition = filters.condition;
    }

    // Location filter
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    // Status filter
    if (filters.status) {
      query.status = filters.status;
    } else {
      // Default to active items
      query.status = 'active';
      query.auctionEndDate = { $gt: new Date() };
    }

    // Featured filter
    if (filters.featured === 'true') {
      query.isFeatured = true;
    }

    return query;
  },

  // Build sort options
  buildSortOptions: (sortBy = 'newest') => {
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-low': { currentBid: 1 },
      'price-high': { currentBid: -1 },
      'ending-soon': { auctionEndDate: 1 },
      'most-bids': { bidCount: -1 },
      'most-viewed': { views: -1 },
      alphabetical: { name: 1 }
    };

    return sortOptions[sortBy] || sortOptions.newest;
  },

  // Calculate auction statistics
  calculateAuctionStats: (bids) => {
    if (!bids || bids.length === 0) {
      return {
        totalBids: 0,
        uniqueBidders: 0,
        averageBid: 0,
        highestBid: 0,
        lowestBid: 0,
        bidIncrement: 0
      };
    }

    const totalBids = bids.length;
    const uniqueBidders = new Set(bids.map(bid => bid.bidder.toString())).size;
    const bidAmounts = bids.map(bid => bid.amount);
    const averageBid = bidAmounts.reduce((sum, amount) => sum + amount, 0) / totalBids;
    const highestBid = Math.max(...bidAmounts);
    const lowestBid = Math.min(...bidAmounts);
    const bidIncrement = highestBid - lowestBid;

    return {
      totalBids,
      uniqueBidders,
      averageBid: Math.round(averageBid * 100) / 100,
      highestBid,
      lowestBid,
      bidIncrement: Math.round(bidIncrement * 100) / 100
    };
  },

  // Generate auction report
  generateAuctionReport: (item, bids) => {
    const stats = helpers.calculateAuctionStats(bids);
    const timeRemaining = helpers.formatTimeRemaining(item.auctionEndDate);

    return {
      item: {
        id: item._id,
        name: item.name,
        category: item.category,
        startingPrice: item.startingPrice,
        currentBid: item.currentBid,
        seller: item.seller,
        status: item.status,
        condition: item.condition,
        location: item.location,
        views: item.views,
        createdAt: item.createdAt,
        auctionEndDate: item.auctionEndDate,
        timeRemaining: timeRemaining.text,
        expired: timeRemaining.expired
      },
      statistics: stats,
      performance: {
        viewsToBidsRatio: item.views > 0 ? (stats.totalBids / item.views * 100).toFixed(2) + '%' : '0%',
        priceIncrease: ((item.currentBid - item.startingPrice) / item.startingPrice * 100).toFixed(2) + '%',
        averageBidPerBidder: stats.uniqueBidders > 0 ? (stats.totalBids / stats.uniqueBidders).toFixed(1) : 0,
        popularityScore: (item.views * 0.3 + stats.totalBids * 0.7).toFixed(1)
      }
    };
  },

  // Validate bid amount
  validateBidAmount: (bidAmount, currentBid, minIncrement = 1) => {
    const errors = [];

    if (!bidAmount || isNaN(bidAmount)) {
      errors.push('Bid amount must be a valid number');
    }

    if (bidAmount <= currentBid) {
      errors.push(`Bid must be higher than current bid of ${helpers.formatCurrency(currentBid)}`);
    }

    const minimumBid = currentBid + minIncrement;
    if (bidAmount < minimumBid) {
      errors.push(`Minimum bid is ${helpers.formatCurrency(minimumBid)}`);
    }

    if (bidAmount > 1000000) {
      errors.push('Bid amount cannot exceed $1,000,000');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate item condition description
  getConditionDescription: (condition) => {
    const conditions = {
      'new': 'Brand new, never used',
      'like-new': 'Excellent condition, barely used',
      'good': 'Good condition with minimal wear',
      'fair': 'Fair condition with some wear',
      'poor': 'Poor condition, significant wear'
    };

    return conditions[condition] || 'Condition not specified';
  },

  // Calculate seller rating based on transactions
  calculateSellerRating: (transactions = []) => {
    if (transactions.length === 0) return 5.0;

    const ratings = transactions.map(t => t.rating).filter(r => r !== undefined);
    if (ratings.length === 0) return 5.0;

    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round(average * 10) / 10; // Round to 1 decimal place
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate image file
  validateImageFile: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const errors = [];

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File must be JPEG, PNG, or WebP format');
    }

    if (file.size > maxSize) {
      errors.push(`File size must be less than ${helpers.formatFileSize(maxSize)}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate API response format
  generateResponse: (success, message, data = null, errors = null) => {
    const response = {
      success,
      message,
      timestamp: new Date().toISOString()
    };

    if (data) response.data = data;
    if (errors) response.errors = errors;

    return response;
  },

  // Hash sensitive data
  hashData: (data, salt = null) => {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt: actualSalt };
  },

  // Compare hashed data
  compareHashedData: (data, hash, salt) => {
    const hashedData = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
    return hashedData === hash;
  },

  // Generate unique filename
  generateUniqueFilename: (originalName) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  },

  // Validate ObjectId
  isValidObjectId: (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  // Calculate distance between two coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in miles
  },

  // Format date for display
  formatDate: (date, format = 'long') => {
    const options = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      datetime: { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
      }
    };

    return new Date(date).toLocaleDateString('en-US', options[format] || options.long);
  },

  // Generate random color
  generateRandomColor: () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA726', 
      '#AB47BC', '#66BB6A', '#EF5350', '#26A69A',
      '#42A5F5', '#FF7043', '#9C27B0', '#2E7D32'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Truncate text with ellipsis
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Remove duplicates from array
  removeDuplicates: (array, key = null) => {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // Deep merge objects
  deepMerge: (target, source) => {
    const output = Object.assign({}, target);
    if (helpers.isObject(target) && helpers.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (helpers.isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, { [key]: source[key] });
          else
            output[key] = helpers.deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  },

  // Check if value is object
  isObject: (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Generate CSV from array of objects
  generateCSV: (data, headers = null) => {
    if (!data || data.length === 0) return '';
    
    const csvHeaders = headers || Object.keys(data[0]);
    const csvRows = data.map(row => 
      csvHeaders.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',')
    );
    
    return [csvHeaders.join(','), ...csvRows].join('\n');
  },

  // Parse CSV string
  parseCSV: (csvString) => {
    const lines = csvString.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
    
    return data;
  },

  // Rate limit checker
  checkRateLimit: (identifier, maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    // This would typically use Redis or a database
    // For now, using in-memory storage (not suitable for production)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!global.rateLimitStore.has(identifier)) {
      global.rateLimitStore.set(identifier, []);
    }
    
    const requests = global.rateLimitStore.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.min(...validRequests) + windowMs
      };
    }
    
    // Add current request
    validRequests.push(now);
    global.rateLimitStore.set(identifier, validRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length,
      resetTime: now + windowMs
    };
  },

  // Clean up old rate limit entries
  cleanupRateLimit: () => {
    if (!global.rateLimitStore) return;
    
    const now = Date.now();
    const cutoff = now - (15 * 60 * 1000); // 15 minutes ago
    
    for (const [identifier, requests] of global.rateLimitStore.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      if (validRequests.length === 0) {
        global.rateLimitStore.delete(identifier);
      } else {
        global.rateLimitStore.set(identifier, validRequests);
      }
    }
  }
};

// Set up cleanup interval for rate limiting
if (typeof setInterval !== 'undefined') {
  setInterval(helpers.cleanupRateLimit, 5 * 60 * 1000); // Clean up every 5 minutes
}

module.exports = helpers;