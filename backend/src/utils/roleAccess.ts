/**
 * Centralized Role Access Control
 * All access control logic for the RAGHUU CO Legal Practice Management System
 * This file contains all role-based permissions and access control functions
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PARTNER = 'partner',
  SENIOR_ASSOCIATE = 'senior_associate',
  JUNIOR_ASSOCIATE = 'junior_associate',
  PARALEGAL = 'paralegal',
  CLIENT = 'client',
  GUEST = 'guest'
}

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',

  // Client Management
  CLIENT_CREATE = 'client:create',
  CLIENT_READ = 'client:read',
  CLIENT_UPDATE = 'client:update',
  CLIENT_DELETE = 'client:delete',
  CLIENT_CONFLICT_CHECK = 'client:conflict_check',

  // Case Management
  CASE_CREATE = 'case:create',
  CASE_READ = 'case:read',
  CASE_UPDATE = 'case:update',
  CASE_DELETE = 'case:delete',
  CASE_ASSIGN = 'case:assign',
  CASE_COMPLETE = 'case:complete',

  // Document Management
  DOCUMENT_CREATE = 'document:create',
  DOCUMENT_READ = 'document:read',
  DOCUMENT_UPDATE = 'document:update',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_DOWNLOAD = 'document:download',

  // Time Tracking & Billing
  TIME_ENTRY_CREATE = 'time_entry:create',
  TIME_ENTRY_READ = 'time_entry:read',
  TIME_ENTRY_UPDATE = 'time_entry:update',
  TIME_ENTRY_DELETE = 'time_entry:delete',
  BILLING_READ = 'billing:read',
  BILLING_CREATE = 'billing:create',
  BILLING_UPDATE = 'billing:update',

  // Calendar & Scheduling
  CALENDAR_READ = 'calendar:read',
  CALENDAR_CREATE = 'calendar:create',
  CALENDAR_UPDATE = 'calendar:update',
  CALENDAR_DELETE = 'calendar:delete',

  // Content Management
  CONTENT_CREATE = 'content:create',
  CONTENT_READ = 'content:read',
  CONTENT_UPDATE = 'content:update',
  CONTENT_DELETE = 'content:delete',
  CONTENT_PUBLISH = 'content:publish',

  // Reporting & Analytics
  REPORT_READ = 'report:read',
  REPORT_CREATE = 'report:create',
  REPORT_EXPORT = 'report:export',

  // System Administration
  SYSTEM_CONFIG = 'system:config',
  AUDIT_LOG_READ = 'audit_log:read',
  BACKUP_MANAGE = 'backup:manage',

  // Communication
  MESSAGE_SEND = 'message:send',
  MESSAGE_READ = 'message:read',
  NOTIFICATION_SEND = 'notification:send'
}

/**
 * Role-based permission mapping
 * Defines what permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Full system access
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_MANAGE_ROLES,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_DELETE,
    Permission.CLIENT_CONFLICT_CHECK,
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.CASE_DELETE,
    Permission.CASE_ASSIGN,
    Permission.CASE_COMPLETE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_DOWNLOAD,
    Permission.TIME_ENTRY_CREATE,
    Permission.TIME_ENTRY_READ,
    Permission.TIME_ENTRY_UPDATE,
    Permission.TIME_ENTRY_DELETE,
    Permission.BILLING_READ,
    Permission.BILLING_CREATE,
    Permission.BILLING_UPDATE,
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CALENDAR_DELETE,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_EXPORT,
    Permission.SYSTEM_CONFIG,
    Permission.AUDIT_LOG_READ,
    Permission.BACKUP_MANAGE,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    Permission.NOTIFICATION_SEND
  ],

  [UserRole.PARTNER]: [
    // Strategic case management and business oversight
    Permission.USER_READ,
    Permission.CLIENT_CREATE,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CLIENT_CONFLICT_CHECK,
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.CASE_ASSIGN,
    Permission.CASE_COMPLETE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_DOWNLOAD,
    Permission.TIME_ENTRY_CREATE,
    Permission.TIME_ENTRY_READ,
    Permission.TIME_ENTRY_UPDATE,
    Permission.TIME_ENTRY_DELETE,
    Permission.BILLING_READ,
    Permission.BILLING_CREATE,
    Permission.BILLING_UPDATE,
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CALENDAR_DELETE,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_PUBLISH,
    Permission.REPORT_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_EXPORT,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ,
    Permission.NOTIFICATION_SEND
  ],

  [UserRole.SENIOR_ASSOCIATE]: [
    // Case strategy and client consultations
    Permission.USER_READ,
    Permission.CLIENT_READ,
    Permission.CLIENT_UPDATE,
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DOWNLOAD,
    Permission.TIME_ENTRY_CREATE,
    Permission.TIME_ENTRY_READ,
    Permission.TIME_ENTRY_UPDATE,
    Permission.TIME_ENTRY_DELETE,
    Permission.BILLING_READ,
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.CALENDAR_UPDATE,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_READ,
    Permission.CONTENT_UPDATE,
    Permission.REPORT_READ,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_READ
  ],

  [UserRole.JUNIOR_ASSOCIATE]: [
    // Research and document preparation
    Permission.USER_READ,
    Permission.CLIENT_READ,
    Permission.CASE_READ,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DOWNLOAD,
    Permission.TIME_ENTRY_CREATE,
    Permission.TIME_ENTRY_READ,
    Permission.TIME_ENTRY_UPDATE,
    Permission.BILLING_READ,
    Permission.CALENDAR_READ,
    Permission.CONTENT_READ,
    Permission.MESSAGE_READ
  ],

  [UserRole.PARALEGAL]: [
    // Administrative support
    Permission.USER_READ,
    Permission.CLIENT_READ,
    Permission.CASE_READ,
    Permission.DOCUMENT_CREATE,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_UPDATE,
    Permission.DOCUMENT_DOWNLOAD,
    Permission.TIME_ENTRY_CREATE,
    Permission.TIME_ENTRY_READ,
    Permission.CALENDAR_READ,
    Permission.CALENDAR_CREATE,
    Permission.MESSAGE_READ
  ],

  [UserRole.CLIENT]: [
    // Limited access to own cases
    Permission.CASE_READ, // Only own cases
    Permission.DOCUMENT_READ, // Only own case documents
    Permission.DOCUMENT_DOWNLOAD, // Only own case documents
    Permission.CALENDAR_READ, // Only own case calendar
    Permission.MESSAGE_READ,
    Permission.MESSAGE_SEND
  ],

  [UserRole.GUEST]: [
    // Very limited access
    Permission.CONTENT_READ, // Public content only
    Permission.MESSAGE_READ // Limited messaging
  ]
};

/**
 * Check if a user has a specific permission
 * @param userRole - The user's role
 * @param permission - The permission to check
 * @returns boolean indicating if user has permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 * @param userRole - The user's role
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has any of the permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if a user has all of the specified permissions
 * @param userRole - The user's role
 * @param permissions - Array of permissions to check
 * @returns boolean indicating if user has all permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Get all permissions for a specific role
 * @param userRole - The user's role
 * @returns Array of permissions for the role
 */
