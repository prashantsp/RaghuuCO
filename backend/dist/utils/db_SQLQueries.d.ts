export declare const SQLQueries: {
    USERS: {
        CREATE_USER: string;
        GET_USER_BY_ID: string;
        GET_USER_BY_EMAIL: string;
        GET_ALL_USERS: string;
        GET_USERS_WITH_PAGINATION: string;
        GET_USERS_BY_ROLE: string;
        SEARCH_USERS: string;
        UPDATE_USER: string;
        UPDATE_USER_ROLE: string;
        UPDATE_USER_PASSWORD: string;
        UPDATE_LAST_LOGIN: string;
        DEACTIVATE_USER: string;
        GET_USERS_COUNT: string;
    };
    SOCIAL_ACCOUNTS: {
        CREATE_SOCIAL_ACCOUNT: string;
        GET_SOCIAL_ACCOUNT: string;
        GET_SOCIAL_ACCOUNTS_BY_USER: string;
        UPDATE_SOCIAL_ACCOUNT: string;
        DELETE_SOCIAL_ACCOUNT: string;
    };
    CLIENTS: {
        GET_CLIENT_TYPE: string;
        CHECK_EMAIL_EXISTS: string;
        CHECK_EMAIL_EXISTS_EXCLUDE: string;
        GET_ACTIVE_CASES_COUNT: string;
        DEACTIVATE_CLIENT: string;
        GET_EMAIL_CONFLICTS: string;
        GET_PHONE_CONFLICTS: string;
        GET_NAME_CONFLICTS: string;
        GET_TOTAL_CLIENTS: string;
    };
    CASES: {
        GET_TOTAL_CASES: string;
        SOFT_DELETE: string;
        GET_CASES_BY_STATUS: string;
        GET_CASES_BY_PRIORITY: string;
        GET_CASES_BY_USER: string;
        GET_RECENT_CASES: string;
    };
    DOCUMENTS: {
        GET_TOTAL_DOCUMENTS: string;
        SOFT_DELETE: string;
        GET_DOCUMENTS_BY_CATEGORY: string;
        GET_DOCUMENTS_BY_TYPE: string;
        GET_TOTAL_STORAGE: string;
        GET_RECENT_UPLOADS: string;
    };
    TIME_ENTRIES: {
        CREATE_TIME_ENTRY: string;
        GET_TIME_ENTRY_BY_ID: string;
        GET_TIME_ENTRIES_BY_CASE: string;
        GET_TIME_ENTRIES_BY_USER: string;
        GET_TIME_ENTRIES_BY_DATE_RANGE: string;
        UPDATE_TIME_ENTRY: string;
        DELETE_TIME_ENTRY: string;
        GET_TIME_ENTRIES_COUNT: string;
        GET_TOTAL_HOURS_BY_CASE: string;
        GET_TOTAL_HOURS_BY_USER: string;
    };
    AUDIT_LOGS: {
        CREATE_AUDIT_LOG: string;
        GET_AUDIT_LOGS_BY_USER: string;
        GET_AUDIT_LOGS_BY_RESOURCE: string;
        GET_AUDIT_LOGS_BY_ACTION: string;
        GET_AUDIT_LOGS_WITH_PAGINATION: string;
        GET_AUDIT_LOGS_BY_DATE_RANGE: string;
        GET_AUDIT_LOGS_COUNT: string;
    };
    USER_SESSIONS: {
        GET_SESSION_BY_REFRESH_TOKEN: string;
        UPDATE_REFRESH_TOKEN: string;
        DEACTIVATE_SESSION: string;
    };
    BILLING_RATES: {
        CREATE: string;
        GET_BY_USER_ID: string;
        GET_DEFAULT_RATE: string;
        GET_RATE_BY_CASE_TYPE: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
    };
    INVOICES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_CASE_ID: string;
        GET_BY_CLIENT_ID: string;
        GET_BY_USER_ID: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
        GET_STATS: string;
        GENERATE_INVOICE_NUMBER: string;
    };
    INVOICE_ITEMS: {
        CREATE: string;
        GET_BY_INVOICE_ID: string;
        UPDATE: string;
        DELETE: string;
        DELETE_BY_INVOICE_ID: string;
    };
    PAYMENTS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_INVOICE_ID: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
        GET_STATS: string;
        GENERATE_PAYMENT_NUMBER: string;
    };
    CALENDAR_EVENTS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_USER_ID: string;
        GET_BY_CASE_ID: string;
        GET_BY_CLIENT_ID: string;
        GET_BY_DATE_RANGE: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
        GET_CONFLICTS: string;
        GET_UPCOMING: string;
    };
    CALENDAR_EVENT_ATTENDEES: {
        CREATE: string;
        GET_BY_EVENT_ID: string;
        UPDATE_RESPONSE: string;
        DELETE: string;
        DELETE_BY_EVENT_ID: string;
    };
    CALENDAR_EVENT_REMINDERS: {
        CREATE: string;
        GET_BY_EVENT_ID: string;
        GET_PENDING: string;
        UPDATE_STATUS: string;
        DELETE: string;
        DELETE_BY_EVENT_ID: string;
    };
    COURT_DATES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_CASE_ID: string;
        GET_BY_USER_ID: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
        GET_UPCOMING: string;
    };
    INTERNAL_MESSAGES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_SENDER_ID: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
    };
    MESSAGE_RECIPIENTS: {
        CREATE: string;
        GET_BY_MESSAGE_ID: string;
        GET_BY_RECIPIENT_ID: string;
        UPDATE_STATUS: string;
        DELETE: string;
        DELETE_BY_MESSAGE_ID: string;
        GET_UNREAD_COUNT: string;
    };
    EMAIL_TEMPLATES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_NAME: string;
        GET_ALL: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
    };
    EMAIL_LOGS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_RECIPIENT: string;
        GET_BY_CASE_ID: string;
        GET_BY_CLIENT_ID: string;
        UPDATE_STATUS: string;
        SEARCH: string;
        GET_STATS: string;
    };
    SMS_LOGS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_RECIPIENT: string;
        GET_BY_CASE_ID: string;
        GET_BY_CLIENT_ID: string;
        UPDATE_STATUS: string;
        SEARCH: string;
        GET_STATS: string;
    };
    NOTIFICATION_PREFERENCES: {
        CREATE: string;
        GET_BY_USER_ID: string;
        GET_BY_USER_AND_TYPE: string;
        UPDATE: string;
        DELETE: string;
        DELETE_BY_USER_ID: string;
    };
    REPORTS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_ALL: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
    };
    REPORT_EXECUTIONS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_REPORT_ID: string;
        UPDATE_STATUS: string;
        SEARCH: string;
    };
    ANALYTICS_EVENTS: {
        CREATE: string;
        GET_BY_USER_ID: string;
        GET_BY_SESSION_ID: string;
        GET_EVENTS_BY_TYPE: string;
        GET_PAGE_VIEWS: string;
        GET_USER_ACTIVITY: string;
    };
    PERFORMANCE_METRICS: {
        CREATE: string;
        GET_BY_NAME: string;
        GET_AVERAGE_BY_NAME: string;
        GET_METRICS_SUMMARY: string;
    };
    BUSINESS_METRICS: {
        CREATE: string;
        GET_BY_TYPE: string;
        GET_SUMMARY: string;
        GET_DAILY_SUMMARY: string;
    };
    TASKS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_CASE_ID: string;
        GET_BY_USER_ID: string;
        GET_BY_CLIENT_ID: string;
        UPDATE: string;
        DELETE: string;
        SEARCH: string;
        GET_DEPENDENCIES: string;
        GET_DEPENDENTS: string;
        GET_STATS: string;
    };
    TASK_DEPENDENCIES: {
        CREATE: string;
        DELETE: string;
        DELETE_BY_TASK_ID: string;
    };
    TASK_TIME_ENTRIES: {
        CREATE: string;
        GET_BY_TASK_ID: string;
        GET_BY_USER_ID: string;
        UPDATE: string;
        DELETE: string;
        GET_ACTIVE_TIMER: string;
        GET_TIME_SUMMARY: string;
    };
    CLIENT_PORTAL_USERS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_EMAIL: string;
        GET_BY_CLIENT_ID: string;
        UPDATE: string;
        UPDATE_PASSWORD: string;
        UPDATE_STATUS: string;
        UPDATE_LOGIN_ATTEMPTS: string;
        DELETE: string;
        SEARCH: string;
    };
    CLIENT_PORTAL_SESSIONS: {
        CREATE: string;
        GET_BY_TOKEN: string;
        DELETE_BY_TOKEN: string;
        DELETE_BY_USER_ID: string;
        DELETE_EXPIRED: string;
    };
    CLIENT_PORTAL_CASES: {
        GET_BY_CLIENT_ID: string;
        GET_CASE_DETAILS: string;
        GET_CASE_DOCUMENTS: string;
        GET_CASE_UPDATES: string;
    };
    CLIENT_PORTAL_MESSAGES: {
        CREATE: string;
        GET_CLIENT_MESSAGES: string;
        GET_CASE_MESSAGES: string;
    };
    CONTENT_CATEGORIES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_ALL: string;
        GET_HIERARCHICAL: string;
        UPDATE: string;
        DELETE: string;
        GET_BY_SLUG: string;
    };
    ARTICLES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_BY_SLUG: string;
        GET_ALL: string;
        GET_PUBLISHED: string;
        UPDATE: string;
        DELETE: string;
        INCREMENT_VIEW_COUNT: string;
        INCREMENT_LIKE_COUNT: string;
        INCREMENT_SHARE_COUNT: string;
        SEARCH: string;
        GET_FEATURED: string;
    };
    ARTICLE_COMMENTS: {
        CREATE: string;
        GET_BY_ARTICLE_ID: string;
        GET_BY_ID: string;
        UPDATE_STATUS: string;
        DELETE: string;
        GET_PENDING: string;
    };
    NEWSLETTERS: {
        CREATE: string;
        GET_BY_ID: string;
        GET_ALL: string;
        UPDATE: string;
        DELETE: string;
        UPDATE_SENT_STATS: string;
        UPDATE_OPENED_COUNT: string;
        UPDATE_CLICKED_COUNT: string;
        GET_SCHEDULED: string;
    };
    NEWSLETTER_SUBSCRIBERS: {
        CREATE: string;
        GET_BY_EMAIL: string;
        GET_ALL: string;
        UNSUBSCRIBE: string;
        RESUBSCRIBE: string;
        DELETE: string;
        GET_STATS: string;
    };
    CONTENT_ANALYTICS: {
        CREATE: string;
        GET_CONTENT_STATS: string;
        GET_POPULAR_CONTENT: string;
        GET_USER_ACTIVITY: string;
    };
    EXPENSES: {
        CREATE: string;
        GET_BY_ID: string;
        GET_ALL: string;
        GET_BY_CASE: string;
        GET_BY_CLIENT: string;
        UPDATE: string;
        DELETE: string;
        APPROVE: string;
        GET_CATEGORIES: string;
        GET_MONTHLY_TOTALS: string;
        GET_CASE_TOTALS: string;
        GET_CLIENT_TOTALS: string;
        SEARCH: string;
    };
    DASHBOARD: {
        GET_USER_STATS: string;
        GET_USER_TRENDS: string;
        GET_RECENT_ACTIVITIES: string;
    };
    SECURITY: {
        UPDATE_2FA_SECRET: string;
        GET_2FA_SECRET: string;
        DISABLE_2FA: string;
        GET_2FA_STATUS: string;
        UPDATE_BACKUP_CODES: string;
        GET_BACKUP_CODES: string;
        GET_USER_SECURITY_SETTINGS: string;
    };
    USERS_EXTENDED: {
        DEACTIVATE_USER: string;
    };
    ML: {
        GET_POPULAR_SEARCHES: string;
        GET_USER_SEARCH_HISTORY: string;
        GET_CONTENT_BASED_SUGGESTIONS: string;
        GET_USER_RECENT_ACTIVITIES: string;
        GET_USER_BEHAVIOR_PATTERNS: string;
        FIND_SIMILAR_USERS: string;
        STORE_DOCUMENT_CLASSIFICATION: string;
        GET_SIMILAR_CASE_RECOMMENDATIONS: string;
        GET_EXPERT_ASSIGNMENT_RECOMMENDATIONS: string;
        GET_RESOURCE_ALLOCATION_RECOMMENDATIONS: string;
        LOG_SUSPICIOUS_ACTIVITY: string;
        GET_SEARCH_TRAINING_DATA: string;
        GET_BEHAVIOR_TRAINING_DATA: string;
        GET_DOCUMENT_TRAINING_DATA: string;
        GET_CASE_ASSIGNMENT_TRAINING_DATA: string;
        GET_FRAUD_TRAINING_DATA: string;
        UPDATE_MODEL_WEIGHTS: string;
        UPDATE_MODEL_METRICS: string;
        GET_MODEL_PERFORMANCE: string;
        STORE_USER_BEHAVIOR_PATTERNS: string;
        STORE_CLASSIFICATION_RULES: string;
        STORE_CASE_RECOMMENDATION_PATTERNS: string;
        STORE_FRAUD_DETECTION_RULES: string;
    };
    ROLE_ACCESS: {
        CHECK_CLIENT_ACCESS: string;
        CHECK_CASE_ACCESS: string;
        GET_USER_PERMISSIONS: string;
        GET_ROLE_HIERARCHY: string;
    };
    SECURITY_AUDIT: {
        LOG_SECURITY_AUDIT: string;
        LOG_SECURITY_INCIDENT: string;
        GET_SECURITY_STATISTICS: string;
        GET_RECENT_INCIDENTS: string;
    };
    ANALYTICS: {
        GET_BUSINESS_ANALYTICS: string;
        GET_USER_ACTIVITY: string;
        GET_DOCUMENT_ANALYTICS: string;
        GET_TIME_TRACKING_ANALYTICS: string;
    };
    SUPPORT: {
        CREATE_TICKET: string;
        GET_TICKET_BY_ID: string;
        GET_USER_TICKETS: string;
        GET_ALL_TICKETS: string;
        UPDATE_TICKET_STATUS: string;
        ASSIGN_TICKET: string;
        ADD_COMMENT: string;
        GET_TICKET_COMMENTS: string;
        RESOLVE_TICKET: string;
        RATE_TICKET_SATISFACTION: string;
        GET_TICKET_STATISTICS: string;
        GET_TICKETS_BY_ASSIGNEE: string;
        GET_ESCALATED_TICKETS: string;
        GET_TICKETS_BY_PRIORITY: string;
        GET_TICKETS_BY_CATEGORY: string;
        SEARCH_TICKETS: string;
        GET_TICKET_HISTORY: string;
        GET_SUPPORT_METRICS: string;
        GET_ASSIGNEE_WORKLOAD: string;
        GET_CATEGORY_PERFORMANCE: string;
        GET_PRIORITY_PERFORMANCE: string;
        GET_TICKET_TRENDS: string;
        GET_SLOW_RESOLUTION_TICKETS: string;
        GET_UNASSIGNED_TICKETS: string;
        GET_USER_TICKET_HISTORY: string;
        GET_TICKET_ANALYTICS: string;
    };
    FEEDBACK: {
        SUBMIT_FEEDBACK: string;
        GET_FEEDBACK_BY_ID: string;
        GET_USER_FEEDBACK: string;
        GET_ALL_FEEDBACK: string;
        UPDATE_FEEDBACK_STATUS: string;
        GET_FEEDBACK_STATISTICS: string;
        SEARCH_FEEDBACK: string;
        GET_FEEDBACK_TRENDS: string;
        GET_FEATURE_FEEDBACK: string;
        GET_FEEDBACK_ANALYTICS: string;
        GET_FEEDBACK_BY_CATEGORY: string;
        GET_FEEDBACK_BY_STATUS: string;
        GET_FEEDBACK_BY_PRIORITY: string;
        GET_HIGH_PRIORITY_FEEDBACK: string;
        GET_UNREVIEWED_FEEDBACK: string;
        GET_FEEDBACK_SUMMARY: string;
        GET_USER_FEEDBACK_HISTORY: string;
        GET_FEEDBACK_PERFORMANCE: string;
        GET_FEEDBACK_INSIGHTS: string;
        GET_FEEDBACK_SENTIMENT: string;
        GET_FEEDBACK_RESPONSE_TIME: string;
        GET_FEEDBACK_IMPACT: string;
    };
};
export default SQLQueries;
//# sourceMappingURL=db_SQLQueries.d.ts.map