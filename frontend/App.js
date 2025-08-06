import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ItemsProvider } from './src/context/ItemsContext';

// Import all screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import UploadScreen from './src/screens/UploadScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AppInfoScreen from './src/screens/AppInfoScreen';

const Stack = createNativeStackNavigator();

// Auth Navigator (for unauthenticated users)
function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator (for authenticated users)
function MainNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Upload" component={UploadScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AppInfo" component={AppInfoScreen} />
      
      {/* Auth screens can still be accessed from main nav for sign out */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
    </Stack.Navigator>
  );
}

// App Content with Authentication Logic
function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    // You can create a loading screen component
    return null; // or <LoadingScreen />
  }

  // Show main app if authenticated, otherwise show auth flow
  if (isAuthenticated && user) {
    return (
      <ItemsProvider>
        <MainNavigator />
      </ItemsProvider>
    );
  }

  return <AuthNavigator />;
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}