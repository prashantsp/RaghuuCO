"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimePeriod = exports.AnalyticsMetricType = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const logger_1 = require("@/utils/logger");
const cacheService_1 = __importDefault(require("@/services/cacheService"));
const db = new DatabaseService_1.DatabaseService();
var AnalyticsMetricType;
(function (AnalyticsMetricType) {
    AnalyticsMetricType["REVENUE"] = "revenue";
    AnalyticsMetricType["CASES"] = "cases";
    AnalyticsMetricType["CLIENTS"] = "clients";
    AnalyticsMetricType["TIME_TRACKING"] = "time_tracking";
    AnalyticsMetricType["PRODUCTIVITY"] = "productivity";
    AnalyticsMetricType["DOCUMENTS"] = "documents";
    AnalyticsMetricType["EXPENSES"] = "expenses";
    AnalyticsMetricType["USER_ACTIVITY"] = "user_activity";
})(AnalyticsMetricType || (exports.AnalyticsMetricType = AnalyticsMetricType = {}));
var TimePeriod;
(function (TimePeriod) {
    TimePeriod["DAY"] = "day";
    TimePeriod["WEEK"] = "week";
    TimePeriod["MONTH"] = "month";
    TimePeriod["QUARTER"] = "quarter";
    TimePeriod["YEAR"] = "year";
})(TimePeriod || (exports.TimePeriod = TimePeriod = {}));
class AnalyticsService {
    async getBusinessAnalytics(period = TimePeriod.MONTH) {
        try {
            const cacheKey = `business_analytics:${period}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const analytics = {
                revenue: await this.getRevenueAnalytics(period),
                cases: await this.getCaseAnalytics(period),
                clients: await this.getClientAnalytics(period),
                productivity: await this.getProductivityAnalytics(period),
                expenses: await this.getExpenseAnalytics(period),
                userActivity: await this.getUserActivityAnalytics(period),
                documents: await this.getDocumentAnalytics(period),
                timeTracking: await this.getTimeTrackingAnalytics(period)
            };
            await cacheService_1.default.set(cacheKey, analytics, 3600);
            return analytics;
        }
        catch (error) {
            logger_1.logger.error('Error getting business analytics:', error);
            throw error;
        }
    }
    async getRevenueAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_invoices,
        AVG(amount) as average_invoice,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_revenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_revenue,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue_revenue,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_invoices
      FROM invoices 
      WHERE created_at >= $1
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const trends = await this.getRevenueTrends(period);
        return {
            summary: {
                totalRevenue: parseFloat(data.total_revenue) || 0,
                totalInvoices: parseInt(data.total_invoices) || 0,
                averageInvoice: parseFloat(data.average_invoice) || 0,
                paidRevenue: parseFloat(data.paid_revenue) || 0,
                pendingRevenue: parseFloat(data.pending_revenue) || 0,
                overdueRevenue: parseFloat(data.overdue_revenue) || 0,
                paidInvoices: parseInt(data.paid_invoices) || 0,
                pendingInvoices: parseInt(data.pending_invoices) || 0,
                overdueInvoices: parseInt(data.overdue_invoices) || 0
            },
            trends,
            period
        };
    }
    async getCaseAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cases,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_cases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_cases,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_cases,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_cases,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_cases,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_case_duration_days
      FROM cases 
      WHERE created_at >= $1 AND status != 'deleted'
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const trends = await this.getCaseTrends(period);
        return {
            summary: {
                totalCases: parseInt(data.total_cases) || 0,
                activeCases: parseInt(data.active_cases) || 0,
                closedCases: parseInt(data.closed_cases) || 0,
                pendingCases: parseInt(data.pending_cases) || 0,
                highPriorityCases: parseInt(data.high_priority_cases) || 0,
                mediumPriorityCases: parseInt(data.medium_priority_cases) || 0,
                lowPriorityCases: parseInt(data.low_priority_cases) || 0,
                averageCaseDuration: parseFloat(data.avg_case_duration_days) || 0
            },
            trends,
            period
        };
    }
    async getClientAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN client_type = 'individual' THEN 1 END) as individual_clients,
        COUNT(CASE WHEN client_type = 'corporate' THEN 1 END) as corporate_clients,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_clients,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_clients,
        AVG((
          SELECT COUNT(*) 
          FROM cases 
          WHERE client_id = clients.id AND status != 'deleted'
        )) as avg_cases_per_client
      FROM clients 
      WHERE is_active = true
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const trends = await this.getClientTrends(period);
        return {
            summary: {
                totalClients: parseInt(data.total_clients) || 0,
                individualClients: parseInt(data.individual_clients) || 0,
                corporateClients: parseInt(data.corporate_clients) || 0,
                activeClients: parseInt(data.active_clients) || 0,
                newClients: parseInt(data.new_clients) || 0,
                averageCasesPerClient: parseFloat(data.avg_cases_per_client) || 0
            },
            trends,
            period
        };
    }
    async getProductivityAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(DISTINCT c.id) as cases_assigned,
        COUNT(DISTINCT t.id) as tasks_assigned,
        COUNT(DISTINCT te.id) as time_entries,
        SUM(te.duration_minutes) as total_minutes,
        AVG(te.duration_minutes) as avg_session_minutes,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks
      FROM users u
      LEFT JOIN cases c ON u.id = c.assigned_to AND c.created_at >= $1
      LEFT JOIN tasks t ON u.id = t.assigned_to AND t.created_at >= $1
      LEFT JOIN time_entries te ON u.id = te.user_id AND te.date >= $1::date
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY total_minutes DESC NULLS LAST
    `;
        const result = await db.query(sql, [timeFilter]);
        const productivityMetrics = result.map(row => ({
            userId: row.id,
            name: `${row.first_name} ${row.last_name}`,
            role: row.role,
            casesAssigned: parseInt(row.cases_assigned) || 0,
            tasksAssigned: parseInt(row.tasks_assigned) || 0,
            timeEntries: parseInt(row.time_entries) || 0,
            totalMinutes: parseInt(row.total_minutes) || 0,
            averageSessionMinutes: parseFloat(row.avg_session_minutes) || 0,
            completedTasks: parseInt(row.completed_tasks) || 0,
            inProgressTasks: parseInt(row.in_progress_tasks) || 0,
            pendingTasks: parseInt(row.pending_tasks) || 0,
            taskCompletionRate: row.tasks_assigned > 0 ?
                (parseInt(row.completed_tasks) / parseInt(row.tasks_assigned)) * 100 : 0,
            billableHours: parseInt(row.total_minutes) / 60
        }));
        return {
            userProductivity: productivityMetrics,
            summary: {
                totalUsers: productivityMetrics.length,
                totalBillableHours: productivityMetrics.reduce((sum, user) => sum + user.billableHours, 0),
                averageTaskCompletionRate: productivityMetrics.reduce((sum, user) => sum + user.taskCompletionRate, 0) / productivityMetrics.length,
                mostProductiveUser: productivityMetrics.length > 0 ? productivityMetrics.reduce((max, user) => user.billableHours > max.billableHours ? user : max, productivityMetrics[0]) : null
            },
            period
        };
    }
    async getExpenseAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        SUM(amount) as total_expenses,
        COUNT(*) as total_expense_entries,
        AVG(amount) as average_expense,
        SUM(CASE WHEN is_approved = true THEN amount ELSE 0 END) as approved_expenses,
        SUM(CASE WHEN is_approved = false THEN amount ELSE 0 END) as pending_expenses,
        COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_count,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_count
      FROM expenses 
      WHERE expense_date >= $1
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const categoryBreakdown = await this.getExpenseCategoryBreakdown(period);
        return {
            summary: {
                totalExpenses: parseFloat(data.total_expenses) || 0,
                totalExpenseEntries: parseInt(data.total_expense_entries) || 0,
                averageExpense: parseFloat(data.average_expense) || 0,
                approvedExpenses: parseFloat(data.approved_expenses) || 0,
                pendingExpenses: parseFloat(data.pending_expenses) || 0,
                approvedCount: parseInt(data.approved_count) || 0,
                pendingCount: parseInt(data.pending_count) || 0
            },
            categoryBreakdown,
            period
        };
    }
    async getUserActivityAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.role,
        COUNT(al.id) as total_actions,
        COUNT(CASE WHEN al.action = 'login' THEN 1 END) as logins,
        COUNT(CASE WHEN al.action = 'data_access' THEN 1 END) as data_access,
        COUNT(CASE WHEN al.action = 'document_upload' THEN 1 END) as document_uploads,
        COUNT(CASE WHEN al.action = 'case_update' THEN 1 END) as case_updates,
        MAX(al.created_at) as last_activity
      FROM users u
      LEFT JOIN audit_logs al ON u.id = al.user_id AND al.created_at >= $1
      WHERE u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name, u.role
      ORDER BY total_actions DESC
    `;
        const result = await db.query(sql, [timeFilter]);
        const userActivity = result.map(row => ({
            userId: row.id,
            name: `${row.first_name} ${row.last_name}`,
            role: row.role,
            totalActions: parseInt(row.total_actions) || 0,
            logins: parseInt(row.logins) || 0,
            dataAccess: parseInt(row.data_access) || 0,
            documentUploads: parseInt(row.document_uploads) || 0,
            caseUpdates: parseInt(row.case_updates) || 0,
            lastActivity: row.last_activity
        }));
        return {
            userActivity,
            summary: {
                totalUsers: userActivity.length,
                totalActions: userActivity.reduce((sum, user) => sum + user.totalActions, 0),
                mostActiveUser: userActivity.length > 0 ? userActivity.reduce((max, user) => user.totalActions > max.totalActions ? user : max, userActivity[0]) : null,
                averageActionsPerUser: userActivity.reduce((sum, user) => sum + user.totalActions, 0) / userActivity.length
            },
            period
        };
    }
    async getDocumentAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN file_type = 'pdf' THEN 1 END) as pdf_documents,
        COUNT(CASE WHEN file_type = 'doc' OR file_type = 'docx' THEN 1 END) as word_documents,
        COUNT(CASE WHEN file_type = 'xls' OR file_type = 'xlsx' THEN 1 END) as excel_documents,
        COUNT(CASE WHEN is_encrypted = true THEN 1 END) as encrypted_documents,
        AVG(file_size) as average_file_size,
        SUM(file_size) as total_storage_used
      FROM documents 
      WHERE created_at >= $1 AND is_deleted = false
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const trends = await this.getDocumentTrends(period);
        return {
            summary: {
                totalDocuments: parseInt(data.total_documents) || 0,
                pdfDocuments: parseInt(data.pdf_documents) || 0,
                wordDocuments: parseInt(data.word_documents) || 0,
                excelDocuments: parseInt(data.excel_documents) || 0,
                encryptedDocuments: parseInt(data.encrypted_documents) || 0,
                averageFileSize: parseFloat(data.average_file_size) || 0,
                totalStorageUsed: parseFloat(data.total_storage_used) || 0
            },
            trends,
            period
        };
    }
    async getTimeTrackingAnalytics(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        COUNT(*) as total_entries,
        SUM(duration_minutes) as total_minutes,
        AVG(duration_minutes) as average_session,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(DISTINCT case_id) as cases_with_time,
        COUNT(DISTINCT task_id) as tasks_with_time
      FROM time_entries 
      WHERE date >= $1
    `;
        const result = await db.query(sql, [timeFilter]);
        const data = result[0];
        const trends = await this.getTimeTrackingTrends(period);
        return {
            summary: {
                totalEntries: parseInt(data.total_entries) || 0,
                totalMinutes: parseInt(data.total_minutes) || 0,
                totalHours: parseInt(data.total_minutes) / 60,
                averageSession: parseFloat(data.average_session) || 0,
                activeUsers: parseInt(data.active_users) || 0,
                casesWithTime: parseInt(data.cases_with_time) || 0,
                tasksWithTime: parseInt(data.tasks_with_time) || 0
            },
            trends,
            period
        };
    }
    async getRevenueTrends(period) {
        const timeFilter = this.getTimeFilter(period);
        const groupBy = this.getGroupByClause(period);
        const sql = `
      SELECT 
        ${groupBy} as period,
        SUM(amount) as revenue,
        COUNT(*) as invoices
      FROM invoices 
      WHERE created_at >= $1
      GROUP BY ${groupBy}
      ORDER BY period
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    async getCaseTrends(period) {
        const timeFilter = this.getTimeFilter(period);
        const groupBy = this.getGroupByClause(period);
        const sql = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_cases,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_cases
      FROM cases 
      WHERE created_at >= $1 AND status != 'deleted'
      GROUP BY ${groupBy}
      ORDER BY period
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    async getClientTrends(period) {
        const timeFilter = this.getTimeFilter(period);
        const groupBy = this.getGroupByClause(period);
        const sql = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as new_clients,
        COUNT(CASE WHEN client_type = 'individual' THEN 1 END) as individual_clients,
        COUNT(CASE WHEN client_type = 'corporate' THEN 1 END) as corporate_clients
      FROM clients 
      WHERE created_at >= $1 AND is_active = true
      GROUP BY ${groupBy}
      ORDER BY period
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    async getExpenseCategoryBreakdown(period) {
        const timeFilter = this.getTimeFilter(period);
        const sql = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount
      FROM expenses 
      WHERE expense_date >= $1
      GROUP BY category
      ORDER BY total_amount DESC
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    async getDocumentTrends(period) {
        const timeFilter = this.getTimeFilter(period);
        const groupBy = this.getGroupByClause(period);
        const sql = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as documents,
        SUM(file_size) as storage_used
      FROM documents 
      WHERE created_at >= $1 AND is_deleted = false
      GROUP BY ${groupBy}
      ORDER BY period
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    async getTimeTrackingTrends(period) {
        const timeFilter = this.getTimeFilter(period);
        const groupBy = this.getGroupByClause(period);
        const sql = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as entries,
        SUM(duration_minutes) as total_minutes,
        COUNT(DISTINCT user_id) as active_users
      FROM time_entries 
      WHERE date >= $1
      GROUP BY ${groupBy}
      ORDER BY period
    `;
        const result = await db.query(sql, [timeFilter]);
        return result;
    }
    getTimeFilter(period) {
        const now = new Date();
        switch (period) {
            case TimePeriod.DAY:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            case TimePeriod.WEEK:
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            case TimePeriod.MONTH:
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            case TimePeriod.QUARTER:
                return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
            case TimePeriod.YEAR:
                return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        }
    }
    getGroupByClause(period) {
        switch (period) {
            case TimePeriod.DAY:
                return 'DATE(created_at)';
            case TimePeriod.WEEK:
                return 'DATE_TRUNC(\'week\', created_at)';
            case TimePeriod.MONTH:
                return 'DATE_TRUNC(\'month\', created_at)';
            case TimePeriod.QUARTER:
                return 'DATE_TRUNC(\'quarter\', created_at)';
            case TimePeriod.YEAR:
                return 'DATE_TRUNC(\'year\', created_at)';
            default:
                return 'DATE_TRUNC(\'month\', created_at)';
        }
    }
    async createBIReport(name, description, type, query, filters = {}) {
        try {
            const report = {
                id: this.generateReportId(),
                name,
                description,
                type,
                data: null,
                filters,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const result = await db.query(query, Object.values(filters));
            report.data = result;
            await db.query(`
        INSERT INTO bi_reports (
          id, name, description, type, query, filters, data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
                report.id,
                report.name,
                report.description,
                report.type,
                query,
                JSON.stringify(filters),
                JSON.stringify(report.data),
                report.createdAt,
                report.updatedAt
            ]);
            logger_1.logger.info(`BI report created: ${report.id}`);
            return report;
        }
        catch (error) {
            logger_1.logger.error('Error creating BI report:', error);
            throw error;
        }
    }
    async getBIReports() {
        try {
            const result = await db.query(`
        SELECT * FROM bi_reports 
        ORDER BY updated_at DESC
      `);
            return result.map(row => ({
                ...row,
                filters: JSON.parse(row.filters || '{}'),
                data: JSON.parse(row.data || '[]')
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting BI reports:', error);
            throw error;
        }
    }
    generateReportId() {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.default = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map