import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { store, persistor } from './src/store';
import AppNavigator from './src/components/AppNavigator';
import { initializeGalaxy } from './src/store/slices/sectorsSlice';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>Loading Space Ace...</Text>
    </View>
  );
}

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize with some basic galaxy sectors
    dispatch(initializeGalaxy());
  }, [dispatch]);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <StatusBar style="auto" />
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});
