/**
 * Notification Redux Slice
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Redux slice for notification state management including
 * toast notifications and system notifications
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/types';

// Notification state interface
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  maxNotifications: 50,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add notification
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        read: false,
      };

      state.notifications.unshift(newNotification);
      state.unreadCount += 1;

      // Limit the number of notifications
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Clear read notifications
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter((n) => !n.read);
    },

    // Set max notifications
    setMaxNotifications: (state, action: PayloadAction<number>) => {
      state.maxNotifications = action.payload;
      if (state.notifications.length > state.maxNotifications) {
        state.notifications = state.notifications.slice(0, state.maxNotifications);
      }
    },

    // Update notification
    updateNotification: (state, action: PayloadAction<{ id: string; updates: Partial<Notification> }>) => {
      const { id, updates } = action.payload;
      const notification = state.notifications.find((n) => n.id === id);
      if (notification) {
        Object.assign(notification, updates);
        
        // Update unread count if read status changed
        if ('read' in updates) {
          if (updates.read && !notification.read) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else if (!updates.read && notification.read) {
            state.unreadCount += 1;
          }
        }
      }
    },

    // Bulk update notifications
    bulkUpdateNotifications: (state, action: PayloadAction<{ ids: string[]; updates: Partial<Notification> }>) => {
      const { ids, updates } = action.payload;
      let unreadCountChange = 0;

      state.notifications.forEach((notification) => {
        if (ids.includes(notification.id)) {
          const wasRead = notification.read;
          Object.assign(notification, updates);
          
          // Update unread count if read status changed
          if ('read' in updates) {
            if (updates.read && !wasRead) {
              unreadCountChange -= 1;
            } else if (!updates.read && wasRead) {
              unreadCountChange += 1;
            }
          }
        }
      });

      state.unreadCount = Math.max(0, state.unreadCount + unreadCountChange);
    },

    // Set notifications (for initial load)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
  },
});

// Export actions
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  clearReadNotifications,
  setMaxNotifications,
  updateNotification,
  bulkUpdateNotifications,
  setNotifications,
} = notificationSlice.actions;

// Export selectors
export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) => state.notifications.unreadCount;
export const selectUnreadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter((n) => !n.read);
export const selectReadNotifications = (state: { notifications: NotificationState }) => 
  state.notifications.notifications.filter((n) => n.read);
export const selectNotificationById = (id: string) => (state: { notifications: NotificationState }) => 
  state.notifications.notifications.find((n) => n.id === id);

export default notificationSlice.reducer;