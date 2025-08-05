import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace with your actual IP address
// Find it with: ipconfig (look for IPv4 Address)
const BASE_URL = 'http://192.168.1.66:5000/api'; // UPDATE THIS IP ADDRESS!

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Sign up new user
  signUp: async (userData) => {
    try {
      console.log('📝 API: Signing up user:', userData.email);
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('❌ API Signup error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Sign in user
  signIn: async (credentials) => {
    try {
      console.log('🔑 API: Signing in user:', credentials.email);
      const response = await api.post('/auth/signin', credentials);
      return response.data;
    } catch (error) {
      console.error('❌ API Signin error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Verify email
  verifyEmail: async (email, code) => {
    try {
      console.log('📧 API: Verifying email:', email);
      const response = await api.post('/auth/verify-email', { email, code });
      return response.data;
    } catch (error) {
      console.error('❌ API Email verification error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Resend verification code
  resendVerification: async (email) => {
    try {
      console.log('🔄 API: Resending verification for:', email);
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('❌ API Resend verification error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

// Items API calls
export const itemsAPI = {
  // Get all items with optional filters
  getItems: async (filters = {}) => {
    try {
      console.log('📦 API: Fetching items with filters:', filters);
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/items?${params}`);
      return response.data;
    } catch (error) {
      console.error('❌ API Get items error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get single item by ID
  getItem: async (itemId) => {
    try {
      console.log('📦 API: Fetching item:', itemId);
      const response = await api.get(`/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('❌ API Get item error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Create new item
  createItem: async (itemData) => {
    try {
      console.log('📦 API: Creating item:', itemData.name);
      const response = await api.post('/items', itemData);
      return response.data;
    } catch (error) {
      console.error('❌ API Create item error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

// Bids API calls
export const bidsAPI = {
  // Place a bid
  placeBid: async (bidData) => {
    try {
      console.log('🔨 API: Placing bid:', bidData);
      const response = await api.post('/bids', bidData);
      return response.data;
    } catch (error) {
      console.error('❌ API Place bid error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Get user's bids
  getUserBids: async (userId) => {
    try {
      console.log('🔨 API: Fetching bids for user:', userId);
      const response = await api.get(`/bids/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ API Get user bids error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

// Test API connection
export const testConnection = async () => {
  try {
    console.log('🧪 API: Testing connection...');
    const response = await api.get('/health');
    console.log('✅ API connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    throw error;
  }
};

export default api;