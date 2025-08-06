import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StatusBar,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('items');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signOut } = useAuth();
  const { items } = useItems();

  // Filter items by current user
  const userItems = items.filter(item => item.seller === 'You');

  // Mock user bids (in a real app, this would come from backend)
  const userBids = [
    {
      id: '1',
      itemName: 'Vintage Clock',
      image: 'https://via.placeholder.com/100x100?text=Clock',
      myBid: '$75',
      currentBid: '$75',
      status: 'winning',
      daysLeft: 3,
    }
  ];

  const handleEditProfile = () => {
    setEditName(user?.name || '');
    setEditBio(user?.bio || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically update the user profile via API
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Here you would upload the image to your server
        console.log('New profile image selected:', result.assets[0].uri);
        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change profile picture');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'items':
        return (
          <View style={styles.tabContent}>
            {userItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No items listed yet</Text>
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => navigation.navigate('Upload')}
                >
                  <Text style={styles.addItemText}>List Your First Item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userItems.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => navigation.navigate('ItemDetail', { item })}
                >
                  <Image source={{ uri: item.photo }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.itemStats}>
                      <Text style={styles.itemStat}>
                        Current bid: <Text style={styles.itemPrice}>{item.currentBid}</Text>
                      </Text>
                      <Text style={styles.itemStat}>{item.bidCount} bids</Text>
                    </View>
                    <Text style={styles.daysLeft}>
                      {item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Ended'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        );

      case 'bids':
        return (
          <View style={styles.tabContent}>
            {userBids.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="hammer-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>No active bids</Text>
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.addItemText}>Start Bidding</Text>
                </TouchableOpacity>
              </View>
            ) : (
              userBids.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <View style={styles.itemStats}>
                      <Text style={styles.itemStat}>
                        My bid: <Text style={styles.itemPrice}>{item.myBid}</Text>
                      </Text>
                      <Text style={styles.itemStat}>
                        Current: <Text style={styles.itemPrice}>{item.currentBid}</Text>
                      </Text>
                    </View>
                    <View style={styles.bidStatus}>
                      <Text style={[
                        styles.statusText,
                        item.status === 'winning' ? styles.winning : styles.outbid
                      ]}>
                        {item.status === 'winning' ? 'WINNING' : 'OUTBID'}
                      </Text>
                      <Text style={styles.daysLeft}>{item.daysLeft} days left</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf5ee" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Header - REMOVED RATING */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleChangeProfilePicture}
          >
            <Image 
              source={{ uri: user?.profileImage || 'https://via.placeholder.com/100x100?text=User' }} 
              style={styles.profileImage} 
            />
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
            <Text style={styles.memberSince}>
              Member since {user?.memberSince ? 
                new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                'Recently'
              }
            </Text>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={16} color="#de6b22" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$0</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userItems.length}</Text>
            <Text style={styles.statLabel}>Items Listed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userBids.length}</Text>
            <Text style={styles.statLabel}>Active Bids</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'items' && styles.activeTab]}
            onPress={() => setActiveTab('items')}
          >
            <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
              My Items ({userItems.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bids' && styles.activeTab]}
            onPress={() => setActiveTab('bids')}
          >
            <Text style={[styles.tabText, activeTab === 'bids' && styles.activeTabText]}>
              My Bids ({userBids.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content - FIXED: Using regular View instead of FlatList */}
        {renderTabContent()}

        {/* App Info Button */}
        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={() => navigation.navigate('AppInfo')}
        >
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoButtonText}>App Info & Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bio (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />
                <Text style={styles.charCount}>{editBio.length}/200</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Upload')}>
          <Ionicons name="add-circle-outline" size={24} color="#666" />
          <Text style={styles.navText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={24} color="#de6b22" />
          <Text style={[styles.navText, styles.activeNavText]}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#de6b22',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#de6b22',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#de6b22',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
    minHeight: 200,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  addItemButton: {
    backgroundColor: '#de6b22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemStats: {
    marginBottom: 4,
  },
  itemStat: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#de6b22',
  },
  daysLeft: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  winning: {
    backgroundColor: '#e8f5e8',
    color: '#2d8f2d',
  },
  outbid: {
    backgroundColor: '#ffeaea',
    color: '#d32f2f',
  },
  infoButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#d32f2f',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    marginBottom: 100,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: '#de6b22',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#de6b22',
  },
});