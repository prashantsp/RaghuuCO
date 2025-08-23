/**
 * Offline Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This service provides offline functionality including data
 * synchronization, offline document access, form submission, and conflict
 * resolution for the legal practice management system.
 */

import { logger } from '@/utils/logger';

/**
 * Offline data types
 */
export enum OfflineDataType {
  CASE = 'case',
  CLIENT = 'client',
  DOCUMENT = 'document',
  TIME_ENTRY = 'time_entry',
  INVOICE = 'invoice',
  EXPENSE = 'expense',
  TASK = 'task',
  MESSAGE = 'message'
}

/**
 * Sync status
 */
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict'
}

/**
 * Offline operation interface
 */
export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  dataType: OfflineDataType;
  data: any;
  timestamp: string;
  status: SyncStatus;
  retryCount: number;
  error?: string;
  conflictResolution?: 'local' | 'remote' | 'manual';
}

/**
 * Offline document interface
 */
export interface OfflineDocument {
  id: string;
  title: string;
  content: string;
  fileType: string;
  size: number;
  lastModified: string;
  isAvailable: boolean;
  syncStatus: SyncStatus;
}

/**
 * Offline form data interface
 */
export interface OfflineFormData {
  id: string;
  formType: string;
  data: any;
  timestamp: string;
  status: SyncStatus;
  retryCount: number;
}

/**
 * Offline service class
 */
