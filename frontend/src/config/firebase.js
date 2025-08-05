import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxq5KfzFcnyNeUta255bF16Ak8ZF1nwqg",
  authDomain: "auth-app-e4a6b.firebaseapp.com",
  projectId: "auth-app-e4a6b",
  storageBucket: "auth-app-e4a6b.firebasestorage.app",
  messagingSenderId: "979629977056",
  appId: "1:979629977056:web:a5717c53a50b2dba7a4f85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export default app;