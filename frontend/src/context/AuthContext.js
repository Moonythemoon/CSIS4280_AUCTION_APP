import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthAPI } from '../services/firebaseAuth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('🔍 Setting up Firebase auth listener...');
    
    const unsubscribe = firebaseAuthAPI.onAuthStateChanged((firebaseUser) => {
      console.log('🔥 Firebase auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  // Sign up function with Firebase
  const signUp = async (userData) => {
    try {
      setIsLoading(true);
      console.log('📝 Starting Firebase signup...');
      
      const result = await firebaseAuthAPI.signUp(
        userData.email,
        userData.password,
        userData.name
      );
      
      console.log('✅ Firebase signup successful');
      return result;
      
    } catch (error) {
      console.error('❌ Firebase signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function with Firebase
  const signIn = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('🔑 Starting Firebase signin...');
      
      const result = await firebaseAuthAPI.signIn(
        credentials.email,
        credentials.password
      );
      
      console.log('✅ Firebase signin successful');
      return result;
      
    } catch (error) {
      console.error('❌ Firebase signin error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Send email verification
  const sendEmailVerification = async () => {
    try {
      setIsLoading(true);
      console.log('📧 Sending email verification...');
      
      const result = await firebaseAuthAPI.sendEmailVerification();
      
      console.log('✅ Email verification sent');
      return result;
      
    } catch (error) {
      console.error('❌ Email verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      await firebaseAuthAPI.signOut();
      console.log('✅ Signout successful');
    } catch (error) {
      console.error('❌ Signout error:', error);
    }
  };

  // Refresh user data (to check if email was verified)
  const refreshUser = () => {
    const currentUser = firebaseAuthAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  };

  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Functions
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
    refreshUser,
    
    // Firebase specific
    isFirebaseEnabled: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;