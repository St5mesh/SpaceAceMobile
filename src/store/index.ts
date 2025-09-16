import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';

import characterSlice from './slices/characterSlice';
import shipSlice from './slices/shipSlice';
import sectorsSlice from './slices/sectorsSlice';
import missionsSlice from './slices/missionsSlice';
import encountersSlice from './slices/encountersSlice';
import npcsSlice from './slices/npcsSlice';
import sessionsSlice from './slices/sessionsSlice';
import logEntriesSlice from './slices/logEntriesSlice';
import rollsSlice from './slices/rollsSlice';
import settingsSlice from './slices/settingsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'character',
    'ship',
    'sectors',
    'missions',
    'encounters',
    'npcs',
    'sessions',
    'logEntries',
    'rolls',
    'settings',
  ],
};

const rootReducer = combineReducers({
  character: characterSlice,
  ship: shipSlice,
  sectors: sectorsSlice,
  missions: missionsSlice,
  encounters: encountersSlice,
  npcs: npcsSlice,
  sessions: sessionsSlice,
  logEntries: logEntriesSlice,
  rolls: rollsSlice,
  settings: settingsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;