import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function EmailVerificationScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  const { user, sendEmailVerification, refreshUser } = useAuth();

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkVerificationStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const checkVerificationStatus = async () => {
    if (checkingVerification) return;
    
    setCheckingVerification(true);
    try {
      // Refresh user data to get latest email verification status
      refreshUser();
      
      // Check if email is now verified
      if (user?.emailVerified) {
        Alert.alert(
          'Email Verified! ✅',
          'Your email has been successfully verified!',
          [{
            text: 'Continue to App',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }]
        );
      }
    } catch (error) {
      console.log('Check verification error:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const result = await sendEmailVerification();
      
      if (result.success) {
        Alert.alert(
          'Email Sent! 📧',
          'A new verification email has been sent to your inbox. Please check your email and click the verification link.'
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheck = async () => {
    setLoading(true);
    await checkVerificationStatus();
    
    if (!user?.emailVerified) {
      Alert.alert(
        'Not Verified Yet',
        'Please check your email and click the verification link, then try again.'
      );
    }
    setLoading(false);
  };

  const handleSkipForNow = () => {
    Alert.alert(
      'Skip Verification?',
      'You can verify your email later, but some features may be limited.',
      [
        { text: 'Stay Here', style: 'cancel' },
        {
          text: 'Skip for Now',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef6ee" />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Ionicons name="mail" size={80} color="#de6b22" />
      </View>

      <Text style={styles.title}>Check your email</Text>
      <Text style={styles.subtitle}>
        We've sent a verification link to{'\n'}
        <Text style={styles.emailText}>{user?.email || 'your email'}</Text>
      </Text>

      <View style={styles.instructionBox}>
        <Ionicons name="information-circle" size={24} color="#de6b22" />
        <Text style={styles.instructionText}>
          Click the link in your email to verify your account. 
          This screen will automatically detect when you've verified your email.
        </Text>
      </View>

      {checkingVerification && (
        <View style={styles.checkingContainer}>
          <ActivityIndicator color="#de6b22" size="small" />
          <Text style={styles.checkingText}>Checking verification status...</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          onPress={handleManualCheck}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>I've Verified My Email</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, loading && styles.disabledButton]} 
          onPress={handleResendEmail}
          disabled={loading}
        >
          <Ionicons name="mail-outline" size={20} color="#de6b22" />
          <Text style={styles.secondaryButtonText}>Resend Email</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.textButton} 
          onPress={handleSkipForNow}
        >
          <Text style={styles.textButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helpText}>
        Check your spam folder if you don't see the email. 
        The verification link will expire in 1 hour.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ee',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#de6b22',
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#de6b22',
    lineHeight: 20,
    marginLeft: 12,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  checkingText: {
    fontSize: 14,
    color: '#de6b22',
    marginLeft: 8,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#de6b22',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#de6b22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#de6b22',
  },
  secondaryButtonText: {
    color: '#de6b22',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#666',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});