import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Roll, UUID, DieType, RollMode } from '../../types';

interface RollsState {
  rolls: Record<UUID, Roll>;
  rollHistory: UUID[]; // ordered list of recent rolls
}

const initialState: RollsState = {
  rolls: {},
  rollHistory: [],
};

const rollsSlice = createSlice({
  name: 'rolls',
  initialState,
  reducers: {
    addRoll: (state, action: PayloadAction<Omit<Roll, 'id' | 'timestamp'>>) => {
      const id = Date.now().toString() + Math.random().toString(36);
      const roll: Roll = {
        ...action.payload,
        id,
        timestamp: new Date(),
      };
      
      state.rolls[id] = roll;
      state.rollHistory.unshift(id);
      
      // Keep only last 100 rolls in history
      if (state.rollHistory.length > 100) {
        const removedRollId = state.rollHistory.pop();
        if (removedRollId) {
          delete state.rolls[removedRollId];
        }
      }
    },
    
    updateRoll: (state, action: PayloadAction<{ id: UUID; updates: Partial<Roll> }>) => {
      const { id, updates } = action.payload;
      if (state.rolls[id]) {
        state.rolls[id] = {
          ...state.rolls[id],
          ...updates,
        };
      }
    },
    
    deleteRoll: (state, action: PayloadAction<UUID>) => {
      const id = action.payload;
      delete state.rolls[id];
      state.rollHistory = state.rollHistory.filter(rollId => rollId !== id);
    },
    
    clearRollHistory: (state) => {
      state.rolls = {};
      state.rollHistory = [];
    },
    
    // Helper action for rolling dice
    rollDice: (state, action: PayloadAction<{
      dieType: DieType;
      mode: RollMode;
      modifiers?: number[];
      note?: string;
      sessionId?: UUID;
      missionId?: UUID;
      encounterId?: UUID;
    }>) => {
      const { dieType, mode, modifiers = [], note, sessionId, missionId, encounterId } = action.payload;
      const id = Date.now().toString() + Math.random().toString(36);
      
      // Generate random result(s)
      const maxValue = dieType === DieType.D20 ? 20 : 6;
      let results: number[] = [];
      let finalResult: number;
      
      if (mode === RollMode.ADVANTAGE || mode === RollMode.DISADVANTAGE) {
        results = [
          Math.floor(Math.random() * maxValue) + 1,
          Math.floor(Math.random() * maxValue) + 1,
        ];
        finalResult = mode === RollMode.ADVANTAGE ? Math.max(...results) : Math.min(...results);
      } else {
        finalResult = Math.floor(Math.random() * maxValue) + 1;
        results = [finalResult];
      }
      
      const roll: Roll = {
        id,
        dieType,
        result: finalResult,
        results: results.length > 1 ? results : undefined,
        modifiers,
        mode,
        note,
        timestamp: new Date(),
        sessionId,
        missionId,
        encounterId,
      };
      
      state.rolls[id] = roll;
      state.rollHistory.unshift(id);
      
      // Keep only last 100 rolls in history
      if (state.rollHistory.length > 100) {
        const removedRollId = state.rollHistory.pop();
        if (removedRollId) {
          delete state.rolls[removedRollId];
        }
      }
    },
  },
});

export const {
  addRoll,
  updateRoll,
  deleteRoll,
  clearRollHistory,
  rollDice,
} = rollsSlice.actions;

export default rollsSlice.reducer;