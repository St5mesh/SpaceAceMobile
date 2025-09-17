import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LogEntry, UUID, LogEntryType } from '../../types';

interface LogEntriesState {
  logEntries: Record<UUID, LogEntry>;
}

const initialState: LogEntriesState = {
  logEntries: {},
};

const logEntriesSlice = createSlice({
  name: 'logEntries',
  initialState,
  reducers: {
    createLogEntry: (state, action: PayloadAction<Omit<LogEntry, 'id' | 'timestamp'>>) => {
      const id = Date.now().toString() + Math.random().toString(36);
      state.logEntries[id] = {
        ...action.payload,
        id,
        timestamp: new Date(),
      };
    },
    
    updateLogEntry: (state, action: PayloadAction<{ id: UUID; updates: Partial<LogEntry> }>) => {
      const { id, updates } = action.payload;
      if (state.logEntries[id]) {
        state.logEntries[id] = {
          ...state.logEntries[id],
          ...updates,
        };
      }
    },
    
    deleteLogEntry: (state, action: PayloadAction<UUID>) => {
      delete state.logEntries[action.payload];
    },
    
    // Helper action to quickly log common events
    logQuickEvent: (state, action: PayloadAction<{
      type: LogEntryType;
      sessionId: UUID;
      note?: string;
      data?: any;
      entityIds?: UUID[];
    }>) => {
      const { type, sessionId, note, data, entityIds = [] } = action.payload;
      const id = Date.now().toString() + Math.random().toString(36);
      
      state.logEntries[id] = {
        id,
        timestamp: new Date(),
        type,
        data: data || {},
        entityIds,
        sessionId,
        note,
      };
    },
  },
});

export const {
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  logQuickEvent,
} = logEntriesSlice.actions;

export default logEntriesSlice.reducer;