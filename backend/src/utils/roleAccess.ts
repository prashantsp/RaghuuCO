/**
 * Centralized Role Access Control
 * All access control logic for the RAGHUU CO Legal Practice Management System
 * This file contains all role-based permissions and access control functions
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This module provides comprehensive role-based access control (RBAC) for the
 * legal practice management system. It defines user roles, permissions, and provides
 * utility functions for checking access rights throughout the application.
 * 
 * @example
 * ```typescript
 * import { hasPermission, UserRole, Permission } from '@/utils/roleAccess';
 * 
 * // Check if a partner can create cases
 * const canCreateCase = hasPermission(UserRole.PARTNER, Permission.CASE_CREATE);
 * ```
 */

/**
 * User roles enumeration defining all possible user types in the system
 * Each role has specific permissions and access levels
 */
export enum UserRole {
  /** Super Administrator - Full system access and configuration */
  SUPER_ADMIN = 'super_admin',
  /** Partner - Strategic case management and business oversight */
  PARTNER = 'partner', 
  /** Senior Associate - Case strategy and client consultations */
  SENIOR_ASSOCIATE = 'senior_associate',
  /** Junior Associate - Research and document preparation */
  JUNIOR_ASSOCIATE = 'junior_associate',
  /** Paralegal - Administrative support and case coordination */
  PARALEGAL = 'paralegal',
  /** Client - Limited access to own cases and documents */
  CLIENT = 'client',
  /** Guest - Very limited access for external collaborators */
  GUEST = 'guest'
}

export enum Permission {
  // User management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',

  // Client management
  VIEW_CLIENTS = 'view_clients',
  CREATE_CLIENTS = 'create_clients',
  UPDATE_CLIENTS = 'update_clients',
  DELETE_CLIENTS = 'delete_clients',

  // Case management
  VIEW_CASES = 'view_cases',
  CREATE_CASES = 'create_cases',
  UPDATE_CASES = 'update_cases',
  DELETE_CASES = 'delete_cases',
  ASSIGN_CASES = 'assign_cases',

  // Document management
  VIEW_DOCUMENTS = 'view_documents',
  UPLOAD_DOCUMENTS = 'upload_documents',
  UPDATE_DOCUMENTS = 'update_documents',
  DELETE_DOCUMENTS = 'delete_documents',
  DOWNLOAD_DOCUMENTS = 'download_documents',

  // Time tracking
  VIEW_TIME_ENTRIES = 'view_time_entries',
  CREATE_TIME_ENTRIES = 'create_time_entries',
  UPDATE_TIME_ENTRIES = 'update_time_entries',
  DELETE_TIME_ENTRIES = 'delete_time_entries',

  // Billing management
  VIEW_INVOICES = 'view_invoices',
  CREATE_INVOICES = 'create_invoices',
  UPDATE_INVOICES = 'update_invoices',
  DELETE_INVOICES = 'delete_invoices',
  VIEW_BILLING_RATES = 'view_billing_rates',
  CREATE_BILLING_RATES = 'create_billing_rates',
  UPDATE_BILLING_RATES = 'update_billing_rates',
  DELETE_BILLING_RATES = 'delete_billing_rates',
  VIEW_PAYMENTS = 'view_payments',
  CREATE_PAYMENTS = 'create_payments',
  UPDATE_PAYMENTS = 'update_payments',
  DELETE_PAYMENTS = 'delete_payments',

  // Calendar management
  VIEW_CALENDAR = 'view_calendar',
  CREATE_EVENTS = 'create_events',
  UPDATE_EVENTS = 'update_events',
  DELETE_EVENTS = 'delete_events',

  // Reporting
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',
  EXPORT_DATA = 'export_data',

  // System administration
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  ACCESS_ADMIN_PANEL = 'access_admin_panel',

  // Content Management Permissions
  CREATE_CONTENT = 'CREATE_CONTENT',
  VIEW_CONTENT = 'VIEW_CONTENT',
  UPDATE_CONTENT = 'UPDATE_CONTENT',
  DELETE_CONTENT = 'DELETE_CONTENT',
  MANAGE_CONTENT_CATEGORIES = 'MANAGE_CONTENT_CATEGORIES',
  MANAGE_NEWSLETTERS = 'MANAGE_NEWSLETTERS',
  VIEW_CONTENT_ANALYTICS = 'VIEW_CONTENT_ANALYTICS',

  // Expenses Management Permissions
  CREATE_EXPENSES = 'CREATE_EXPENSES',
  VIEW_EXPENSES = 'VIEW_EXPENSES',
  UPDATE_EXPENSES = 'UPDATE_EXPENSES',
  DELETE_EXPENSES = 'DELETE_EXPENSES',
  APPROVE_EXPENSES = 'APPROVE_EXPENSES'
}

