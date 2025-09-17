import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { moveTo, discoverSector } from '../store/slices/sectorsSlice';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { LogEntryType, Sector, SectorType } from '../types';

export default function GalaxyScreen() {
  const dispatch = useDispatch();
  const sectors = useSelector((state: RootState) => state.sectors.sectors);
  const currentSectorId = useSelector((state: RootState) => state.sectors.currentSector);
  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  
  const sectorList = Object.values(sectors).sort((a, b) => {
    // Sort by discovered first, then by distance from origin
    if (a.discoveredAt && !b.discoveredAt) return -1;
    if (!a.discoveredAt && b.discoveredAt) return 1;
    
    const distanceA = Math.abs(a.hexQ) + Math.abs(a.hexR) + Math.abs(-a.hexQ - a.hexR);
    const distanceB = Math.abs(b.hexQ) + Math.abs(b.hexR) + Math.abs(-b.hexQ - b.hexR);
    return distanceA - distanceB;
  });

  const handleHypersurf = (sector: Sector) => {
    if (sector.id === currentSectorId) return;
    
    const wasUndiscovered = !sector.discoveredAt;
    
    // Move to the sector (this will auto-discover it)
    dispatch(moveTo(sector.id));
    
    // Log the travel if in session
    if (currentSessionId) {
      dispatch(logQuickEvent({
        type: LogEntryType.TRAVEL,
        sessionId: currentSessionId,
        data: { 
          fromSectorId: currentSectorId,
          toSectorId: sector.id,
          coordinates: `(${sector.hexQ}, ${sector.hexR})`,
          wasUndiscovered,
        },
        note: `Hypersurfed to ${sector.name}${wasUndiscovered ? ' (newly discovered!)' : ''}`,
        entityIds: [sector.id],
      }));
    }
  };

  const getSectorIcon = (sector: Sector) => {
    if (!sector.discoveredAt) return 'help-circle-outline';
    
    switch (sector.type) {
      case SectorType.CIVILIZED:
        return 'business';
      case SectorType.FRONTIER:
        return 'home-outline';
      case SectorType.DANGEROUS:
        return 'warning';
      case SectorType.ANOMALY:
        return 'flash';
      default:
        return 'planet-outline';
    }
  };

  const getSectorColor = (sector: Sector) => {
    if (!sector.discoveredAt) return '#ccc';
    if (sector.isDangerous) return '#DC3545';
    
    switch (sector.type) {
      case SectorType.CIVILIZED:
        return '#28A745';
      case SectorType.FRONTIER:
        return '#007AFF';
      case SectorType.DANGEROUS:
        return '#DC3545';
      case SectorType.ANOMALY:
        return '#6F42C1';
      default:
        return '#666';
    }
  };

  const renderSectorItem = ({ item: sector }: { item: Sector }) => {
    const isCurrentSector = sector.id === currentSectorId;
    const isSelected = sector.id === selectedSectorId;

    return (
      <TouchableOpacity
        style={[
          styles.sectorItem,
          isCurrentSector && styles.currentSectorItem,
          isSelected && styles.selectedSectorItem,
        ]}
        onPress={() => setSelectedSectorId(isSelected ? null : sector.id)}
      >
        <View style={styles.sectorHeader}>
          <Ionicons 
            name={getSectorIcon(sector)} 
            size={24} 
            color={getSectorColor(sector)} 
          />
          <View style={styles.sectorInfo}>
            <Text style={[
              styles.sectorName,
              !sector.discoveredAt && styles.undiscoveredText
            ]}>
              {sector.discoveredAt ? sector.name : 'Unknown Sector'}
            </Text>
            <Text style={styles.sectorCoords}>
              ({sector.hexQ}, {sector.hexR})
            </Text>
            {sector.discoveredAt && (
              <Text style={styles.sectorType}>
                {sector.type.charAt(0).toUpperCase() + sector.type.slice(1)}
              </Text>
            )}
          </View>
          <View style={styles.sectorActions}>
            {isCurrentSector && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
            {sector.isDangerous && (
              <Ionicons name="warning" size={16} color="#DC3545" />
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.sectorDetails}>
            {sector.discoveredAt && sector.notes && (
              <Text style={styles.sectorNotes}>{sector.notes}</Text>
            )}
            
            <View style={styles.sectorStats}>
              <Text style={styles.statText}>
                Encounters: {sector.linkedEncounterIds.length}
              </Text>
              <Text style={styles.statText}>
                Missions: {sector.linkedMissionIds.length}
              </Text>
              {sector.discoveredAt && (
                <Text style={styles.statText}>
                  Discovered: {new Date(sector.discoveredAt).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            {sector.id !== currentSectorId && (
              <TouchableOpacity
                style={styles.hypersurfButton}
                onPress={() => handleHypersurf(sector)}
              >
                <Ionicons name="navigate" size={16} color="white" />
                <Text style={styles.hypersurfButtonText}>
                  Hypersurf Here
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Galaxy Map</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statText}>
            {sectorList.filter(s => s.discoveredAt).length} discovered
          </Text>
        </View>
      </View>

      {/* Simple hex grid visualization */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hex Grid (Simple View)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.hexGrid}>
            {sectorList.slice(0, 12).map((sector) => (
              <TouchableOpacity
                key={sector.id}
                style={[
                  styles.hexTile,
                  sector.id === currentSectorId && styles.currentHexTile,
                  !sector.discoveredAt && styles.undiscoveredHexTile,
                ]}
                onPress={() => handleHypersurf(sector)}
              >
                <Text style={[
                  styles.hexTileText,
                  sector.id === currentSectorId && styles.currentHexTileText
                ]}>
                  {sector.hexQ},{sector.hexR}
                </Text>
                <Text style={[
                  styles.hexTileName,
                  sector.id === currentSectorId && styles.currentHexTileText
                ]}>
                  {sector.discoveredAt ? sector.name : '???'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Sector List */}
      <View style={styles.sectorListContainer}>
        <Text style={styles.sectionTitle}>Sectors</Text>
        <FlatList
          data={sectorList}
          renderItem={renderSectorItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    backgroundColor: 'white',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  hexGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hexTile: {
    width: 80,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  currentHexTile: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  undiscoveredHexTile: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  hexTileText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  hexTileName: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  currentHexTileText: {
    color: 'white',
  },
  sectorListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectorItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentSectorItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedSectorItem: {
    backgroundColor: '#f8f9fa',
  },
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  undiscoveredText: {
    color: '#666',
    fontStyle: 'italic',
  },
  sectorCoords: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectorType: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
  sectorActions: {
    alignItems: 'flex-end',
  },
  currentBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  currentBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  sectorDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectorNotes: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  sectorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  hypersurfButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  hypersurfButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});