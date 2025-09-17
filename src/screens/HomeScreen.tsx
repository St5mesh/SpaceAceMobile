import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { TabParamList, RootStackParamList } from '../types';
import { startSession } from '../store/slices/sessionsSlice';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();
  
  const character = useSelector((state: RootState) => state.character.current);
  const ship = useSelector((state: RootState) => state.ship.current);
  const currentSectorId = useSelector((state: RootState) => state.sectors.currentSector);
  const currentSector = useSelector((state: RootState) => 
    currentSectorId ? state.sectors.sectors[currentSectorId] : null
  );
  const currentSession = useSelector((state: RootState) => {
    const sessionId = state.sessions.currentSessionId;
    return sessionId ? state.sessions.sessions[sessionId] : null;
  });

  const handleStartSession = () => {
    dispatch(startSession({ summary: `Session ${new Date().toLocaleDateString()}` }));
  };

  const handleQuickRoll = () => {
    navigation.navigate('DiceRoller');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Space Ace</Text>
          <Text style={styles.subtitle}>Voyages in Infinite Space</Text>
        </View>

        {/* Character & Ship Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          
          {/* Character Card */}
          {character ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <Text style={styles.cardTitle}>{character.name}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Fame</Text>
                  <Text style={styles.statValue}>{character.fame}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Sway</Text>
                  <Text style={styles.statValue}>{character.sway}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Heat</Text>
                  <Text style={styles.statValue}>{character.heat}</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.card, styles.createCard]}
              onPress={() => navigation.navigate('Character')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.createText}>Create Character</Text>
            </TouchableOpacity>
          )}

          {/* Ship Card */}
          {ship ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="rocket" size={20} color="#007AFF" />
                <Text style={styles.cardTitle}>{ship.name}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Shields</Text>
                  <Text style={styles.statValue}>{ship.shields}/{ship.maxShields}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Hull</Text>
                  <Text style={styles.statValue}>{ship.hull}/{ship.maxHull}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Drive</Text>
                  <Text style={styles.statValue}>{ship.driveRange}</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.card, styles.createCard]}
              onPress={() => navigation.navigate('Ship')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.createText}>Create Ship</Text>
            </TouchableOpacity>
          )}

          {/* Current Sector */}
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Galaxy')}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="planet" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Current Sector</Text>
            </View>
            <Text style={styles.cardSubtext}>
              {currentSector ? currentSector.name : 'Unknown Space'}
            </Text>
            {currentSector && (
              <Text style={styles.cardDetail}>
                {currentSector.type} • ({currentSector.hexQ}, {currentSector.hexR})
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Session Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          
          {currentSession ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="play-circle" size={20} color="#28A745" />
                <Text style={styles.cardTitle}>Active Session</Text>
              </View>
              <Text style={styles.cardSubtext}>{currentSession.summary}</Text>
              <Text style={styles.cardDetail}>
                Started: {new Date(currentSession.dateRange.start).toLocaleString()}
              </Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.card, styles.primaryButton]}
              onPress={handleStartSession}
            >
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.primaryButtonText}>Start New Session</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={handleQuickRoll}
            >
              <Ionicons name="cube" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Roll Dice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Journal')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Quick Log</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Galaxy')}
            >
              <Ionicons name="navigate" size={24} color="#007AFF" />
              <Text style={styles.quickActionText}>Hypersurf</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  createText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1a1a1a',
  },
  cardSubtext: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 2,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});