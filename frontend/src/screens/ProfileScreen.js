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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('items');
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
              <FlatList
                data={userItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
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
                )}
                showsVerticalScrollIndicator={false}
              />
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
              <FlatList
                data={userBids}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.itemCard}>
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
                )}
                showsVerticalScrollIndicator={false}
              />
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

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: user?.profileImage || 'https://via.placeholder.com/100x100?text=User' }} 
              style={styles.profileImage} 
            />
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.rating}>4.8</Text>
            </View>
          </View>
          
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
          
          <TouchableOpacity style={styles.editButton}>
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

        {/* Tab Content */}
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
  ratingContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
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