import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

const initialState: AppSettings = {
  theme: 'auto',
  hapticFeedback: true,
  anonymousAnalytics: false,
  requireAuth: false,
  autoLogRolls: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    
    toggleHapticFeedback: (state) => {
      state.hapticFeedback = !state.hapticFeedback;
    },
    
    toggleAutoLogRolls: (state) => {
      state.autoLogRolls = !state.autoLogRolls;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    
    resetSettings: () => initialState,
  },
});

export const {
  updateSettings,
  toggleHapticFeedback,
  toggleAutoLogRolls,
  setTheme,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;