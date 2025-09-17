import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Session, UUID } from '../../types';

interface SessionsState {
  sessions: Record<UUID, Session>;
  currentSessionId?: UUID;
}

const initialState: SessionsState = {
  sessions: {},
  currentSessionId: undefined,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    startSession: (state, action: PayloadAction<{ summary?: string }>) => {
      const now = new Date();
      const id = Date.now().toString() + Math.random().toString(36);
      const newSession: Session = {
        id,
        dateRange: { start: now },
        summary: action.payload.summary || `Session ${Object.keys(state.sessions).length + 1}`,
        entryIds: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      
      // End current session if exists
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        state.sessions[state.currentSessionId].isActive = false;
        state.sessions[state.currentSessionId].dateRange.end = now;
        state.sessions[state.currentSessionId].updatedAt = now;
      }
      
      state.sessions[id] = newSession;
      state.currentSessionId = id;
    },
    
    endCurrentSession: (state) => {
      if (state.currentSessionId && state.sessions[state.currentSessionId]) {
        const now = new Date();
        state.sessions[state.currentSessionId].isActive = false;
        state.sessions[state.currentSessionId].dateRange.end = now;
        state.sessions[state.currentSessionId].updatedAt = now;
        state.currentSessionId = undefined;
      }
    },
    
    updateSession: (state, action: PayloadAction<{ id: UUID; updates: Partial<Session> }>) => {
      const { id, updates } = action.payload;
      if (state.sessions[id]) {
        state.sessions[id] = {
          ...state.sessions[id],
          ...updates,
          updatedAt: new Date(),
        };
      }
    },
    
    addLogEntryToSession: (state, action: PayloadAction<{ sessionId: UUID; logEntryId: UUID }>) => {
      const { sessionId, logEntryId } = action.payload;
      if (state.sessions[sessionId]) {
        if (!state.sessions[sessionId].entryIds.includes(logEntryId)) {
          state.sessions[sessionId].entryIds.push(logEntryId);
          state.sessions[sessionId].updatedAt = new Date();
        }
      }
    },
    
    deleteSession: (state, action: PayloadAction<UUID>) => {
      delete state.sessions[action.payload];
      if (state.currentSessionId === action.payload) {
        state.currentSessionId = undefined;
      }
    },
  },
});

export const {
  startSession,
  endCurrentSession,
  updateSession,
  addLogEntryToSession,
  deleteSession,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;