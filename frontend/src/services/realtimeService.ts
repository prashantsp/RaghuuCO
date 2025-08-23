/**
 * Real-time Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This service provides real-time updates and notifications using
 * WebSocket connections for live data synchronization.
 */

import { logger } from '@/utils/logger';

/**
 * Real-time event types
 */
export enum RealtimeEventType {
  CASE_UPDATED = 'case_updated',
  CASE_CREATED = 'case_created',
  CASE_DELETED = 'case_deleted',
  CLIENT_UPDATED = 'client_updated',
  CLIENT_CREATED = 'client_created',
  CLIENT_DELETED = 'client_deleted',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_UPDATED = 'document_updated',
  DOCUMENT_DELETED = 'document_deleted',
  TIME_ENTRY_CREATED = 'time_entry_created',
  TIME_ENTRY_UPDATED = 'time_entry_updated',
  INVOICE_CREATED = 'invoice_created',
  INVOICE_UPDATED = 'invoice_updated',
  INVOICE_PAID = 'invoice_paid',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  MESSAGE_RECEIVED = 'message_received',
  NOTIFICATION = 'notification',
  SYSTEM_ALERT = 'system_alert'
}

/**
 * Real-time event interface
 */
export interface RealtimeEvent {
  type: RealtimeEventType;
  data: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

/**
 * Real-time service class
 */
class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<RealtimeEventType, Function[]> = new Map();
  private notificationListeners: Function[] = [];
  private isConnected = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  constructor() {
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private connect(): void {
    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        logger.info('WebSocket connected successfully');
        
        // Authenticate connection
        if (this.userId) {
          this.authenticate(this.userId);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error as Error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        logger.warn('WebSocket connection closed');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        logger.error('WebSocket error:', error);
      };

    } catch (error) {
      logger.error('Error connecting to WebSocket:', error as Error);
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'pong':
        // Heartbeat response
        break;
        
      case 'event':
        this.handleEvent(data.event as RealtimeEvent);
        break;
        
      case 'notification':
        this.handleNotification(data.notification as Notification);
        break;
        
      case 'error':
        logger.error('WebSocket server error:', data.error);
        break;
        
      default:
        logger.warn('Unknown WebSocket message type:', data.type);
    }
  }

  /**
   * Handle real-time events
   */
  private handleEvent(event: RealtimeEvent): void {
    logger.debug('Received real-time event:', event);
    
    // Notify event listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          logger.error('Error in event listener:', error as Error);
        }
      });
    }
  }

  /**
   * Handle notifications
   */
  private handleNotification(notification: Notification): void {
    logger.debug('Received notification:', notification);
    
    // Notify notification listeners
    this.notificationListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        logger.error('Error in notification listener:', error as Error);
      }
    });
  }

  /**
   * Authenticate WebSocket connection
   */
  authenticate(userId: string): void {
    this.userId = userId;
    
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        userId: userId,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Subscribe to real-time events
   */
  subscribe(eventType: RealtimeEventType, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(callback);
    
    // Send subscription to server
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        eventType: eventType,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Unsubscribe from real-time events
   */
  unsubscribe(eventType: RealtimeEventType, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Subscribe to notifications
   */
  onNotification(callback: Function): void {
    this.notificationListeners.push(callback);
  }

  /**
   * Unsubscribe from notifications
   */
  offNotification(callback: Function): void {
    const index = this.notificationListeners.indexOf(callback);
    if (index > -1) {
      this.notificationListeners.splice(index, 1);
    }
  }

  /**
   * Send real-time event
   */
  sendEvent(eventType: RealtimeEventType, data: any): void {
    if (this.isConnected && this.ws) {
      const event: RealtimeEvent = {
        type: eventType,
        data: data,
        timestamp: new Date().toISOString(),
        userId: this.userId || undefined
      };
      
      this.ws.send(JSON.stringify({
        type: 'event',
        event: event
      }));
    }
  }

  /**
   * Send notification
   */
  sendNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    if (this.isConnected && this.ws) {
      const fullNotification: Notification = {
        ...notification,
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        read: false
      };
      
      this.ws.send(JSON.stringify({
        type: 'notification',
        notification: fullNotification
      }));
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.eventListeners.clear();
    this.notificationListeners = [];
    
    logger.info('WebSocket disconnected');
  }

  /**
   * Get connection statistics
   */
  getStats(): any {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      eventListeners: this.eventListeners.size,
      notificationListeners: this.notificationListeners.length,
      userId: this.userId
    };
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
export { RealtimeService, RealtimeEventType };