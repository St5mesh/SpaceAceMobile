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
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { createCharacter, updateCharacter, updateCharacterStats } from '../store/slices/characterSlice';

const { width } = Dimensions.get('window');

export default function CharacterScreen() {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character.current);
  const ship = useSelector((state: RootState) => state.ship.current);
  
  const [isEditing, setIsEditing] = useState(!character);
  const [formData, setFormData] = useState({
    name: character?.name || '',
    career: character?.career || '',
    knacks: character?.knacks || '',
    drive: character?.drive || '',
    gumption: {
      current: character?.gumption?.current || 0,
      maximum: character?.gumption?.maximum || 0,
    },
    catchphrase: character?.catchphrase || '',
    // Legacy fields for backward compatibility
    species: character?.species || '',
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
        career: character.career,
        knacks: character.knacks || '',
        drive: character.drive || '',
        gumption: {
          current: character.gumption?.current || 0,
          maximum: character.gumption?.maximum || 0,
        },
        catchphrase: character.catchphrase || '',
        species: character.species || '',
        notes: character.notes || '',
        fame: character.fame || 0,
        sway: character.sway || 0,
        heat: character.heat || 0,
      });
      setIsEditing(false);
    }
  };

  const updateGumption = (type: 'current' | 'maximum', delta: number) => {
    if (character && character.gumption) {
      const currentValue = character.gumption[type];
      const newValue = Math.max(0, currentValue + delta);
      const newGumption = { ...character.gumption, [type]: newValue };
      dispatch(updateCharacterStats({ gumption: newGumption }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>CHARACTER SHEET</Text>
          {character && !isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>

        {isEditing ? (
          <View style={styles.characterSheet}>
            {/* Character Sheet Border */}
            <View style={styles.sheetBorder}>
              
              {/* Two Column Layout */}
              <View style={styles.topSection}>
                
                {/* Left Column - Character Info */}
                <View style={styles.leftColumn}>
                  
                  {/* CHARACTER NAME */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>CHARACTER NAME:</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholder="Character name"
                      autoCapitalize="words"
                    />
                  </View>

                  {/* CAREER */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>CAREER:</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.careerInput]}
                      value={formData.career}
                      onChangeText={(text) => setFormData({ ...formData, career: text })}
                      placeholder="e.g., Pilot, Explorer, Mercenary"
                      autoCapitalize="words"
                    />
                  </View>

                  {/* KNACK(S) */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>KNACK(S):</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.knacksInput]}
                      value={formData.knacks}
                      onChangeText={(text) => setFormData({ ...formData, knacks: text })}
                      placeholder="Character knacks and specialties"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* DRIVE */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>DRIVE:</Text>
                    <TextInput
                      style={styles.fieldInput}
                      value={formData.drive}
                      onChangeText={(text) => setFormData({ ...formData, drive: text })}
                      placeholder="Character motivation"
                      autoCapitalize="sentences"
                    />
                  </View>

                  {/* GUMPTION */}
                  <View style={styles.fieldGroup}>
                    <View style={styles.gumptionSection}>
                      <View style={styles.gumptionIcon}>
                        <Ionicons name="heart" size={24} color="#FF3B30" />
                      </View>
                      <Text style={styles.fieldLabel}>GUMPTION:</Text>
                      <View style={styles.gumptionFields}>
                        <View style={styles.gumptionInput}>
                          <Text style={styles.gumptionLabel}>CURRENT</Text>
                          <TextInput
                            style={styles.gumptionValue}
                            value={formData.gumption.current.toString()}
                            onChangeText={(text) => 
                              setFormData({ 
                                ...formData, 
                                gumption: { 
                                  ...formData.gumption, 
                                  current: parseInt(text) || 0 
                                } 
                              })
                            }
                            keyboardType="numeric"
                          />
                        </View>
                        <Text style={styles.gumptionSlash}>/</Text>
                        <View style={styles.gumptionInput}>
                          <Text style={styles.gumptionLabel}>MAXIMUM</Text>
                          <TextInput
                            style={styles.gumptionValue}
                            value={formData.gumption.maximum.toString()}
                            onChangeText={(text) => 
                              setFormData({ 
                                ...formData, 
                                gumption: { 
                                  ...formData.gumption, 
                                  maximum: parseInt(text) || 0 
                                } 
                              })
                            }
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* CATCHPHRASE */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>CATCHPHRASE:</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.catchphraseInput]}
                      value={formData.catchphrase}
                      onChangeText={(text) => setFormData({ ...formData, catchphrase: text })}
                      placeholder="Character catchphrase"
                      autoCapitalize="sentences"
                    />
                  </View>
                </View>

                {/* Right Column - Portrait and Gear */}
                <View style={styles.rightColumn}>
                  
                  {/* PORTRAIT */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>PORTRAIT:</Text>
                    <View style={styles.portraitFrame}>
                      <Text style={styles.portraitPlaceholder}>Character Portrait</Text>
                    </View>
                  </View>

                  {/* GEAR & LOOT */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>GEAR & LOOT:</Text>
                    <TextInput
                      style={[styles.fieldInput, styles.gearInput]}
                      value={formData.notes}
                      onChangeText={(text) => setFormData({ ...formData, notes: text })}
                      placeholder="Equipment and gear"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>

              {/* Starship Section */}
              <View style={styles.starshipSection}>
                <View style={styles.starshipDivider} />
                
                <View style={styles.starshipContent}>
                  {/* Left side - Starship Info */}
                  <View style={styles.starshipLeft}>
                    
                    {/* STARSHIP NAME */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>STARSHIP NAME:</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={ship?.name || ''}
                        placeholder="Ship name"
                        editable={false}
                      />
                    </View>

                    {/* PURPOSE AND PERSONALITY */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>PURPOSE AND PERSONALITY:</Text>
                      <TextInput
                        style={[styles.fieldInput, styles.purposeInput]}
                        value={ship?.purpose + ' - ' + ship?.personality || ''}
                        placeholder="Ship purpose and personality"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        editable={false}
                      />
                    </View>

                    {/* SHIELDS */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>SHIELDS:</Text>
                      <View style={styles.statFields}>
                        <View style={styles.statValue}>
                          <Text style={styles.statNumber}>{ship?.shields || 0}</Text>
                        </View>
                        <Text style={styles.statSlash}>/</Text>
                        <View style={styles.statValue}>
                          <Text style={styles.statNumber}>{ship?.maxShields || 0}</Text>
                        </View>
                      </View>
                    </View>

                    {/* HULL */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>HULL:</Text>
                      <View style={styles.statFields}>
                        <View style={styles.statValue}>
                          <Text style={styles.statNumber}>{ship?.hull || 0}</Text>
                        </View>
                        <Text style={styles.statSlash}>/</Text>
                        <View style={styles.statValue}>
                          <Text style={styles.statNumber}>{ship?.maxHull || 0}</Text>
                        </View>
                      </View>
                    </View>

                    {/* DRIVE RANGE */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>DRIVE RANGE:</Text>
                      <View style={styles.driveRangeBox}>
                        <Text style={styles.statNumber}>{ship?.driveRange || 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Right side - Starship Layout and Upgrades */}
                  <View style={styles.starshipRight}>
                    
                    {/* STARSHIP LAYOUT */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>STARSHIP LAYOUT:</Text>
                      <View style={styles.starshipLayoutFrame}>
                        <Text style={styles.layoutPlaceholder}>Ship Layout Diagram</Text>
                      </View>
                    </View>

                    {/* UPGRADES */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.fieldLabel}>UPGRADES:</Text>
                      <View style={styles.upgradesBox}>
                        <Text style={styles.upgradesText}>
                          {ship?.modules?.join(', ') || 'No upgrades'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
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
          </View>
        ) : character ? (
          // View Mode - Display Character Sheet
          <View style={styles.characterSheet}>
            <View style={styles.sheetBorder}>
              
              {/* Two Column Layout - View Mode */}
              <View style={styles.topSection}>
                
                {/* Left Column - Character Info */}
                <View style={styles.leftColumn}>
                  
                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>CHARACTER NAME:</Text>
                    <Text style={styles.displayValue}>{character.name}</Text>
                  </View>

                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>CAREER:</Text>
                    <Text style={styles.displayValue}>{character.career}</Text>
                  </View>

                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>KNACK(S):</Text>
                    <Text style={styles.displayValue}>{character.knacks || 'None specified'}</Text>
                  </View>

                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>DRIVE:</Text>
                    <Text style={styles.displayValue}>{character.drive || 'None specified'}</Text>
                  </View>

                  <View style={styles.displayField}>
                    <View style={styles.gumptionSection}>
                      <View style={styles.gumptionIcon}>
                        <Ionicons name="heart" size={24} color="#FF3B30" />
                      </View>
                      <Text style={styles.fieldLabel}>GUMPTION:</Text>
                      <View style={styles.gumptionDisplay}>
                        <TouchableOpacity 
                          style={styles.statButton}
                          onPress={() => updateGumption('current', -1)}
                        >
                          <Ionicons name="remove" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                        <Text style={styles.gumptionDisplayValue}>
                          {character.gumption?.current || 0}
                        </Text>
                        <TouchableOpacity 
                          style={styles.statButton}
                          onPress={() => updateGumption('current', 1)}
                        >
                          <Ionicons name="add" size={16} color="#28A745" />
                        </TouchableOpacity>
                        <Text style={styles.gumptionSlash}>/</Text>
                        <TouchableOpacity 
                          style={styles.statButton}
                          onPress={() => updateGumption('maximum', -1)}
                        >
                          <Ionicons name="remove" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                        <Text style={styles.gumptionDisplayValue}>
                          {character.gumption?.maximum || 0}
                        </Text>
                        <TouchableOpacity 
                          style={styles.statButton}
                          onPress={() => updateGumption('maximum', 1)}
                        >
                          <Ionicons name="add" size={16} color="#28A745" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>CATCHPHRASE:</Text>
                    <Text style={styles.displayValue}>{character.catchphrase || 'None specified'}</Text>
                  </View>
                </View>

                {/* Right Column - Portrait and Gear */}
                <View style={styles.rightColumn}>
                  
                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>PORTRAIT:</Text>
                    <View style={styles.portraitFrame}>
                      <Text style={styles.portraitPlaceholder}>Character Portrait</Text>
                    </View>
                  </View>

                  <View style={styles.displayField}>
                    <Text style={styles.fieldLabel}>GEAR & LOOT:</Text>
                    <Text style={styles.displayValue}>{character.notes || 'None specified'}</Text>
                  </View>
                </View>
              </View>

              {/* Starship Section - View Mode */}
              <View style={styles.starshipSection}>
                <View style={styles.starshipDivider} />
                
                <View style={styles.starshipContent}>
                  <View style={styles.starshipLeft}>
                    
                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>STARSHIP NAME:</Text>
                      <Text style={styles.displayValue}>{ship?.name || 'No ship assigned'}</Text>
                    </View>

                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>PURPOSE AND PERSONALITY:</Text>
                      <Text style={styles.displayValue}>
                        {ship ? `${ship.purpose} - ${ship.personality}` : 'No ship assigned'}
                      </Text>
                    </View>

                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>SHIELDS:</Text>
                      <Text style={styles.displayValue}>
                        {ship ? `${ship.shields}/${ship.maxShields}` : '0/0'}
                      </Text>
                    </View>

                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>HULL:</Text>
                      <Text style={styles.displayValue}>
                        {ship ? `${ship.hull}/${ship.maxHull}` : '0/0'}
                      </Text>
                    </View>

                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>DRIVE RANGE:</Text>
                      <Text style={styles.displayValue}>{ship?.driveRange || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.starshipRight}>
                    
                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>STARSHIP LAYOUT:</Text>
                      <View style={styles.starshipLayoutFrame}>
                        <Text style={styles.layoutPlaceholder}>Ship Layout Diagram</Text>
                      </View>
                    </View>

                    <View style={styles.displayField}>
                      <Text style={styles.fieldLabel}>UPGRADES:</Text>
                      <Text style={styles.displayValue}>
                        {ship?.modules?.join(', ') || 'No upgrades'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'System',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  
  // Character Sheet Layout
  characterSheet: {
    padding: 16,
  },
  sheetBorder: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'white',
    padding: 20,
    minHeight: 600,
  },
  
  // Two Column Layout
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
    paddingRight: 20,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 20,
  },
  
  // Field Styling
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'System',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'white',
    padding: 8,
    fontSize: 14,
    fontFamily: 'System',
    minHeight: 32,
  },
  careerInput: {
    minHeight: 40,
  },
  knacksInput: {
    minHeight: 80,
  },
  catchphraseInput: {
    minHeight: 32,
  },
  
  // Gumption Section with Heart Icon
  gumptionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gumptionIcon: {
    marginRight: 8,
  },
  gumptionFields: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  gumptionInput: {
    alignItems: 'center',
  },
  gumptionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gumptionValue: {
    borderWidth: 1,
    borderColor: '#000',
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'white',
    paddingTop: 8,
  },
  gumptionSlash: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  gumptionDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  gumptionDisplayValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 4,
    minWidth: 30,
    textAlign: 'center',
  },
  
  // Portrait Frame
  portraitFrame: {
    width: '100%',
    height: 150,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitPlaceholder: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Gear Input
  gearInput: {
    minHeight: 100,
  },
  
  // Starship Section
  starshipSection: {
    marginTop: 20,
  },
  starshipDivider: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 20,
  },
  starshipContent: {
    flexDirection: 'row',
  },
  starshipLeft: {
    flex: 1,
    paddingRight: 20,
  },
  starshipRight: {
    flex: 1,
    paddingLeft: 20,
  },
  
  // Purpose Input
  purposeInput: {
    minHeight: 80,
  },
  
  // Stat Fields (Shields, Hull)
  statFields: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    borderWidth: 1,
    borderColor: '#000',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statSlash: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  
  // Drive Range Box
  driveRangeBox: {
    borderWidth: 1,
    borderColor: '#000',
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  
  // Starship Layout Frame
  starshipLayoutFrame: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  layoutPlaceholder: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Upgrades Box
  upgradesBox: {
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'white',
    padding: 12,
    minHeight: 60,
  },
  upgradesText: {
    fontSize: 14,
  },
  
  // Display Mode Styling
  displayField: {
    marginBottom: 16,
  },
  displayValue: {
    fontSize: 14,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 32,
  },
  
  // Buttons
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 4,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  // Stat Buttons (for +/- controls)
  statButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  // Empty State
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