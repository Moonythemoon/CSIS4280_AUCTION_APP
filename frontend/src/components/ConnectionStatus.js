import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { testConnection } from '../services/api';

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      await testConnection();
      setIsConnected(true);
      console.log('✅ Backend connected');
    } catch (error) {
      setIsConnected(false);
      console.log('❌ Backend disconnected:', error.message);
    } finally {
      setIsChecking(false);
    }
  };

  if (isConnected === null) return null; // Don't show until first check

  return (
    <TouchableOpacity style={styles.container} onPress={checkConnection}>
      <View style={[styles.indicator, isConnected ? styles.connected : styles.disconnected]}>
        <Ionicons 
          name={isChecking ? "refresh" : (isConnected ? "wifi" : "wifi-off")} 
          size={12} 
          color="#fff" 
        />
      </View>
      <Text style={[styles.text, isConnected ? styles.connectedText : styles.disconnectedText]}>
        {isChecking ? 'Checking...' : (isConnected ? 'Backend Online' : 'Offline Mode')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
  },
  indicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#FF5722',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  connectedText: {
    color: '#4CAF50',
  },
  disconnectedText: {
    color: '#FF5722',
  },
});