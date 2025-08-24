"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentStats = exports.trackContentAnalytics = exports.getNewsletterStats = exports.unsubscribeFromNewsletter = exports.subscribeToNewsletter = exports.getNewsletters = exports.createNewsletter = exports.getArticleComments = exports.createComment = exports.getFeaturedArticles = exports.searchArticles = exports.getPublishedArticles = exports.getArticleBySlug = exports.getArticleById = exports.createArticle = exports.getHierarchicalCategories = exports.getCategories = exports.createCategory = void 0;
const contentManagementService_1 = require("@/services/contentManagementService");
const logger_1 = __importDefault(require("@/utils/logger"));
const createCategory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const categoryData = req.body;
        logger_1.default.info('Creating content category', { userId, name: categoryData.name });
        const result = await contentManagementService_1.contentManagementService.createCategory(categoryData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating content category', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CONTENT_CATEGORY_CREATE_ERROR',
                message: 'Failed to create content category'
            }
        });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        logger_1.default.info('Getting content categories');
        const result = await contentManagementService_1.contentManagementService.getCategories();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting content categories', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CONTENT_CATEGORIES_FETCH_ERROR',
                message: 'Failed to get content categories'
            }
        });
    }
};
exports.getCategories = getCategories;
const getHierarchicalCategories = async (req, res) => {
    try {
        logger_1.default.info('Getting hierarchical content categories');
        const result = await contentManagementService_1.contentManagementService.getHierarchicalCategories();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting hierarchical categories', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'HIERARCHICAL_CATEGORIES_ERROR',
                message: 'Failed to get hierarchical categories'
            }
        });
    }
};
exports.getHierarchicalCategories = getHierarchicalCategories;
const createArticle = async (req, res) => {
    try {
        const userId = req.user?.id;
        const articleData = {
            ...req.body,
            authorId: userId
        };
        logger_1.default.info('Creating article', { userId, title: articleData.title });
        const result = await contentManagementService_1.contentManagementService.createArticle(articleData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating article', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ARTICLE_CREATE_ERROR',
                message: 'Failed to create article'
            }
        });
    }
};
exports.createArticle = createArticle;
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ARTICLE_ID',
                    message: 'Article ID is required'
                }
            });
        }
        logger_1.default.info('Getting article by ID', { articleId: id });
        const result = await contentManagementService_1.contentManagementService.getArticleById(id);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting article by ID', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ARTICLE_FETCH_ERROR',
                message: 'Failed to get article'
            }
        });
    }
};
exports.getArticleById = getArticleById;
const getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ARTICLE_SLUG',
                    message: 'Article slug is required'
                }
            });
        }
        logger_1.default.info('Getting article by slug', { slug });
        const result = await contentManagementService_1.contentManagementService.getArticleBySlug(slug);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting article by slug', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'ARTICLE_SLUG_FETCH_ERROR',
                message: 'Failed to get article'
            }
        });
    }
};
exports.getArticleBySlug = getArticleBySlug;
const getPublishedArticles = async (req, res) => {
    try {
        const { categoryId, limit = 10, offset = 0 } = req.query;
        logger_1.default.info('Getting published articles', { categoryId, limit, offset });
        const result = await contentManagementService_1.contentManagementService.getPublishedArticles(categoryId, parseInt(limit), parseInt(offset));
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting published articles', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'PUBLISHED_ARTICLES_ERROR',
                message: 'Failed to get published articles'
            }
        });
    }
};
exports.getPublishedArticles = getPublishedArticles;
const searchArticles = async (req, res) => {
    try {
        const { q, limit = 10, offset = 0 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SEARCH_QUERY_REQUIRED',
                    message: 'Search query is required'
                }
            });
        }
        logger_1.default.info('Searching articles', { query: q, limit, offset });
        const result = await contentManagementService_1.contentManagementService.searchArticles(q, parseInt(limit), parseInt(offset));
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error searching articles', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'ARTICLE_SEARCH_ERROR',
                message: 'Failed to search articles'
            }
        });
    }
};
exports.searchArticles = searchArticles;
const getFeaturedArticles = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        logger_1.default.info('Getting featured articles', { limit });
        const result = await contentManagementService_1.contentManagementService.getFeaturedArticles(parseInt(limit));
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting featured articles', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'FEATURED_ARTICLES_ERROR',
                message: 'Failed to get featured articles'
            }
        });
    }
};
exports.getFeaturedArticles = getFeaturedArticles;
const createComment = async (req, res) => {
    try {
        const { id } = req.params;
        const commentData = {
            ...req.body,
            articleId: id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        };
        logger_1.default.info('Creating article comment', { articleId: id });
        const result = await contentManagementService_1.contentManagementService.createComment(commentData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating article comment', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'COMMENT_CREATE_ERROR',
                message: 'Failed to create comment'
            }
        });
    }
};
exports.createComment = createComment;
const getArticleComments = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_ARTICLE_ID',
                    message: 'Article ID is required'
                }
            });
        }
        logger_1.default.info('Getting article comments', { articleId: id });
        const result = await contentManagementService_1.contentManagementService.getArticleComments(id);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting article comments', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'COMMENTS_FETCH_ERROR',
                message: 'Failed to get comments'
            }
        });
    }
};
exports.getArticleComments = getArticleComments;
const createNewsletter = async (req, res) => {
    try {
        const userId = req.user?.id;
        const newsletterData = {
            ...req.body,
            createdBy: userId
        };
        logger_1.default.info('Creating newsletter', { userId, title: newsletterData.title });
        const result = await contentManagementService_1.contentManagementService.createNewsletter(newsletterData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating newsletter', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEWSLETTER_CREATE_ERROR',
                message: 'Failed to create newsletter'
            }
        });
    }
};
exports.createNewsletter = createNewsletter;
const getNewsletters = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        logger_1.default.info('Getting newsletters', { limit, offset });
        const result = await contentManagementService_1.contentManagementService.getNewsletters(parseInt(limit), parseInt(offset));
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting newsletters', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEWSLETTERS_FETCH_ERROR',
                message: 'Failed to get newsletters'
            }
        });
    }
};
exports.getNewsletters = getNewsletters;
const subscribeToNewsletter = async (req, res) => {
    try {
        const subscriberData = {
            ...req.body,
            ipAddress: req.ip
        };
        logger_1.default.info('Subscribing to newsletter', { email: subscriberData.email });
        const result = await contentManagementService_1.contentManagementService.subscribeToNewsletter(subscriberData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error subscribing to newsletter', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEWSLETTER_SUBSCRIBE_ERROR',
                message: 'Failed to subscribe to newsletter'
            }
        });
    }
};
exports.subscribeToNewsletter = subscribeToNewsletter;
const unsubscribeFromNewsletter = async (req, res) => {
    try {
        const { email, reason } = req.body;
        logger_1.default.info('Unsubscribing from newsletter', { email });
        const result = await contentManagementService_1.contentManagementService.unsubscribeFromNewsletter(email, reason);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error unsubscribing from newsletter', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEWSLETTER_UNSUBSCRIBE_ERROR',
                message: 'Failed to unsubscribe from newsletter'
            }
        });
    }
};
exports.unsubscribeFromNewsletter = unsubscribeFromNewsletter;
const getNewsletterStats = async (req, res) => {
    try {
        logger_1.default.info('Getting newsletter statistics');
        const result = await contentManagementService_1.contentManagementService.getNewsletterStats();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting newsletter statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'NEWSLETTER_STATS_ERROR',
                message: 'Failed to get newsletter statistics'
            }
        });
    }
};
exports.getNewsletterStats = getNewsletterStats;
const trackContentAnalytics = async (req, res) => {
    try {
        const analyticsData = {
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            sessionId: req.sessionID
        };
        logger_1.default.info('Tracking content analytics', {
            contentType: analyticsData.contentType,
            contentId: analyticsData.contentId,
            action: analyticsData.action
        });
        const result = await contentManagementService_1.contentManagementService.trackContentAnalytics(analyticsData);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error tracking content analytics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CONTENT_ANALYTICS_ERROR',
                message: 'Failed to track analytics'
            }
        });
    }
};
exports.trackContentAnalytics = trackContentAnalytics;
const getContentStats = async (req, res) => {
    try {
        const { contentType, contentId } = req.params;
        if (!contentId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CONTENT_ID',
                    message: 'Content ID is required'
                }
            });
        }
        if (!contentType) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CONTENT_TYPE',
                    message: 'Content type is required'
                }
            });
        }
        logger_1.default.info('Getting content statistics', { contentType, contentId });
        const result = await contentManagementService_1.contentManagementService.getContentStats(contentId, contentType);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting content statistics', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CONTENT_STATS_ERROR',
                message: 'Failed to get content statistics'
            }
        });
    }
};
exports.getContentStats = getContentStats;
exports.default = {
    createCategory: exports.createCategory,
    getCategories: exports.getCategories,
    getHierarchicalCategories: exports.getHierarchicalCategories,
    createArticle: exports.createArticle,
    getArticleById: exports.getArticleById,
    getArticleBySlug: exports.getArticleBySlug,
    getPublishedArticles: exports.getPublishedArticles,
    searchArticles: exports.searchArticles,
    getFeaturedArticles: exports.getFeaturedArticles,
    createComment: exports.createComment,
    getArticleComments: exports.getArticleComments,
    createNewsletter: exports.createNewsletter,
    getNewsletters: exports.getNewsletters,
    subscribeToNewsletter: exports.subscribeToNewsletter,
    unsubscribeFromNewsletter: exports.unsubscribeFromNewsletter,
    getNewsletterStats: exports.getNewsletterStats,
    trackContentAnalytics: exports.trackContentAnalytics,
    getContentStats: exports.getContentStats
};
//# sourceMappingURL=contentManagementController.js.map