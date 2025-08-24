export declare enum AnalyticsMetricType {
    REVENUE = "revenue",
    CASES = "cases",
    CLIENTS = "clients",
    TIME_TRACKING = "time_tracking",
    PRODUCTIVITY = "productivity",
    DOCUMENTS = "documents",
    EXPENSES = "expenses",
    USER_ACTIVITY = "user_activity"
}
export declare enum TimePeriod {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
    YEAR = "year"
}
export interface AnalyticsData {
    metric: string;
    value: number;
    previousValue?: number;
    change?: number;
    changePercent?: number;
    period: TimePeriod;
    timestamp: string;
    metadata?: Record<string, any>;
}
export interface BIReport {
    id: string;
    name: string;
    description: string;
    type: string;
    data: any;
    filters: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
declare class AnalyticsService {
    getBusinessAnalytics(period?: TimePeriod): Promise<any>;
    private getRevenueAnalytics;
    private getCaseAnalytics;
    private getClientAnalytics;
    private getProductivityAnalytics;
    private getExpenseAnalytics;
    private getUserActivityAnalytics;
    private getDocumentAnalytics;
    private getTimeTrackingAnalytics;
    private getRevenueTrends;
    private getCaseTrends;
    private getClientTrends;
    private getExpenseCategoryBreakdown;
    private getDocumentTrends;
    private getTimeTrackingTrends;
    private getTimeFilter;
    private getGroupByClause;
    createBIReport(name: string, description: string, type: string, query: string, filters?: Record<string, any>): Promise<BIReport>;
    getBIReports(): Promise<BIReport[]>;
    private generateReportId;
}
declare const _default: AnalyticsService;
export default _default;
export { AnalyticsService, AnalyticsMetricType, TimePeriod };
//# sourceMappingURL=analyticsService.d.ts.map