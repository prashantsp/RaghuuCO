"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentManagementService = exports.ContentManagementService = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db_SQLQueries_1 = require("@/utils/db_SQLQueries");
const db = new DatabaseService_1.default();
class ContentManagementService {
    async createCategory(categoryData) {
        try {
            const { name, slug, description, parentCategoryId, isActive, sortOrder } = categoryData;
            logger_1.default.info('Creating content category', { name, slug });
            const result = await db.query(db_SQLQueries_1.SQLQueries.CONTENT_CATEGORIES.CREATE, [
                name,
                slug,
                description || null,
                parentCategoryId || null,
                isActive !== false,
                sortOrder || 0
            ]);
            const category = result[0];
            logger_1.default.businessEvent('content_category_created', 'content_category', category.id, '');
            return {
                success: true,
                data: { category }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating content category', error);
            throw new Error('Failed to create content category');
        }
    }
    async getCategories() {
        try {
            logger_1.default.info('Getting content categories');
            const result = await db.query(db_SQLQueries_1.SQLQueries.CONTENT_CATEGORIES.GET_ALL);
            const categories = result;
            logger_1.default.info('Content categories fetched successfully', { count: categories.length });
            return {
                success: true,
                data: { categories }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting content categories', error);
            throw new Error('Failed to get content categories');
        }
    }
    async getHierarchicalCategories() {
        try {
            logger_1.default.info('Getting hierarchical content categories');
            const result = await db.query(db_SQLQueries_1.SQLQueries.CONTENT_CATEGORIES.GET_HIERARCHICAL);
            const categories = result;
            logger_1.default.info('Hierarchical categories fetched successfully', { count: categories.length });
            return {
                success: true,
                data: { categories }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting hierarchical categories', error);
            throw new Error('Failed to get hierarchical categories');
        }
    }
    async createArticle(articleData) {
        try {
            const { title, slug, excerpt, content, featuredImageUrl, categoryId, authorId, status, publishedAt, metaTitle, metaDescription, tags } = articleData;
            logger_1.default.info('Creating article', { title, slug, authorId });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.CREATE, [
                title,
                slug,
                excerpt || null,
                content,
                featuredImageUrl || null,
                categoryId || null,
                authorId,
                status || 'draft',
                publishedAt || null,
                metaTitle || null,
                metaDescription || null,
                tags || []
            ]);
            const article = result[0];
            logger_1.default.businessEvent('article_created', 'article', article.id, authorId);
            return {
                success: true,
                data: { article }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating article', error);
            throw new Error('Failed to create article');
        }
    }
    async getArticleById(articleId) {
        try {
            logger_1.default.info('Getting article by ID', { articleId });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.GET_BY_ID, [articleId]);
            const article = result[0];
            if (!article) {
                throw new Error('Article not found');
            }
            logger_1.default.info('Article fetched successfully', { articleId });
            return {
                success: true,
                data: { article }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting article by ID', error);
            throw new Error('Failed to get article');
        }
    }
    async getArticleBySlug(slug) {
        try {
            logger_1.default.info('Getting article by slug', { slug });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.GET_BY_SLUG, [slug]);
            const article = result[0];
            if (!article) {
                throw new Error('Article not found');
            }
            await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.INCREMENT_VIEW_COUNT, [article.id]);
            logger_1.default.info('Article fetched successfully', { slug });
            return {
                success: true,
                data: { article }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting article by slug', error);
            throw new Error('Failed to get article');
        }
    }
    async getPublishedArticles(categoryId, limit = 10, offset = 0) {
        try {
            logger_1.default.info('Getting published articles', { categoryId, limit, offset });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.GET_PUBLISHED, [
                categoryId || null,
                limit,
                offset
            ]);
            const articles = result;
            logger_1.default.info('Published articles fetched successfully', { count: articles.length });
            return {
                success: true,
                data: { articles }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting published articles', error);
            throw new Error('Failed to get published articles');
        }
    }
    async searchArticles(query, limit = 10, offset = 0) {
        try {
            logger_1.default.info('Searching articles', { query, limit, offset });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.SEARCH, [
                `%${query}%`,
                limit,
                offset
            ]);
            const articles = result;
            logger_1.default.info('Article search completed successfully', { query, count: articles.length });
            return {
                success: true,
                data: { articles }
            };
        }
        catch (error) {
            logger_1.default.error('Error searching articles', error);
            throw new Error('Failed to search articles');
        }
    }
    async getFeaturedArticles(limit = 5) {
        try {
            logger_1.default.info('Getting featured articles', { limit });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLES.GET_FEATURED, [limit]);
            const articles = result;
            logger_1.default.info('Featured articles fetched successfully', { count: articles.length });
            return {
                success: true,
                data: { articles }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting featured articles', error);
            throw new Error('Failed to get featured articles');
        }
    }
    async createComment(commentData) {
        try {
            const { articleId, authorName, authorEmail, content, parentCommentId, ipAddress, userAgent } = commentData;
            logger_1.default.info('Creating article comment', { articleId, authorEmail });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLE_COMMENTS.CREATE, [
                articleId,
                authorName,
                authorEmail,
                content,
                parentCommentId || null,
                ipAddress || null,
                userAgent || null
            ]);
            const comment = result[0];
            logger_1.default.businessEvent('article_comment_created', 'article_comment', comment.id, '');
            return {
                success: true,
                data: { comment }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating article comment', error);
            throw new Error('Failed to create comment');
        }
    }
    async getArticleComments(articleId) {
        try {
            logger_1.default.info('Getting article comments', { articleId });
            const result = await db.query(db_SQLQueries_1.SQLQueries.ARTICLE_COMMENTS.GET_BY_ARTICLE_ID, [articleId]);
            const comments = result;
            logger_1.default.info('Article comments fetched successfully', { articleId, count: comments.length });
            return {
                success: true,
                data: { comments }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting article comments', error);
            throw new Error('Failed to get comments');
        }
    }
    async createNewsletter(newsletterData) {
        try {
            const { title, subject, content, templateId, status, scheduledAt, createdBy } = newsletterData;
            logger_1.default.info('Creating newsletter', { title, createdBy });
            const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTERS.CREATE, [
                title,
                subject,
                content,
                templateId || null,
                status || 'draft',
                scheduledAt || null,
                createdBy
            ]);
            const newsletter = result[0];
            logger_1.default.businessEvent('newsletter_created', 'newsletter', newsletter.id, createdBy);
            return {
                success: true,
                data: { newsletter }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating newsletter', error);
            throw new Error('Failed to create newsletter');
        }
    }
    async getNewsletters(limit = 10, offset = 0) {
        try {
            logger_1.default.info('Getting newsletters', { limit, offset });
            const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTERS.GET_ALL, [limit, offset]);
            const newsletters = result;
            logger_1.default.info('Newsletters fetched successfully', { count: newsletters.length });
            return {
                success: true,
                data: { newsletters }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting newsletters', error);
            throw new Error('Failed to get newsletters');
        }
    }
    async subscribeToNewsletter(subscriberData) {
        try {
            const { email, firstName, lastName, source, ipAddress } = subscriberData;
            logger_1.default.info('Subscribing to newsletter', { email });
            const existingResult = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTER_SUBSCRIBERS.GET_BY_EMAIL, [email]);
            const existing = existingResult[0];
            if (existing) {
                if (existing.is_active) {
                    throw new Error('Email already subscribed');
                }
                else {
                    const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTER_SUBSCRIBERS.RESUBSCRIBE, [email]);
                    const subscriber = result[0];
                    logger_1.default.businessEvent('newsletter_resubscribed', 'newsletter_subscriber', subscriber.id, '');
                    return {
                        success: true,
                        data: { subscriber, action: 'resubscribed' }
                    };
                }
            }
            const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTER_SUBSCRIBERS.CREATE, [
                email,
                firstName || null,
                lastName || null,
                source || 'website',
                ipAddress || null
            ]);
            const subscriber = result[0];
            logger_1.default.businessEvent('newsletter_subscribed', 'newsletter_subscriber', subscriber.id, '');
            return {
                success: true,
                data: { subscriber, action: 'subscribed' }
            };
        }
        catch (error) {
            logger_1.default.error('Error subscribing to newsletter', error);
            throw new Error('Failed to subscribe to newsletter');
        }
    }
    async unsubscribeFromNewsletter(email, reason) {
        try {
            logger_1.default.info('Unsubscribing from newsletter', { email });
            const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTER_SUBSCRIBERS.UNSUBSCRIBE, [email, reason || null]);
            const subscriber = result[0];
            if (!subscriber) {
                throw new Error('Subscriber not found');
            }
            logger_1.default.businessEvent('newsletter_unsubscribed', 'newsletter_subscriber', subscriber.id, '');
            return {
                success: true,
                data: { subscriber }
            };
        }
        catch (error) {
            logger_1.default.error('Error unsubscribing from newsletter', error);
            throw new Error('Failed to unsubscribe from newsletter');
        }
    }
    async getNewsletterStats() {
        try {
            logger_1.default.info('Getting newsletter statistics');
            const result = await db.query(db_SQLQueries_1.SQLQueries.NEWSLETTER_SUBSCRIBERS.GET_STATS);
            const stats = result[0];
            logger_1.default.info('Newsletter statistics fetched successfully');
            return {
                success: true,
                data: { stats }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting newsletter statistics', error);
            throw new Error('Failed to get newsletter statistics');
        }
    }
    async trackContentAnalytics(analyticsData) {
        try {
            const { contentType, contentId, action, userId, ipAddress, userAgent, referrerUrl, sessionId } = analyticsData;
            logger_1.default.info('Tracking content analytics', { contentType, contentId, action });
            const result = await db.query(db_SQLQueries_1.SQLQueries.CONTENT_ANALYTICS.CREATE, [
                contentType,
                contentId,
                action,
                userId || null,
                ipAddress || null,
                userAgent || null,
                referrerUrl || null,
                sessionId || null
            ]);
            const analytics = result[0];
            return {
                success: true,
                data: { analytics }
            };
        }
        catch (error) {
            logger_1.default.error('Error tracking content analytics', error);
            throw new Error('Failed to track analytics');
        }
    }
    async getContentStats(contentId, contentType) {
        try {
            logger_1.default.info('Getting content statistics', { contentId, contentType });
            const result = await db.query(db_SQLQueries_1.SQLQueries.CONTENT_ANALYTICS.GET_CONTENT_STATS, [contentId, contentType]);
            const stats = result;
            logger_1.default.info('Content statistics fetched successfully', { contentId, contentType });
            return {
                success: true,
                data: { stats }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting content statistics', error);
            throw new Error('Failed to get content statistics');
        }
    }
}
exports.ContentManagementService = ContentManagementService;
exports.contentManagementService = new ContentManagementService();
//# sourceMappingURL=contentManagementService.js.map