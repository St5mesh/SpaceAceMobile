import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export function SectorDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Sector Detail</Text>
      <Text style={styles.subtitle}>Sector details coming soon...</Text>
    </SafeAreaView>
  );
}

export function MissionDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mission Detail</Text>
      <Text style={styles.subtitle}>Mission details coming soon...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});