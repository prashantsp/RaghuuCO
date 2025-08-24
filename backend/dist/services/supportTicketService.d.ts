export declare enum TicketPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum TicketStatus {
    OPEN = "open",
    IN_PROGRESS = "in-progress",
    RESOLVED = "resolved",
    CLOSED = "closed",
    ESCALATED = "escalated"
}
export declare enum TicketCategory {
    TECHNICAL = "technical",
    BILLING = "billing",
    TRAINING = "training",
    FEATURE_REQUEST = "feature_request",
    BUG_REPORT = "bug_report",
    GENERAL = "general"
}
export interface SupportTicket {
    id: string;
    userId: string;
    subject: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    category: TicketCategory;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    resolution?: string;
    attachments?: string[];
    tags?: string[];
    estimatedResolutionTime?: Date;
    actualResolutionTime?: Date;
    userSatisfaction?: number;
    internalNotes?: string;
}
export interface TicketComment {
    id: string;
    ticketId: string;
    userId: string;
    comment: string;
    isInternal: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TicketStatistics {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    userSatisfaction: number;
    ticketsByPriority: Record<TicketPriority, number>;
    ticketsByCategory: Record<TicketCategory, number>;
    ticketsByStatus: Record<TicketStatus, number>;
}
declare class SupportTicketService {
    createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<SupportTicket>;
    getTicketById(ticketId: string, userId: string): Promise<SupportTicket | null>;
    getUserTickets(userId: string, filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
        limit?: number;
        offset?: number;
    }): Promise<SupportTicket[]>;
    getAllTickets(userId: string, filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        category?: TicketCategory;
        assignedTo?: string;
        limit?: number;
        offset?: number;
    }): Promise<SupportTicket[]>;
    updateTicketStatus(ticketId: string, status: TicketStatus, userId: string): Promise<SupportTicket>;
    assignTicket(ticketId: string, assignedTo: string, userId: string): Promise<SupportTicket>;
    addComment(ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<TicketComment>;
    getTicketStatistics(userId: string, filters?: {
        startDate?: Date;
        endDate?: Date;
        category?: TicketCategory;
    }): Promise<TicketStatistics>;
    resolveTicket(ticketId: string, resolution: string, userId: string): Promise<SupportTicket>;
    rateTicketSatisfaction(ticketId: string, rating: number, userId: string): Promise<void>;
    private generateTicketId;
    private generateCommentId;
    private canUserAccessTicket;
    private canUserUpdateTicket;
    private mapTicketFromRow;
    private mapStatisticsFromRow;
    private notifySupportTeam;
    private sendTicketConfirmation;
    private notifyUserOfStatusChange;
    private notifyAssignedUser;
    private notifyCommentAdded;
    private sendResolutionNotification;
}
declare const _default: SupportTicketService;
export default _default;
//# sourceMappingURL=supportTicketService.d.ts.map