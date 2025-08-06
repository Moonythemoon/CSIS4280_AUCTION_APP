// App constants and configuration
export const COLORS = {
  // Primary colors
  primary: '#de6b22',
  primaryLight: '#ff8c42',
  primaryDark: '#b8541a',
  
  // Background colors
  background: '#fef6ee',
  backgroundLight: '#fdf5ee',
  backgroundDark: '#f5f0e8',
  
  // Text colors
  textPrimary: '#333',
  textSecondary: '#666',
  textLight: '#999',
  textWhite: '#fff',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#f44336',
  info: '#2196F3',
  
  // UI colors
  white: '#fff',
  black: '#000',
  gray: '#f5f5f5',
  grayLight: '#f8f9fa',
  grayDark: '#ddd',
  border: '#eee',
  shadow: 'rgba(0,0,0,0.1)',
  
  // Gradient colors
  gradientStart: '#de6b22',
  gradientEnd: '#ff8c42',
};

export const FONTS = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 28,
    massive: 32,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

export const CATEGORIES = [
  { id: 'ALL', name: 'All Categories', icon: 'apps' },
  { id: 'Electronics', name: 'Electronics', icon: 'phone-portrait' },
  { id: 'Fashion', name: 'Fashion', icon: 'shirt' },
  { id: 'Home', name: 'Home & Garden', icon: 'home' },
  { id: 'Sports', name: 'Sports', icon: 'basketball' },
  { id: 'Books', name: 'Books', icon: 'book' },
  { id: 'Art', name: 'Art & Collectibles', icon: 'color-palette' },
];

export const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First', icon: 'time' },
  { id: 'oldest', name: 'Oldest First', icon: 'time-outline' },
  { id: 'price-low', name: 'Price: Low to High', icon: 'arrow-up' },
  { id: 'price-high', name: 'Price: High to Low', icon: 'arrow-down' },
  { id: 'ending-soon', name: 'Ending Soon', icon: 'hourglass' },
  { id: 'most-bids', name: 'Most Bids', icon: 'trending-up' },
];

export const ITEM_CONDITIONS = [
  { id: 'new', name: 'New', description: 'Brand new, never used' },
  { id: 'like-new', name: 'Like New', description: 'Excellent condition, barely used' },
  { id: 'good', name: 'Good', description: 'Good condition with minimal wear' },
  { id: 'fair', name: 'Fair', description: 'Fair condition with some wear' },
  { id: 'poor', name: 'Poor', description: 'Poor condition, significant wear' },
];

export const AUCTION_DURATIONS = [
  { id: 1, name: '1 Day', days: 1 },
  { id: 3, name: '3 Days', days: 3 },
  { id: 5, name: '5 Days', days: 5 },
  { id: 7, name: '7 Days', days: 7 },
  { id: 10, name: '10 Days', days: 10 },
  { id: 14, name: '14 Days', days: 14 },
  { id: 21, name: '21 Days', days: 21 },
  { id: 30, name: '30 Days', days: 30 },
];

export const BID_STATUS = {
  ACTIVE: 'active',
  OUTBID: 'outbid',
  WINNING: 'winning',
  WON: 'won',
  LOST: 'lost',
};

export const ITEM_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
  SOLD: 'sold',
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

export const API_ENDPOINTS = {
  // Auth
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  PROFILE: '/auth/profile',
  
  // Items
  ITEMS: '/items',
  ITEM_BY_ID: '/items/:id',
  FEATURED_ITEMS: '/items/featured',
  ENDING_SOON: '/items/ending-soon',
  
  // Bids
  BIDS: '/bids',
  ITEM_BIDS: '/bids/item/:itemId',
  USER_BIDS: '/bids/user/:userId',
  WINNING_BIDS: '/bids/user/:userId/winning',
  BID_HISTORY: '/bids/item/:itemId/history',
  
  // Health
  HEALTH: '/health',
  STATS: '/stats',
  TEST_DB: '/test-db',
};

