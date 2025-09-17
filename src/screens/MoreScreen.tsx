import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { 
  toggleHapticFeedback, 
  toggleAutoLogRolls, 
  setTheme, 
  resetSettings 
} from '../store/slices/settingsSlice';
import { clearCharacter } from '../store/slices/characterSlice';
import { clearShip } from '../store/slices/shipSlice';

export default function MoreScreen() {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const character = useSelector((state: RootState) => state.character.current);
  const ship = useSelector((state: RootState) => state.ship.current);
  const sessionsCount = useSelector((state: RootState) => Object.keys(state.sessions.sessions).length);
  const rollsCount = useSelector((state: RootState) => state.rolls.rollHistory.length);

  const handleExportData = async () => {
    try {
      const state = {
        character,
        ship,
        // Add more data as needed for export
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      };

      const exportData = JSON.stringify(state, null, 2);
      
      await Share.share({
        message: exportData,
        title: 'SpaceAce Campaign Data',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data');
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your characters, ships, missions, and session data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            dispatch(clearCharacter());
            dispatch(clearShip());
            dispatch(resetSettings());
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.settingsGroup}>
        {children}
      </View>
    </View>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onPress, 
    color = '#333',
    rightElement 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: string;
    onPress?: () => void;
    color?: string;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity 
      style={styles.settingsRow} 
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={icon as any} size={20} color={color} />
      <View style={styles.settingsRowContent}>
        <Text style={[styles.settingsRowTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        value && <Text style={styles.settingsRowValue}>{value}</Text>
      )}
      {onPress && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </TouchableOpacity>
  );

  const Toggle = ({ value, onToggle }: { value: boolean; onToggle: () => void }) => (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={onToggle}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Ionicons name="rocket" size={32} color="#007AFF" />
          </View>
          <Text style={styles.appName}>SpaceAce Mobile</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your companion for Space Aces: Voyages in Infinite Space
          </Text>
        </View>

        {/* Game Settings */}
        <SettingsSection title="Game Settings">
          <SettingsRow
            icon="options"
            title="Auto-log Dice Rolls"
            subtitle="Automatically add dice rolls to session journal"
            rightElement={
              <Toggle 
                value={settings.autoLogRolls} 
                onToggle={() => dispatch(toggleAutoLogRolls())} 
              />
            }
          />
          
          <SettingsRow
            icon="phone-portrait"
            title="Haptic Feedback"
            subtitle="Vibrations for rolls and confirmations"
            rightElement={
              <Toggle 
                value={settings.hapticFeedback} 
                onToggle={() => dispatch(toggleHapticFeedback())} 
              />
            }
          />

          <SettingsRow
            icon="color-palette"
            title="Theme"
            subtitle="App appearance"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => {
              const themes = ['light', 'dark', 'auto'] as const;
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              dispatch(setTheme(nextTheme));
            }}
          />
        </SettingsSection>

        {/* Statistics */}
        <SettingsSection title="Campaign Statistics">
          <SettingsRow
            icon="person"
            title="Character"
            value={character ? character.name : 'Not created'}
          />
          
          <SettingsRow
            icon="rocket"
            title="Ship"
            value={ship ? ship.name : 'Not created'}
          />
          
          <SettingsRow
            icon="play-circle"
            title="Sessions Played"
            value={sessionsCount.toString()}
          />
          
          <SettingsRow
            icon="cube"
            title="Dice Rolled"
            value={rollsCount.toString()}
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management">
          <SettingsRow
            icon="share"
            title="Export Campaign Data"
            subtitle="Share your campaign as JSON"
            onPress={handleExportData}
          />
          
          <SettingsRow
            icon="refresh"
            title="Reset All Data"
            subtitle="Delete all campaign data"
            color="#DC3545"
            onPress={handleResetData}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsRow
            icon="information-circle"
            title="About Space Aces"
            subtitle="Learn about the tabletop RPG"
            onPress={() => Alert.alert('Space Aces', 'Space Aces: Voyages in Infinite Space is a tabletop RPG about adventure, exploration, and storytelling in the depths of space.')}
          />
          
          <SettingsRow
            icon="code"
            title="App Version"
            value="1.0.0"
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for Space Aces players
          </Text>
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
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  appIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#f0f8ff',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingsGroup: {
    backgroundColor: 'white',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsRowContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsRowTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsRowSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingsRowValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: '#ccc',
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#007AFF',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});