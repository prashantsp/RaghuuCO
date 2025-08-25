/**
 * Security Audit Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This service provides comprehensive security auditing, vulnerability
 * assessment, and security incident response capabilities.
 */

import { DatabaseService } from './DatabaseService';
import logger from '../utils/logger';
import * as crypto from 'crypto';

const db = new DatabaseService();

/**
 * Security vulnerability levels
 */
export enum VulnerabilityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Security incident types
 */
export enum SecurityIncidentType {
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH = 'data_breach',
  MALWARE_DETECTED = 'malware_detected',
  CONFIGURATION_ERROR = 'configuration_error'
}

/**
 * Security audit interface
 */
export interface SecurityAudit {
  id: string;
  type: string;
  severity: VulnerabilityLevel;
  description: string;
  recommendation: string;
  status: 'open' | 'resolved' | 'false_positive';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Security incident interface
 */
export interface SecurityIncident {
  id: string;
  type: SecurityIncidentType;
  severity: VulnerabilityLevel;
  description: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * Security audit service class
 */
class SecurityAuditService {
  /**
   * Perform comprehensive security audit
   */
  async performSecurityAudit(): Promise<SecurityAudit[]> {
    try {
      logger.info('Starting comprehensive security audit...');
      
      const audits: SecurityAudit[] = [];
      
      // Database security audit
      const dbAudits = await this.auditDatabaseSecurity();
      audits.push(...dbAudits);
      
      // Authentication security audit
      const authAudits = await this.auditAuthenticationSecurity();
      audits.push(...authAudits);
      
      // Authorization security audit
      const authzAudits = await this.auditAuthorizationSecurity();
      audits.push(...authzAudits);
      
      // Data security audit
      const dataAudits = await this.auditDataSecurity();
      audits.push(...dataAudits);
      
      // Configuration security audit
      const configAudits = await this.auditConfigurationSecurity();
      audits.push(...configAudits);
      
      // Log security audit
      await this.logSecurityAudit(audits);
      
      logger.info(`Security audit completed. Found ${audits.length} issues.`);
      return audits;
    } catch (error) {
      logger.error('Error performing security audit:', error as Error);
      throw error;
    }
  }

  /**
   * Audit database security
   */
  private async auditDatabaseSecurity(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = [];
    
    try {
      // Check for weak passwords
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
      
      // Check for inactive sessions
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
      
      // Check for failed login attempts
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
      
    } catch (error) {
      logger.error('Error auditing database security:', error as Error);
    }
    
    return audits;
  }

  /**
   * Audit authentication security
   */
  private async auditAuthenticationSecurity(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = [];
    
    try {
      // Check for users without 2FA
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
      
      // Check for JWT token expiration
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
      
    } catch (error) {
      logger.error('Error auditing authentication security:', error as Error);
    }
    
    return audits;
  }

  /**
   * Audit authorization security
   */
  private async auditAuthorizationSecurity(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = [];
    
    try {
      // Check for excessive permissions
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
      
      // Check for role escalation attempts
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
      
    } catch (error) {
      logger.error('Error auditing authorization security:', error as Error);
    }
    
    return audits;
  }

  /**
   * Audit data security
   */
  private async auditDataSecurity(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = [];
    
    try {
      // Check for unencrypted sensitive data
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
      
      // Check for data access patterns
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
      
    } catch (error) {
      logger.error('Error auditing data security:', error as Error);
    }
    
    return audits;
  }

  /**
   * Audit configuration security
   */
  private async auditConfigurationSecurity(): Promise<SecurityAudit[]> {
    const audits: SecurityAudit[] = [];
    
    try {
      // Check for weak JWT secrets
      const jwtSecret = (process as any).env.JWT_SECRET;
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
      
      // Check for missing environment variables
      const requiredEnvVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'DATABASE_URL',
        'REDIS_PASSWORD'
      ];
      
      const missingEnvVars = requiredEnvVars.filter(varName => !(process as any).env[varName]);
      
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
      
      // Check for insecure configurations
      if ((process as any).env.NODE_ENV === 'production' && (process as any).env.DISABLE_HTTPS === 'true') {
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
      
    } catch (error) {
      logger.error('Error auditing configuration security:', error as Error);
    }
    
    return audits;
  }

  /**
   * Log security audit results
   */
  private async logSecurityAudit(audits: SecurityAudit[]): Promise<void> {
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
    } catch (error) {
      logger.error('Error logging security audit:', error as Error);
    }
  }

  /**
   * Create security incident
   */
  async createSecurityIncident(
    type: SecurityIncidentType,
    severity: VulnerabilityLevel,
    description: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata: Record<string, any> = {}
  ): Promise<SecurityIncident> {
    try {
      const incident: SecurityIncident = {
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
      
      // Log to audit trail
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
      
      logger.warn('Security incident created:', incident);
      return incident;
    } catch (error) {
      logger.error('Error creating security incident:', error as Error);
      throw error;
    }
  }

  /**
   * Get security incidents
   */
  async getSecurityIncidents(
    status?: string,
    severity?: VulnerabilityLevel,
    limit = 50,
    offset = 0
  ): Promise<SecurityIncident[]> {
    try {
      let sql = `
        SELECT * FROM security_incidents 
        WHERE 1=1
      `;
      const params: any[] = [];
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
    } catch (error) {
      logger.error('Error getting security incidents:', error as Error);
      throw error;
    }
  }

  /**
   * Resolve security incident
   */
  async resolveSecurityIncident(
    incidentId: string,
    resolvedBy: string,
    resolution: string
  ): Promise<void> {
    try {
      await db.query(`
        UPDATE security_incidents 
        SET status = 'resolved', resolved_at = NOW(), resolved_by = $1
        WHERE id = $2
      `, [resolvedBy, incidentId]);
      
      // Log resolution
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
      
      logger.info(`Security incident ${incidentId} resolved by ${resolvedBy}`);
    } catch (error) {
      logger.error('Error resolving security incident:', error as Error);
      throw error;
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(): Promise<any> {
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
    } catch (error) {
      logger.error('Error getting security stats:', error as Error);
      throw error;
    }
  }

  /**
   * Generate audit ID
   */
  private generateAuditId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate incident ID
   */
  private generateIncidentId(): string {
    return `incident_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
}

export { SecurityAuditService };
export default new SecurityAuditService();