export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  ITEM_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  ITEM_DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  BID: {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 1000000,
  },
  PHONE: {
    REGEX: /^\+?[\d\s\-\(\)]{10,}$/,
  },
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  QUALITY: 0.8,
  ASPECT_RATIO: [4, 3],
};

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
};

export const TIMEOUTS = {
  API_REQUEST: 10000, // 10 seconds
  IMAGE_UPLOAD: 30000, // 30 seconds
  WEBSOCKET_RECONNECT: 5000, // 5 seconds
};

export const LOCAL_STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETE: 'onboardingComplete',
  SEARCH_HISTORY: 'searchHistory',
  FAVORITE_ITEMS: 'favoriteItems',
  NOTIFICATION_SETTINGS: 'notificationSettings',
};

export const NOTIFICATION_TYPES = {
  BID_PLACED: 'bid_placed',
  OUTBID: 'outbid',
  AUCTION_WON: 'auction_won',
  AUCTION_ENDED: 'auction_ended',
  AUCTION_ENDING_SOON: 'auction_ending_soon',
  ITEM_SOLD: 'item_sold',
  NEW_MESSAGE: 'new_message',
  ACCOUNT_UPDATE: 'account_update',
};

export const FEATURES = {
  REAL_TIME_BIDDING: false,
  PUSH_NOTIFICATIONS: false,
  PAYMENT_INTEGRATION: false,
  CHAT_SYSTEM: false,
  ADMIN_FEATURES: false,
  OFFLINE_MODE: true,
  ADVANCED_SEARCH: true,
  FAVORITES: true,
  WATCH_LIST: true,
  AUTO_BIDDING: false,
};

export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/auctionhub',
  TWITTER: 'https://twitter.com/auctionhub',
  INSTAGRAM: 'https://instagram.com/auctionhub',
  LINKEDIN: 'https://linkedin.com/company/auctionhub',
};

export const SUPPORT = {
  EMAIL: 'support@auctionhub.com',
  PHONE: '+1 (555) 123-4567',
  HOURS: 'Monday - Friday, 9 AM - 6 PM EST',
  FAQ_URL: 'https://auctionhub.com/faq',
  HELP_URL: 'https://auctionhub.com/help',
};

export const APP_INFO = {
  NAME: 'AuctionHub',
  VERSION: '1.0.0',
  BUILD: '1',
  COURSE: 'CSIS 4280',
  AUTHOR: 'CSIS 4280 Student',
  COPYRIGHT: '© 2024 AuctionHub',
  DESCRIPTION: 'The ultimate marketplace for bidding on unique items',
  KEYWORDS: ['auction', 'bidding', 'marketplace', 'items', 'buying', 'selling'],
};

export const ANIMATIONS = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
};

// Screen names for navigation
export const SCREENS = {
  // Auth Stack
  WELCOME: 'Welcome',
  SIGN_IN: 'SignIn',
  SIGN_UP: 'SignUp',
  EMAIL_VERIFICATION: 'EmailVerification',
  
  // Main Stack
  HOME: 'Home',
  ITEM_DETAIL: 'ItemDetail',
  UPLOAD: 'Upload',
  PROFILE: 'Profile',
  APP_INFO: 'AppInfo',
  
  // Additional screens
  SEARCH: 'Search',
  FAVORITES: 'Favorites',
  MY_BIDS: 'MyBids',
  MY_ITEMS: 'MyItems',
  SETTINGS: 'Settings',
  HELP: 'Help',
  NOTIFICATIONS: 'Notifications',
};

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  CATEGORIES,
  SORT_OPTIONS,
  ITEM_CONDITIONS,
  AUCTION_DURATIONS,
  BID_STATUS,
  ITEM_STATUS,
  USER_ROLES,
  API_ENDPOINTS,
  VALIDATION_RULES,
  IMAGE_CONFIG,
  PAGINATION,
  TIMEOUTS,
  LOCAL_STORAGE_KEYS,
  NOTIFICATION_TYPES,
  FEATURES,
  SOCIAL_LINKS,
  SUPPORT,
  APP_INFO,
  ANIMATIONS,
  SCREENS,
};