/**
 * Role-based permission mapping
 * Each role has specific permissions based on their responsibilities
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.VIEW_USERS, Permission.CREATE_USERS, Permission.UPDATE_USERS, Permission.DELETE_USERS, Permission.MANAGE_USER_ROLES,
    Permission.VIEW_CLIENTS, Permission.CREATE_CLIENTS, Permission.UPDATE_CLIENTS, Permission.DELETE_CLIENTS,
    Permission.VIEW_CASES, Permission.CREATE_CASES, Permission.UPDATE_CASES, Permission.DELETE_CASES, Permission.ASSIGN_CASES,
    Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS, Permission.UPDATE_DOCUMENTS, Permission.DELETE_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_TIME_ENTRIES, Permission.CREATE_TIME_ENTRIES, Permission.UPDATE_TIME_ENTRIES, Permission.DELETE_TIME_ENTRIES,
    Permission.VIEW_INVOICES, Permission.CREATE_INVOICES, Permission.UPDATE_INVOICES, Permission.DELETE_INVOICES,
    Permission.VIEW_BILLING_RATES, Permission.CREATE_BILLING_RATES, Permission.UPDATE_BILLING_RATES, Permission.DELETE_BILLING_RATES,
    Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS, Permission.DELETE_PAYMENTS,
    Permission.VIEW_CALENDAR, Permission.CREATE_EVENTS, Permission.UPDATE_EVENTS, Permission.DELETE_EVENTS,
    Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS, Permission.EXPORT_DATA,
    Permission.VIEW_AUDIT_LOGS, Permission.MANAGE_SYSTEM_SETTINGS, Permission.ACCESS_ADMIN_PANEL,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.PARTNER]: [
    // Full access to cases, clients, documents, billing, and team management
    Permission.VIEW_USERS, Permission.CREATE_USERS, Permission.UPDATE_USERS, Permission.MANAGE_USER_ROLES,
    Permission.VIEW_CLIENTS, Permission.CREATE_CLIENTS, Permission.UPDATE_CLIENTS, Permission.DELETE_CLIENTS,
    Permission.VIEW_CASES, Permission.CREATE_CASES, Permission.UPDATE_CASES, Permission.DELETE_CASES, Permission.ASSIGN_CASES,
    Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS, Permission.UPDATE_DOCUMENTS, Permission.DELETE_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_TIME_ENTRIES, Permission.CREATE_TIME_ENTRIES, Permission.UPDATE_TIME_ENTRIES, Permission.DELETE_TIME_ENTRIES,
    Permission.VIEW_INVOICES, Permission.CREATE_INVOICES, Permission.UPDATE_INVOICES, Permission.DELETE_INVOICES,
    Permission.VIEW_BILLING_RATES, Permission.CREATE_BILLING_RATES, Permission.UPDATE_BILLING_RATES, Permission.DELETE_BILLING_RATES,
    Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS, Permission.DELETE_PAYMENTS,
    Permission.VIEW_CALENDAR, Permission.CREATE_EVENTS, Permission.UPDATE_EVENTS, Permission.DELETE_EVENTS,
    Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS, Permission.EXPORT_DATA,
    Permission.VIEW_AUDIT_LOGS,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.SENIOR_ASSOCIATE]: [
    // Full access to assigned cases and related resources
    Permission.VIEW_USERS,
    Permission.VIEW_CLIENTS, Permission.CREATE_CLIENTS, Permission.UPDATE_CLIENTS,
    Permission.VIEW_CASES, Permission.CREATE_CASES, Permission.UPDATE_CASES, Permission.ASSIGN_CASES,
    Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS, Permission.UPDATE_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_TIME_ENTRIES, Permission.CREATE_TIME_ENTRIES, Permission.UPDATE_TIME_ENTRIES, Permission.DELETE_TIME_ENTRIES,
    Permission.VIEW_INVOICES, Permission.CREATE_INVOICES, Permission.UPDATE_INVOICES,
    Permission.VIEW_BILLING_RATES, Permission.CREATE_BILLING_RATES, Permission.UPDATE_BILLING_RATES,
    Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS, Permission.UPDATE_PAYMENTS,
    Permission.VIEW_CALENDAR, Permission.CREATE_EVENTS, Permission.UPDATE_EVENTS, Permission.DELETE_EVENTS,
    Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.ASSOCIATE]: [
    // Access to assigned cases and basic operations
    Permission.VIEW_USERS,
    Permission.VIEW_CLIENTS, Permission.CREATE_CLIENTS, Permission.UPDATE_CLIENTS,
    Permission.VIEW_CASES, Permission.CREATE_CASES, Permission.UPDATE_CASES,
    Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS, Permission.UPDATE_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_TIME_ENTRIES, Permission.CREATE_TIME_ENTRIES, Permission.UPDATE_TIME_ENTRIES,
    Permission.VIEW_INVOICES, Permission.CREATE_INVOICES,
    Permission.VIEW_BILLING_RATES,
    Permission.VIEW_PAYMENTS, Permission.CREATE_PAYMENTS,
    Permission.VIEW_CALENDAR, Permission.CREATE_EVENTS, Permission.UPDATE_EVENTS,
    Permission.VIEW_REPORTS,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.PARALEGAL]: [
    // Limited access for support tasks
    Permission.VIEW_USERS,
    Permission.VIEW_CLIENTS, Permission.UPDATE_CLIENTS,
    Permission.VIEW_CASES, Permission.UPDATE_CASES,
    Permission.VIEW_DOCUMENTS, Permission.UPLOAD_DOCUMENTS, Permission.UPDATE_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_TIME_ENTRIES, Permission.CREATE_TIME_ENTRIES, Permission.UPDATE_TIME_ENTRIES,
    Permission.VIEW_INVOICES,
    Permission.VIEW_BILLING_RATES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_CALENDAR, Permission.CREATE_EVENTS, Permission.UPDATE_EVENTS,
    Permission.VIEW_REPORTS,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.CLIENT]: [
    // Client portal access
    Permission.VIEW_CASES,
    Permission.VIEW_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
    Permission.VIEW_INVOICES,
    Permission.VIEW_PAYMENTS,
    Permission.VIEW_CALENDAR,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
  ],

  [UserRole.GUEST]: [
    // Minimal access for public information
    Permission.VIEW_CASES,
    Permission.VIEW_DOCUMENTS,
    Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
    Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
    Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES
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