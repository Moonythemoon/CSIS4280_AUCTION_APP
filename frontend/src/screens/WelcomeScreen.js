import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef6ee" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="hammer" size={80} color="#de6b22" />
        </View>
        
        <Text style={styles.title}>AuctionHub</Text>
        <Text style={styles.subtitle}>
          Discover unique items and bid on amazing auctions
        </Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color="#de6b22" />
            <Text style={styles.featureText}>Browse thousands of items</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="trending-up" size={24} color="#de6b22" />
            <Text style={styles.featureText}>Place competitive bids</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cash" size={24} color="#de6b22" />
            <Text style={styles.featureText}>Sell your own items</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.signUpText}>Get Started</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.signInText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ee',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  features: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  signUpButton: {
    backgroundColor: '#de6b22',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#de6b22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signUpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signInButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInText: {
    color: '#de6b22',
    fontSize: 16,
    fontWeight: '600',
  },
});