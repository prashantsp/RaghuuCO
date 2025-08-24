/**
 * Database Service
 * Raw SQL approach for database operations in the RAGHUU CO Legal Practice Management System
 * Uses PostgreSQL with connection pooling and comprehensive error handling
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This service provides a comprehensive interface for database operations
 * using raw SQL queries. It implements connection pooling, transaction management,
 * and comprehensive error handling. All queries are centralized in the db_SQLQueries module.
 * 
 * @example
 * ```typescript
 * import DatabaseService from '@/services/DatabaseService';
 * 
 * const db = new DatabaseService(config);
 * 
 * // Execute a query
 * const users = await db.query('SELECT * FROM users WHERE role = $1', ['partner']);
 * 
 * // Use a transaction
 * await db.transaction(async (client) => {
 *   const user = await client.query('INSERT INTO users...');
 *   await client.query('INSERT INTO audit_logs...');
 * });
 * ```
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import SQLQueries from '../utils/db_SQLQueries';
import logger from '../utils/logger';
import { DatabaseConfig, defaultDatabaseConfig } from '../config/database';

/**
 * Database Service Class
 * Handles all database operations using raw SQL queries
 */
export class DatabaseService {
  private pool: Pool;
  // private isConnected: boolean = false;

  constructor(config?: DatabaseConfig) {
    const dbConfig = config || defaultDatabaseConfig;
    this.pool = new Pool(dbConfig);
    this.setupEventHandlers();
    logger.info('Database service initialized', { config: { ...dbConfig, password: '[HIDDEN]' } });
  }

  /**
   * Setup database connection event handlers
   */
  private setupEventHandlers(): void {
    this.pool.on('connect', (_client: PoolClient) => {
      // this.isConnected = true;
      logger.info('Database client connected');
    });

    this.pool.on('error', (err: Error, _client: PoolClient) => {
      // this.isConnected = false;
      logger.error('Database pool error', err);
    });

    this.pool.on('remove', (_client: PoolClient) => {
      logger.info('Database client removed from pool');
    });
  }

