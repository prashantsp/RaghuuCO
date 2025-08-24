/**
 * UI Redux Slice
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Redux slice for UI state management including theme, sidebar, and modal states
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// UI state interface
interface UIState {
  theme: {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
  };
  sidebar: {
    open: boolean;
    width: number;
  };
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  loading: {
    [key: string]: boolean;
  };
  notifications: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
}

// Initial state
const initialState: UIState = {
  theme: {
    mode: 'light',
    primaryColor: '#2196f3',
    secondaryColor: '#e91e63',
  },
  sidebar: {
    open: true,
    width: 240,
  },
  modals: {},
  loading: {},
  notifications: {
    enabled: true,
    position: 'top-right',
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme actions
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme.mode = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.theme.primaryColor = action.payload;
    },
    setSecondaryColor: (state, action: PayloadAction<string>) => {
      state.theme.secondaryColor = action.payload;
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.open = action.payload;
    },
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = action.payload;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<{ key: string; data?: any }>) => {
      state.modals[action.payload.key] = {
        open: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload.key]) {
        state.modals[action.payload.key].open = false;
        state.modals[action.payload.key].data = undefined;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = {
          open: false,
          data: undefined,
        };
      });
    },

    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    clearLoading: (state, action: PayloadAction<string>) => {
      delete state.loading[action.payload];
    },
    clearAllLoading: (state) => {
      state.loading = {};
    },

    // Notification actions
    setNotificationEnabled: (state, action: PayloadAction<boolean>) => {
      state.notifications.enabled = action.payload;
    },
    setNotificationPosition: (
      state,
      action: PayloadAction<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>
    ) => {
      state.notifications.position = action.payload;
    },

    // Reset UI state
    resetUI: (state) => {
      state.sidebar.open = true;
      state.modals = {};
      state.loading = {};
    },
  },
});

// Export actions
export const {
  setThemeMode,
  setPrimaryColor,
  setSecondaryColor,
  toggleSidebar,
  setSidebarOpen,
  setSidebarWidth,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  clearLoading,
  clearAllLoading,
  setNotificationEnabled,
  setNotificationPosition,
  resetUI,
} = uiSlice.actions;

// Export selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectThemeMode = (state: { ui: UIState }) => state.ui.theme.mode;
export const selectSidebar = (state: { ui: UIState }) => state.ui.sidebar;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebar.open;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectModal = (key: string) => (state: { ui: UIState }) => state.ui.modals[key];
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectIsLoading = (key: string) => (state: { ui: UIState }) => state.ui.loading[key] || false;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;

export default uiSlice.reducer;