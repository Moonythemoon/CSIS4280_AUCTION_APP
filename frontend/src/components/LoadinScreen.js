import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef6ee" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="hammer" size={60} color="#de6b22" />
        </View>
        
        <ActivityIndicator size="large" color="#de6b22" style={styles.spinner} />
        
        <Text style={styles.appName}>AuctionHub</Text>
        <Text style={styles.message}>{message}</Text>
        
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>CSIS 4280 Project</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef6ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  spinner: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#de6b22',
    marginHorizontal: 4,
  },
  dot1: {
    opacity: 1,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.3,
  },
  footer: {
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});