import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NPC, UUID } from '../../types';

interface NPCsState {
  npcs: Record<UUID, NPC>;
}

const initialState: NPCsState = {
  npcs: {},
};

const npcsSlice = createSlice({
  name: 'npcs',
  initialState,
  reducers: {
    createNPC: (state, action: PayloadAction<Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      const id = Date.now().toString() + Math.random().toString(36);
      state.npcs[id] = {
        ...action.payload,
        id,
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateNPC: (state, action: PayloadAction<{ id: UUID; updates: Partial<NPC> }>) => {
      const { id, updates } = action.payload;
      if (state.npcs[id]) {
        state.npcs[id] = {
          ...state.npcs[id],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    
    deleteNPC: (state, action: PayloadAction<UUID>) => {
      delete state.npcs[action.payload];
    },
  },
});

export const {
  createNPC,
  updateNPC,
  deleteNPC,
} = npcsSlice.actions;

export default npcsSlice.reducer;