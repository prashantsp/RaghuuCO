"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditService = exports.SecurityIncidentType = exports.VulnerabilityLevel = void 0;
const DatabaseService_1 = require("./DatabaseService");
const logger_1 = __importDefault(require("../utils/logger"));
const crypto = __importStar(require("crypto"));
const db = new DatabaseService_1.DatabaseService();
var VulnerabilityLevel;
(function (VulnerabilityLevel) {
    VulnerabilityLevel["LOW"] = "low";
    VulnerabilityLevel["MEDIUM"] = "medium";
    VulnerabilityLevel["HIGH"] = "high";
    VulnerabilityLevel["CRITICAL"] = "critical";
})(VulnerabilityLevel || (exports.VulnerabilityLevel = VulnerabilityLevel = {}));
var SecurityIncidentType;
(function (SecurityIncidentType) {
    SecurityIncidentType["FAILED_LOGIN"] = "failed_login";
    SecurityIncidentType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityIncidentType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    SecurityIncidentType["DATA_BREACH"] = "data_breach";
    SecurityIncidentType["MALWARE_DETECTED"] = "malware_detected";
    SecurityIncidentType["CONFIGURATION_ERROR"] = "configuration_error";
})(SecurityIncidentType || (exports.SecurityIncidentType = SecurityIncidentType = {}));
class SecurityAuditService {
    async performSecurityAudit() {
        try {
            logger_1.default.info('Starting comprehensive security audit...');
            const audits = [];
            const dbAudits = await this.auditDatabaseSecurity();
            audits.push(...dbAudits);
            const authAudits = await this.auditAuthenticationSecurity();
            audits.push(...authAudits);
            const authzAudits = await this.auditAuthorizationSecurity();
            audits.push(...authzAudits);
            const dataAudits = await this.auditDataSecurity();
            audits.push(...dataAudits);
            const configAudits = await this.auditConfigurationSecurity();
            audits.push(...configAudits);
            await this.logSecurityAudit(audits);
            logger_1.default.info(`Security audit completed. Found ${audits.length} issues.`);
            return audits;
        }
        catch (error) {
            logger_1.default.error('Error performing security audit:', error);
            throw error;
        }
    }
    async auditDatabaseSecurity() {
        const audits = [];
        try {
            const weakPasswords = await db.query(`
        SELECT id, email, role, last_password_change
        FROM users 
        WHERE last_password_change < NOW() - INTERVAL '90 days'
        AND is_active = true
      `);
            if (weakPasswords.length > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'weak_passwords',
                    severity: VulnerabilityLevel.MEDIUM,
                    description: `${weakPasswords.length} users have passwords older than 90 days`,
                    recommendation: 'Enforce password change for users with old passwords',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const inactiveSessions = await db.query(`
        SELECT COUNT(*) as count
        FROM user_sessions 
        WHERE expires_at < NOW() - INTERVAL '24 hours'
      `);
            if (inactiveSessions.length > 0 && parseInt(inactiveSessions[0].count) > 100) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'inactive_sessions',
                    severity: VulnerabilityLevel.LOW,
                    description: 'Large number of inactive sessions found',
                    recommendation: 'Clean up expired sessions regularly',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const failedLogins = await db.query(`
        SELECT COUNT(*) as count
        FROM audit_logs 
        WHERE action = 'login_failed' 
        AND created_at > NOW() - INTERVAL '1 hour'
      `);
            if (failedLogins.length > 0 && parseInt(failedLogins[0].count) > 50) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'brute_force_attempts',
                    severity: VulnerabilityLevel.HIGH,
                    description: 'High number of failed login attempts detected',
                    recommendation: 'Investigate potential brute force attacks',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error auditing database security:', error);
        }
        return audits;
    }
    async auditAuthenticationSecurity() {
        const audits = [];
        try {
            const usersWithout2FA = await db.query(`
        SELECT COUNT(*) as count
        FROM users 
        WHERE two_factor_enabled = false 
        AND role IN ('super_admin', 'partner', 'senior_associate')
        AND is_active = true
      `);
            if (usersWithout2FA.length > 0 && parseInt(usersWithout2FA[0].count) > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'missing_2fa',
                    severity: VulnerabilityLevel.HIGH,
                    description: `${usersWithout2FA[0].count} privileged users without 2FA`,
                    recommendation: 'Enforce 2FA for all privileged users',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const shortTokenExpiry = await db.query(`
        SELECT COUNT(*) as count
        FROM user_sessions 
        WHERE expires_at < NOW() + INTERVAL '1 hour'
        AND expires_at > NOW()
      `);
            if (shortTokenExpiry.length > 0 && parseInt(shortTokenExpiry[0].count) > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'short_token_expiry',
                    severity: VulnerabilityLevel.MEDIUM,
                    description: 'Some tokens expiring soon',
                    recommendation: 'Monitor token expiration and refresh patterns',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error auditing authentication security:', error);
        }
        return audits;
    }
    async auditAuthorizationSecurity() {
        const audits = [];
        try {
            const excessivePermissions = await db.query(`
        SELECT u.id, u.email, u.role, COUNT(*) as permission_count
        FROM users u
        JOIN user_permissions up ON u.id = up.user_id
        WHERE u.is_active = true
        GROUP BY u.id, u.email, u.role
        HAVING COUNT(*) > 50
      `);
            if (excessivePermissions.length > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'excessive_permissions',
                    severity: VulnerabilityLevel.MEDIUM,
                    description: `${excessivePermissions.length} users with excessive permissions`,
                    recommendation: 'Review and reduce user permissions',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const roleEscalation = await db.query(`
        SELECT COUNT(*) as count
        FROM audit_logs 
        WHERE action = 'role_change' 
        AND created_at > NOW() - INTERVAL '24 hours'
      `);
            if (roleEscalation.length > 0 && parseInt(roleEscalation[0].count) > 5) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'role_escalation_attempts',
                    severity: VulnerabilityLevel.HIGH,
                    description: 'Multiple role change attempts detected',
                    recommendation: 'Investigate role escalation attempts',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error auditing authorization security:', error);
        }
        return audits;
    }
    async auditDataSecurity() {
        const audits = [];
        try {
            const unencryptedData = await db.query(`
        SELECT COUNT(*) as count
        FROM documents 
        WHERE is_encrypted = false 
        AND file_type IN ('pdf', 'doc', 'docx', 'xls', 'xlsx')
      `);
            if (unencryptedData.length > 0 && parseInt(unencryptedData[0].count) > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'unencrypted_documents',
                    severity: VulnerabilityLevel.HIGH,
                    description: `${unencryptedData[0].count} sensitive documents not encrypted`,
                    recommendation: 'Encrypt all sensitive documents',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const unusualAccess = await db.query(`
        SELECT COUNT(*) as count
        FROM audit_logs 
        WHERE action = 'data_access' 
        AND created_at > NOW() - INTERVAL '1 hour'
        AND user_id IN (
          SELECT user_id 
          FROM audit_logs 
          WHERE action = 'data_access' 
          GROUP BY user_id 
          HAVING COUNT(*) > 100
        )
      `);
            if (unusualAccess.length > 0 && parseInt(unusualAccess[0].count) > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'unusual_data_access',
                    severity: VulnerabilityLevel.MEDIUM,
                    description: 'Unusual data access patterns detected',
                    recommendation: 'Investigate unusual data access patterns',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error auditing data security:', error);
        }
        return audits;
    }
    async auditConfigurationSecurity() {
        const audits = [];
        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (jwtSecret && jwtSecret.length < 32) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'weak_jwt_secret',
                    severity: VulnerabilityLevel.CRITICAL,
                    description: 'JWT secret is too short',
                    recommendation: 'Use a JWT secret of at least 32 characters',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            const requiredEnvVars = [
                'JWT_SECRET',
                'JWT_REFRESH_SECRET',
                'DATABASE_URL',
                'REDIS_PASSWORD'
            ];
            const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
            if (missingEnvVars.length > 0) {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'missing_env_vars',
                    severity: VulnerabilityLevel.CRITICAL,
                    description: `Missing environment variables: ${missingEnvVars.join(', ')}`,
                    recommendation: 'Set all required environment variables',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
            if (process.env.NODE_ENV === 'production' && process.env.DISABLE_HTTPS === 'true') {
                audits.push({
                    id: this.generateAuditId(),
                    type: 'insecure_production_config',
                    severity: VulnerabilityLevel.CRITICAL,
                    description: 'HTTPS disabled in production',
                    recommendation: 'Enable HTTPS in production environment',
                    status: 'open',
                    createdAt: new Date().toISOString()
                });
            }
        }
        catch (error) {
            logger_1.default.error('Error auditing configuration security:', error);
        }
        return audits;
    }
    async logSecurityAudit(audits) {
        try {
            for (const audit of audits) {
                await db.query(`
          INSERT INTO security_audits (
            id, type, severity, description, recommendation, status, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
                    audit.id,
                    audit.type,
                    audit.severity,
                    audit.description,
                    audit.recommendation,
                    audit.status,
                    audit.createdAt
                ]);
            }
        }
        catch (error) {
            logger_1.default.error('Error logging security audit:', error);
        }
    }
    async createSecurityIncident(type, severity, description, userId, ipAddress, userAgent, metadata = {}) {
        try {
            const incident = {
                id: this.generateIncidentId(),
                type,
                severity,
                description,
                userId: userId || '',
                ipAddress: ipAddress || '',
                userAgent: userAgent || '',
                metadata,
                status: 'open',
                createdAt: new Date().toISOString()
            };
            await db.query(`
        INSERT INTO security_incidents (
          id, type, severity, description, user_id, ip_address, user_agent, 
          metadata, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
                incident.id,
                incident.type,
                incident.severity,
                incident.description,
                incident.userId,
                incident.ipAddress,
                incident.userAgent,
                JSON.stringify(incident.metadata),
                incident.status,
                incident.createdAt
            ]);
            await db.query(`
        INSERT INTO audit_logs (
          user_id, action, entity_type, entity_id, ip_address, user_agent, 
          details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                userId || null,
                'security_incident_created',
                'security_incident',
                incident.id,
                ipAddress,
                userAgent,
                JSON.stringify({ type, severity, description }),
                new Date()
            ]);
            logger_1.default.warn('Security incident created:', incident);
            return incident;
        }
        catch (error) {
            logger_1.default.error('Error creating security incident:', error);
            throw error;
        }
    }
    async getSecurityIncidents(status, severity, limit = 50, offset = 0) {
        try {
            let sql = `
        SELECT * FROM security_incidents 
        WHERE 1=1
      `;
            const params = [];
            let paramIndex = 1;
            if (status) {
                sql += ` AND status = $${paramIndex++}`;
                params.push(status);
            }
            if (severity) {
                sql += ` AND severity = $${paramIndex++}`;
                params.push(severity);
            }
            sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            params.push(limit, offset);
            const result = await db.query(sql, params);
            return result.map(row => ({
                ...row,
                metadata: JSON.parse(row.metadata || '{}')
            }));
        }
        catch (error) {
            logger_1.default.error('Error getting security incidents:', error);
            throw error;
        }
    }
    async resolveSecurityIncident(incidentId, resolvedBy, resolution) {
        try {
            await db.query(`
        UPDATE security_incidents 
        SET status = 'resolved', resolved_at = NOW(), resolved_by = $1
        WHERE id = $2
      `, [resolvedBy, incidentId]);
            await db.query(`
        INSERT INTO audit_logs (
          user_id, action, entity_type, entity_id, details, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                resolvedBy,
                'security_incident_resolved',
                'security_incident',
                incidentId,
                JSON.stringify({ resolution }),
                new Date()
            ]);
            logger_1.default.info(`Security incident ${incidentId} resolved by ${resolvedBy}`);
        }
        catch (error) {
            logger_1.default.error('Error resolving security incident:', error);
            throw error;
        }
    }
    async getSecurityStats() {
        try {
            const stats = await db.query(`
        SELECT 
          COUNT(*) as total_incidents,
          COUNT(CASE WHEN status = 'open' THEN 1 END) as open_incidents,
          COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
          COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_incidents,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as incidents_24h,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as incidents_7d
        FROM security_incidents
      `);
            return stats[0];
        }
        catch (error) {
            logger_1.default.error('Error getting security stats:', error);
            throw error;
        }
    }
    generateAuditId() {
        return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
    generateIncidentId() {
        return `incident_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }
}
exports.SecurityAuditService = SecurityAuditService;
exports.default = new SecurityAuditService();
//# sourceMappingURL=securityAuditService.js.map