export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a user can access a specific resource
 * @param userRole - The user's role
 * @param resourceType - Type of resource (case, document, etc.)
 * @param action - Action being performed (read, write, delete)
 * @returns boolean indicating if user can access the resource
 */
export function canAccessResource(
  userRole: UserRole,
  resourceType: string,
  action: string
): boolean {
  const permission = `${resourceType}:${action}` as Permission;
  return hasPermission(userRole, permission);
}

/**
 * Check if a user can access a specific case
 * @param userRole - The user's role
 * @param userId - The user's ID
 * @param caseData - The case data (includes assigned_partner, assigned_associates, client_id)
 * @returns boolean indicating if user can access the case
 */
export function canAccessCase(
  userRole: UserRole,
  userId: string,
  caseData: {
    assigned_partner?: string;
    assigned_associates?: string[];
    client_id?: string;
  }
): boolean {
  // Super admin and partner can access all cases
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.PARTNER) {
    return true;
  }

  // Senior associate can access cases they're assigned to
  if (userRole === UserRole.SENIOR_ASSOCIATE) {
    return caseData.assigned_partner === userId || 
           (caseData.assigned_associates && caseData.assigned_associates.includes(userId));
  }

  // Junior associate and paralegal can access cases they're assigned to
  if (userRole === UserRole.JUNIOR_ASSOCIATE || userRole === UserRole.PARALEGAL) {
    return caseData.assigned_partner === userId || 
           (caseData.assigned_associates && caseData.assigned_associates.includes(userId));
  }

  // Client can only access their own cases
  if (userRole === UserRole.CLIENT) {
    // This would need to be checked against the client's user ID
    // Implementation depends on how client-user relationship is stored
    return false; // Placeholder - needs proper implementation
  }

  return false;
}

