import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Mission, UUID, ObjectiveStatus, Objective } from '../../types';

interface MissionsState {
  missions: Record<UUID, Mission>;
}

const initialState: MissionsState = {
  missions: {},
};

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    createMission: (state, action: PayloadAction<Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      const id = Date.now().toString() + Math.random().toString(36);
      state.missions[id] = {
        ...action.payload,
        id,
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateMission: (state, action: PayloadAction<{ id: UUID; updates: Partial<Mission> }>) => {
      const { id, updates } = action.payload;
      if (state.missions[id]) {
        state.missions[id] = {
          ...state.missions[id],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    
    updateObjective: (state, action: PayloadAction<{ missionId: UUID; objectiveId: UUID; status: ObjectiveStatus }>) => {
      const { missionId, objectiveId, status } = action.payload;
      if (state.missions[missionId]) {
        const objective = state.missions[missionId].objectives.find(obj => obj.id === objectiveId);
        if (objective) {
          objective.status = status;
          state.missions[missionId].updatedAt = new Date();
        }
      }
    },
    
    deleteMission: (state, action: PayloadAction<UUID>) => {
      delete state.missions[action.payload];
    },
  },
});

export const {
  createMission,
  updateMission,
  updateObjective,
  deleteMission,
} = missionsSlice.actions;

export default missionsSlice.reducer;