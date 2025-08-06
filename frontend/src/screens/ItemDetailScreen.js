import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { bidsAPI } from '../services/api';

export default function ItemDetailScreen({ navigation, route }) {
  const { item } = route.params || {};
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentBid, setCurrentBid] = useState(item?.currentBid || '$0');
  const [bidCount, setBidCount] = useState(item?.bidCount || 0);

  const { user } = useAuth();

  if (!item) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fdf3e7" />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#ccc" />
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </View>
    );
  }

  const getCurrentBidValue = () => {
    const bidValue = parseFloat(currentBid.replace('$', ''));
    return isNaN(bidValue) ? 0 : bidValue;
  };

  const getMinimumBid = () => {
    return getCurrentBidValue() + 1; // Minimum increment of $1
  };

  const handleBid = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to place bids');
      return;
    }

    if (!bidAmount) {
      Alert.alert('Error', 'Please enter a bid amount');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minimumBid = getMinimumBid();

    if (isNaN(bidValue)) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    if (bidValue < minimumBid) {
      Alert.alert('Error', `Bid must be at least $${minimumBid.toFixed(2)}`);
      return;
    }

    // Check if user is bidding on their own item
    if (item.seller === 'You' || item.seller === user.name) {
      Alert.alert('Error', 'You cannot bid on your own item');
      return;
    }

    setLoading(true);

    try {
      console.log('🔨 Placing bid:', {
        itemId: item.id,
        bidderId: user.id,
        amount: bidValue
      });

      // REAL BACKEND INTEGRATION
      try {
        const result = await bidsAPI.placeBid({
          itemId: item.id || item._id,
          bidderId: user.id,
          amount: bidValue
        });

        console.log('✅ Bid placed on backend:', result);

        // Update UI with backend response
        if (result.success) {
          const newBidAmount = `$${bidValue.toFixed(2)}`;
          setCurrentBid(newBidAmount);
          setBidCount(bidCount + 1);
          setBidAmount('');

          Alert.alert(
            'Bid Placed!', 
            `Your bid of $${bidValue.toFixed(2)} has been placed successfully!`,
            [{ text: 'OK' }]
          );
        }

      } catch (backendError) {
        console.log('⚠️  Backend unavailable, simulating bid:', backendError.message);
        
        // Graceful degradation - simulate successful bid
        const newBidAmount = `$${bidValue.toFixed(2)}`;
        setCurrentBid(newBidAmount);
        setBidCount(bidCount + 1);
        setBidAmount('');

        Alert.alert(
          'Bid Placed!', 
          `Your bid of $${bidValue.toFixed(2)} has been placed! (Local only - backend unavailable)`,
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('❌ Bid error:', error);
      Alert.alert('Error', error.message || 'Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (days, hours) => {
    if (days > 0) {
      return `${days}d ${hours}h left`;
    }
    return `${hours}h left`;
  };

  const isAuctionActive = () => {
    return (item.daysLeft > 0 || item.hoursLeft > 0);
  };

  const handleShare = () => {
    // Share functionality
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf3e7" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - REMOVED FAVORITE BUTTON */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.photo }} style={styles.image} />
          {isAuctionActive() && (
            <View style={styles.timeLeftBadge}>
              <Ionicons name="time" size={12} color="#fff" />
              <Text style={styles.timeLeftText}>
                {formatTimeLeft(item.daysLeft || 0, item.hoursLeft || 0)}
              </Text>
            </View>
          )}
          {!isAuctionActive() && (
            <View style={[styles.timeLeftBadge, styles.endedBadge]}>
              <Text style={styles.timeLeftText}>ENDED</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.sellerContainer}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.seller}>by {item.seller}</Text>
          </View>
          
          <View style={styles.priceSection}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Current Bid</Text>
              <Text style={styles.currentBid}>{currentBid}</Text>
              <Text style={styles.startingPrice}>Started at {item.startingPrice}</Text>
            </View>
            <View style={styles.bidInfo}>
              <Ionicons name="people" size={16} color="#666" />
              <Text style={styles.bidCount}>{bidCount} bid{bidCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>

          {/* Bid Section */}
          {isAuctionActive() && user && (
            <View style={styles.bidSection}>
              <Text style={styles.bidLabel}>Place Your Bid</Text>
              <Text style={styles.bidHint}>
                Minimum bid: ${getMinimumBid().toFixed(2)}
              </Text>
              <View style={styles.bidInputContainer}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.bidInput}
                  placeholder={getMinimumBid().toFixed(2)}
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.bidButton, loading && styles.disabledButton]} 
                onPress={handleBid}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="hammer" size={20} color="#fff" />
                    <Text style={styles.bidButtonText}>Place Bid</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Auction Ended Message */}
          {!isAuctionActive() && (
            <View style={styles.endedSection}>
              <Ionicons name="flag" size={24} color="#666" />
              <Text style={styles.endedText}>This auction has ended</Text>
            </View>
          )}

          {/* Login Required Message */}
          {!user && (
            <View style={styles.loginSection}>
              <Ionicons name="log-in" size={24} color="#de6b22" />
              <Text style={styles.loginText}>Login to place bids</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => navigation.navigate('SignIn')}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
  shareButton: {
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
  imageContainer: {
    position: 'relative',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#ccc',
  },
  timeLeftBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  endedBadge: {
    backgroundColor: 'rgba(211, 47, 47, 0.9)',
  },
  timeLeftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  seller: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentBid: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#de6b22',
    marginBottom: 4,
  },
  startingPrice: {
    fontSize: 12,
    color: '#999',
  },
  bidInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bidCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  bidSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bidLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bidHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 16,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#de6b22',
    marginRight: 8,
  },
  bidInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bidButton: {
    backgroundColor: '#de6b22',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#de6b22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  bidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  endedSection: {
    alignItems: 'center',
    padding: 40,
  },
  endedText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  loginSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 18,
    color: '#de6b22',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#de6b22',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});