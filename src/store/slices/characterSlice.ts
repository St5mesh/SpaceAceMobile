import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Character, InventoryItem, UUID } from '../../types';

interface CharacterState {
  current?: Character;
}

const initialState: CharacterState = {
  current: undefined,
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    createCharacter: (state, action: PayloadAction<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      state.current = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36),
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateCharacter: (state, action: PayloadAction<Partial<Character>>) => {
      if (state.current) {
        state.current = {
          ...state.current,
          ...action.payload,
          updatedAt: new Date(),
        };
      }
    },
    
    updateCharacterStats: (state, action: PayloadAction<{ fame?: number; sway?: number; heat?: number }>) => {
      if (state.current) {
        const { fame, sway, heat } = action.payload;
        if (fame !== undefined) state.current.fame = fame;
        if (sway !== undefined) state.current.sway = sway;
        if (heat !== undefined) state.current.heat = heat;
        state.current.updatedAt = new Date();
      }
    },
    
    addInventoryItem: (state, action: PayloadAction<Omit<InventoryItem, 'id'>>) => {
      if (state.current) {
        const newItem: InventoryItem = {
          ...action.payload,
          id: Date.now().toString() + Math.random().toString(36),
        };
        state.current.inventory.push(newItem);
        state.current.updatedAt = new Date();
      }
    },
    
    updateInventoryItem: (state, action: PayloadAction<{ id: UUID; updates: Partial<InventoryItem> }>) => {
      if (state.current) {
        const itemIndex = state.current.inventory.findIndex(item => item.id === action.payload.id);
        if (itemIndex !== -1) {
          state.current.inventory[itemIndex] = {
            ...state.current.inventory[itemIndex],
            ...action.payload.updates,
          };
          state.current.updatedAt = new Date();
        }
      }
    },
    
    removeInventoryItem: (state, action: PayloadAction<UUID>) => {
      if (state.current) {
        state.current.inventory = state.current.inventory.filter(item => item.id !== action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    clearCharacter: (state) => {
      state.current = undefined;
    },
  },
});

export const {
  createCharacter,
  updateCharacter,
  updateCharacterStats,
  addInventoryItem,
  updateInventoryItem,
  removeInventoryItem,
  clearCharacter,
} = characterSlice.actions;

export default characterSlice.reducer;