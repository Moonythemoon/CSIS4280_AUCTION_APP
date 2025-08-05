import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const handleSignIn = async () => {
    // Simple validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Starting signin process...');
      
      const result = await signIn({
        email: email.trim().toLowerCase(),
        password: password
      });

      console.log('✅ Signin result:', result);

      if (result.success) {
        // Check if email is verified
        if (!result.data.user.isEmailVerified) {
          Alert.alert(
            'Email Not Verified',
            'Please verify your email address before continuing.',
            [
              {
                text: 'Verify Now',
                onPress: () => navigation.navigate('EmailVerification', {
                  email: email.trim().toLowerCase(),
                  fromSignin: true
                })
              }
            ]
          );
        } else {
          // Navigate to Home screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }

    } catch (error) {
      console.error('❌ Signin error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message?.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('deactivated')) {
        errorMessage = 'Your account has been deactivated. Please contact support.';
      } else if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].msg || error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef6ee" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Your Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Your Password"
                placeholderTextColor="#999"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Ionicons 
                  name={passwordVisible ? 'eye' : 'eye-off'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.signinButton, loading && styles.disabledButton]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signinText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backToSignUpButton} 
              onPress={() => navigation.navigate('SignUp')}
            >
              <Text style={styles.backToSignUpText}>
                Don't have an account? <Text style={styles.linkText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ee',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  signinButton: {
    backgroundColor: '#de6b22',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#de6b22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  signinText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backToSignUpButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backToSignUpText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#de6b22',
    fontWeight: 'bold',
  },
});