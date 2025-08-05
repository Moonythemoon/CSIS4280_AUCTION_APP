import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Firebase Authentication Service
export const firebaseAuthAPI = {
  // Sign up with email and password
  signUp: async (email, password, displayName) => {
    try {
      console.log(' Firebase: Creating user account...');
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Send email verification
      await sendEmailVerification(user);
      console.log('📧 Email verification sent to:', email);
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          name: displayName || user.displayName,
          emailVerified: user.emailVerified,
          profileImage: user.photoURL || 'https://via.placeholder.com/100x100?text=User'
        },
        message: 'Account created successfully! Please check your email to verify your account.'
      };
      
    } catch (error) {
      console.error('🔥 Firebase signup error:', error);
      throw {
        success: false,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      console.log('🔥 Firebase: Signing in user...');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          emailVerified: user.emailVerified,
          profileImage: user.photoURL || 'https://via.placeholder.com/100x100?text=User'
        },
        message: 'Login successful!'
      };
      
    } catch (error) {
      console.error(' Firebase signin error:', error);
      throw {
        success: false,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Send email verification
  sendEmailVerification: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }
      
      await sendEmailVerification(user);
      console.log('📧 Email verification sent');
      
      return {
        success: true,
        message: 'Verification email sent successfully!'
      };
      
    } catch (error) {
      console.error(' Firebase email verification error:', error);
      throw {
        success: false,
        message: getFirebaseErrorMessage(error.code)
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      console.log('🔥 Firebase: User signed out');
      return { success: true };
    } catch (error) {
      console.error(' Firebase signout error:', error);
      throw {
        success: false,
        message: 'Error signing out'
      };
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = auth.currentUser;
    if (user) {
      return {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        emailVerified: user.emailVerified,
        profileImage: user.photoURL || 'https://via.placeholder.com/100x100?text=User'
      };
    }
    return null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback({
          id: user.uid,
          email: user.email,
          name: user.displayName,
          emailVerified: user.emailVerified,
          profileImage: user.photoURL || 'https://via.placeholder.com/100x100?text=User'
        });
      } else {
        callback(null);
      }
    });
  }
};

// Helper function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};