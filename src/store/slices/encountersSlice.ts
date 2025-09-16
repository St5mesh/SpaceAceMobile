import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Encounter, UUID } from '../../types';

interface EncountersState {
  encounters: Record<UUID, Encounter>;
}

const initialState: EncountersState = {
  encounters: {},
};

const encountersSlice = createSlice({
  name: 'encounters',
  initialState,
  reducers: {
    createEncounter: (state, action: PayloadAction<Omit<Encounter, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      const id = Date.now().toString() + Math.random().toString(36);
      state.encounters[id] = {
        ...action.payload,
        id,
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateEncounter: (state, action: PayloadAction<{ id: UUID; updates: Partial<Encounter> }>) => {
      const { id, updates } = action.payload;
      if (state.encounters[id]) {
        state.encounters[id] = {
          ...state.encounters[id],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    
    deleteEncounter: (state, action: PayloadAction<UUID>) => {
      delete state.encounters[action.payload];
    },
  },
});

export const {
  createEncounter,
  updateEncounter,
  deleteEncounter,
} = encountersSlice.actions;

export default encountersSlice.reducer;