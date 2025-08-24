export declare enum MLModelType {
    SEARCH_SUGGESTIONS = "search_suggestions",
    USER_BEHAVIOR = "user_behavior",
    DOCUMENT_CLASSIFICATION = "document_classification",
    CASE_RECOMMENDATIONS = "case_recommendations",
    FRAUD_DETECTION = "fraud_detection"
}
export interface SearchSuggestion {
    query: string;
    frequency: number;
    relevance: number;
    category: string;
    timestamp: string;
}
export interface UserBehaviorPrediction {
    userId: string;
    predictedAction: string;
    confidence: number;
    nextBestAction: string;
    recommendations: string[];
    timestamp: string;
}
export interface DocumentClassification {
    documentId: string;
    predictedCategory: string;
    confidence: number;
    tags: string[];
    metadata: Record<string, any>;
    timestamp: string;
}
export interface CaseRecommendation {
    caseId: string;
    userId: string;
    recommendationType: 'similar_case' | 'expert_assignment' | 'resource_allocation';
    confidence: number;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
    timestamp: string;
}
declare class MachineLearningService {
    generateSearchSuggestions(partialQuery: string, userId?: string, limit?: number): Promise<SearchSuggestion[]>;
    predictUserBehavior(userId: string): Promise<UserBehaviorPrediction>;
    classifyDocument(documentId: string, content: string, metadata: Record<string, any>): Promise<DocumentClassification>;
    generateCaseRecommendations(userId: string, limit?: number): Promise<CaseRecommendation[]>;
    detectFraud(userId: string, activity: any): Promise<{
        isSuspicious: boolean;
        riskScore: number;
        reasons: string[];
        recommendations: string[];
    }>;
    trainModels(): Promise<void>;
    getModelPerformance(): Promise<any>;
    private getPopularSearches;
    private getUserSearchHistory;
    private getContentBasedSuggestions;
    private removeDuplicateSuggestions;
    private getUserRecentActivities;
    private analyzeBehaviorPatterns;
    private findSimilarUsers;
    private predictNextAction;
    private getNextBestAction;
    private generateRecommendations;
    private calculateConfidence;
    private extractDocumentFeatures;
    private classifyDocumentContent;
    private calculateClassificationConfidence;
    private extractDocumentTags;
    private storeDocumentClassification;
    private getSimilarCaseRecommendations;
    private getExpertAssignmentRecommendations;
    private getResourceAllocationRecommendations;
    private identifyRiskFactors;
    private calculateAnomalyScore;
    private calculateRiskScore;
    private logSuspiciousActivity;
    private containsLegalTerms;
    private extractKeywords;
    private trainSearchSuggestionModel;
    private trainUserBehaviorModel;
    private trainDocumentClassificationModel;
    private trainCaseRecommendationModel;
    private trainFraudDetectionModel;
    private generateClassificationRules;
}
declare const _default: MachineLearningService;
export default _default;
export { MachineLearningService, MLModelType };
//# sourceMappingURL=machineLearningService.d.ts.map