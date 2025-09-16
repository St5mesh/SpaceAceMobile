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
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../store';
import { createMission, updateMission, updateObjective } from '../store/slices/missionsSlice';
import { logQuickEvent } from '../store/slices/logEntriesSlice';
import { LogEntryType, ObjectiveStatus, Mission, Objective } from '../types';

export default function MissionsScreen() {
  const dispatch = useDispatch();
  const missions = useSelector((state: RootState) => state.missions.missions);
  const currentSessionId = useSelector((state: RootState) => state.sessions.currentSessionId);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    objectives: [''],
    rewards: '',
    fameDelta: 0,
    swayDelta: 0,
  });

  const missionsByStatus = {
    [ObjectiveStatus.NOT_STARTED]: Object.values(missions).filter(m => m.status === ObjectiveStatus.NOT_STARTED),
    [ObjectiveStatus.IN_PROGRESS]: Object.values(missions).filter(m => m.status === ObjectiveStatus.IN_PROGRESS),
    [ObjectiveStatus.COMPLETE]: Object.values(missions).filter(m => m.status === ObjectiveStatus.COMPLETE),
  };

  const handleCreateMission = () => {
    if (!newMission.title.trim()) {
      Alert.alert('Error', 'Mission title is required');
      return;
    }

    const objectives: Objective[] = newMission.objectives
      .filter(obj => obj.trim())
      .map((text, index) => ({
        id: `obj_${Date.now()}_${index}`,
        text: text.trim(),
        status: ObjectiveStatus.NOT_STARTED,
      }));

    if (objectives.length === 0) {
      Alert.alert('Error', 'At least one objective is required');
      return;
    }

    dispatch(createMission({
      title: newMission.title.trim(),
      description: newMission.description.trim(),
      objectives,
      rewards: newMission.rewards.trim(),
      fameDelta: newMission.fameDelta,
      swayDelta: newMission.swayDelta,
      relatedSectorIds: [],
      npcIds: [],
      status: ObjectiveStatus.NOT_STARTED,
    }));

    // Log mission creation
    if (currentSessionId) {
      dispatch(logQuickEvent({
        type: LogEntryType.MISSION_UPDATE,
        sessionId: currentSessionId,
        data: { action: 'created', title: newMission.title },
        note: `Created new mission: ${newMission.title}`,
      }));
    }

    setNewMission({
      title: '',
      description: '',
      objectives: [''],
      rewards: '',
      fameDelta: 0,
      swayDelta: 0,
    });
    setShowCreateForm(false);
  };

  const handleObjectiveToggle = (missionId: string, objectiveId: string, currentStatus: ObjectiveStatus) => {
    let newStatus: ObjectiveStatus;
    
    switch (currentStatus) {
      case ObjectiveStatus.NOT_STARTED:
        newStatus = ObjectiveStatus.IN_PROGRESS;
        break;
      case ObjectiveStatus.IN_PROGRESS:
        newStatus = ObjectiveStatus.COMPLETE;
        break;
      case ObjectiveStatus.COMPLETE:
        newStatus = ObjectiveStatus.NOT_STARTED;
        break;
    }

    dispatch(updateObjective({ missionId, objectiveId, status: newStatus }));

    // Update mission status based on objectives
    const mission = missions[missionId];
    if (mission) {
      const updatedObjectives = mission.objectives.map(obj => 
        obj.id === objectiveId ? { ...obj, status: newStatus } : obj
      );
      
      let missionStatus: ObjectiveStatus;
      if (updatedObjectives.every(obj => obj.status === ObjectiveStatus.COMPLETE)) {
        missionStatus = ObjectiveStatus.COMPLETE;
      } else if (updatedObjectives.some(obj => obj.status === ObjectiveStatus.IN_PROGRESS)) {
        missionStatus = ObjectiveStatus.IN_PROGRESS;
      } else {
        missionStatus = ObjectiveStatus.NOT_STARTED;
      }

      dispatch(updateMission({ id: missionId, updates: { status: missionStatus } }));

      // Log the objective update
      if (currentSessionId) {
        dispatch(logQuickEvent({
          type: LogEntryType.MISSION_UPDATE,
          sessionId: currentSessionId,
          data: { 
            missionId, 
            objectiveId, 
            action: 'objective_updated',
            newStatus,
            missionTitle: mission.title 
          },
          note: `Mission objective ${newStatus.replace('_', ' ')}: ${mission.title}`,
          entityIds: [missionId],
        }));
      }
    }
  };

  const getStatusColor = (status: ObjectiveStatus) => {
    switch (status) {
      case ObjectiveStatus.NOT_STARTED:
        return '#666';
      case ObjectiveStatus.IN_PROGRESS:
        return '#007AFF';
      case ObjectiveStatus.COMPLETE:
        return '#28A745';
    }
  };

  const getStatusIcon = (status: ObjectiveStatus) => {
    switch (status) {
      case ObjectiveStatus.NOT_STARTED:
        return 'ellipse-outline';
      case ObjectiveStatus.IN_PROGRESS:
        return 'radio-button-on';
      case ObjectiveStatus.COMPLETE:
        return 'checkmark-circle';
    }
  };

  const renderMission = ({ item: mission }: { item: Mission }) => {
    const isSelected = selectedMissionId === mission.id;
    const completedObjectives = mission.objectives.filter(obj => obj.status === ObjectiveStatus.COMPLETE).length;
    
    return (
      <TouchableOpacity
        style={[styles.missionCard, isSelected && styles.selectedMissionCard]}
        onPress={() => setSelectedMissionId(isSelected ? null : mission.id)}
      >
        <View style={styles.missionHeader}>
          <View style={styles.missionInfo}>
            <Text style={styles.missionTitle}>{mission.title}</Text>
            <Text style={styles.missionProgress}>
              {completedObjectives}/{mission.objectives.length} objectives complete
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mission.status) }]}>
            <Ionicons name={getStatusIcon(mission.status)} size={16} color="white" />
          </View>
        </View>

        {isSelected && (
          <View style={styles.missionDetails}>
            {mission.description && (
              <Text style={styles.missionDescription}>{mission.description}</Text>
            )}

            <View style={styles.objectivesSection}>
              <Text style={styles.sectionTitle}>Objectives</Text>
              {mission.objectives.map((objective) => (
                <TouchableOpacity
                  key={objective.id}
                  style={styles.objective}
                  onPress={() => handleObjectiveToggle(mission.id, objective.id, objective.status)}
                >
                  <Ionicons 
                    name={getStatusIcon(objective.status)} 
                    size={20} 
                    color={getStatusColor(objective.status)} 
                  />
                  <Text style={[
                    styles.objectiveText,
                    objective.status === ObjectiveStatus.COMPLETE && styles.completedObjectiveText
                  ]}>
                    {objective.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(mission.rewards || mission.fameDelta !== 0 || mission.swayDelta !== 0) && (
              <View style={styles.rewardsSection}>
                <Text style={styles.sectionTitle}>Rewards</Text>
                {mission.rewards && (
                  <Text style={styles.rewardText}>{mission.rewards}</Text>
                )}
                {(mission.fameDelta !== 0 || mission.swayDelta !== 0) && (
                  <View style={styles.statRewards}>
                    {mission.fameDelta !== 0 && (
                      <Text style={styles.statReward}>Fame: {mission.fameDelta > 0 ? '+' : ''}{mission.fameDelta}</Text>
                    )}
                    {mission.swayDelta !== 0 && (
                      <Text style={styles.statReward}>Sway: {mission.swayDelta > 0 ? '+' : ''}{mission.swayDelta}</Text>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMissionSection = (status: ObjectiveStatus, missions: Mission[]) => {
    const sectionTitles = {
      [ObjectiveStatus.NOT_STARTED]: 'Not Started',
      [ObjectiveStatus.IN_PROGRESS]: 'In Progress',
      [ObjectiveStatus.COMPLETE]: 'Complete',
    };

    if (missions.length === 0) return null;

    return (
      <View key={status} style={styles.section}>
        <Text style={styles.sectionHeader}>
          {sectionTitles[status]} ({missions.length})
        </Text>
        {missions.map(mission => (
          <View key={mission.id}>
            {renderMission({ item: mission })}
          </View>
        ))}
      </View>
    );
  };

  if (showCreateForm) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.title}>New Mission</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mission Title</Text>
              <TextInput
                style={styles.input}
                value={newMission.title}
                onChangeText={(text) => setNewMission({ ...newMission, title: text })}
                placeholder="Enter mission title"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newMission.description}
                onChangeText={(text) => setNewMission({ ...newMission, description: text })}
                placeholder="Mission description (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Objectives</Text>
              {newMission.objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveInput}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={objective}
                    onChangeText={(text) => {
                      const updatedObjectives = [...newMission.objectives];
                      updatedObjectives[index] = text;
                      setNewMission({ ...newMission, objectives: updatedObjectives });
                    }}
                    placeholder={`Objective ${index + 1}`}
                  />
                  {newMission.objectives.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        const updatedObjectives = newMission.objectives.filter((_, i) => i !== index);
                        setNewMission({ ...newMission, objectives: updatedObjectives });
                      }}
                    >
                      <Ionicons name="remove-circle" size={24} color="#DC3545" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addObjectiveButton}
                onPress={() => setNewMission({ 
                  ...newMission, 
                  objectives: [...newMission.objectives, ''] 
                })}
              >
                <Ionicons name="add" size={16} color="#007AFF" />
                <Text style={styles.addObjectiveText}>Add Objective</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rewards</Text>
              <TextInput
                style={styles.input}
                value={newMission.rewards}
                onChangeText={(text) => setNewMission({ ...newMission, rewards: text })}
                placeholder="Mission rewards (optional)"
              />
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Fame Bonus</Text>
                <TextInput
                  style={styles.statInputField}
                  value={newMission.fameDelta.toString()}
                  onChangeText={(text) => 
                    setNewMission({ ...newMission, fameDelta: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.statInput}>
                <Text style={styles.label}>Sway Bonus</Text>
                <TextInput
                  style={styles.statInputField}
                  value={newMission.swayDelta.toString()}
                  onChangeText={(text) => 
                    setNewMission({ ...newMission, swayDelta: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreateMission}>
              <Text style={styles.createButtonText}>Create Mission</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Missions</Text>
        <TouchableOpacity onPress={() => setShowCreateForm(true)}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.keys(missionsByStatus).map(status => 
          renderMissionSection(status as ObjectiveStatus, missionsByStatus[status as ObjectiveStatus])
        )}

        {Object.values(missions).length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No missions yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create your first mission to start tracking objectives
            </Text>
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
  placeholder: {
    width: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  missionCard: {
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
  selectedMissionCard: {
    backgroundColor: '#f8f9fa',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  missionProgress: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  objectivesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  objective: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  objectiveText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  completedObjectiveText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  rewardsSection: {
    marginBottom: 16,
  },
  rewardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  statRewards: {
    flexDirection: 'row',
    gap: 16,
  },
  statReward: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
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
    height: 80,
    textAlignVertical: 'top',
  },
  objectiveInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  removeButton: {
    padding: 4,
  },
  addObjectiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 8,
  },
  addObjectiveText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statInput: {
    flex: 1,
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
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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