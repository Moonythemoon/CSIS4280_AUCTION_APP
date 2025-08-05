import React, { createContext, useContext, useState } from 'react';

// Create context for sharing items between screens
const ItemContext = createContext();

// Hook to use items in any screen
export const useItems = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};

export const ItemsProvider = ({ children }) => {
  // Initial demo items
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Vintage Clock',
      startingPrice: '$45',
      currentBid: '$75',
      category: 'Home',
      photo: 'https://via.placeholder.com/150x150?text=Vintage+Clock',
      description: 'Beautiful antique clock from the 1940s',
      daysLeft: 3,
      hoursLeft: 14,
      bidCount: 12,
      seller: 'AntiqueDealer',
    },
    {
      id: '2',
      name: 'Old Vase',
      startingPrice: '$30',
      currentBid: '$65',
      category: 'Home',
      photo: 'https://via.placeholder.com/150x150?text=Old+Vase',
      description: 'Handcrafted ceramic vase',
      daysLeft: 5,
      hoursLeft: 8,
      bidCount: 8,
      seller: 'CeramicArt',
    },
  ]);

  const addItem = (newItem) => {
    const item = {
      id: Date.now().toString(),
      ...newItem,
      currentBid: newItem.startingPrice,
      bidCount: 0,
      daysLeft: 7,
      hoursLeft: 0,
      seller: 'You',
    };
    
    setItems(prevItems => [item, ...prevItems]);
    console.log('✅ Item added:', item.name);
  };

  return (
    <ItemContext.Provider value={{ items, addItem }}>
      {children}
    </ItemContext.Provider>
  );
};