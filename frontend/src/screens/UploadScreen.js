import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/api';
import { useItems } from '../context/ItemsContext';

export default function UploadScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Home');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { addItem } = useItems();

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        console.log('✅ Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.log('❌ Image picker error:', error);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow camera access to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        console.log('✅ Photo taken:', result.assets[0].uri);
      }
    } catch (error) {
      console.log('❌ Camera error:', error);
      Alert.alert('Error', 'Could not take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const calculateEndDate = () => {
    // Set auction to end in 7 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    return endDate.toISOString();
  };

  const handleSubmit = async () => {
    console.log('📤 Submit button pressed!');
    
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    
    if (!price.trim()) {
      Alert.alert('Error', 'Please enter starting price');
      return;
    }
    
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter description');
      return;
    }
    
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to list items');
      return;
    }

    setLoading(true);

    try {
      // For now, we'll add to local state (you can add backend integration later)
      const newItem = {
        name: name.trim(),
        startingPrice: parseFloat(price),
        category,
        photo: image,
        description: description.trim(),
        auctionEndDate: calculateEndDate(),
        sellerId: user.id
      };

      console.log('📦 Creating item:', newItem);

      // Add to local state first (immediate feedback)
      addItem({
        ...newItem,
        startingPrice: `${price}`,
        currentBid: `${price}`,
      });

      // TODO: Uncomment this when you want real backend integration
      // const result = await itemsAPI.createItem(newItem);
      // console.log('✅ Item created on backend:', result);

      Alert.alert(
        'Success!', 
        `${name} listed for ${price}!`,
        [{ 
          text: 'OK', 
          onPress: () => {
            // Clear form
            setName('');
            setPrice('');
            setDescription('');
            setImage(null);
            setCategory('Home');
            // Go to home
            navigation.navigate('Home');
          }
        }]
      );

    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to list item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fdf3e7" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Your Item</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Image Upload */}
          <TouchableOpacity onPress={showImageOptions} style={styles.imageUpload}>
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={40} color="#999" />
                <Text style={styles.imageText}>Tap to add photo</Text>
                <Text style={styles.imageSubtext}>Camera or Photo Library</Text>
              </View>
            )}
            {image && (
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={showImageOptions}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              placeholder="What are you selling?"
              style={styles.input}
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
          </View>

          {/* Starting Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Starting Price *</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                placeholder="0.00"
                style={styles.priceInput}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryRow}>
              {['Home', 'Electronics', 'Fashion'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.activeCategory,
                  ]}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat && styles.activeCategoryText,
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              placeholder="Describe your item in detail..."
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* Auction Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#de6b22" />
            <Text style={styles.infoText}>
              Your auction will run for 7 days and end automatically
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.submitText}>List My Item</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="add-circle" size={24} color="#de6b22" />
          <Text style={[styles.navText, styles.activeNavText]}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  imageUpload: {
    marginBottom: 20,
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#ccc',
  },
  imagePlaceholder: {
    backgroundColor: '#fff',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imageText: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
    fontWeight: '600',
  },
  imageSubtext: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  changeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#de6b22',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#de6b22',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCategory: {
    backgroundColor: '#de6b22',
    borderColor: '#de6b22',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeCategoryText: {
    color: '#fff',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#de6b22',
    marginLeft: 8,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#de6b22',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
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
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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