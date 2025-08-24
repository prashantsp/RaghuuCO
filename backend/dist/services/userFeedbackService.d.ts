export declare enum FeedbackCategory {
    BUG = "bug",
    FEATURE = "feature",
    IMPROVEMENT = "improvement",
    GENERAL = "general",
    USABILITY = "usability",
    PERFORMANCE = "performance",
    SECURITY = "security"
}
export declare enum FeedbackStatus {
    NEW = "new",
    REVIEWED = "reviewed",
    IMPLEMENTED = "implemented",
    DECLINED = "declined",
    IN_PROGRESS = "in_progress"
}
export interface UserFeedback {
    id: string;
    userId: string;
    feature: string;
    rating: number;
    comment?: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    timestamp: Date;
    reviewedBy?: string;
    reviewedAt?: Date;
    response?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
    attachments?: string[];
    userAgent?: string;
    browser?: string;
    device?: string;
    location?: string;
    sessionId?: string;
}
export interface FeedbackStatistics {
    totalFeedback: number;
    averageRating: number;
    feedbackByCategory: Record<FeedbackCategory, number>;
    feedbackByStatus: Record<FeedbackStatus, number>;
    feedbackByPriority: Record<string, number>;
    recentFeedback: number;
    satisfactionTrend: number;
    topFeatures: Array<{
        feature: string;
        rating: number;
        count: number;
    }>;
    topIssues: Array<{
        category: string;
        count: number;
        avgRating: number;
    }>;
}
declare class UserFeedbackService {
    submitFeedback(feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>, userId: string): Promise<UserFeedback>;
    getFeedbackById(feedbackId: string, userId: string): Promise<UserFeedback | null>;
    getUserFeedback(userId: string, filters?: {
        category?: FeedbackCategory;
        status?: FeedbackStatus;
        limit?: number;
        offset?: number;
    }): Promise<UserFeedback[]>;
    getAllFeedback(userId: string, filters?: {
        category?: FeedbackCategory;
        status?: FeedbackStatus;
        priority?: string;
        limit?: number;
        offset?: number;
    }): Promise<UserFeedback[]>;
    updateFeedbackStatus(feedbackId: string, status: FeedbackStatus, userId: string, response?: string): Promise<UserFeedback>;
    getFeedbackStatistics(userId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        category?: FeedbackCategory;
    }): Promise<FeedbackStatistics>;
    searchFeedback(searchTerm: string, userId: string): Promise<UserFeedback[]>;
    getFeedbackTrends(userId: string, days?: number): Promise<any>;
    getFeatureFeedback(feature: string, userId: string): Promise<UserFeedback[]>;
    getFeedbackAnalytics(userId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        category?: FeedbackCategory;
    }): Promise<any>;
    private generateFeedbackId;
    private canUserAccessFeedback;
    private mapFeedbackFromRow;
    private mapStatisticsFromRow;
    private notifyAdminTeam;
    private sendFeedbackConfirmation;
    private notifyUserOfStatusChange;
}
declare const _default: UserFeedbackService;
export default _default;
//# sourceMappingURL=userFeedbackService.d.ts.map