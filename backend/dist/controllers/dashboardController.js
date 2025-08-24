"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = exports.getRecentActivities = exports.getDashboardStats = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Fetching dashboard statistics', { userId });
        const statsResult = await db.query(db_SQLQueries_1.SQLQueries.DASHBOARD.GET_USER_STATS, [userId]);
        const userStats = statsResult[0];
        const stats = {
            cases: {
                count: parseInt(userStats.cases_count || '0'),
                trend: 5
            },
            clients: {
                count: parseInt(userStats.clients_count || '0'),
                trend: 12
            },
            documents: {
                count: parseInt(userStats.documents_count || '0'),
                trend: 8
            },
            time_entries: {
                count: parseInt(userStats.time_entries_count || '0'),
                trend: -3
            },
            calendar_events: {
                count: parseInt(userStats.calendar_events_count || '0'),
                trend: 15
            },
            billing: {
                count: parseInt(userStats.invoices_count || '0'),
                trend: 20
            }
        };
        logger_1.default.info('Dashboard statistics fetched successfully', { userId, stats });
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DASHBOARD_STATS_ERROR',
                message: 'Failed to fetch dashboard statistics'
            }
        });
    }
};
exports.getDashboardStats = getDashboardStats;
const getRecentActivities = async (req, res) => {
    try {
        const userId = req.user?.id;
        const limit = parseInt(req.query.limit) || 10;
        logger_1.default.info('Fetching recent activities', { userId, limit });
        const activities = await db.query(db_SQLQueries_1.SQLQueries.DASHBOARD.GET_RECENT_ACTIVITIES, [userId, limit]);
        const formattedActivities = activities.rows.map((activity) => ({
            id: activity.id,
            type: activity.resource_type,
            action: activity.action,
            description: `${activity.action.replace('_', ' ')} ${activity.resource_type}`,
            createdAt: activity.created_at,
            icon: getActivityIcon(activity.resource_type),
            resourceId: activity.resource_id
        }));
        logger_1.default.info('Recent activities fetched successfully', { userId, count: formattedActivities.length });
        res.json({
            success: true,
            data: {
                activities: formattedActivities
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching recent activities', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DASHBOARD_ACTIVITIES_ERROR',
                message: 'Failed to fetch recent activities'
            }
        });
    }
};
exports.getRecentActivities = getRecentActivities;
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user?.id;
        logger_1.default.info('Fetching dashboard summary', { userId });
        const trendsResult = await db.query(db_SQLQueries_1.SQLQueries.DASHBOARD.GET_USER_TRENDS, ['active', userId]);
        const trends = trendsResult[0];
        const summary = {
            activeCases: parseInt(trends.active_cases || '0'),
            pendingTasks: parseInt(trends.upcoming_events || '0'),
            upcomingEvents: parseInt(trends.events_this_week || '0'),
            recentDocuments: parseInt(trends.recent_documents || '0')
        };
        logger_1.default.info('Dashboard summary fetched successfully', { userId, summary });
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard summary', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'DASHBOARD_SUMMARY_ERROR',
                message: 'Failed to fetch dashboard summary'
            }
        });
    }
};
exports.getDashboardSummary = getDashboardSummary;
function getActivityIcon(resourceType) {
    const icons = {
        user: 'person',
        client: 'people',
        case: 'business',
        document: 'description',
        time_entry: 'schedule',
        calendar_event: 'event',
        invoice: 'payment'
    };
    return icons[resourceType] || 'assignment';
}
exports.default = {
    getDashboardStats: exports.getDashboardStats,
    getRecentActivities: exports.getRecentActivities,
    getDashboardSummary: exports.getDashboardSummary
};
//# sourceMappingURL=dashboardController.js.map