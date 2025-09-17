import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../store';
import { rollDice } from '../store/slices/rollsSlice';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { DieType, RollMode, LogEntryType } from '../types';

const { width } = Dimensions.get('window');

export default function DiceRollerScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [selectedMode, setSelectedMode] = useState<RollMode>(RollMode.NORMAL);
  const [modifiers, setModifiers] = useState<number[]>([]);
  const [lastRoll, setLastRoll] = useState<any>(null);
  
  const settings = useSelector((state: RootState) => state.settings);
  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  const rollHistory = useSelector((state: RootState) => 
    state.rolls.rollHistory.slice(0, 5).map(id => state.rolls.rolls[id])
  );

  const performRoll = async (dieType: DieType) => {
    if (settings.hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const rollAction = rollDice({
      dieType,
      mode: selectedMode,
      modifiers,
      sessionId: currentSessionId,
    });
    
    dispatch(rollAction);
    
    // Get the roll result from the action
    const rollResult = {
      dieType,
      mode: selectedMode,
      result: rollAction.payload.dieType === DieType.D20 
        ? Math.floor(Math.random() * 20) + 1 
        : Math.floor(Math.random() * 6) + 1,
      modifiers,
    };
    
    setLastRoll(rollResult);
    
    // Auto-log if enabled and session is active
    if (settings.autoLogRolls && currentSessionId) {
      dispatch(logQuickEvent({
        type: LogEntryType.ROLL,
        sessionId: currentSessionId,
        data: rollResult,
        note: `Rolled ${rollResult.result} on ${dieType}${selectedMode !== RollMode.NORMAL ? ` (${selectedMode})` : ''}`,
      }));
    }
  };

  const addModifier = (value: number) => {
    setModifiers([...modifiers, value]);
  };

  const removeModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  const calculateTotal = (baseRoll: number): number => {
    return baseRoll + modifiers.reduce((sum, mod) => sum + mod, 0);
  };

  const getModeIcon = (mode: RollMode) => {
    switch (mode) {
      case RollMode.ADVANTAGE:
        return 'arrow-up';
      case RollMode.DISADVANTAGE:
        return 'arrow-down';
      default:
        return 'remove';
    }
  };

  const getModeColor = (mode: RollMode) => {
    switch (mode) {
      case RollMode.ADVANTAGE:
        return '#28A745';
      case RollMode.DISADVANTAGE:
        return '#DC3545';
      default:
        return '#007AFF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Dice Roller</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Roll Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roll Mode</Text>
          <View style={styles.modeSelector}>
            {Object.values(RollMode).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  selectedMode === mode && { 
                    backgroundColor: getModeColor(mode),
                    borderColor: getModeColor(mode),
                  }
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <Ionicons 
                  name={getModeIcon(mode)} 
                  size={16} 
                  color={selectedMode === mode ? 'white' : getModeColor(mode)} 
                />
                <Text style={[
                  styles.modeText,
                  selectedMode === mode && { color: 'white' }
                ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dice Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roll Dice</Text>
          <View style={styles.diceContainer}>
            <TouchableOpacity 
              style={[styles.diceButton, styles.d20Button]}
              onPress={() => performRoll(DieType.D20)}
            >
              <Text style={styles.diceText}>D20</Text>
              <Text style={styles.diceSides}>1-20</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.diceButton, styles.d6Button]}
              onPress={() => performRoll(DieType.D6)}
            >
              <Text style={styles.diceText}>D6</Text>
              <Text style={styles.diceSides}>1-6</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modifiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modifiers</Text>
          <View style={styles.modifierControls}>
            <TouchableOpacity 
              style={styles.modifierButton}
              onPress={() => addModifier(1)}
            >
              <Text style={styles.modifierButtonText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modifierButton}
              onPress={() => addModifier(2)}
            >
              <Text style={styles.modifierButtonText}>+2</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modifierButton}
              onPress={() => addModifier(-1)}
            >
              <Text style={styles.modifierButtonText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modifierButton}
              onPress={() => addModifier(-2)}
            >
              <Text style={styles.modifierButtonText}>-2</Text>
            </TouchableOpacity>
          </View>
          
          {modifiers.length > 0 && (
            <View style={styles.activeModifiers}>
              {modifiers.map((modifier, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activeModifier}
                  onPress={() => removeModifier(index)}
                >
                  <Text style={styles.activeModifierText}>
                    {modifier > 0 ? '+' : ''}{modifier}
                  </Text>
                  <Ionicons name="close" size={16} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Last Roll Result */}
        {lastRoll && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Roll</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultDie}>{lastRoll.dieType}</Text>
                {lastRoll.mode !== RollMode.NORMAL && (
                  <View style={styles.resultMode}>
                    <Ionicons 
                      name={getModeIcon(lastRoll.mode)} 
                      size={16} 
                      color={getModeColor(lastRoll.mode)} 
                    />
                    <Text style={[styles.resultModeText, { color: getModeColor(lastRoll.mode) }]}>
                      {lastRoll.mode}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.resultValue}>{lastRoll.result}</Text>
              
              {modifiers.length > 0 && (
                <View style={styles.resultModifiers}>
                  <Text style={styles.resultModifiersText}>
                    Base: {lastRoll.result} | Modifiers: {modifiers.join(', ')} | Total: {calculateTotal(lastRoll.result)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Roll History */}
        {rollHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Rolls</Text>
            {rollHistory.map((roll) => (
              <View key={roll.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyDie}>{roll.dieType}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(roll.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.historyResult}>{roll.result}</Text>
                {roll.mode !== RollMode.NORMAL && (
                  <Text style={styles.historyMode}>{roll.mode}</Text>
                )}
              </View>
            ))}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  modeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  diceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  diceButton: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  d20Button: {
    backgroundColor: '#007AFF',
  },
  d6Button: {
    backgroundColor: '#28A745',
  },
  diceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  diceSides: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  modifierControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  modifierButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 60,
    alignItems: 'center',
  },
  modifierButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activeModifiers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activeModifier: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  activeModifierText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginRight: 6,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultDie: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultMode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  resultModeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultModifiers: {
    marginTop: 12,
  },
  resultModifiersText: {
    fontSize: 14,
    color: '#666',
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyHeader: {
    flex: 1,
  },
  historyDie: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  historyResult: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 16,
  },
  historyMode: {
    fontSize: 12,
    color: '#666',
  },
});