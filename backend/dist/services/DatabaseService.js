"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
const db_SQLQueries_1 = __importDefault(require("../utils/db_SQLQueries"));
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = require("../config/database");
class DatabaseService {
    constructor(config) {
        this.isConnected = false;
        const dbConfig = config || database_1.defaultDatabaseConfig;
        this.pool = new pg_1.Pool(dbConfig);
        this.setupEventHandlers();
        logger_1.default.info('Database service initialized', { config: { ...dbConfig, password: '[HIDDEN]' } });
    }
    setupEventHandlers() {
        this.pool.on('connect', (client) => {
            this.isConnected = true;
            logger_1.default.info('Database client connected');
        });
        this.pool.on('error', (err, client) => {
            this.isConnected = false;
            logger_1.default.error('Database pool error', err, { clientId: client.processID });
        });
        this.pool.on('remove', (client) => {
            logger_1.default.info('Database client removed from pool', { clientId: client.processID });
        });
    }
    async query(query, params = []) {
        const startTime = Date.now();
        try {
            logger_1.default.dbQuery(query, params);
            const result = await this.pool.query(query, params);
            const duration = Date.now() - startTime;
            logger_1.default.performance('query_duration', duration, 'ms', { query: query.substring(0, 100) });
            return result.rows;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            logger_1.default.error('Database query failed', error, {
                query,
                params,
                duration: `${duration}ms`
            });
            throw error;
        }
    }
    async queryOne(query, params = []) {
        const rows = await this.query(query, params);
        return rows.length > 0 ? rows[0] : null;
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            logger_1.default.debug('Database transaction started');
            const result = await callback(client);
            await client.query('COMMIT');
            logger_1.default.debug('Database transaction committed');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            logger_1.default.error('Database transaction rolled back', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        try {
            await this.query('SELECT 1 as health_check');
            return {
                status: 'healthy',
                message: 'Database connection is working',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            logger_1.default.error('Database health check failed', error);
            return {
                status: 'unhealthy',
                message: 'Database connection failed',
                timestamp: new Date().toISOString()
            };
        }
    }
    async getStats() {
        return {
            totalConnections: this.pool.totalCount,
            idleConnections: this.pool.idleCount,
            waitingConnections: this.pool.waitingCount
        };
    }
    async close() {
        try {
            await this.pool.end();
            this.isConnected = false;
            logger_1.default.info('Database connection pool closed');
        }
        catch (error) {
            logger_1.default.error('Error closing database pool', error);
            throw error;
        }
    }
    async createUser(userData) {
        const query = db_SQLQueries_1.default.USERS.CREATE_USER;
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
        logger_1.default.businessEvent('user_created', 'user', result.id, 'system');
        return result;
    }
    async getUserById(userId) {
        const query = db_SQLQueries_1.default.USERS.GET_USER_BY_ID;
        return await this.queryOne(query, [userId]);
    }
    async getUserByEmail(email) {
        const query = db_SQLQueries_1.default.USERS.GET_USER_BY_EMAIL;
        return await this.queryOne(query, [email]);
    }
    async getUsers(limit = 20, offset = 0) {
        const query = db_SQLQueries_1.default.USERS.GET_USERS_WITH_PAGINATION;
        return await this.query(query, [limit, offset]);
    }
    async updateUser(userId, userData) {
        const query = db_SQLQueries_1.default.USERS.UPDATE_USER;
        const params = [
            userId,
            userData.firstName,
            userData.lastName,
            userData.phone
        ];
        const result = await this.queryOne(query, params);
        if (result) {
            logger_1.default.businessEvent('user_updated', 'user', userId, 'system', userData);
        }
        return result;
    }
    async updateLastLogin(userId) {
        const query = db_SQLQueries_1.default.USERS.UPDATE_LAST_LOGIN;
        return await this.queryOne(query, [userId]);
    }
    async createClient(clientData, createdBy) {
        const query = db_SQLQueries_1.default.CLIENTS.CREATE_CLIENT;
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
        logger_1.default.businessEvent('client_created', 'client', result.id, createdBy);
        return result;
    }
    async getClientById(clientId) {
        const query = db_SQLQueries_1.default.CLIENTS.GET_CLIENT_BY_ID;
        return await this.queryOne(query, [clientId]);
    }
    async getClients(limit = 20, offset = 0) {
        const query = db_SQLQueries_1.default.CLIENTS.GET_CLIENTS_WITH_PAGINATION;
        return await this.query(query, [limit, offset]);
    }
    async searchClients(searchTerm) {
        const query = db_SQLQueries_1.default.CLIENTS.SEARCH_CLIENTS;
        return await this.query(query, [`%${searchTerm}%`]);
    }
    async createCase(caseData, createdBy) {
        const query = db_SQLQueries_1.default.CASES.CREATE_CASE;
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
        logger_1.default.businessEvent('case_created', 'case', result.id, createdBy);
        return result;
    }
    async getCaseById(caseId) {
        const query = db_SQLQueries_1.default.CASES.GET_CASE_BY_ID;
        return await this.queryOne(query, [caseId]);
    }
    async getCases(limit = 20, offset = 0) {
        const query = db_SQLQueries_1.default.CASES.GET_CASES_WITH_PAGINATION;
        return await this.query(query, [limit, offset]);
    }
    async getCasesByStatus(status) {
        const query = db_SQLQueries_1.default.CASES.GET_CASES_BY_STATUS;
        return await this.query(query, [status]);
    }
    async searchCases(searchTerm) {
        const query = db_SQLQueries_1.default.CASES.SEARCH_CASES;
        return await this.query(query, [`%${searchTerm}%`]);
    }
    async updateCase(caseId, caseData) {
        const query = db_SQLQueries_1.default.CASES.UPDATE_CASE;
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
            logger_1.default.businessEvent('case_updated', 'case', caseId, 'system', caseData);
        }
        return result;
    }
    async createDocument(documentData) {
        const query = db_SQLQueries_1.default.DOCUMENTS.CREATE_DOCUMENT;
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
        logger_1.default.businessEvent('document_created', 'document', result.id, documentData.uploadedBy);
        return result;
    }
    async getDocumentById(documentId) {
        const query = db_SQLQueries_1.default.DOCUMENTS.GET_DOCUMENT_BY_ID;
        return await this.queryOne(query, [documentId]);
    }
    async getDocumentsByCase(caseId) {
        const query = db_SQLQueries_1.default.DOCUMENTS.GET_DOCUMENTS_BY_CASE;
        return await this.query(query, [caseId]);
    }
    async createTimeEntry(timeEntryData) {
        const query = db_SQLQueries_1.default.TIME_ENTRIES.CREATE_TIME_ENTRY;
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
        logger_1.default.businessEvent('time_entry_created', 'time_entry', result.id, timeEntryData.userId);
        return result;
    }
    async getTimeEntriesByCase(caseId) {
        const query = db_SQLQueries_1.default.TIME_ENTRIES.GET_TIME_ENTRIES_BY_CASE;
        return await this.query(query, [caseId]);
    }
    async createAuditLog(auditData) {
        const query = db_SQLQueries_1.default.AUDIT_LOGS.CREATE_AUDIT_LOG;
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
    async getAuditLogsByUser(userId) {
        const query = db_SQLQueries_1.default.AUDIT_LOGS.GET_AUDIT_LOGS_BY_USER;
        return await this.query(query, [userId]);
    }
    async createSocialAccount(socialData) {
        const query = db_SQLQueries_1.default.SOCIAL_ACCOUNTS.CREATE_SOCIAL_ACCOUNT;
        const params = [
            socialData.userId,
            socialData.provider,
            socialData.providerId,
            socialData.accessToken,
            socialData.refreshToken,
            socialData.profileData ? JSON.stringify(socialData.profileData) : null
        ];
        const result = await this.queryOne(query, params);
        logger_1.default.businessEvent('social_account_created', 'social_account', result.id, socialData.userId);
        return result;
    }
    async getSocialAccountByProvider(provider, providerId) {
        const query = db_SQLQueries_1.default.SOCIAL_ACCOUNTS.GET_BY_PROVIDER;
        return await this.queryOne(query, [provider, providerId]);
    }
    async getSocialAccountsByUserId(userId) {
        const query = db_SQLQueries_1.default.SOCIAL_ACCOUNTS.GET_BY_USER_ID;
        return await this.query(query, [userId]);
    }
    async updateSocialAccount(id, updateData) {
        const query = db_SQLQueries_1.default.SOCIAL_ACCOUNTS.UPDATE_SOCIAL_ACCOUNT;
        const params = [
            updateData.accessToken,
            updateData.refreshToken,
            updateData.profileData ? JSON.stringify(updateData.profileData) : null,
            id
        ];
        const result = await this.queryOne(query, params);
        if (result) {
            logger_1.default.businessEvent('social_account_updated', 'social_account', id, 'system');
        }
        return result;
    }
    async deleteSocialAccount(id) {
        const query = db_SQLQueries_1.default.SOCIAL_ACCOUNTS.DELETE_SOCIAL_ACCOUNT;
        await this.query(query, [id]);
        logger_1.default.businessEvent('social_account_deleted', 'social_account', id, 'system');
    }
    async createUserSession(sessionData) {
        const query = db_SQLQueries_1.default.USER_SESSIONS.CREATE_SESSION;
        const params = [
            sessionData.userId,
            sessionData.sessionToken,
            sessionData.refreshToken,
            sessionData.ipAddress,
            sessionData.userAgent,
            sessionData.expiresAt
        ];
        const result = await this.queryOne(query, params);
        logger_1.default.businessEvent('session_created', 'session', result.id, sessionData.userId);
        return result;
    }
    async getUserSessionByToken(sessionToken) {
        const query = db_SQLQueries_1.default.USER_SESSIONS.GET_BY_TOKEN;
        return await this.queryOne(query, [sessionToken]);
    }
    async getUserSessionsByUserId(userId) {
        const query = db_SQLQueries_1.default.USER_SESSIONS.GET_BY_USER_ID;
        return await this.query(query, [userId]);
    }
    async updateUserSession(id, updateData) {
        const query = db_SQLQueries_1.default.USER_SESSIONS.UPDATE_SESSION;
        const params = [
            updateData.refreshToken,
            updateData.expiresAt,
            updateData.lastActivity,
            id
        ];
        const result = await this.queryOne(query, params);
        if (result) {
            logger_1.default.businessEvent('session_updated', 'session', id, 'system');
        }
        return result;
    }
    async deleteUserSession(id) {
        const query = db_SQLQueries_1.default.USER_SESSIONS.DELETE_SESSION;
        await this.query(query, [id]);
        logger_1.default.businessEvent('session_deleted', 'session', id, 'system');
    }
    async deleteExpiredSessions() {
        const query = db_SQLQueries_1.default.USER_SESSIONS.DELETE_EXPIRED_SESSIONS;
        await this.query(query);
        logger_1.default.info('Expired sessions cleaned up');
    }
}
exports.DatabaseService = DatabaseService;
exports.default = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map