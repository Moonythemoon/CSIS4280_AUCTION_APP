// Environment Configuration
const isDevelopment = __DEV__;

const config = {
  development: {
    API_BASE_URL: 'http://192.168.1.66:5000/api', // UPDATE WITH YOUR IP
    ENABLE_LOGGING: true,
    ENABLE_BACKEND: true,
    TIMEOUT: 10000,
  },
  production: {
    API_BASE_URL: 'https://your-backend-domain.com/api', // UPDATE WITH YOUR PRODUCTION URL
    ENABLE_LOGGING: false,
    ENABLE_BACKEND: true,
    TIMEOUT: 15000,
  }
};

export default isDevelopment ? config.development : config.production;

// Feature flags
export const features = {
  REAL_TIME_BIDDING: false, // Enable when you add WebSocket support
  PUSH_NOTIFICATIONS: false, // Enable when you add push notifications
  PAYMENT_INTEGRATION: false, // Enable when you add payments
  CHAT_SYSTEM: false, // Enable when you add messaging
  ADMIN_FEATURES: false, // Enable for admin users
  OFFLINE_MODE: true, // Allow app to work without backend
};