import { PoolClient } from 'pg';
import { DatabaseConfig } from '../config/database';
export declare class DatabaseService {
    private pool;
    private isConnected;
    constructor(config?: DatabaseConfig);
    private setupEventHandlers;
    query<T = any>(query: string, params?: any[]): Promise<T[]>;
    queryOne<T = any>(query: string, params?: any[]): Promise<T | null>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<{
        status: string;
        message: string;
        timestamp: string;
    }>;
    getStats(): Promise<{
        totalConnections: number;
        idleConnections: number;
        waitingConnections: number;
    }>;
    close(): Promise<void>;
    createUser(userData: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: string;
        phone?: string;
        isActive?: boolean;
        emailVerified?: boolean;
    }): Promise<any>;
    getUserById(userId: string): Promise<any>;
    getUserByEmail(email: string): Promise<any>;
    getUsers(limit?: number, offset?: number): Promise<any[]>;
    updateUser(userId: string, userData: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<any>;
    updateLastLogin(userId: string): Promise<any>;
    createClient(clientData: {
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
    }, createdBy: string): Promise<any>;
    getClientById(clientId: string): Promise<any>;
    getClients(limit?: number, offset?: number): Promise<any[]>;
    searchClients(searchTerm: string): Promise<any[]>;
    createCase(caseData: {
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
    }, createdBy: string): Promise<any>;
    getCaseById(caseId: string): Promise<any>;
    getCases(limit?: number, offset?: number): Promise<any[]>;
    getCasesByStatus(status: string): Promise<any[]>;
    searchCases(searchTerm: string): Promise<any[]>;
    updateCase(caseId: string, caseData: any): Promise<any>;
    createDocument(documentData: {
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
    }): Promise<any>;
    getDocumentById(documentId: string): Promise<any>;
    getDocumentsByCase(caseId: string): Promise<any[]>;
    createTimeEntry(timeEntryData: {
        caseId: string;
        userId: string;
        taskDescription: string;
        hoursWorked: number;
        billingRate?: number;
        isBillable?: boolean;
        dateWorked: string;
    }): Promise<any>;
    getTimeEntriesByCase(caseId: string): Promise<any[]>;
    createAuditLog(auditData: {
        userId?: string;
        action: string;
        resourceType: string;
        resourceId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
    }): Promise<any>;
    getAuditLogsByUser(userId: string): Promise<any[]>;
    createSocialAccount(socialData: {
        userId: string;
        provider: string;
        providerId: string;
        accessToken: string;
        refreshToken?: string;
        profileData?: any;
    }): Promise<any>;
    getSocialAccountByProvider(provider: string, providerId: string): Promise<any>;
    getSocialAccountsByUserId(userId: string): Promise<any[]>;
    updateSocialAccount(id: string, updateData: {
        accessToken: string;
        refreshToken?: string;
        profileData?: any;
    }): Promise<any>;
    deleteSocialAccount(id: string): Promise<void>;
    createUserSession(sessionData: {
        userId: string;
        sessionToken: string;
        refreshToken: string;
        ipAddress?: string;
        userAgent?: string;
        expiresAt: Date;
    }): Promise<any>;
    getUserSessionByToken(sessionToken: string): Promise<any>;
    getUserSessionsByUserId(userId: string): Promise<any[]>;
    updateUserSession(id: string, updateData: {
        refreshToken?: string;
        expiresAt?: Date;
        lastActivity?: Date;
    }): Promise<any>;
    deleteUserSession(id: string): Promise<void>;
    deleteExpiredSessions(): Promise<void>;
}
export default DatabaseService;
//# sourceMappingURL=DatabaseService.d.ts.map