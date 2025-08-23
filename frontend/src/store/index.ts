/**
 * Redux Store Configuration
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Redux store configuration with authentication slice and middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

// Persist configuration for authentication
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'tokens', 'isAuthenticated'], // Only persist these fields
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui: uiReducer,
  notifications: notificationReducer,
});

// Store configuration
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor for Redux Persist
export const persistor = persistStore(store);

// Root state type
export type RootState = ReturnType<typeof store.getState>;

// App dispatch type
export type AppDispatch = typeof store.dispatch;

export default store;