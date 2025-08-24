"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.UserRole = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.getRolePermissions = getRolePermissions;
exports.canAccessResource = canAccessResource;
exports.canAccessCase = canAccessCase;
exports.canAccessDocument = canAccessDocument;
exports.getAssignableRoles = getAssignableRoles;
exports.canAssignRole = canAssignRole;
exports.getRoleHierarchyLevel = getRoleHierarchyLevel;
exports.canManageUser = canManageUser;
exports.hasClientAccess = hasClientAccess;
exports.hasCaseAccess = hasCaseAccess;
const DatabaseService_1 = require("../services/DatabaseService");
const logger_1 = __importDefault(require("../utils/logger"));
const db_SQLQueries_1 = require("../utils/db_SQLQueries");
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["PARTNER"] = "partner";
    UserRole["SENIOR_ASSOCIATE"] = "senior_associate";
    UserRole["ASSOCIATE"] = "associate";
    UserRole["JUNIOR_ASSOCIATE"] = "junior_associate";
    UserRole["PARALEGAL"] = "paralegal";
    UserRole["CLIENT"] = "client";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["VIEW_USERS"] = "view_users";
    Permission["CREATE_USERS"] = "create_users";
    Permission["UPDATE_USERS"] = "update_users";
    Permission["DELETE_USERS"] = "delete_users";
    Permission["MANAGE_USER_ROLES"] = "manage_user_roles";
    Permission["VIEW_CLIENTS"] = "view_clients";
    Permission["CREATE_CLIENTS"] = "create_clients";
    Permission["UPDATE_CLIENTS"] = "update_clients";
    Permission["DELETE_CLIENTS"] = "delete_clients";
    Permission["VIEW_CASES"] = "view_cases";
    Permission["CREATE_CASES"] = "create_cases";
    Permission["UPDATE_CASES"] = "update_cases";
    Permission["DELETE_CASES"] = "delete_cases";
    Permission["ASSIGN_CASES"] = "assign_cases";
    Permission["VIEW_DOCUMENTS"] = "view_documents";
    Permission["UPLOAD_DOCUMENTS"] = "upload_documents";
    Permission["UPDATE_DOCUMENTS"] = "update_documents";
    Permission["DELETE_DOCUMENTS"] = "delete_documents";
    Permission["DOWNLOAD_DOCUMENTS"] = "download_documents";
    Permission["DOCUMENT_READ"] = "document_read";
    Permission["VIEW_TIME_ENTRIES"] = "view_time_entries";
    Permission["CREATE_TIME_ENTRIES"] = "create_time_entries";
    Permission["UPDATE_TIME_ENTRIES"] = "update_time_entries";
    Permission["DELETE_TIME_ENTRIES"] = "delete_time_entries";
    Permission["VIEW_INVOICES"] = "view_invoices";
    Permission["CREATE_INVOICES"] = "create_invoices";
    Permission["UPDATE_INVOICES"] = "update_invoices";
    Permission["DELETE_INVOICES"] = "delete_invoices";
    Permission["VIEW_BILLING_RATES"] = "view_billing_rates";
    Permission["CREATE_BILLING_RATES"] = "create_billing_rates";
    Permission["UPDATE_BILLING_RATES"] = "update_billing_rates";
    Permission["DELETE_BILLING_RATES"] = "delete_billing_rates";
    Permission["VIEW_PAYMENTS"] = "view_payments";
    Permission["CREATE_PAYMENTS"] = "create_payments";
    Permission["UPDATE_PAYMENTS"] = "update_payments";
    Permission["DELETE_PAYMENTS"] = "delete_payments";
    Permission["VIEW_CALENDAR"] = "view_calendar";
    Permission["CREATE_EVENTS"] = "create_events";
    Permission["UPDATE_EVENTS"] = "update_events";
    Permission["DELETE_EVENTS"] = "delete_events";
    Permission["VIEW_REPORTS"] = "view_reports";
    Permission["GENERATE_REPORTS"] = "generate_reports";
    Permission["EXPORT_DATA"] = "export_data";
    Permission["VIEW_AUDIT_LOGS"] = "view_audit_logs";
    Permission["MANAGE_SYSTEM_SETTINGS"] = "manage_system_settings";
    Permission["ACCESS_ADMIN_PANEL"] = "access_admin_panel";
    Permission["CREATE_CONTENT"] = "CREATE_CONTENT";
    Permission["VIEW_CONTENT"] = "VIEW_CONTENT";
    Permission["UPDATE_CONTENT"] = "UPDATE_CONTENT";
    Permission["DELETE_CONTENT"] = "DELETE_CONTENT";
    Permission["MANAGE_CONTENT_CATEGORIES"] = "MANAGE_CONTENT_CATEGORIES";
    Permission["MANAGE_NEWSLETTERS"] = "MANAGE_NEWSLETTERS";
    Permission["VIEW_CONTENT_ANALYTICS"] = "VIEW_CONTENT_ANALYTICS";
    Permission["CREATE_EXPENSES"] = "CREATE_EXPENSES";
    Permission["VIEW_EXPENSES"] = "VIEW_EXPENSES";
    Permission["UPDATE_EXPENSES"] = "UPDATE_EXPENSES";
    Permission["DELETE_EXPENSES"] = "DELETE_EXPENSES";
    Permission["APPROVE_EXPENSES"] = "APPROVE_EXPENSES";
    Permission["VIEW_TASKS"] = "VIEW_TASKS";
    Permission["CREATE_TASKS"] = "CREATE_TASKS";
    Permission["UPDATE_TASKS"] = "UPDATE_TASKS";
    Permission["DELETE_TASKS"] = "DELETE_TASKS";
    Permission["ASSIGN_TASKS"] = "ASSIGN_TASKS";
    Permission["VIEW_COMMUNICATION"] = "VIEW_COMMUNICATION";
    Permission["CREATE_COMMUNICATION"] = "CREATE_COMMUNICATION";
    Permission["UPDATE_COMMUNICATION"] = "UPDATE_COMMUNICATION";
    Permission["DELETE_COMMUNICATION"] = "DELETE_COMMUNICATION";
    Permission["SEND_MESSAGES"] = "SEND_MESSAGES";
    Permission["VIEW_FINANCIAL_REPORTS"] = "VIEW_FINANCIAL_REPORTS";
    Permission["CREATE_FINANCIAL_REPORTS"] = "CREATE_FINANCIAL_REPORTS";
    Permission["EXPORT_FINANCIAL_REPORTS"] = "EXPORT_FINANCIAL_REPORTS";
    Permission["VIEW_PRODUCTIVITY_REPORTS"] = "VIEW_PRODUCTIVITY_REPORTS";
    Permission["CREATE_PRODUCTIVITY_REPORTS"] = "CREATE_PRODUCTIVITY_REPORTS";
    Permission["EXPORT_PRODUCTIVITY_REPORTS"] = "EXPORT_PRODUCTIVITY_REPORTS";
    Permission["CREATE_REPORTS"] = "CREATE_REPORTS";
    Permission["UPDATE_REPORTS"] = "UPDATE_REPORTS";
    Permission["DELETE_REPORTS"] = "DELETE_REPORTS";
    Permission["EXPORT_REPORTS"] = "EXPORT_REPORTS";
    Permission["USE_GLOBAL_SEARCH"] = "USE_GLOBAL_SEARCH";
    Permission["VIEW_SEARCH_STATISTICS"] = "VIEW_SEARCH_STATISTICS";
    Permission["SUPPORT_READ_ALL"] = "support:read_all";
    Permission["SUPPORT_ASSIGN"] = "support:assign";
    Permission["SUPPORT_UPDATE"] = "support:update";
    Permission["SUPPORT_VIEW_STATS"] = "support:view_stats";
    Permission["FEEDBACK_READ_ALL"] = "feedback:read_all";
    Permission["FEEDBACK_UPDATE"] = "feedback:update";
    Permission["FEEDBACK_VIEW_STATS"] = "feedback:view_stats";
    Permission["FEEDBACK_SEARCH"] = "feedback:search";
    Permission["FEEDBACK_VIEW_TRENDS"] = "feedback:view_trends";
    Permission["FEEDBACK_VIEW_ANALYTICS"] = "feedback:view_analytics";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: [
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
        Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS, Permission.DELETE_TASKS, Permission.ASSIGN_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.UPDATE_COMMUNICATION, Permission.DELETE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.VIEW_FINANCIAL_REPORTS, Permission.CREATE_FINANCIAL_REPORTS, Permission.EXPORT_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS, Permission.CREATE_PRODUCTIVITY_REPORTS, Permission.EXPORT_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.UPDATE_REPORTS, Permission.DELETE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH, Permission.VIEW_SEARCH_STATISTICS,
        Permission.SUPPORT_READ_ALL, Permission.SUPPORT_ASSIGN, Permission.SUPPORT_UPDATE, Permission.SUPPORT_VIEW_STATS,
        Permission.FEEDBACK_READ_ALL, Permission.FEEDBACK_UPDATE, Permission.FEEDBACK_VIEW_STATS, Permission.FEEDBACK_SEARCH, Permission.FEEDBACK_VIEW_TRENDS, Permission.FEEDBACK_VIEW_ANALYTICS
    ],
    [UserRole.PARTNER]: [
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
        Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS, Permission.DELETE_TASKS, Permission.ASSIGN_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.UPDATE_COMMUNICATION, Permission.DELETE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.VIEW_FINANCIAL_REPORTS, Permission.CREATE_FINANCIAL_REPORTS, Permission.EXPORT_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS, Permission.CREATE_PRODUCTIVITY_REPORTS, Permission.EXPORT_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.UPDATE_REPORTS, Permission.DELETE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH, Permission.VIEW_SEARCH_STATISTICS,
        Permission.SUPPORT_READ_ALL, Permission.SUPPORT_ASSIGN, Permission.SUPPORT_UPDATE, Permission.SUPPORT_VIEW_STATS,
        Permission.FEEDBACK_READ_ALL, Permission.FEEDBACK_UPDATE, Permission.FEEDBACK_VIEW_STATS, Permission.FEEDBACK_SEARCH, Permission.FEEDBACK_VIEW_TRENDS, Permission.FEEDBACK_VIEW_ANALYTICS
    ],
    [UserRole.SENIOR_ASSOCIATE]: [
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
        Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS, Permission.DELETE_TASKS, Permission.ASSIGN_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.UPDATE_COMMUNICATION, Permission.DELETE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.VIEW_FINANCIAL_REPORTS, Permission.CREATE_FINANCIAL_REPORTS, Permission.EXPORT_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS, Permission.CREATE_PRODUCTIVITY_REPORTS, Permission.EXPORT_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.UPDATE_REPORTS, Permission.DELETE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH, Permission.VIEW_SEARCH_STATISTICS,
        Permission.SUPPORT_READ_ALL, Permission.SUPPORT_ASSIGN, Permission.SUPPORT_UPDATE, Permission.SUPPORT_VIEW_STATS,
        Permission.FEEDBACK_READ_ALL, Permission.FEEDBACK_UPDATE, Permission.FEEDBACK_VIEW_STATS, Permission.FEEDBACK_SEARCH, Permission.FEEDBACK_VIEW_TRENDS, Permission.FEEDBACK_VIEW_ANALYTICS
    ],
    [UserRole.ASSOCIATE]: [
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
        Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS, Permission.DELETE_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.UPDATE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.VIEW_FINANCIAL_REPORTS, Permission.CREATE_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS, Permission.CREATE_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.UPDATE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH
    ],
    [UserRole.JUNIOR_ASSOCIATE]: [
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
        Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT,
        Permission.VIEW_EXPENSES, Permission.CREATE_EXPENSES, Permission.UPDATE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.VIEW_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH
    ],
    [UserRole.PARALEGAL]: [
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
        Permission.CREATE_EXPENSES, Permission.VIEW_EXPENSES, Permission.UPDATE_EXPENSES, Permission.DELETE_EXPENSES, Permission.APPROVE_EXPENSES,
        Permission.VIEW_TASKS, Permission.CREATE_TASKS, Permission.UPDATE_TASKS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.UPDATE_COMMUNICATION,
        Permission.VIEW_FINANCIAL_REPORTS,
        Permission.VIEW_PRODUCTIVITY_REPORTS,
        Permission.CREATE_REPORTS, Permission.EXPORT_REPORTS,
        Permission.USE_GLOBAL_SEARCH
    ],
    [UserRole.CLIENT]: [
        Permission.VIEW_CASES,
        Permission.VIEW_DOCUMENTS, Permission.DOWNLOAD_DOCUMENTS,
        Permission.VIEW_INVOICES,
        Permission.VIEW_PAYMENTS,
        Permission.VIEW_CALENDAR,
        Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
        Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
        Permission.VIEW_COMMUNICATION, Permission.CREATE_COMMUNICATION, Permission.SEND_MESSAGES,
        Permission.USE_GLOBAL_SEARCH
    ],
    [UserRole.GUEST]: [
        Permission.VIEW_CASES,
        Permission.VIEW_DOCUMENTS,
        Permission.CREATE_CONTENT, Permission.VIEW_CONTENT, Permission.UPDATE_CONTENT, Permission.DELETE_CONTENT,
        Permission.MANAGE_CONTENT_CATEGORIES, Permission.MANAGE_NEWSLETTERS, Permission.VIEW_CONTENT_ANALYTICS,
        Permission.USE_GLOBAL_SEARCH
    ]
};
function hasPermission(userRole, permission) {
    const rolePermissions = exports.ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
}
function hasAnyPermission(userRole, permissions) {
    return permissions.some(permission => hasPermission(userRole, permission));
}
function hasAllPermissions(userRole, permissions) {
    return permissions.every(permission => hasPermission(userRole, permission));
}
function getRolePermissions(userRole) {
    return exports.ROLE_PERMISSIONS[userRole] || [];
}
function canAccessResource(userRole, resourceType, action) {
    const permission = `${resourceType}:${action}`;
    return hasPermission(userRole, permission);
}
function canAccessCase(userRole, userId, caseData) {
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.PARTNER) {
        return true;
    }
    if (userRole === UserRole.SENIOR_ASSOCIATE) {
        return (caseData.assigned_partner === userId) ||
            (caseData.assigned_associates && caseData.assigned_associates.includes(userId)) || false;
    }
    if (userRole === UserRole.JUNIOR_ASSOCIATE || userRole === UserRole.PARALEGAL) {
        return (caseData.assigned_partner === userId) ||
            (caseData.assigned_associates && caseData.assigned_associates.includes(userId)) || false;
    }
    if (userRole === UserRole.CLIENT) {
        return false;
    }
    return false;
}
function canAccessDocument(userRole, _userId, documentData) {
    if (userRole === UserRole.SUPER_ADMIN) {
        return true;
    }
    if (userRole === UserRole.PARTNER) {
        return !documentData.is_confidential;
    }
    return hasPermission(userRole, Permission.DOCUMENT_READ);
}
function getAssignableRoles(currentUserRole) {
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
function canAssignRole(currentUserRole, targetRole) {
    const assignableRoles = getAssignableRoles(currentUserRole);
    return assignableRoles.includes(targetRole);
}
function getRoleHierarchyLevel(role) {
    const hierarchy = {
        [UserRole.SUPER_ADMIN]: 7,
        [UserRole.PARTNER]: 6,
        [UserRole.SENIOR_ASSOCIATE]: 5,
        [UserRole.ASSOCIATE]: 4,
        [UserRole.JUNIOR_ASSOCIATE]: 3,
        [UserRole.PARALEGAL]: 2,
        [UserRole.CLIENT]: 1,
        [UserRole.GUEST]: 0
    };
    return hierarchy[role] || 0;
}
function canManageUser(currentUserRole, targetUserRole) {
    const currentLevel = getRoleHierarchyLevel(currentUserRole);
    const targetLevel = getRoleHierarchyLevel(targetUserRole);
    return currentLevel > targetLevel;
}
async function hasClientAccess(userRole, userId, clientId) {
    try {
        if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.PARTNER) {
            return true;
        }
        const db = new DatabaseService_1.DatabaseService();
        const result = await db.query(db_SQLQueries_1.SQLQueries.ROLE_ACCESS.CHECK_CLIENT_ACCESS, [clientId, userId]);
        return result.length > 0 && parseInt(result[0].case_count) > 0;
    }
    catch (error) {
        logger_1.default.error('Error checking client access:', error);
        return false;
    }
}
async function hasCaseAccess(userRole, userId, caseId) {
    try {
        if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.PARTNER) {
            return true;
        }
        const db = new DatabaseService_1.DatabaseService();
        const result = await db.query(db_SQLQueries_1.SQLQueries.ROLE_ACCESS.CHECK_CASE_ACCESS, [caseId]);
        if (result.length === 0) {
            return false;
        }
        const caseData = result[0];
        return caseData.assigned_to === userId;
    }
    catch (error) {
        logger_1.default.error('Error checking case access:', error);
        return false;
    }
}
exports.default = {
    UserRole,
    Permission,
    ROLE_PERMISSIONS: exports.ROLE_PERMISSIONS,
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
    canManageUser,
    hasClientAccess,
    hasCaseAccess
};
//# sourceMappingURL=roleAccess.js.map