  /**
   * Execute a query with parameters
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Promise with query result
   */
  async query<T = any>(query: string, params: any[] = []): Promise<T[]> {
    const startTime = Date.now();
    
    try {
      logger.dbQuery(query, params);
      
      const result: QueryResult = await this.pool.query(query, params);
      
      const duration = Date.now() - startTime;
      logger.performance('query_duration', duration, 'ms', { query: query.substring(0, 100) });
      
      return result.rows;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Database query failed', error as Error, { 
        query, 
        params, 
        duration: `${duration}ms` 
      });
      throw error;
    }
  }

  /**
   * Execute a query and return single row
   * @param query - SQL query string
   * @param params - Query parameters
   * @returns Promise with single row result
   */
  async queryOne<T = any>(query: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(query, params);
    return rows.length > 0 ? rows[0] : null as T | null;
  }

  /**
   * Execute a transaction with multiple queries
   * @param callback - Function containing transaction logic
   * @returns Promise with transaction result
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      logger.debug('Database transaction started');
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      logger.debug('Database transaction committed');
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Database transaction rolled back', error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check database connection health
   * @returns Promise with health status
   */
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    try {
      await this.query('SELECT 1 as health_check');
      return {
        status: 'healthy',
        message: 'Database connection is working',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get database statistics
   * @returns Promise with database statistics
   */
  async getStats(): Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingConnections: number;
  }> {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingConnections: this.pool.waitingCount
    };
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database pool', error as Error);
      throw error;
    }
  }

  /**
   * User Management Methods
   */

  /**
   * Create a new user
   * @param userData - User data
   * @returns Promise with created user
   */
  async createUser(userData: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }): Promise<any> {
    const query = SQLQueries.USERS.CREATE_USER;
    const params = [
      userData.email,
      userData.passwordHash,
      userData.firstName,
      userData.lastName,
      userData.role,
      userData.phone || null,
      userData.isActive ?? true,
      userData.emailVerified ?? false
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('user_created', 'user', result.id, 'system');
    return result;
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns Promise with user data
   */
  async getUserById(userId: string): Promise<any> {
    const query = SQLQueries.USERS.GET_USER_BY_ID;
    return await this.queryOne(query, [userId]);
  }

  /**
   * Get user by email
   * @param email - User email
   * @returns Promise with user data
   */
  async getUserByEmail(email: string): Promise<any> {
    const query = SQLQueries.USERS.GET_USER_BY_EMAIL;
    return await this.queryOne(query, [email]);
  }

  /**
   * Get all users with pagination
   * @param limit - Number of users to return
   * @param offset - Number of users to skip
   * @returns Promise with users array
   */
  async getUsers(limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = SQLQueries.USERS.GET_USERS_WITH_PAGINATION;
    return await this.query(query, [limit, offset]);
  }

  /**
   * Update user
   * @param userId - User ID
   * @param userData - Updated user data
   * @returns Promise with updated user
   */
  async updateUser(userId: string, userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<any> {
    const query = SQLQueries.USERS.UPDATE_USER;
    const params = [
      userId,
      userData.firstName,
      userData.lastName,
      userData.phone
    ];

    const result = await this.queryOne(query, params);
    if (result) {
      logger.businessEvent('user_updated', 'user', userId, 'system', userData);
    }
    return result;
  }

  /**
   * Update user's last login time
   * @param userId - User ID
   * @returns Promise with updated user
   */
  async updateLastLogin(userId: string): Promise<any> {
    const query = SQLQueries.USERS.UPDATE_LAST_LOGIN;
    return await this.queryOne(query, [userId]);
  }

  /**
   * Client Management Methods
   */

  /**
   * Create a new client
   * @param clientData - Client data
   * @param createdBy - User ID who created the client
   * @returns Promise with created client
   */
  async createClient(clientData: {
    clientType: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    address?: any;
    panNumber?: string;
    gstin?: string;
    emergencyContact?: any;
    referralSource?: string;
  }, createdBy: string): Promise<any> {
    const query = SQLQueries.CLIENTS.CREATE_CLIENT;
    const params = [
      clientData.clientType,
      clientData.firstName,
      clientData.lastName,
      clientData.companyName,
      clientData.email,
      clientData.phone,
      clientData.address ? JSON.stringify(clientData.address) : null,
      clientData.panNumber,
      clientData.gstin,
      clientData.emergencyContact ? JSON.stringify(clientData.emergencyContact) : null,
      clientData.referralSource,
      createdBy
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('client_created', 'client', result.id, createdBy);
    return result;
  }

  /**
   * Get client by ID
   * @param clientId - Client ID
   * @returns Promise with client data
   */
  async getClientById(clientId: string): Promise<any> {
    const query = SQLQueries.CLIENTS.GET_CLIENT_BY_ID;
    return await this.queryOne(query, [clientId]);
  }

  /**
   * Get all clients with pagination
   * @param limit - Number of clients to return
   * @param offset - Number of clients to skip
   * @returns Promise with clients array
   */
  async getClients(limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = SQLQueries.CLIENTS.GET_CLIENTS_WITH_PAGINATION;
    return await this.query(query, [limit, offset]);
  }

  /**
   * Search clients
   * @param searchTerm - Search term
   * @returns Promise with matching clients
   */
  async searchClients(searchTerm: string): Promise<any[]> {
    const query = SQLQueries.CLIENTS.SEARCH_CLIENTS;
    return await this.query(query, [`%${searchTerm}%`]);
  }

  /**
   * Case Management Methods
   */

  /**
   * Create a new case
   * @param caseData - Case data
   * @param createdBy - User ID who created the case
   * @returns Promise with created case
   */
  async createCase(caseData: {
    caseNumber: string;
    title: string;
    caseType: string;
    status?: string;
    priority?: string;
    description?: string;
    clientId: string;
    assignedPartner?: string;
    assignedAssociates?: string[];
    courtDetails?: any;
    opposingParty?: any;
    caseValue?: number;
    retainerAmount?: number;
    billingArrangement?: string;
    startDate: string;
    expectedCompletionDate?: string;
  }, createdBy: string): Promise<any> {
    const query = SQLQueries.CASES.CREATE_CASE;
    const params = [
      caseData.caseNumber,
      caseData.title,
      caseData.caseType,
      caseData.status || 'active',
      caseData.priority || 'medium',
      caseData.description,
      caseData.clientId,
      caseData.assignedPartner,
      caseData.assignedAssociates || [],
      caseData.courtDetails ? JSON.stringify(caseData.courtDetails) : null,
      caseData.opposingParty ? JSON.stringify(caseData.opposingParty) : null,
      caseData.caseValue,
      caseData.retainerAmount,
      caseData.billingArrangement,
      caseData.startDate,
      caseData.expectedCompletionDate,
      createdBy
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('case_created', 'case', result.id, createdBy);
    return result;
  }

  /**
   * Get case by ID
   * @param caseId - Case ID
   * @returns Promise with case data
   */
  async getCaseById(caseId: string): Promise<any> {
    const query = SQLQueries.CASES.GET_CASE_BY_ID;
    return await this.queryOne(query, [caseId]);
  }

  /**
   * Get all cases with pagination
   * @param limit - Number of cases to return
   * @param offset - Number of cases to skip
   * @returns Promise with cases array
   */
  async getCases(limit: number = 20, offset: number = 0): Promise<any[]> {
    const query = SQLQueries.CASES.GET_CASES_WITH_PAGINATION;
    return await this.query(query, [limit, offset]);
  }

  /**
   * Get cases by status
   * @param status - Case status
   * @returns Promise with cases array
   */
  async getCasesByStatus(status: string): Promise<any[]> {
    const query = SQLQueries.CASES.GET_CASES_BY_STATUS;
    return await this.query(query, [status]);
  }

  /**
   * Search cases
   * @param searchTerm - Search term
   * @returns Promise with matching cases
   */
  async searchCases(searchTerm: string): Promise<any[]> {
    const query = SQLQueries.CASES.SEARCH_CASES;
    return await this.query(query, [`%${searchTerm}%`]);
  }

  /**
   * Update case
   * @param caseId - Case ID
   * @param caseData - Updated case data
   * @returns Promise with updated case
   */
  async updateCase(caseId: string, caseData: any): Promise<any> {
    const query = SQLQueries.CASES.UPDATE_CASE;
    const params = [
      caseId,
      caseData.title,
      caseData.caseType,
      caseData.status,
      caseData.priority,
      caseData.description,
      caseData.assignedPartner,
      caseData.assignedAssociates,
      caseData.courtDetails ? JSON.stringify(caseData.courtDetails) : null,
      caseData.opposingParty ? JSON.stringify(caseData.opposingParty) : null,
      caseData.caseValue,
      caseData.retainerAmount,
      caseData.billingArrangement,
      caseData.expectedCompletionDate
    ];

    const result = await this.queryOne(query, params);
    if (result) {
      logger.businessEvent('case_updated', 'case', caseId, 'system', caseData);
    }
    return result;
  }

  /**
   * Document Management Methods
   */

  /**
   * Create a new document
   * @param documentData - Document data
   * @returns Promise with created document
   */
  async createDocument(documentData: {
    caseId: string;
    filename: string;
    originalFilename: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    documentType?: string;
    version?: number;
    parentDocumentId?: string;
    tags?: string[];
    description?: string;
    isConfidential?: boolean;
    uploadedBy: string;
  }): Promise<any> {
    const query = SQLQueries.DOCUMENTS.CREATE_DOCUMENT;
    const params = [
      documentData.caseId,
      documentData.filename,
      documentData.originalFilename,
      documentData.filePath,
      documentData.fileSize,
      documentData.mimeType,
      documentData.documentType,
      documentData.version || 1,
      documentData.parentDocumentId,
      documentData.tags || [],
      documentData.description,
      documentData.isConfidential || false,
      documentData.uploadedBy
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('document_created', 'document', result.id, documentData.uploadedBy);
    return result;
  }

  /**
   * Get document by ID
   * @param documentId - Document ID
   * @returns Promise with document data
   */
  async getDocumentById(documentId: string): Promise<any> {
    const query = SQLQueries.DOCUMENTS.GET_DOCUMENT_BY_ID;
    return await this.queryOne(query, [documentId]);
  }

  /**
   * Get documents by case ID
   * @param caseId - Case ID
   * @returns Promise with documents array
   */
  async getDocumentsByCase(caseId: string): Promise<any[]> {
    const query = SQLQueries.DOCUMENTS.GET_DOCUMENTS_BY_CASE;
    return await this.query(query, [caseId]);
  }

  /**
   * Time Tracking Methods
   */

  /**
   * Create a new time entry
   * @param timeEntryData - Time entry data
   * @returns Promise with created time entry
   */
  async createTimeEntry(timeEntryData: {
    caseId: string;
    userId: string;
    taskDescription: string;
    hoursWorked: number;
    billingRate?: number;
    isBillable?: boolean;
    dateWorked: string;
  }): Promise<any> {
    const query = SQLQueries.TIME_ENTRIES.CREATE_TIME_ENTRY;
    const params = [
      timeEntryData.caseId,
      timeEntryData.userId,
      timeEntryData.taskDescription,
      timeEntryData.hoursWorked,
      timeEntryData.billingRate,
      timeEntryData.isBillable ?? true,
      timeEntryData.dateWorked
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('time_entry_created', 'time_entry', result.id, timeEntryData.userId);
    return result;
  }

  /**
   * Get time entries by case ID
   * @param caseId - Case ID
   * @returns Promise with time entries array
   */
  async getTimeEntriesByCase(caseId: string): Promise<any[]> {
    const query = SQLQueries.TIME_ENTRIES.GET_TIME_ENTRIES_BY_CASE;
    return await this.query(query, [caseId]);
  }

  /**
   * Audit Log Methods
   */

  /**
   * Create audit log entry
   * @param auditData - Audit log data
   * @returns Promise with created audit log
   */
  async createAuditLog(auditData: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }): Promise<any> {
    const query = SQLQueries.AUDIT_LOGS.CREATE_AUDIT_LOG;
    const params = [
      auditData.userId,
      auditData.action,
      auditData.resourceType,
      auditData.resourceId,
      auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
      auditData.newValues ? JSON.stringify(auditData.newValues) : null,
      auditData.ipAddress,
      auditData.userAgent,
      auditData.sessionId
    ];

    return await this.queryOne(query, params);
  }

  /**
   * Get audit logs by user ID
   * @param userId - User ID
   * @returns Promise with audit logs array
   */
  async getAuditLogsByUser(userId: string): Promise<any[]> {
    const query = SQLQueries.AUDIT_LOGS.GET_AUDIT_LOGS_BY_USER;
    return await this.query(query, [userId]);
  }

  // Social Account Management Methods

  /**
   * Create social account
   * @param socialData - Social account data
   * @returns Promise with created social account
   */
  async createSocialAccount(socialData: {
    userId: string;
    provider: string;
    providerId: string;
    accessToken: string;
    refreshToken?: string;
    profileData?: any;
  }): Promise<any> {
    const query = SQLQueries.SOCIAL_ACCOUNTS.CREATE_SOCIAL_ACCOUNT;
    const params = [
      socialData.userId,
      socialData.provider,
      socialData.providerId,
      socialData.accessToken,
      socialData.refreshToken,
      socialData.profileData ? JSON.stringify(socialData.profileData) : null
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('social_account_created', 'social_account', result.id, socialData.userId);
    return result;
  }

  /**
   * Get social account by provider and provider ID
   * @param provider - Social provider
   * @param providerId - Provider user ID
   * @returns Promise with social account data
   */
  async getSocialAccountByProvider(provider: string, providerId: string): Promise<any> {
    const query = SQLQueries.SOCIAL_ACCOUNTS.GET_SOCIAL_ACCOUNT;
    return await this.queryOne(query, [provider, providerId]);
  }

  /**
   * Get social accounts by user ID
   * @param userId - User ID
   * @returns Promise with social accounts array
   */
  async getSocialAccountsByUserId(userId: string): Promise<any[]> {
    const query = SQLQueries.SOCIAL_ACCOUNTS.GET_SOCIAL_ACCOUNTS_BY_USER;
    return await this.query(query, [userId]);
  }

  /**
   * Update social account
   * @param id - Social account ID
   * @param updateData - Update data
   * @returns Promise with updated social account
   */
  async updateSocialAccount(id: string, updateData: {
    accessToken: string;
    refreshToken?: string;
    profileData?: any;
  }): Promise<any> {
    const query = SQLQueries.SOCIAL_ACCOUNTS.UPDATE_SOCIAL_ACCOUNT;
    const params = [
      updateData.accessToken,
      updateData.refreshToken,
      updateData.profileData ? JSON.stringify(updateData.profileData) : null,
      id
    ];

    const result = await this.queryOne(query, params);
    if (result) {
      logger.businessEvent('social_account_updated', 'social_account', id, 'system');
    }
    return result;
  }

  /**
   * Delete social account
   * @param id - Social account ID
   * @returns Promise<void>
   */
  async deleteSocialAccount(id: string): Promise<void> {
    const query = SQLQueries.SOCIAL_ACCOUNTS.DELETE_SOCIAL_ACCOUNT;
    await this.query(query, [id]);
    logger.businessEvent('social_account_deleted', 'social_account', id, 'system');
  }

  // User Session Management Methods

  /**
   * Create user session
   * @param sessionData - Session data
   * @returns Promise with created session
   */
  async createUserSession(sessionData: {
    userId: string;
    sessionToken: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<any> {
    const query = SQLQueries.USER_SESSIONS.CREATE;
    const params = [
      sessionData.userId,
      sessionData.sessionToken,
      sessionData.refreshToken,
      sessionData.ipAddress,
      sessionData.userAgent,
      sessionData.expiresAt
    ];

    const result = await this.queryOne(query, params);
    logger.businessEvent('session_created', 'session', result.id, sessionData.userId);
    return result;
  }

  /**
   * Get user session by token
   * @param sessionToken - Session token
   * @returns Promise with session data
   */
  async getUserSessionByToken(sessionToken: string): Promise<any> {
    const query = SQLQueries.USER_SESSIONS.GET_BY_TOKEN;
    return await this.queryOne(query, [sessionToken]);
  }

  /**
   * Get user sessions by user ID
   * @param userId - User ID
   * @returns Promise with sessions array
   */
  async getUserSessionsByUserId(userId: string): Promise<any[]> {
    const query = SQLQueries.USER_SESSIONS.GET_BY_USER_ID;
    return await this.query(query, [userId]);
  }

  /**
   * Update user session
   * @param id - Session ID
   * @param updateData - Update data
   * @returns Promise with updated session
   */
  async updateUserSession(id: string, updateData: {
    refreshToken?: string;
    expiresAt?: Date;
    lastActivity?: Date;
  }): Promise<any> {
    const query = SQLQueries.USER_SESSIONS.UPDATE;
    const params = [
      updateData.refreshToken,
      updateData.expiresAt,
      updateData.lastActivity,
      id
    ];

    const result = await this.queryOne(query, params);
    if (result) {
      logger.businessEvent('session_updated', 'session', id, 'system');
    }
    return result;
  }

  /**
   * Delete user session
   * @param id - Session ID
   * @returns Promise<void>
   */
  async deleteUserSession(id: string): Promise<void> {
    const query = SQLQueries.USER_SESSIONS.DELETE;
    await this.query(query, [id]);
    logger.businessEvent('session_deleted', 'session', id, 'system');
  }

  /**
   * Delete expired sessions
   * @returns Promise<void>
   */
  async deleteExpiredSessions(): Promise<void> {
    const query = SQLQueries.USER_SESSIONS.DELETE_EXPIRED;
    await this.query(query);
    logger.info('Expired sessions cleaned up');
  }
}

export default DatabaseService;