/**
 * Check if a user can access a specific document
 * @param userRole - The user's role
 * @param userId - The user's ID
 * @param documentData - The document data (includes case_id, uploaded_by, is_confidential)
 * @returns boolean indicating if user can access the document
 */
export function canAccessDocument(
  userRole: UserRole,
  userId: string,
  documentData: {
    case_id?: string;
    uploaded_by?: string;
    is_confidential?: boolean;
  }
): boolean {
  // Super admin can access all documents
  if (userRole === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Partner can access all documents except highly confidential ones
  if (userRole === UserRole.PARTNER) {
    return !documentData.is_confidential;
  }

  // Other roles need case-level access check
  // This would need to be implemented with case data
  return hasPermission(userRole, Permission.DOCUMENT_READ);
}

/**
 * Get accessible roles for a user to assign
 * @param currentUserRole - The current user's role
 * @returns Array of roles that can be assigned
 */
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  switch (currentUserRole) {
    case UserRole.SUPER_ADMIN:
      return Object.values(UserRole);
    
    case UserRole.PARTNER:
      return [
        UserRole.SENIOR_ASSOCIATE,
        UserRole.JUNIOR_ASSOCIATE,
        UserRole.PARALEGAL,
        UserRole.CLIENT,
        UserRole.GUEST
      ];
    
    case UserRole.SENIOR_ASSOCIATE:
      return [
        UserRole.JUNIOR_ASSOCIATE,
        UserRole.PARALEGAL
      ];
    
    default:
      return [];
  }
}

/**
 * Check if a role can be assigned by the current user
 * @param currentUserRole - The current user's role
 * @param targetRole - The role to be assigned
 * @returns boolean indicating if the role can be assigned
 */
export function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  const assignableRoles = getAssignableRoles(currentUserRole);
  return assignableRoles.includes(targetRole);
}

/**
 * Get role hierarchy level (higher number = more privileges)
 * @param role - The user role
 * @returns Hierarchy level number
 */
export function getRoleHierarchyLevel(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 7,
    [UserRole.PARTNER]: 6,
    [UserRole.SENIOR_ASSOCIATE]: 5,
    [UserRole.JUNIOR_ASSOCIATE]: 4,
    [UserRole.PARALEGAL]: 3,
    [UserRole.CLIENT]: 2,
    [UserRole.GUEST]: 1
  };
  
  return hierarchy[role] || 0;
}

/**
 * Check if a user can manage another user
 * @param currentUserRole - The current user's role
 * @param targetUserRole - The target user's role
 * @returns boolean indicating if the user can be managed
 */
export function canManageUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean {
  const currentLevel = getRoleHierarchyLevel(currentUserRole);
  const targetLevel = getRoleHierarchyLevel(targetUserRole);
  
  return currentLevel > targetLevel;
}

export default {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessResource,
  canAccessCase,
  canAccessDocument,
  getAssignableRoles,
  canAssignRole,
  getRoleHierarchyLevel,
  canManageUser
};