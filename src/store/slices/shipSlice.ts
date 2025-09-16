import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ship, UUID } from '../../types';

interface ShipState {
  current?: Ship;
}

const initialState: ShipState = {
  current: undefined,
};

const shipSlice = createSlice({
  name: 'ship',
  initialState,
  reducers: {
    createShip: (state, action: PayloadAction<Omit<Ship, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const now = new Date();
      state.current = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36),
        createdAt: now,
        updatedAt: now,
      };
    },
    
    updateShip: (state, action: PayloadAction<Partial<Ship>>) => {
      if (state.current) {
        state.current = {
          ...state.current,
          ...action.payload,
          updatedAt: new Date(),
        };
      }
    },
    
    damageShields: (state, action: PayloadAction<number>) => {
      if (state.current) {
        state.current.shields = Math.max(0, state.current.shields - action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    damageHull: (state, action: PayloadAction<number>) => {
      if (state.current) {
        state.current.hull = Math.max(0, state.current.hull - action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    repairShields: (state, action: PayloadAction<number>) => {
      if (state.current) {
        state.current.shields = Math.min(
          state.current.maxShields,
          state.current.shields + action.payload
        );
        state.current.updatedAt = new Date();
      }
    },
    
    repairHull: (state, action: PayloadAction<number>) => {
      if (state.current) {
        state.current.hull = Math.min(
          state.current.maxHull,
          state.current.hull + action.payload
        );
        state.current.updatedAt = new Date();
      }
    },
    
    addModule: (state, action: PayloadAction<string>) => {
      if (state.current) {
        state.current.modules.push(action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    removeModule: (state, action: PayloadAction<string>) => {
      if (state.current) {
        state.current.modules = state.current.modules.filter(module => module !== action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    addQuirk: (state, action: PayloadAction<string>) => {
      if (state.current) {
        state.current.quirks.push(action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    removeQuirk: (state, action: PayloadAction<string>) => {
      if (state.current) {
        state.current.quirks = state.current.quirks.filter(quirk => quirk !== action.payload);
        state.current.updatedAt = new Date();
      }
    },
    
    clearShip: (state) => {
      state.current = undefined;
    },
  },
});

export const {
  createShip,
  updateShip,
  damageShields,
  damageHull,
  repairShields,
  repairHull,
  addModule,
  removeModule,
  addQuirk,
  removeQuirk,
  clearShip,
} = shipSlice.actions;

export default shipSlice.reducer;