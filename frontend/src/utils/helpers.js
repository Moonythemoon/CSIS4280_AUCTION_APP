// Frontend helper functions
export const helpers = {
  // Format currency
  formatCurrency: (amount) => {
    if (typeof amount === 'string') {
      // Remove dollar sign if it exists and convert to number
      const numAmount = parseFloat(amount.replace('$', ''));
      if (isNaN(numAmount)) return amount;
      return `$${numAmount.toFixed(2)}`;
    }
    
    if (typeof amount !== 'number') return '$0.00';
    return `$${amount.toFixed(2)}`;
  },

  // Format time remaining from days and hours
  formatTimeLeft: (days, hours) => {
    if (days > 0) {
      if (hours > 0) {
        return `${days}d ${hours}h left`;
      }
      return `${days}d left`;
    }
    
    if (hours > 0) {
      return `${hours}h left`;
    }
    
    return 'Ending soon';
  },

  // Format time remaining from end date
  getTimeRemaining: (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;

    if (timeDiff <= 0) {
      return { 
        days: 0, 
        hours: 0, 
        minutes: 0,
        expired: true,
        text: 'Auction ended'
      };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    let text = '';
    if (days > 0) {
      text = `${days}d ${hours}h left`;
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m left`;
    } else {
      text = `${minutes}m left`;
    }

    return { days, hours, minutes, expired: false, text };
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password
  validatePassword: (password) => {
    if (!password) return { isValid: false, message: 'Password is required' };
    if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
    return { isValid: true, message: '' };
  },

  // Validate bid amount
  validateBidAmount: (bidAmount, currentBid) => {
    const amount = parseFloat(bidAmount);
    const current = parseFloat(currentBid.replace('$', ''));
    
    if (isNaN(amount)) {
      return { isValid: false, message: 'Please enter a valid amount' };
    }
    
    if (amount <= current) {
      return { 
        isValid: false, 
        message: `Bid must be higher than current bid of ${helpers.formatCurrency(current)}` 
      };
    }
    
    const minimumBid = current + 1;
    if (amount < minimumBid) {
      return { 
        isValid: false, 
        message: `Minimum bid is ${helpers.formatCurrency(minimumBid)}` 
      };
    }
    
    return { isValid: true, message: '' };
  },

  // Format date
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now - past;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return helpers.formatDate(date, { month: 'short', day: 'numeric' });
  },

  // Truncate text
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Generate initials from name
  getInitials: (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  // Get category icon
  getCategoryIcon: (category) => {
    const icons = {
      Electronics: 'phone-portrait',
      Fashion: 'shirt',
      Home: 'home',
      Sports: 'basketball',
      Books: 'book',
      Art: 'color-palette',
      Collectibles: 'diamond'
    };
    return icons[category] || 'cube';
  },

  // Get category color
  getCategoryColor: (category) => {
    const colors = {
      Electronics: '#2196F3',
      Fashion: '#E91E63',
      Home: '#4CAF50',
      Sports: '#FF9800',
      Books: '#795548',
      Art: '#9C27B0',
      Collectibles: '#FFD700'
    };
    return colors[category] || '#666';
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate random ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Capitalize first letter
  capitalize: (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  // Calculate percentage increase
  calculatePercentageIncrease: (original, current) => {
    const originalNum = parseFloat(original.toString().replace('$', ''));
    const currentNum = parseFloat(current.toString().replace('$', ''));
    
    if (originalNum === 0) return 0;
    
    const increase = ((currentNum - originalNum) / originalNum) * 100;
    return Math.round(increase * 10) / 10; // Round to 1 decimal place
  },

  // Get bid status color
  getBidStatusColor: (status) => {
    const colors = {
      active: '#4CAF50',
      winning: '#4CAF50',
      outbid: '#FF9800',
      won: '#2196F3',
      lost: '#757575'
    };
    return colors[status] || '#666';
  },

  // Get auction status
  getAuctionStatus: (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    
    if (end <= now) return 'ended';
    
    const timeDiff = end - now;
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    
    if (hoursLeft <= 1) return 'ending-soon';
    if (hoursLeft <= 24) return 'ending-today';
    
    return 'active';
  },

  // Format large numbers (e.g., 1000 -> 1K)
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  },

  // Check if user is winning a bid
  isWinningBid: (userBids, itemId, userId) => {
    if (!userBids || !Array.isArray(userBids)) return false;
    
    const userBid = userBids.find(bid => 
      bid.item?._id === itemId && bid.bidder === userId
    );
    
    return userBid && userBid.status === 'active';
  },

  // Sort items
  sortItems: (items, sortBy) => {
    const sorted = [...items];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'price-low':
        return sorted.sort((a, b) => {
          const aPrice = parseFloat(a.currentBid.replace('$', ''));
          const bPrice = parseFloat(b.currentBid.replace('$', ''));
          return aPrice - bPrice;
        });
      case 'price-high':
        return sorted.sort((a, b) => {
          const aPrice = parseFloat(a.currentBid.replace('$', ''));
          const bPrice = parseFloat(b.currentBid.replace('$', ''));
          return bPrice - aPrice;
        });
      case 'ending-soon':
        return sorted.sort((a, b) => {
          const aTime = (a.daysLeft * 24) + a.hoursLeft;
          const bTime = (b.daysLeft * 24) + b.hoursLeft;
          return aTime - bTime;
        });
      case 'most-bids':
        return sorted.sort((a, b) => (b.bidCount || 0) - (a.bidCount || 0));
      default:
        return sorted;
    }
  },

  // Handle API errors
  handleAPIError: (error) => {
    if (error.response) {
      // Server responded with error
      return error.response.data?.message || 'Server error occurred';
    } else if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || 'Something went wrong';
    }
  },

  // Local storage helpers (using AsyncStorage)
  storage: {
    set: async (key, value) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
        return true;
      } catch (error) {
        console.error('Storage set error:', error);
        return false;
      }
    },

    get: async (key) => {
      try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      } catch (error) {
        console.error('Storage get error:', error);
        return null;
      }
    },

    remove: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('Storage remove error:', error);
        return false;
      }
    },

    clear: async () => {
      try {
        await AsyncStorage.clear();
        return true;
      } catch (error) {
        console.error('Storage clear error:', error);
        return false;
      }
    }
  }
};

export default helpers;