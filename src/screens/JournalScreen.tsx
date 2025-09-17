import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { LogEntryType, LogEntry } from '../types';

export default function JournalScreen() {
  const dispatch = useDispatch();
  const [newEntryText, setNewEntryText] = useState('');
  const [filter, setFilter] = useState<'all' | 'session' | 'rolls' | 'travel'>('all');

  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  const currentSession = useSelector((state: RootState) => 
    currentSessionId ? state.sessions.sessions[currentSessionId] : null
  );
  const allLogEntries = useSelector((state: RootState) => state.logEntries.logEntries);
  const allRolls = useSelector((state: RootState) => state.rolls.rolls);
  const allSectors = useSelector((state: RootState) => state.sectors.sectors);

  // Get log entries for current session or all entries
  const getFilteredEntries = (): LogEntry[] => {
    let entries = Object.values(allLogEntries);

    if (filter === 'session' && currentSessionId) {
      entries = entries.filter(entry => entry.sessionId === currentSessionId);
    } else if (filter === 'rolls') {
      entries = entries.filter(entry => entry.type === LogEntryType.ROLL);
    } else if (filter === 'travel') {
      entries = entries.filter(entry => entry.type === LogEntryType.TRAVEL);
    }

    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredEntries = getFilteredEntries();

  const handleAddNote = () => {
    if (!newEntryText.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    if (!currentSessionId) {
      Alert.alert('Error', 'Please start a session first');
      return;
    }

    dispatch(logQuickEvent({
      type: LogEntryType.NOTE,
      sessionId: currentSessionId,
      note: newEntryText.trim(),
      data: {},
    }));

    setNewEntryText('');
  };

  const getEntryIcon = (type: LogEntryType) => {
    switch (type) {
      case LogEntryType.ROLL:
        return 'cube';
      case LogEntryType.TRAVEL:
        return 'navigate';
      case LogEntryType.DAMAGE:
        return 'warning';
      case LogEntryType.REWARD:
        return 'gift';
      case LogEntryType.ENCOUNTER:
        return 'people';
      case LogEntryType.MISSION_UPDATE:
        return 'checkmark-circle';
      default:
        return 'document-text';
    }
  };

  const getEntryColor = (type: LogEntryType) => {
    switch (type) {
      case LogEntryType.ROLL:
        return '#007AFF';
      case LogEntryType.TRAVEL:
        return '#28A745';
      case LogEntryType.DAMAGE:
        return '#DC3545';
      case LogEntryType.REWARD:
        return '#FFC107';
      case LogEntryType.ENCOUNTER:
        return '#6F42C1';
      case LogEntryType.MISSION_UPDATE:
        return '#17A2B8';
      default:
        return '#666';
    }
  };

  const formatEntryData = (entry: LogEntry): string => {
    if (entry.type === LogEntryType.ROLL && allRolls[entry.data.rollId]) {
      const roll = allRolls[entry.data.rollId];
      return `Rolled ${roll.result} on ${roll.dieType}`;
    }
    
    if (entry.type === LogEntryType.TRAVEL && entry.data.toSectorId) {
      const sector = allSectors[entry.data.toSectorId];
      return sector ? `Moved to ${sector.name}` : 'Moved to unknown sector';
    }

    if (entry.type === LogEntryType.DAMAGE) {
      return `${entry.data.amount} ${entry.data.type} damage`;
    }

    return '';
  };

  const renderLogEntry = ({ item: entry }: { item: LogEntry }) => {
    const additionalInfo = formatEntryData(entry);

    return (
      <View style={styles.logEntry}>
        <View style={styles.entryHeader}>
          <Ionicons 
            name={getEntryIcon(entry.type)} 
            size={20} 
            color={getEntryColor(entry.type)} 
          />
          <View style={styles.entryInfo}>
            <Text style={styles.entryType}>
              {entry.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.entryTime}>
              {new Date(entry.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
        
        {entry.note && (
          <Text style={styles.entryNote}>{entry.note}</Text>
        )}
        
        {additionalInfo && (
          <Text style={styles.entryData}>{additionalInfo}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Journal</Text>
        <Text style={styles.subtitle}>
          {currentSession ? `Session: ${currentSession.summary}` : 'No active session'}
        </Text>
      </View>

      {/* Quick Add Note */}
      {currentSessionId && (
        <View style={styles.quickAdd}>
          <TextInput
            style={styles.noteInput}
            value={newEntryText}
            onChangeText={setNewEntryText}
            placeholder="Add a note to your journal..."
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddNote}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filters}>
        {['all', 'session', 'rolls', 'travel'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.activeFilterButton
            ]}
            onPress={() => setFilter(filterType as typeof filter)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === filterType && styles.activeFilterButtonText
            ]}>
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Log Entries */}
      <View style={styles.logContainer}>
        {filteredEntries.length > 0 ? (
          <FlatList
            data={filteredEntries}
            renderItem={renderLogEntry}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {filter === 'all' 
                ? 'No journal entries yet'
                : `No ${filter} entries found`
              }
            </Text>
            {!currentSessionId && (
              <Text style={styles.emptyStateSubtext}>
                Start a session to begin logging your adventures
              </Text>
            )}
          </View>
        )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickAdd: {
    backgroundColor: 'white',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  logContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logEntry: {
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
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryInfo: {
    marginLeft: 12,
    flex: 1,
  },
  entryType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  entryTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  entryNote: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  entryData: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});