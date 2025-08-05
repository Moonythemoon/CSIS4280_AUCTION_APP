import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useItems } from '../context/ItemsContext';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/api';
import ConnectionStatus from '../components/ConnectionStatus';

const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [backendItems, setBackendItems] = useState([]);
  
  const { items } = useItems(); // Local items
  const { user } = useAuth();

  const categories = ['ALL', 'Electronics', 'Fashion', 'Home'];

  // Fetch items from backend on component mount
  useEffect(() => {
    fetchBackendItems();
  }, []);

  const fetchBackendItems = async () => {
    try {
      console.log('📦 Fetching items from backend...');
      const result = await itemsAPI.getItems();
      if (result.success && result.data.items) {
        setBackendItems(result.data.items);
        console.log('✅ Loaded', result.data.items.length, 'items from backend');
      }
    } catch (error) {
      console.log('⚠️  Backend unavailable, using local items only:', error.message);
      // Graceful degradation - continue with local items
    }
  };

  // Combine local and backend items
  const allItems = [
    ...items, // Local items
    ...backendItems.map(item => ({
      ...item,
      id: item._id || item.id,
      currentBid: `${item.currentBid}`,
      startingPrice: `${item.startingPrice}`,
      seller: item.seller?.name || item.seller,
      daysLeft: item.timeLeft?.days || 0,
      hoursLeft: item.timeLeft?.hours || 0,
    }))
  ];

  // Enhanced filtering with search functionality
  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = search === '' || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.seller.toLowerCase().includes(search.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBackendItems();
    setRefreshing(false);
  };

  const formatTimeLeft = (days, hours) => {
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h left`;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.photo }} 
          style={styles.image}
          defaultSource={{ uri: 'https://via.placeholder.com/150x150?text=No+Image' }}
        />
        <View style={styles.timeLeftBadge}>
          <Text style={styles.timeLeftText}>
            {formatTimeLeft(item.daysLeft, item.hoursLeft)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.seller}>by {item.seller}</Text>
        
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Current Bid</Text>
            <Text style={styles.currentBid}>{item.currentBid}</Text>
          </View>
          <View style={styles.bidInfo}>
            <Ionicons name="people" size={12} color="#666" />
            <Text style={styles.bidCount}>{item.bidCount} bids</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf3e7" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Welcome back!</Text>
          {user && <Text style={styles.userName}>{user.name}</Text>}
        </View>
        <View style={styles.headerRight}>
          <ConnectionStatus />
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search auctions..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.activeCategoryButton
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.activeCategoryText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Items Count */}
      <View style={styles.itemsCountContainer}>
        <Text style={styles.itemsCount}>
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or category filter
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#de6b22" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Upload')}>
          <Ionicons name="add-circle-outline" size={24} color="#666" />
          <Text style={styles.navText}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf3e7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingLeft: 20,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  activeCategoryButton: {
    backgroundColor: '#de6b22',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  itemsCountContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  itemsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  timeLeftBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeLeftText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#de6b22',
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
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