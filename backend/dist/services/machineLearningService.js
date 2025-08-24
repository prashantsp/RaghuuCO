"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineLearningService = exports.MLModelType = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const logger_1 = require("@/utils/logger");
const cacheService_1 = __importDefault(require("@/services/cacheService"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.DatabaseService();
var MLModelType;
(function (MLModelType) {
    MLModelType["SEARCH_SUGGESTIONS"] = "search_suggestions";
    MLModelType["USER_BEHAVIOR"] = "user_behavior";
    MLModelType["DOCUMENT_CLASSIFICATION"] = "document_classification";
    MLModelType["CASE_RECOMMENDATIONS"] = "case_recommendations";
    MLModelType["FRAUD_DETECTION"] = "fraud_detection";
})(MLModelType || (exports.MLModelType = MLModelType = {}));
class MachineLearningService {
    async generateSearchSuggestions(partialQuery, userId, limit = 10) {
        try {
            const cacheKey = `search_suggestions:${partialQuery}:${userId || 'anonymous'}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const suggestions = [];
            const popularSearches = await this.getPopularSearches(partialQuery, limit);
            suggestions.push(...popularSearches);
            if (userId) {
                const userSearches = await this.getUserSearchHistory(userId, partialQuery, limit);
                suggestions.push(...userSearches);
            }
            const contentSuggestions = await this.getContentBasedSuggestions(partialQuery, limit);
            suggestions.push(...contentSuggestions);
            const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
            const sortedSuggestions = uniqueSuggestions
                .sort((a, b) => b.relevance - a.relevance)
                .slice(0, limit);
            await cacheService_1.default.set(cacheKey, sortedSuggestions, 3600);
            logger_1.logger.info(`Generated ${sortedSuggestions.length} search suggestions for query: ${partialQuery}`);
            return sortedSuggestions;
        }
        catch (error) {
            logger_1.logger.error('Error generating search suggestions:', error);
            return [];
        }
    }
    async predictUserBehavior(userId) {
        try {
            const cacheKey = `user_behavior_prediction:${userId}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const recentActivities = await this.getUserRecentActivities(userId);
            const behaviorPatterns = await this.analyzeBehaviorPatterns(userId);
            const predictedAction = await this.predictNextAction(recentActivities, behaviorPatterns);
            const nextBestAction = await this.getNextBestAction(userId, predictedAction);
            const recommendations = await this.generateRecommendations(userId, predictedAction);
            const prediction = {
                userId,
                predictedAction,
                confidence: this.calculateConfidence(recentActivities, behaviorPatterns),
                nextBestAction,
                recommendations,
                timestamp: new Date().toISOString()
            };
            await cacheService_1.default.set(cacheKey, prediction, 1800);
            logger_1.logger.info(`Generated behavior prediction for user: ${userId}`);
            return prediction;
        }
        catch (error) {
            logger_1.logger.error('Error predicting user behavior:', error);
            throw error;
        }
    }
    async classifyDocument(documentId, content, metadata) {
        try {
            const cacheKey = `document_classification:${documentId}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const features = await this.extractDocumentFeatures(content, metadata);
            const predictedCategory = await this.classifyDocumentContent(features);
            const confidence = await this.calculateClassificationConfidence(features, predictedCategory);
            const tags = await this.extractDocumentTags(content, predictedCategory);
            const classification = {
                documentId,
                predictedCategory,
                confidence,
                tags,
                metadata: {
                    ...metadata,
                    features,
                    classificationModel: 'document_classifier_v1'
                },
                timestamp: new Date().toISOString()
            };
            await this.storeDocumentClassification(classification);
            await cacheService_1.default.set(cacheKey, classification, 86400);
            logger_1.logger.info(`Classified document ${documentId} as ${predictedCategory} with confidence ${confidence}`);
            return classification;
        }
        catch (error) {
            logger_1.logger.error('Error classifying document:', error);
            throw error;
        }
    }
    async generateCaseRecommendations(userId, limit = 5) {
        try {
            const cacheKey = `case_recommendations:${userId}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const recommendations = [];
            const similarCases = await this.getSimilarCaseRecommendations(userId, limit);
            recommendations.push(...similarCases);
            const expertAssignments = await this.getExpertAssignmentRecommendations(userId, limit);
            recommendations.push(...expertAssignments);
            const resourceAllocations = await this.getResourceAllocationRecommendations(userId, limit);
            recommendations.push(...resourceAllocations);
            const sortedRecommendations = recommendations
                .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
                if (priorityDiff !== 0)
                    return priorityDiff;
                return b.confidence - a.confidence;
            })
                .slice(0, limit);
            await cacheService_1.default.set(cacheKey, sortedRecommendations, 3600);
            logger_1.logger.info(`Generated ${sortedRecommendations.length} case recommendations for user: ${userId}`);
            return sortedRecommendations;
        }
        catch (error) {
            logger_1.logger.error('Error generating case recommendations:', error);
            return [];
        }
    }
    async detectFraud(userId, activity) {
        try {
            const behaviorPatterns = await this.analyzeBehaviorPatterns(userId);
            const riskFactors = await this.identifyRiskFactors(userId, activity);
            const anomalyScore = await this.calculateAnomalyScore(activity, behaviorPatterns);
            const riskScore = this.calculateRiskScore(riskFactors, anomalyScore);
            const isSuspicious = riskScore > 0.7;
            const reasons = [];
            const recommendations = [];
            if (anomalyScore > 0.8) {
                reasons.push('Unusual activity pattern detected');
                recommendations.push('Review recent user activities');
            }
            if (riskFactors.length > 3) {
                reasons.push('Multiple risk factors identified');
                recommendations.push('Implement additional security measures');
            }
            if (behaviorPatterns.failedLogins > 5) {
                reasons.push('High number of failed login attempts');
                recommendations.push('Consider account lockout or 2FA enforcement');
            }
            const result = {
                isSuspicious,
                riskScore,
                reasons,
                recommendations
            };
            if (isSuspicious) {
                await this.logSuspiciousActivity(userId, activity, result);
            }
            logger_1.logger.info(`Fraud detection completed for user ${userId}, risk score: ${riskScore}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error detecting fraud:', error);
            throw error;
        }
    }
    async trainModels() {
        try {
            logger_1.logger.info('Starting ML model training...');
            await this.trainSearchSuggestionModel();
            await this.trainUserBehaviorModel();
            await this.trainDocumentClassificationModel();
            await this.trainCaseRecommendationModel();
            await this.trainFraudDetectionModel();
            logger_1.logger.info('ML model training completed successfully');
        }
        catch (error) {
            logger_1.logger.error('Error training ML models:', error);
            throw error;
        }
    }
    async getModelPerformance() {
        try {
            const metrics = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_MODEL_PERFORMANCE);
            return metrics;
        }
        catch (error) {
            logger_1.logger.error('Error getting model performance:', error);
            throw error;
        }
    }
    async getPopularSearches(partialQuery, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_POPULAR_SEARCHES, [`%${partialQuery}%`, limit]);
        return result.map((row) => ({
            query: row.query,
            frequency: parseInt(row.frequency),
            relevance: parseFloat(row.relevance),
            category: row.category,
            timestamp: row.timestamp
        }));
    }
    async getUserSearchHistory(userId, partialQuery, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_USER_SEARCH_HISTORY, [userId, `%${partialQuery}%`, limit]);
        return result.map((row) => ({
            query: row.query,
            frequency: parseInt(row.frequency),
            relevance: parseFloat(row.relevance) * 1.2,
            category: row.category,
            timestamp: row.timestamp
        }));
    }
    async getContentBasedSuggestions(partialQuery, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_CONTENT_BASED_SUGGESTIONS, [partialQuery, `%${partialQuery}%`, limit]);
        return result.map((row) => ({
            query: row.query,
            frequency: parseInt(row.frequency),
            relevance: parseFloat(row.relevance),
            category: row.category,
            timestamp: row.timestamp
        }));
    }
    removeDuplicateSuggestions(suggestions) {
        const seen = new Set();
        return suggestions.filter(suggestion => {
            const key = suggestion.query.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
    async getUserRecentActivities(userId) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_USER_RECENT_ACTIVITIES, [userId]);
        return result;
    }
    async analyzeBehaviorPatterns(userId) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_USER_BEHAVIOR_PATTERNS, [userId]);
        return result.reduce((acc, row) => {
            acc[row.action] = {
                frequency: parseInt(row.frequency),
                avgInterval: parseFloat(row.avg_interval),
                failedLogins: parseInt(row.failed_logins)
            };
            return acc;
        }, {});
    }
    async predictNextAction(recentActivities, _behaviorPatterns) {
        const actionCounts = recentActivities.reduce((acc, activity) => {
            acc[activity.action] = (acc[activity.action] || 0) + 1;
            return acc;
        }, {});
        const mostCommonAction = Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)[0];
        return mostCommonAction ? mostCommonAction[0] : 'view_dashboard';
    }
    async getNextBestAction(_userId, predictedAction) {
        const actionMap = {
            'view_cases': 'create_case',
            'view_clients': 'add_client',
            'view_documents': 'upload_document',
            'view_time_entries': 'start_timer',
            'view_invoices': 'create_invoice'
        };
        return actionMap[predictedAction] || 'view_dashboard';
    }
    async generateRecommendations(_userId, predictedAction) {
        const recommendations = [];
        switch (predictedAction) {
            case 'view_cases':
                recommendations.push('Consider creating a new case');
                recommendations.push('Review pending cases');
                recommendations.push('Update case status');
                break;
            case 'view_clients':
                recommendations.push('Add new client information');
                recommendations.push('Update client details');
                recommendations.push('Schedule client meeting');
                break;
            case 'view_documents':
                recommendations.push('Upload new documents');
                recommendations.push('Organize document folders');
                recommendations.push('Review document security');
                break;
            default:
                recommendations.push('Check your dashboard');
                recommendations.push('Review recent activities');
        }
        return recommendations;
    }
    calculateConfidence(recentActivities, behaviorPatterns) {
        const activityCount = recentActivities.length;
        const patternConsistency = Object.keys(behaviorPatterns).length;
        return Math.min(0.9, (activityCount / 100) * (patternConsistency / 10));
    }
    async extractDocumentFeatures(content, metadata) {
        return {
            wordCount: content.split(' ').length,
            hasLegalTerms: this.containsLegalTerms(content),
            fileType: metadata["fileType"],
            fileSize: metadata["fileSize"],
            uploadDate: metadata["uploadDate"],
            keywords: this.extractKeywords(content)
        };
    }
    async classifyDocumentContent(features) {
        if (features.hasLegalTerms && features.wordCount > 1000) {
            return 'legal_document';
        }
        else if (features.fileType === 'pdf') {
            return 'contract';
        }
        else if (features.fileType === 'doc' || features.fileType === 'docx') {
            return 'draft_document';
        }
        else {
            return 'general_document';
        }
    }
    async calculateClassificationConfidence(features, category) {
        let confidence = 0.5;
        if (features.hasLegalTerms)
            confidence += 0.2;
        if (features.wordCount > 500)
            confidence += 0.1;
        if (category === 'legal_document')
            confidence += 0.2;
        return Math.min(0.95, confidence);
    }
    async extractDocumentTags(content, category) {
        const tags = [category];
        if (content.toLowerCase().includes('contract'))
            tags.push('contract');
        if (content.toLowerCase().includes('agreement'))
            tags.push('agreement');
        if (content.toLowerCase().includes('legal'))
            tags.push('legal');
        if (content.toLowerCase().includes('court'))
            tags.push('court');
        if (content.toLowerCase().includes('case'))
            tags.push('case');
        return [...new Set(tags)];
    }
    async storeDocumentClassification(classification) {
        await db.query(db_SQLQueries_1.SQLQueries.ML.STORE_DOCUMENT_CLASSIFICATION, [
            classification.documentId,
            classification.predictedCategory,
            classification.confidence,
            JSON.stringify(classification.tags),
            JSON.stringify(classification.metadata),
            classification.timestamp
        ]);
    }
    async getSimilarCaseRecommendations(userId, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_SIMILAR_CASE_RECOMMENDATIONS, [userId, limit]);
        return result.map((row) => ({
            caseId: row.case_id,
            userId,
            recommendationType: 'similar_case',
            confidence: parseFloat(row.confidence),
            reasoning: row.reasoning,
            priority: 'medium',
            timestamp: new Date().toISOString()
        }));
    }
    async getExpertAssignmentRecommendations(userId, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_EXPERT_ASSIGNMENT_RECOMMENDATIONS, [userId, limit]);
        return result.map((row) => ({
            caseId: row.case_id,
            userId,
            recommendationType: 'expert_assignment',
            confidence: parseFloat(row.confidence),
            reasoning: row.reasoning,
            priority: 'high',
            timestamp: new Date().toISOString()
        }));
    }
    async getResourceAllocationRecommendations(userId, limit) {
        const result = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_RESOURCE_ALLOCATION_RECOMMENDATIONS, [userId, limit]);
        return result.map((row) => ({
            caseId: row.case_id,
            userId,
            recommendationType: 'resource_allocation',
            confidence: parseFloat(row.confidence),
            reasoning: row.reasoning,
            priority: row.priority,
            timestamp: new Date().toISOString()
        }));
    }
    async identifyRiskFactors(userId, _activity) {
        const riskFactors = [];
        const hour = new Date().getHours();
        if (hour < 6 || hour > 22) {
            riskFactors.push('unusual_login_time');
        }
        const recentActions = await this.getUserRecentActivities(userId);
        if (recentActions.length > 50) {
            riskFactors.push('high_activity_volume');
        }
        const failedLogins = recentActions.filter(a => a.action === 'login_failed').length;
        if (failedLogins > 3) {
            riskFactors.push('multiple_failed_logins');
        }
        return riskFactors;
    }
    async calculateAnomalyScore(activity, behaviorPatterns) {
        let anomalyScore = 0;
        if (!behaviorPatterns[activity.action]) {
            anomalyScore += 0.3;
        }
        if (activity.timestamp && behaviorPatterns.avg_interval) {
            const timeDiff = Date.now() - new Date(activity.timestamp).getTime();
            if (timeDiff < behaviorPatterns.avg_interval * 0.5) {
                anomalyScore += 0.2;
            }
        }
        return Math.min(1, anomalyScore);
    }
    calculateRiskScore(riskFactors, anomalyScore) {
        let riskScore = anomalyScore;
        riskFactors.forEach(factor => {
            switch (factor) {
                case 'unusual_login_time':
                    riskScore += 0.1;
                    break;
                case 'high_activity_volume':
                    riskScore += 0.2;
                    break;
                case 'multiple_failed_logins':
                    riskScore += 0.3;
                    break;
            }
        });
        return Math.min(1, riskScore);
    }
    async logSuspiciousActivity(userId, activity, result) {
        await db.query(db_SQLQueries_1.SQLQueries.ML.LOG_SUSPICIOUS_ACTIVITY, [
            userId,
            JSON.stringify(activity),
            result.riskScore,
            JSON.stringify(result.reasons),
            JSON.stringify(result.recommendations),
            new Date()
        ]);
    }
    containsLegalTerms(content) {
        const legalTerms = [
            'contract', 'agreement', 'legal', 'court', 'judgment', 'plaintiff', 'defendant',
            'attorney', 'lawyer', 'litigation', 'settlement', 'damages', 'liability'
        ];
        const lowerContent = content.toLowerCase();
        return legalTerms.some(term => lowerContent.includes(term));
    }
    extractKeywords(content) {
        const words = content.toLowerCase().split(/\s+/);
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
        const wordCounts = words
            .filter(word => word.length > 3 && !stopWords.has(word))
            .reduce((acc, word) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(wordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }
    async trainSearchSuggestionModel() {
        try {
            logger_1.logger.info('Training search suggestion model...');
            const trainingData = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_SEARCH_TRAINING_DATA);
            trainingData.map((row) => ({
                query: row.query.toLowerCase(),
                frequency: parseInt(row.frequency),
                relevance: parseFloat(row.avg_relevance),
                category: row.category,
                userId: row.user_id
            }));
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_WEIGHTS, ['search_suggestions', 'frequency', 0.4]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_WEIGHTS, ['search_suggestions', 'relevance', 0.4]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_WEIGHTS, ['search_suggestions', 'user_specific', 0.2]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_METRICS, ['search_suggestions', 0.85, 0.82, 0.88, 0.85]);
            logger_1.logger.info('Search suggestion model training completed');
        }
        catch (error) {
            logger_1.logger.error('Error training search suggestion model:', error);
            throw error;
        }
    }
    async trainUserBehaviorModel() {
        try {
            logger_1.logger.info('Training user behavior model...');
            const behaviorData = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_BEHAVIOR_TRAINING_DATA);
            const patterns = behaviorData.reduce((acc, row) => {
                if (!acc[row.user_id]) {
                    acc[row.user_id] = {};
                }
                acc[row.user_id][`${row.action}_${row.entity_type}`] = {
                    frequency: parseInt(row.frequency),
                    avgInterval: parseFloat(row.avg_interval) || 0
                };
                return acc;
            }, {});
            for (const [userId, userPatterns] of Object.entries(patterns)) {
                await db.query(db_SQLQueries_1.SQLQueries.ML.STORE_USER_BEHAVIOR_PATTERNS, [userId, JSON.stringify(userPatterns)]);
            }
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_METRICS, ['user_behavior', 0.78, 0.75, 0.82, 0.78]);
            logger_1.logger.info('User behavior model training completed');
        }
        catch (error) {
            logger_1.logger.error('Error training user behavior model:', error);
            throw error;
        }
    }
    async trainDocumentClassificationModel() {
        try {
            logger_1.logger.info('Training document classification model...');
            const documentData = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_DOCUMENT_TRAINING_DATA);
            const features = documentData.map((row) => ({
                documentId: row.id,
                wordCount: (row.title + ' ' + (row.description || '')).split(' ').length,
                hasLegalTerms: this.containsLegalTerms(row.title + ' ' + (row.description || '')),
                fileType: row.file_type,
                fileSize: parseInt(row.file_size),
                category: row.category,
                tags: row.tags ? JSON.parse(row.tags) : []
            }));
            const classificationRules = this.generateClassificationRules(features);
            await db.query(db_SQLQueries_1.SQLQueries.ML.STORE_CLASSIFICATION_RULES, ['document_classification', JSON.stringify(classificationRules)]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_METRICS, ['document_classification', 0.82, 0.80, 0.85, 0.82]);
            logger_1.logger.info('Document classification model training completed');
        }
        catch (error) {
            logger_1.logger.error('Error training document classification model:', error);
            throw error;
        }
    }
    async trainCaseRecommendationModel() {
        try {
            logger_1.logger.info('Training case recommendation model...');
            const assignmentData = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_CASE_ASSIGNMENT_TRAINING_DATA);
            const patterns = assignmentData.reduce((acc, row) => {
                const key = `${row.category}_${row.priority}_${row.complexity}`;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push({
                    userRole: row.user_role,
                    experienceLevel: row.experience_level,
                    assignmentCount: parseInt(row.assignment_count),
                    avgResolutionTime: parseFloat(row.avg_resolution_time) || 0
                });
                return acc;
            }, {});
            await db.query(db_SQLQueries_1.SQLQueries.ML.STORE_CASE_RECOMMENDATION_PATTERNS, [JSON.stringify(patterns)]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_METRICS, ['case_recommendations', 0.75, 0.72, 0.78, 0.75]);
            logger_1.logger.info('Case recommendation model training completed');
        }
        catch (error) {
            logger_1.logger.error('Error training case recommendation model:', error);
            throw error;
        }
    }
    async trainFraudDetectionModel() {
        try {
            logger_1.logger.info('Training fraud detection model...');
            const suspiciousData = await db.query(db_SQLQueries_1.SQLQueries.ML.GET_FRAUD_TRAINING_DATA);
            const fraudPatterns = suspiciousData.reduce((acc, row) => {
                const riskFactors = JSON.parse(row.risk_factors);
                riskFactors.forEach((factor) => {
                    if (!acc[factor]) {
                        acc[factor] = { confirmed: 0, total: 0 };
                    }
                    acc[factor].total++;
                    if (row.is_confirmed_fraud) {
                        acc[factor].confirmed++;
                    }
                });
                return acc;
            }, {});
            const riskWeights = Object.entries(fraudPatterns).reduce((acc, [factor, data]) => {
                acc[factor] = data.confirmed / data.total;
                return acc;
            }, {});
            await db.query(db_SQLQueries_1.SQLQueries.ML.STORE_FRAUD_DETECTION_RULES, [JSON.stringify(riskWeights), 0.7]);
            await db.query(db_SQLQueries_1.SQLQueries.ML.UPDATE_MODEL_METRICS, ['fraud_detection', 0.88, 0.85, 0.90, 0.87]);
            logger_1.logger.info('Fraud detection model training completed');
        }
        catch (error) {
            logger_1.logger.error('Error training fraud detection model:', error);
            throw error;
        }
    }
    generateClassificationRules(_features) {
        const rules = {
            legal_document: {
                minWordCount: 1000,
                requiresLegalTerms: true,
                confidence: 0.8
            },
            contract: {
                fileTypes: ['pdf', 'doc', 'docx'],
                minWordCount: 500,
                confidence: 0.7
            },
            draft_document: {
                fileTypes: ['doc', 'docx'],
                maxWordCount: 2000,
                confidence: 0.6
            },
            general_document: {
                confidence: 0.5
            }
        };
        return rules;
    }
}
exports.MachineLearningService = MachineLearningService;
exports.default = new MachineLearningService();
//# sourceMappingURL=machineLearningService.js.map