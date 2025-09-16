import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { createShip, updateShip, damageShields, damageHull, repairShields, repairHull } from '../store/slices/shipSlice';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { LogEntryType } from '../types';

export default function ShipScreen() {
  const dispatch = useDispatch();
  const ship = useSelector((state: RootState) => state.ship.current);
  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  
  const [isEditing, setIsEditing] = useState(!ship);
  const [formData, setFormData] = useState({
    name: ship?.name || '',
    purpose: ship?.purpose || '',
    personality: ship?.personality || '',
    maxShields: ship?.maxShields || 10,
    maxHull: ship?.maxHull || 10,
    driveRange: ship?.driveRange || 5,
    notes: ship?.notes || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Ship name is required');
      return;
    }

    if (ship) {
      dispatch(updateShip(formData));
    } else {
      dispatch(createShip({
        ...formData,
        shields: formData.maxShields,
        hull: formData.maxHull,
        modules: [],
        quirks: [],
      }));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (ship) {
      setFormData({
        name: ship.name,
        purpose: ship.purpose,
        personality: ship.personality,
        maxShields: ship.maxShields,
        maxHull: ship.maxHull,
        driveRange: ship.driveRange,
        notes: ship.notes,
      });
      setIsEditing(false);
    }
  };

  const handleDamage = (type: 'shields' | 'hull', amount: number) => {
    if (!ship) return;
    
    Alert.alert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Damage`,
      `Apply ${amount} damage to ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            if (type === 'shields') {
              dispatch(damageShields(amount));
            } else {
              dispatch(damageHull(amount));
            }
            
            // Log the damage if in session
            if (currentSessionId) {
              dispatch(logQuickEvent({
                type: LogEntryType.DAMAGE,
                sessionId: currentSessionId,
                data: { type, amount, shipId: ship.id },
                note: `Ship took ${amount} ${type} damage`,
                entityIds: [ship.id],
              }));
            }
          },
        },
      ]
    );
  };

  const handleRepair = (type: 'shields' | 'hull', amount: number) => {
    if (!ship) return;
    
    Alert.alert(
      `${type.charAt(0).toUpperCase() + type.slice(1)} Repair`,
      `Repair ${amount} ${type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Repair',
          onPress: () => {
            if (type === 'shields') {
              dispatch(repairShields(amount));
            } else {
              dispatch(repairHull(amount));
            }
            
            // Log the repair if in session
            if (currentSessionId) {
              dispatch(logQuickEvent({
                type: LogEntryType.REWARD,
                sessionId: currentSessionId,
                data: { type: 'repair', target: type, amount, shipId: ship.id },
                note: `Ship repaired ${amount} ${type}`,
                entityIds: [ship.id],
              }));
            }
          },
        },
      ]
    );
  };

  const getHealthBarColor = (current: number, max: number) => {
    const percentage = current / max;
    if (percentage > 0.6) return '#28A745';
    if (percentage > 0.3) return '#FFC107';
    return '#DC3545';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ship</Text>
          {ship && !isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ship Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ship name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Purpose</Text>
              <TextInput
                style={styles.input}
                value={formData.purpose}
                onChangeText={(text) => setFormData({ ...formData, purpose: text })}
                placeholder="e.g., Explorer, Trader, Fighter"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Personality</Text>
              <TextInput
                style={styles.input}
                value={formData.personality}
                onChangeText={(text) => setFormData({ ...formData, personality: text })}
                placeholder="Ship's personality traits"
                autoCapitalize="sentences"
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Max Shields</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.maxShields.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, maxShields: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.statInput}>
                <Text style={styles.label}>Max Hull</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.maxHull.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, maxHull: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.statInput}>
                <Text style={styles.label}>Drive Range</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.driveRange.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, driveRange: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Ship notes and details"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {ship ? 'Save' : 'Create Ship'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : ship ? (
          <View style={styles.shipDisplay}>
            {/* Ship Info Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="rocket" size={24} color="#007AFF" />
                <Text style={styles.cardTitle}>{ship.name}</Text>
              </View>
              
              <View style={styles.shipDetail}>
                <Text style={styles.detailLabel}>Purpose:</Text>
                <Text style={styles.detailValue}>{ship.purpose}</Text>
              </View>
              
              <View style={styles.shipDetail}>
                <Text style={styles.detailLabel}>Personality:</Text>
                <Text style={styles.detailValue}>{ship.personality}</Text>
              </View>
              
              <View style={styles.shipDetail}>
                <Text style={styles.detailLabel}>Drive Range:</Text>
                <Text style={styles.detailValue}>{ship.driveRange}</Text>
              </View>
              
              {ship.notes ? (
                <View style={styles.shipDetail}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>{ship.notes}</Text>
                </View>
              ) : null}
            </View>

            {/* Health Status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ship Status</Text>
              
              {/* Shields */}
              <View style={styles.healthSection}>
                <View style={styles.healthHeader}>
                  <Ionicons name="shield" size={20} color="#007AFF" />
                  <Text style={styles.healthLabel}>Shields</Text>
                  <Text style={styles.healthValue}>
                    {ship.shields}/{ship.maxShields}
                  </Text>
                </View>
                
                <View style={styles.healthBarContainer}>
                  <View 
                    style={[
                      styles.healthBar,
                      { backgroundColor: '#f0f0f0' }
                    ]}
                  >
                    <View 
                      style={[
                        styles.healthBarFill,
                        { 
                          width: `${(ship.shields / ship.maxShields) * 100}%`,
                          backgroundColor: getHealthBarColor(ship.shields, ship.maxShields)
                        }
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.healthControls}>
                  <TouchableOpacity 
                    style={[styles.healthButton, styles.damageButton]}
                    onPress={() => handleDamage('shields', 1)}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.healthButton, styles.repairButton]}
                    onPress={() => handleRepair('shields', 1)}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Hull */}
              <View style={styles.healthSection}>
                <View style={styles.healthHeader}>
                  <Ionicons name="construct" size={20} color="#DC3545" />
                  <Text style={styles.healthLabel}>Hull</Text>
                  <Text style={styles.healthValue}>
                    {ship.hull}/{ship.maxHull}
                  </Text>
                </View>
                
                <View style={styles.healthBarContainer}>
                  <View 
                    style={[
                      styles.healthBar,
                      { backgroundColor: '#f0f0f0' }
                    ]}
                  >
                    <View 
                      style={[
                        styles.healthBarFill,
                        { 
                          width: `${(ship.hull / ship.maxHull) * 100}%`,
                          backgroundColor: getHealthBarColor(ship.hull, ship.maxHull)
                        }
                      ]}
                    />
                  </View>
                </View>
                
                <View style={styles.healthControls}>
                  <TouchableOpacity 
                    style={[styles.healthButton, styles.damageButton]}
                    onPress={() => handleDamage('hull', 1)}
                  >
                    <Ionicons name="remove" size={16} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.healthButton, styles.repairButton]}
                    onPress={() => handleRepair('hull', 1)}
                  >
                    <Ionicons name="add" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Modules & Quirks */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="settings" size={20} color="#007AFF" />
                <Text style={styles.cardTitle}>Modules & Quirks</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              {ship.modules.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.listTitle}>Modules</Text>
                  {ship.modules.map((module, index) => (
                    <Text key={index} style={styles.listItem}>• {module}</Text>
                  ))}
                </View>
              )}
              
              {ship.quirks.length > 0 && (
                <View style={styles.listSection}>
                  <Text style={styles.listTitle}>Quirks</Text>
                  {ship.quirks.map((quirk, index) => (
                    <Text key={index} style={styles.listItem}>• {quirk}</Text>
                  ))}
                </View>
              )}
              
              {ship.modules.length === 0 && ship.quirks.length === 0 && (
                <Text style={styles.emptyText}>No modules or quirks added</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="rocket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Create your ship to get started</Text>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  statInputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shipDisplay: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1a1a1a',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  shipDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#666',
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  healthSection: {
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  healthValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  healthBarContainer: {
    marginBottom: 12,
  },
  healthBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  healthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  damageButton: {
    backgroundColor: '#DC3545',
  },
  repairButton: {
    backgroundColor: '#28A745',
  },
  listSection: {
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});