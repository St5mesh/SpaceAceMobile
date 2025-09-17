import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { moveTo, discoverSector, discoverAdjacentSectors, deleteSector, addSectorAtPosition, swapSectors } from '../store/slices/sectorsSlice';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { LogEntryType, Sector, SectorType } from '../types';
import { HexUtils } from '../utils/hexUtils';
import HexGrid from '../components/HexGrid';
import HexTile from '../components/HexTile';

export default function GalaxyScreen() {
  const dispatch = useDispatch();
  const sectors = useSelector((state: RootState) => state.sectors.sectors);
  const currentSectorId = useSelector((state: RootState) => state.sectors.currentSector);
  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [swapFirstSectorId, setSwapFirstSectorId] = useState<string | null>(null);
  const hexGridRef = useRef<any>(null);

  useLayoutEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return subscription?.remove;
  }, []);

  const handleZoomChange = (scale: number) => {
    setCurrentZoom(scale);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom * 1.2, 4.0);
    hexGridRef.current?.zoomIn();
    setCurrentZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom / 1.2, 0.3);
    hexGridRef.current?.zoomOut();
    setCurrentZoom(newZoom);
  };

  const handleSectorSelect = (sector: Sector | null) => {
    if (isSwapMode && sector) {
      if (!swapFirstSectorId) {
        // First selection in swap mode
        setSwapFirstSectorId(sector.id);
        setSelectedSectorId(sector.id);
      } else if (swapFirstSectorId !== sector.id) {
        // Second selection - perform swap
        dispatch(swapSectors({ sectorId1: swapFirstSectorId, sectorId2: sector.id }));
        setIsSwapMode(false);
        setSwapFirstSectorId(null);
        setSelectedSectorId(null);
      }
    } else {
      setSelectedSectorId(sector?.id || null);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedSectorId(null); // Clear selection when entering selection mode
    } else {
      // Exiting selection mode
      setIsSwapMode(false);
      setSwapFirstSectorId(null);
    }
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    hexGridRef.current?.pan(direction);
  };

  const handleCenterOnCurrent = () => {
    hexGridRef.current?.centerOnCurrentSector();
  };

  const handleAddTile = () => {
    if (!selectedSectorId) return;
    
    const selectedSector = sectors[selectedSectorId];
    if (!selectedSector) return;
    
    // Get adjacent positions
    const neighbors = HexUtils.hexNeighbors({
      q: selectedSector.hexQ,
      r: selectedSector.hexR
    });
    
    // Find empty adjacent positions
    const emptyPositions = neighbors.filter(pos => 
      !Object.values(sectors).some(s => s.hexQ === pos.q && s.hexR === pos.r)
    );
    
    if (emptyPositions.length === 0) {
      Alert.alert('No Space', 'No empty adjacent positions available.');
      return;
    }
    
    // For now, use the first empty position
    const targetPos = emptyPositions[0];
    
    Alert.alert(
      'Add New Sector',
      `Add a new sector at coordinates (${targetPos.q}, ${targetPos.r})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            dispatch(addSectorAtPosition({
              hexQ: targetPos.q,
              hexR: targetPos.r,
              sectorData: {
                name: `Sector ${targetPos.q},${targetPos.r}`,
                type: SectorType.FRONTIER,
              }
            }));
          }
        }
      ]
    );
  };

  const handleDeleteTile = () => {
    if (!selectedSectorId || selectedSectorId === 'lanai') return;
    
    const selectedSector = sectors[selectedSectorId];
    if (!selectedSector) return;
    
    Alert.alert(
      'Delete Sector',
      `Are you sure you want to delete "${selectedSector.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteSector(selectedSectorId));
            setSelectedSectorId(null);
          }
        }
      ]
    );
  };

  const handleSwapTile = () => {
    if (!selectedSectorId) return;
    
    setIsSwapMode(true);
    setSwapFirstSectorId(selectedSectorId);
    
    Alert.alert(
      'Swap Mode',
      'Now select another sector to swap positions with.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            setIsSwapMode(false);
            setSwapFirstSectorId(null);
          }
        },
        { text: 'OK' }
      ]
    );
  };
  
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
              <View style={styles.sectorTypeContainer}>
                <Text style={[styles.sectorType, { color: getSectorColor(sector) }]}>
                  {sector.type.charAt(0).toUpperCase() + sector.type.slice(1)}
                </Text>
                {sector.type === SectorType.ANOMALY && (
                  <Ionicons name="flash" size={12} color="#6F42C1" />
                )}
              </View>
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

      {/* Enhanced Hex Grid with Zoom/Pan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Galaxy Hex Map</Text>
          <View style={styles.mapControls}>
            <View style={styles.zoomControls}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleZoomOut}
              >
                <Ionicons name="remove" size={20} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.zoomText}>
                {(currentZoom * 100).toFixed(0)}%
              </Text>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={handleZoomIn}
              >
                <Ionicons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.controlButton, isSelectionMode && styles.activeControlButton]}
              onPress={toggleSelectionMode}
            >
              <Ionicons name="hand-left" size={20} color={isSelectionMode ? "white" : "#007AFF"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selection mode instruction */}
        {!isSelectionMode && (
          <Text style={styles.instructionText}>
            Tap the hand icon to enable selection mode for sector manipulation
          </Text>
        )}

        {/* Pan Controls */}
        <View style={styles.panControls}>
          <View style={styles.panControlsRow}>
            <TouchableOpacity 
              style={styles.panButton}
              onPress={() => handlePan('up')}
            >
              <Ionicons name="chevron-up" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.panControlsRow}>
            <TouchableOpacity 
              style={styles.panButton}
              onPress={() => handlePan('left')}
            >
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.panButton, styles.centerButton]}
              onPress={handleCenterOnCurrent}
            >
              <Ionicons name="locate" size={16} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.panButton}
              onPress={() => handlePan('right')}
            >
              <Ionicons name="chevron-forward" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.panControlsRow}>
            <TouchableOpacity 
              style={styles.panButton}
              onPress={() => handlePan('down')}
            >
              <Ionicons name="chevron-down" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.hexGridWrapper}>
          <HexGrid
            ref={hexGridRef}
            sectors={sectorList}
            currentSectorId={currentSectorId}
            selectedSectorId={selectedSectorId}
            swapFirstSectorId={swapFirstSectorId}
            onSectorPress={isSelectionMode ? undefined : handleHypersurf}
            onSectorSelect={isSelectionMode ? handleSectorSelect : undefined}
            containerWidth={screenData.width - 120} // Account for pan controls (80px) + padding (40px)
            containerHeight={300}
            initialScale={1.0}
            onZoomChange={handleZoomChange}
          />
        </View>

        {/* Tile Manipulation Controls */}
        {isSelectionMode && selectedSectorId && (
          <View style={styles.tileControls}>
            <Text style={styles.tileControlsTitle}>
              {isSwapMode && swapFirstSectorId 
                ? `Swapping: ${sectors[swapFirstSectorId]?.name || 'Unknown'} - Select target`
                : `Selected: ${sectors[selectedSectorId]?.name || 'Unknown'}`
              }
            </Text>
            <View style={styles.tileControlsRow}>
              <TouchableOpacity 
                style={[styles.tileButton, styles.addButton, isSwapMode && styles.disabledButton]}
                onPress={isSwapMode ? undefined : handleAddTile}
                disabled={isSwapMode}
              >
                <Ionicons name="add-circle" size={20} color={isSwapMode ? "#999" : "white"} />
                <Text style={[styles.tileButtonText, isSwapMode && styles.disabledButtonText]}>Add Adjacent</Text>
              </TouchableOpacity>
              
              {selectedSectorId !== 'lanai' && ( // Don't allow deleting home sector
                <TouchableOpacity 
                  style={[styles.tileButton, styles.deleteButton, isSwapMode && styles.disabledButton]}
                  onPress={isSwapMode ? undefined : handleDeleteTile}
                  disabled={isSwapMode}
                >
                  <Ionicons name="trash" size={20} color={isSwapMode ? "#999" : "white"} />
                  <Text style={[styles.tileButtonText, isSwapMode && styles.disabledButtonText]}>Delete</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.tileButton, styles.swapButton, isSwapMode && styles.activeSwapButton]}
                onPress={handleSwapTile}
              >
                <Ionicons name="swap-horizontal" size={20} color="white" />
                <Text style={styles.tileButtonText}>{isSwapMode ? 'Swapping...' : 'Swap'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  activeViewMode: {
    backgroundColor: '#007AFF',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  activeControlButton: {
    backgroundColor: '#007AFF',
  },
  panControls: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -60,
    alignItems: 'center',
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    borderRadius: 8,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 10,
  },
  panControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    margin: 1,
  },
  centerButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  zoomText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  hexGridWrapper: {
    backgroundColor: '#000011',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hexRow: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '500',
    marginTop: 2,
  },
  sectorTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  tileControls: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tileControlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tileControlsRow: {
    flexDirection: 'row',
    gap: 6, // Reduce gap for mobile
  },
  tileButton: {
    flex: 1,
    flexDirection: 'column', // Stack icon and text vertically for mobile
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 4,
    minHeight: 56, // Ensure touch target is adequate
  },
  addButton: {
    backgroundColor: '#28A745',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  swapButton: {
    backgroundColor: '#6F42C1',
  },
  activeSwapButton: {
    backgroundColor: '#5A2D91',
  },
  disabledButton: {
    backgroundColor: '#E9ECEF',
  },
  tileButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
});