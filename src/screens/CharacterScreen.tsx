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
import { createCharacter, updateCharacter, updateCharacterStats } from '../store/slices/characterSlice';

export default function CharacterScreen() {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character.current);
  
  const [isEditing, setIsEditing] = useState(!character);
  const [formData, setFormData] = useState({
    name: character?.name || '',
    species: character?.species || '',
    career: character?.career || '',
    notes: character?.notes || '',
    fame: character?.fame || 0,
    sway: character?.sway || 0,
    heat: character?.heat || 0,
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Character name is required');
      return;
    }

    if (character) {
      dispatch(updateCharacter(formData));
    } else {
      dispatch(createCharacter({
        ...formData,
        tags: [],
        inventory: [],
      }));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (character) {
      setFormData({
        name: character.name,
        species: character.species,
        career: character.career,
        notes: character.notes,
        fame: character.fame,
        sway: character.sway,
        heat: character.heat,
      });
      setIsEditing(false);
    }
  };

  const updateStat = (stat: 'fame' | 'sway' | 'heat', delta: number) => {
    if (character) {
      const currentValue = character[stat];
      const newValue = Math.max(0, currentValue + delta);
      dispatch(updateCharacterStats({ [stat]: newValue }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Character</Text>
          {character && !isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Character name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Species</Text>
              <TextInput
                style={styles.input}
                value={formData.species}
                onChangeText={(text) => setFormData({ ...formData, species: text })}
                placeholder="e.g., Human, Voidwalker, Android"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Career</Text>
              <TextInput
                style={styles.input}
                value={formData.career}
                onChangeText={(text) => setFormData({ ...formData, career: text })}
                placeholder="e.g., Pilot, Explorer, Mercenary"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Character background and notes"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Fame</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.fame.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, fame: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.statInput}>
                <Text style={styles.label}>Sway</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.sway.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, sway: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.statInput}>
                <Text style={styles.label}>Heat</Text>
                <TextInput
                  style={styles.statInputField}
                  value={formData.heat.toString()}
                  onChangeText={(text) => 
                    setFormData({ ...formData, heat: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>
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
                  {character ? 'Save' : 'Create Character'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : character ? (
          <View style={styles.characterDisplay}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={24} color="#007AFF" />
                <Text style={styles.cardTitle}>{character.name}</Text>
              </View>
              
              <View style={styles.characterDetail}>
                <Text style={styles.detailLabel}>Species:</Text>
                <Text style={styles.detailValue}>{character.species}</Text>
              </View>
              
              <View style={styles.characterDetail}>
                <Text style={styles.detailLabel}>Career:</Text>
                <Text style={styles.detailValue}>{character.career}</Text>
              </View>
              
              {character.notes ? (
                <View style={styles.characterDetail}>
                  <Text style={styles.detailLabel}>Notes:</Text>
                  <Text style={styles.detailValue}>{character.notes}</Text>
                </View>
              ) : null}
            </View>

            {/* Stats with +/- buttons */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Character Stats</Text>
              
              {(['fame', 'sway', 'heat'] as const).map((stat) => (
                <View key={stat} style={styles.statRow}>
                  <Text style={styles.statName}>
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </Text>
                  <View style={styles.statControls}>
                    <TouchableOpacity 
                      style={styles.statButton}
                      onPress={() => updateStat(stat, -1)}
                    >
                      <Ionicons name="remove" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                    
                    <Text style={styles.statValue}>{character[stat]}</Text>
                    
                    <TouchableOpacity 
                      style={styles.statButton}
                      onPress={() => updateStat(stat, 1)}
                    >
                      <Ionicons name="add" size={20} color="#28A745" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Inventory Preview */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="bag" size={20} color="#007AFF" />
                <Text style={styles.cardTitle}>Inventory</Text>
                <TouchableOpacity style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              {character.inventory.length > 0 ? (
                character.inventory.map((item) => (
                  <View key={item.id} style={styles.inventoryItem}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No items in inventory</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="person-add" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>Create your character to get started</Text>
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
    marginBottom: 24,
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
  characterDisplay: {
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
  characterDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#666',
    minWidth: 80,
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    minWidth: 40,
    textAlign: 'center',
  },
  inventoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
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