class OfflineService {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private syncQueue: OfflineOperation[] = [];
  private syncInProgress: boolean = false;

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    try {
      await this.initIndexedDB();
      await this.loadSyncQueue();
      this.setupOnlineOfflineListeners();
      this.startPeriodicSync();
      
      logger.info('Offline service initialized successfully');
    } catch (error) {
      logger.error('Error initializing offline service:', error as Error);
      throw error;
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RaghuuCOOffline', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineDocuments')) {
          const docStore = db.createObjectStore('offlineDocuments', { keyPath: 'id' });
          docStore.createIndex('lastModified', 'lastModified', { unique: false });
          docStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineForms')) {
          const formStore = db.createObjectStore('offlineForms', { keyPath: 'id' });
          formStore.createIndex('timestamp', 'timestamp', { unique: false });
          formStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'id' });
          dataStore.createIndex('dataType', 'dataType', { unique: false });
          dataStore.createIndex('lastSync', 'lastSync', { unique: false });
        }
      };
    });
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.info('Application is now online');
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.info('Application is now offline');
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncPendingOperations();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  /**
   * Add operation to sync queue
   */
  async addToSyncQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<string> {
    try {
      const id = this.generateOperationId();
      const syncOperation: OfflineOperation = {
        ...operation,
        id,
        timestamp: new Date().toISOString(),
        status: SyncStatus.PENDING,
        retryCount: 0
      };

      await this.saveToIndexedDB('syncQueue', syncOperation);
      this.syncQueue.push(syncOperation);

      logger.info(`Added operation to sync queue: ${operation.type} ${operation.dataType}`);
      return id;
    } catch (error) {
      logger.error('Error adding operation to sync queue:', error as Error);
      throw error;
    }
  }

  /**
   * Sync pending operations
   */
  async syncPendingOperations(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    const pendingOperations = this.syncQueue.filter(op => op.status === SyncStatus.PENDING);

    logger.info(`Starting sync of ${pendingOperations.length} pending operations`);

    for (const operation of pendingOperations) {
      try {
        await this.syncOperation(operation);
      } catch (error) {
        logger.error(`Error syncing operation ${operation.id}:`, error as Error);
        await this.handleSyncError(operation, error as Error);
      }
    }

    this.syncInProgress = false;
  }

  /**
   * Sync individual operation
   */
  private async syncOperation(operation: OfflineOperation): Promise<void> {
    operation.status = SyncStatus.SYNCING;
    await this.updateOperation(operation);

    let response: Response;
    const url = this.getApiUrl(operation.dataType, operation.data.id);

    switch (operation.type) {
      case 'create':
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(operation.data)
        });
        break;

      case 'update':
        response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify(operation.data)
        });
        break;

      case 'delete':
        response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
        break;

      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    operation.status = SyncStatus.COMPLETED;
    await this.updateOperation(operation);

    logger.info(`Successfully synced operation: ${operation.type} ${operation.dataType}`);
  }

  /**
   * Handle sync error
   */
  private async handleSyncError(operation: OfflineOperation, error: Error): Promise<void> {
    operation.retryCount++;
    operation.error = error.message;

    if (operation.retryCount >= 3) {
      operation.status = SyncStatus.FAILED;
      logger.error(`Operation ${operation.id} failed after ${operation.retryCount} retries`);
    } else {
      operation.status = SyncStatus.PENDING;
      // Exponential backoff
      setTimeout(() => {
        this.syncPendingOperations();
      }, Math.pow(2, operation.retryCount) * 1000);
    }

    await this.updateOperation(operation);
  }

  /**
   * Store offline document
   */
  async storeOfflineDocument(document: OfflineDocument): Promise<void> {
    try {
      await this.saveToIndexedDB('offlineDocuments', document);
      logger.info(`Stored offline document: ${document.title}`);
    } catch (error) {
      logger.error('Error storing offline document:', error as Error);
      throw error;
    }
  }

  /**
   * Get offline document
   */
  async getOfflineDocument(id: string): Promise<OfflineDocument | null> {
    try {
      return await this.getFromIndexedDB('offlineDocuments', id);
    } catch (error) {
      logger.error('Error getting offline document:', error as Error);
      return null;
    }
  }

  /**
   * Get all offline documents
   */
  async getAllOfflineDocuments(): Promise<OfflineDocument[]> {
    try {
      return await this.getAllFromIndexedDB('offlineDocuments');
    } catch (error) {
      logger.error('Error getting offline documents:', error as Error);
      return [];
    }
  }

  /**
   * Store offline form data
   */
  async storeOfflineForm(formData: OfflineFormData): Promise<void> {
    try {
      await this.saveToIndexedDB('offlineForms', formData);
      logger.info(`Stored offline form: ${formData.formType}`);
    } catch (error) {
      logger.error('Error storing offline form:', error as Error);
      throw error;
    }
  }

  /**
   * Get offline form data
   */
  async getOfflineForm(id: string): Promise<OfflineFormData | null> {
    try {
      return await this.getFromIndexedDB('offlineForms', id);
    } catch (error) {
      logger.error('Error getting offline form:', error as Error);
      return null;
    }
  }

  /**
   * Get all offline forms
   */
  async getAllOfflineForms(): Promise<OfflineFormData[]> {
    try {
      return await this.getAllFromIndexedDB('offlineForms');
    } catch (error) {
      logger.error('Error getting offline forms:', error as Error);
      return [];
    }
  }

  /**
   * Store offline data
   */
  async storeOfflineData(dataType: OfflineDataType, data: any): Promise<void> {
    try {
      const offlineData = {
        id: `${dataType}_${data.id}`,
        dataType,
        data,
        lastSync: new Date().toISOString()
      };

      await this.saveToIndexedDB('offlineData', offlineData);
      logger.info(`Stored offline data: ${dataType} ${data.id}`);
    } catch (error) {
      logger.error('Error storing offline data:', error as Error);
      throw error;
    }
  }

  /**
   * Get offline data
   */
  async getOfflineData(dataType: OfflineDataType, id: string): Promise<any | null> {
    try {
      const offlineData = await this.getFromIndexedDB('offlineData', `${dataType}_${id}`);
      return offlineData ? offlineData.data : null;
    } catch (error) {
      logger.error('Error getting offline data:', error as Error);
      return null;
    }
  }

  /**
   * Get all offline data by type
   */
  async getAllOfflineDataByType(dataType: OfflineDataType): Promise<any[]> {
    try {
      const allData = await this.getAllFromIndexedDB('offlineData');
      return allData
        .filter(item => item.dataType === dataType)
        .map(item => item.data);
    } catch (error) {
      logger.error('Error getting offline data by type:', error as Error);
      return [];
    }
  }

  /**
   * Resolve conflicts
   */
  async resolveConflict(operationId: string, resolution: 'local' | 'remote' | 'manual'): Promise<void> {
    try {
      const operation = this.syncQueue.find(op => op.id === operationId);
      if (!operation) {
        throw new Error(`Operation ${operationId} not found`);
      }

      operation.conflictResolution = resolution;
      operation.status = SyncStatus.PENDING;

      if (resolution === 'local') {
        // Keep local changes, retry sync
        await this.syncOperation(operation);
      } else if (resolution === 'remote') {
        // Discard local changes
        operation.status = SyncStatus.COMPLETED;
        await this.updateOperation(operation);
      } else {
        // Manual resolution - keep in queue for user to handle
        operation.status = SyncStatus.CONFLICT;
        await this.updateOperation(operation);
      }

      logger.info(`Resolved conflict for operation ${operationId} with resolution: ${resolution}`);
    } catch (error) {
      logger.error('Error resolving conflict:', error as Error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isOnline: boolean;
    pendingOperations: number;
    failedOperations: number;
    conflicts: number;
    lastSync: string | null;
  } {
    const pendingOperations = this.syncQueue.filter(op => op.status === SyncStatus.PENDING).length;
    const failedOperations = this.syncQueue.filter(op => op.status === SyncStatus.FAILED).length;
    const conflicts = this.syncQueue.filter(op => op.status === SyncStatus.CONFLICT).length;
    const lastSync = this.syncQueue
      .filter(op => op.status === SyncStatus.COMPLETED)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp || null;

    return {
      isOnline: this.isOnline,
      pendingOperations,
      failedOperations,
      conflicts,
      lastSync
    };
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      await this.clearIndexedDBStore('syncQueue');
      this.syncQueue = [];
      logger.info('Sync queue cleared');
    } catch (error) {
      logger.error('Error clearing sync queue:', error as Error);
      throw error;
    }
  }

  /**
   * Load sync queue from IndexedDB
   */
  private async loadSyncQueue(): Promise<void> {
    try {
      this.syncQueue = await this.getAllFromIndexedDB('syncQueue');
      logger.info(`Loaded ${this.syncQueue.length} operations from sync queue`);
    } catch (error) {
      logger.error('Error loading sync queue:', error as Error);
      this.syncQueue = [];
    }
  }

  /**
   * Update operation in IndexedDB
   */
  private async updateOperation(operation: OfflineOperation): Promise<void> {
    try {
      await this.saveToIndexedDB('syncQueue', operation);
      const index = this.syncQueue.findIndex(op => op.id === operation.id);
      if (index !== -1) {
        this.syncQueue[index] = operation;
      }
    } catch (error) {
      logger.error('Error updating operation:', error as Error);
      throw error;
    }
  }

  /**
   * Save to IndexedDB
   */
  private async saveToIndexedDB(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get from IndexedDB
   */
  private async getFromIndexedDB(storeName: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all from IndexedDB
   */
  private async getAllFromIndexedDB(storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear IndexedDB store
   */
  private async clearIndexedDBStore(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get API URL for data type
   */
  private getApiUrl(dataType: OfflineDataType, id?: string): string {
    const baseUrl = process.env.REACT_APP_API_URL || '/api/v1';
    const endpoints = {
      [OfflineDataType.CASE]: '/cases',
      [OfflineDataType.CLIENT]: '/clients',
      [OfflineDataType.DOCUMENT]: '/documents',
      [OfflineDataType.TIME_ENTRY]: '/time-entries',
      [OfflineDataType.INVOICE]: '/invoices',
      [OfflineDataType.EXPENSE]: '/expenses',
      [OfflineDataType.TASK]: '/tasks',
      [OfflineDataType.MESSAGE]: '/messages'
    };

    const endpoint = endpoints[dataType];
    return id ? `${baseUrl}${endpoint}/${id}` : `${baseUrl}${endpoint}`;
  }

  /**
   * Get auth token
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export default new OfflineService();
export { OfflineService, OfflineDataType, SyncStatus };