export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    PARTNER = "partner",
    SENIOR_ASSOCIATE = "senior_associate",
    ASSOCIATE = "associate",
    JUNIOR_ASSOCIATE = "junior_associate",
    PARALEGAL = "paralegal",
    CLIENT = "client",
    GUEST = "guest"
}
export declare enum Permission {
    VIEW_USERS = "view_users",
    CREATE_USERS = "create_users",
    UPDATE_USERS = "update_users",
    DELETE_USERS = "delete_users",
    MANAGE_USER_ROLES = "manage_user_roles",
    VIEW_CLIENTS = "view_clients",
    CREATE_CLIENTS = "create_clients",
    UPDATE_CLIENTS = "update_clients",
    DELETE_CLIENTS = "delete_clients",
    VIEW_CASES = "view_cases",
    CREATE_CASES = "create_cases",
    UPDATE_CASES = "update_cases",
    DELETE_CASES = "delete_cases",
    ASSIGN_CASES = "assign_cases",
    VIEW_DOCUMENTS = "view_documents",
    UPLOAD_DOCUMENTS = "upload_documents",
    UPDATE_DOCUMENTS = "update_documents",
    DELETE_DOCUMENTS = "delete_documents",
    DOWNLOAD_DOCUMENTS = "download_documents",
    DOCUMENT_READ = "document_read",
    VIEW_TIME_ENTRIES = "view_time_entries",
    CREATE_TIME_ENTRIES = "create_time_entries",
    UPDATE_TIME_ENTRIES = "update_time_entries",
    DELETE_TIME_ENTRIES = "delete_time_entries",
    VIEW_INVOICES = "view_invoices",
    CREATE_INVOICES = "create_invoices",
    UPDATE_INVOICES = "update_invoices",
    DELETE_INVOICES = "delete_invoices",
    VIEW_BILLING_RATES = "view_billing_rates",
    CREATE_BILLING_RATES = "create_billing_rates",
    UPDATE_BILLING_RATES = "update_billing_rates",
    DELETE_BILLING_RATES = "delete_billing_rates",
    VIEW_PAYMENTS = "view_payments",
    CREATE_PAYMENTS = "create_payments",
    UPDATE_PAYMENTS = "update_payments",
    DELETE_PAYMENTS = "delete_payments",
    VIEW_CALENDAR = "view_calendar",
    CREATE_EVENTS = "create_events",
    UPDATE_EVENTS = "update_events",
    DELETE_EVENTS = "delete_events",
    VIEW_REPORTS = "view_reports",
    GENERATE_REPORTS = "generate_reports",
    EXPORT_DATA = "export_data",
    VIEW_AUDIT_LOGS = "view_audit_logs",
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings",
    ACCESS_ADMIN_PANEL = "access_admin_panel",
    CREATE_CONTENT = "CREATE_CONTENT",
    VIEW_CONTENT = "VIEW_CONTENT",
    UPDATE_CONTENT = "UPDATE_CONTENT",
    DELETE_CONTENT = "DELETE_CONTENT",
    MANAGE_CONTENT_CATEGORIES = "MANAGE_CONTENT_CATEGORIES",
    MANAGE_NEWSLETTERS = "MANAGE_NEWSLETTERS",
    VIEW_CONTENT_ANALYTICS = "VIEW_CONTENT_ANALYTICS",
    CREATE_EXPENSES = "CREATE_EXPENSES",
    VIEW_EXPENSES = "VIEW_EXPENSES",
    UPDATE_EXPENSES = "UPDATE_EXPENSES",
    DELETE_EXPENSES = "DELETE_EXPENSES",
    APPROVE_EXPENSES = "APPROVE_EXPENSES",
    VIEW_TASKS = "VIEW_TASKS",
    CREATE_TASKS = "CREATE_TASKS",
    UPDATE_TASKS = "UPDATE_TASKS",
    DELETE_TASKS = "DELETE_TASKS",
    ASSIGN_TASKS = "ASSIGN_TASKS",
    VIEW_COMMUNICATION = "VIEW_COMMUNICATION",
    CREATE_COMMUNICATION = "CREATE_COMMUNICATION",
    UPDATE_COMMUNICATION = "UPDATE_COMMUNICATION",
    DELETE_COMMUNICATION = "DELETE_COMMUNICATION",
    SEND_MESSAGES = "SEND_MESSAGES",
    VIEW_FINANCIAL_REPORTS = "VIEW_FINANCIAL_REPORTS",
    CREATE_FINANCIAL_REPORTS = "CREATE_FINANCIAL_REPORTS",
    EXPORT_FINANCIAL_REPORTS = "EXPORT_FINANCIAL_REPORTS",
    VIEW_PRODUCTIVITY_REPORTS = "VIEW_PRODUCTIVITY_REPORTS",
    CREATE_PRODUCTIVITY_REPORTS = "CREATE_PRODUCTIVITY_REPORTS",
    EXPORT_PRODUCTIVITY_REPORTS = "EXPORT_PRODUCTIVITY_REPORTS",
    CREATE_REPORTS = "CREATE_REPORTS",
    UPDATE_REPORTS = "UPDATE_REPORTS",
    DELETE_REPORTS = "DELETE_REPORTS",
    EXPORT_REPORTS = "EXPORT_REPORTS",
    USE_GLOBAL_SEARCH = "USE_GLOBAL_SEARCH",
    VIEW_SEARCH_STATISTICS = "VIEW_SEARCH_STATISTICS"
}
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
export declare function hasPermission(userRole: UserRole, permission: Permission): boolean;
export declare function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean;
export declare function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean;
export declare function getRolePermissions(userRole: UserRole): Permission[];
export declare function canAccessResource(userRole: UserRole, resourceType: string, action: string): boolean;
export declare function canAccessCase(userRole: UserRole, userId: string, caseData: {
    assigned_partner?: string;
    assigned_associates?: string[];
    client_id?: string;
}): boolean;
export declare function canAccessDocument(userRole: UserRole, userId: string, documentData: {
    case_id?: string;
    uploaded_by?: string;
    is_confidential?: boolean;
}): boolean;
export declare function getAssignableRoles(currentUserRole: UserRole): UserRole[];
export declare function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean;
export declare function getRoleHierarchyLevel(role: UserRole): number;
export declare function canManageUser(currentUserRole: UserRole, targetUserRole: UserRole): boolean;
export declare function hasClientAccess(userRole: UserRole, userId: string, clientId: string): Promise<boolean>;
export declare function hasCaseAccess(userRole: UserRole, userId: string, caseId: string): Promise<boolean>;
declare const _default: {
    UserRole: typeof UserRole;
    Permission: typeof Permission;
    ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
    hasPermission: typeof hasPermission;
    hasAnyPermission: typeof hasAnyPermission;
    hasAllPermissions: typeof hasAllPermissions;
    getRolePermissions: typeof getRolePermissions;
    canAccessResource: typeof canAccessResource;
    canAccessCase: typeof canAccessCase;
    canAccessDocument: typeof canAccessDocument;
    getAssignableRoles: typeof getAssignableRoles;
    canAssignRole: typeof canAssignRole;
    getRoleHierarchyLevel: typeof getRoleHierarchyLevel;
    canManageUser: typeof canManageUser;
    hasClientAccess: typeof hasClientAccess;
    hasCaseAccess: typeof hasCaseAccess;
};
export default _default;
//# sourceMappingURL=roleAccess.d.ts.map