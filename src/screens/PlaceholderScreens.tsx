import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export function MissionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Missions</Text>
      <Text style={styles.subtitle}>Mission tracker coming soon...</Text>
    </SafeAreaView>
  );
}

export function JournalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      <Text style={styles.subtitle}>Session log coming soon...</Text>
    </SafeAreaView>
  );
}

export function ShipScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ship</Text>
      <Text style={styles.subtitle}>Ship management coming soon...</Text>
    </SafeAreaView>
  );
}

export function MoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Settings and export coming soon...</Text>
    </SafeAreaView>
  );
}

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