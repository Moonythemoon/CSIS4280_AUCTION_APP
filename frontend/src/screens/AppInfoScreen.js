import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { testConnection } from '../services/api';
import config, { features } from '../config/environment';

export default function AppInfoScreen({ navigation }) {
  const { user } = useAuth();

  const testBackendConnection = async () => {
    try {
      const result = await testConnection();
      alert(`✅ Backend Connected!\n\nStatus: ${result.status}\nProject: ${result.project || 'Auction App'}`);
    } catch (error) {
      alert(`❌ Backend Disconnected\n\nError: ${error.message}`);
    }
  };

  const InfoRow = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.infoRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color="#de6b22" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoRight}>
        <Text style={styles.infoValue}>{value}</Text>
        {onPress && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf5ee" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Info</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application</Text>
          <InfoRow icon="hammer" label="App Name" value="AuctionHub" />
          <InfoRow icon="code-slash" label="Version" value="1.0.0" />
          <InfoRow icon="school" label="Course" value="CSIS 4280" />
          <InfoRow icon="flask" label="Environment" value={__DEV__ ? 'Development' : 'Production'} />
        </View>

        {/* User Info Section */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Information</Text>
            <InfoRow icon="person" label="Name" value={user.name} />
            <InfoRow icon="mail" label="Email" value={user.email} />
            <InfoRow icon="checkmark-circle" label="Email Verified" value={user.isEmailVerified ? 'Yes' : 'No'} />
            <InfoRow icon="calendar" label="Member Since" value={
              user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'Recently'
            } />
          </View>
        )}

        {/* Backend Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Configuration</Text>
          <InfoRow icon="server" label="API URL" value={config.API_BASE_URL} />
          <InfoRow icon="time" label="Timeout" value={`${config.TIMEOUT / 1000}s`} />
          <InfoRow icon="bug" label="Logging" value={config.ENABLE_LOGGING ? 'Enabled' : 'Disabled'} />
          <InfoRow 
            icon="pulse" 
            label="Test Connection" 
            value="Tap to test" 
            onPress={testBackendConnection}
          />
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <InfoRow icon="checkmark-circle" label="User Authentication" value="✅ Active" />
          <InfoRow icon="checkmark-circle" label="Item Listing" value="✅ Active" />
          <InfoRow icon="checkmark-circle" label="Bidding System" value="✅ Active" />
          <InfoRow icon="checkmark-circle" label="Image Upload" value="✅ Active" />
          <InfoRow icon="checkmark-circle" label="Profile Management" value="✅ Active" />
          <InfoRow icon="time" label="Real-time Bidding" value={features.REAL_TIME_BIDDING ? "✅ Active" : "⏳ Coming Soon"} />
          <InfoRow icon="notifications" label="Push Notifications" value={features.PUSH_NOTIFICATIONS ? "✅ Active" : "⏳ Coming Soon"} />
          <InfoRow icon="card" label="Payments" value={features.PAYMENT_INTEGRATION ? "✅ Active" : "⏳ Coming Soon"} />
        </View>

        {/* Technical Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Stack</Text>
          <InfoRow icon="logo-react" label="Frontend" value="React Native + Expo" />
          <InfoRow icon="server" label="Backend" value="Node.js + Express" />
          <InfoRow icon="library" label="Database" value="MongoDB Atlas" />
          <InfoRow icon="shield-checkmark" label="Authentication" value="JWT Tokens" />
          <InfoRow icon="image" label="Image Storage" value="Local + Cloudinary Ready" />
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <InfoRow icon="help-circle" label="Help & Support" value="Contact Developer" />
          <InfoRow icon="document-text" label="Privacy Policy" value="View Policy" />
          <InfoRow icon="shield" label="Terms of Service" value="View Terms" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf5ee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
});