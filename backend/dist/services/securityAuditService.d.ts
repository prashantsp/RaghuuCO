export declare enum VulnerabilityLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum SecurityIncidentType {
    FAILED_LOGIN = "failed_login",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DATA_BREACH = "data_breach",
    MALWARE_DETECTED = "malware_detected",
    CONFIGURATION_ERROR = "configuration_error"
}
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
export interface SecurityIncident {
    id: string;
    type: SecurityIncidentType;
    severity: VulnerabilityLevel;
    description: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata: Record<string, any>;
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
}
declare class SecurityAuditService {
    performSecurityAudit(): Promise<SecurityAudit[]>;
    private auditDatabaseSecurity;
    private auditAuthenticationSecurity;
    private auditAuthorizationSecurity;
    private auditDataSecurity;
    private auditConfigurationSecurity;
    private logSecurityAudit;
    createSecurityIncident(type: SecurityIncidentType, severity: VulnerabilityLevel, description: string, userId?: string, ipAddress?: string, userAgent?: string, metadata?: Record<string, any>): Promise<SecurityIncident>;
    getSecurityIncidents(status?: string, severity?: VulnerabilityLevel, limit?: number, offset?: number): Promise<SecurityIncident[]>;
    resolveSecurityIncident(incidentId: string, resolvedBy: string, resolution: string): Promise<void>;
    getSecurityStats(): Promise<any>;
    private generateAuditId;
    private generateIncidentId;
}
export { SecurityAuditService, VulnerabilityLevel, SecurityIncidentType };
declare const _default: SecurityAuditService;
export default _default;
//# sourceMappingURL=securityAuditService.d.ts.map