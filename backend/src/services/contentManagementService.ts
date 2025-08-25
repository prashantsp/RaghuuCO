/**
 * Content Management Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for content management including articles, categories, newsletters, and analytics
 */

import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';
import { SQLQueries } from '@/utils/db_SQLQueries';

const db = new DatabaseService();

/**
 * Content Management Service Class
 * Handles all content management operations
 */
export class ContentManagementService {
  /**
   * Create content category
   */
  async createCategory(categoryData: any): Promise<any> {
    try {
      const { name, slug, description, parentCategoryId, isActive, sortOrder } = categoryData;

      logger.info('Creating content category', { name, slug });

      const result = await db.query(SQLQueries.CONTENT_CATEGORIES.CREATE, [
        name,
        slug,
        description || null,
        parentCategoryId || null,
        isActive !== false,
        sortOrder || 0
      ]);

      const category = result[0];

      logger.businessEvent('content_category_created', 'content_category', category.id, '');

      return {
        success: true,
        data: { category }
      };
    } catch (error) {
      logger.error('Error creating content category', error as Error);
      throw new Error('Failed to create content category');
    }
  }

  /**
   * Get all content categories
   */
  async getCategories(): Promise<any> {
    try {
      logger.info('Getting content categories');

      const result = await db.query(SQLQueries.CONTENT_CATEGORIES.GET_ALL);
      const categories = result;

      logger.info('Content categories fetched successfully', { count: categories.length });

      return {
        success: true,
        data: { categories }
      };
    } catch (error) {
      logger.error('Error getting content categories', error as Error);
      throw new Error('Failed to get content categories');
    }
  }

  /**
   * Get hierarchical categories
   */
  async getHierarchicalCategories(): Promise<any> {
    try {
      logger.info('Getting hierarchical content categories');

      const result = await db.query(SQLQueries.CONTENT_CATEGORIES.GET_HIERARCHICAL);
      const categories = result;

      logger.info('Hierarchical categories fetched successfully', { count: categories.length });

      return {
        success: true,
        data: { categories }
      };
    } catch (error) {
      logger.error('Error getting hierarchical categories', error as Error);
      throw new Error('Failed to get hierarchical categories');
    }
  }

  /**
   * Create article
   */
  async createArticle(articleData: any): Promise<any> {
    try {
      const {
        title,
        slug,
        excerpt,
        content,
        featuredImageUrl,
        categoryId,
        authorId,
        status,
        publishedAt,
        metaTitle,
        metaDescription,
        tags
      } = articleData;

      logger.info('Creating article', { title, slug, authorId });

      const result = await db.query(SQLQueries.ARTICLES.CREATE, [
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

      logger.businessEvent('article_created', 'article', article.id, authorId);

      return {
        success: true,
        data: { article }
      };
    } catch (error) {
      logger.error('Error creating article', error as Error);
      throw new Error('Failed to create article');
    }
  }

  /**
   * Get article by ID
   */
  async getArticleById(articleId: string): Promise<any> {
    try {
      logger.info('Getting article by ID', { articleId });

      const result = await db.query(SQLQueries.ARTICLES.GET_BY_ID, [articleId]);
      const article = result[0];

      if (!article) {
        throw new Error('Article not found');
      }

      logger.info('Article fetched successfully', { articleId });

      return {
        success: true,
        data: { article }
      };
    } catch (error) {
      logger.error('Error getting article by ID', error as Error);
      throw new Error('Failed to get article');
    }
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string): Promise<any> {
    try {
      logger.info('Getting article by slug', { slug });

      const result = await db.query(SQLQueries.ARTICLES.GET_BY_SLUG, [slug]);
      const article = result[0];

      if (!article) {
        throw new Error('Article not found');
      }

      // Increment view count
      await db.query(SQLQueries.ARTICLES.INCREMENT_VIEW_COUNT, [article.id]);

      logger.info('Article fetched successfully', { slug });

      return {
        success: true,
        data: { article }
      };
    } catch (error) {
      logger.error('Error getting article by slug', error as Error);
      throw new Error('Failed to get article');
    }
  }

  /**
   * Get published articles
   */
  async getPublishedArticles(categoryId?: string, limit: number = 10, offset: number = 0): Promise<any> {
    try {
      logger.info('Getting published articles', { categoryId, limit, offset });

      const result = await db.query(SQLQueries.ARTICLES.GET_PUBLISHED, [
        categoryId || null,
        limit,
        offset
      ]);

      const articles = result;

      logger.info('Published articles fetched successfully', { count: articles.length });

      return {
        success: true,
        data: { articles }
      };
    } catch (error) {
      logger.error('Error getting published articles', error as Error);
      throw new Error('Failed to get published articles');
    }
  }

  /**
   * Search articles
   */
  async searchArticles(query: string, limit: number = 10, offset: number = 0): Promise<any> {
    try {
      logger.info('Searching articles', { query, limit, offset });

      const result = await db.query(SQLQueries.ARTICLES.SEARCH, [
        `%${query}%`,
        limit,
        offset
      ]);

      const articles = result;

      logger.info('Article search completed successfully', { query, count: articles.length });

      return {
        success: true,
        data: { articles }
      };
    } catch (error) {
      logger.error('Error searching articles', error as Error);
      throw new Error('Failed to search articles');
    }
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 5): Promise<any> {
    try {
      logger.info('Getting featured articles', { limit });

      const result = await db.query(SQLQueries.ARTICLES.GET_FEATURED, [limit]);
      const articles = result;

      logger.info('Featured articles fetched successfully', { count: articles.length });

      return {
        success: true,
        data: { articles }
      };
    } catch (error) {
      logger.error('Error getting featured articles', error as Error);
      throw new Error('Failed to get featured articles');
    }
  }

  /**
   * Create article comment
   */
  async createComment(commentData: any): Promise<any> {
    try {
      const {
        articleId,
        authorName,
        authorEmail,
        content,
        parentCommentId,
        ipAddress,
        userAgent
      } = commentData;

      logger.info('Creating article comment', { articleId, authorEmail });

      const result = await db.query(SQLQueries.ARTICLE_COMMENTS.CREATE, [
        articleId,
        authorName,
        authorEmail,
        content,
        parentCommentId || null,
        ipAddress || null,
        userAgent || null
      ]);

      const comment = result[0];

      logger.businessEvent('article_comment_created', 'article_comment', comment.id, '');

      return {
        success: true,
        data: { comment }
      };
    } catch (error) {
      logger.error('Error creating article comment', error as Error);
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Get article comments
   */
  async getArticleComments(articleId: string): Promise<any> {
    try {
      logger.info('Getting article comments', { articleId });

      const result = await db.query(SQLQueries.ARTICLE_COMMENTS.GET_BY_ARTICLE_ID, [articleId]);
      const comments = result;

      logger.info('Article comments fetched successfully', { articleId, count: comments.length });

      return {
        success: true,
        data: { comments }
      };
    } catch (error) {
      logger.error('Error getting article comments', error as Error);
      throw new Error('Failed to get comments');
    }
  }

  /**
   * Create newsletter
   */
  async createNewsletter(newsletterData: any): Promise<any> {
    try {
      const {
        title,
        subject,
        content,
        templateId,
        status,
        scheduledAt,
        createdBy
      } = newsletterData;

      logger.info('Creating newsletter', { title, createdBy });

      const result = await db.query(SQLQueries.NEWSLETTERS.CREATE, [
        title,
        subject,
        content,
        templateId || null,
        status || 'draft',
        scheduledAt || null,
        createdBy
      ]);

      const newsletter = result[0];

      logger.businessEvent('newsletter_created', 'newsletter', newsletter.id, createdBy);

      return {
        success: true,
        data: { newsletter }
      };
    } catch (error) {
      logger.error('Error creating newsletter', error as Error);
      throw new Error('Failed to create newsletter');
    }
  }

  /**
   * Get newsletters
   */
  async getNewsletters(limit: number = 10, offset: number = 0): Promise<any> {
    try {
      logger.info('Getting newsletters', { limit, offset });

      const result = await db.query(SQLQueries.NEWSLETTERS.GET_ALL, [limit, offset]);
      const newsletters = result;

      logger.info('Newsletters fetched successfully', { count: newsletters.length });

      return {
        success: true,
        data: { newsletters }
      };
    } catch (error) {
      logger.error('Error getting newsletters', error as Error);
      throw new Error('Failed to get newsletters');
    }
  }

  /**
   * Subscribe to newsletter
   */
  async subscribeToNewsletter(subscriberData: any): Promise<any> {
    try {
      const {
        email,
        firstName,
        lastName,
        source,
        ipAddress
      } = subscriberData;

      logger.info('Subscribing to newsletter', { email });

      // Check if already subscribed
      const existingResult = await db.query(SQLQueries.NEWSLETTER_SUBSCRIBERS.GET_BY_EMAIL, [email]);
      const existing = existingResult[0];

      if (existing) {
        if (existing.is_active) {
          throw new Error('Email already subscribed');
        } else {
          // Resubscribe
          const result = await db.query(SQLQueries.NEWSLETTER_SUBSCRIBERS.RESUBSCRIBE, [email]);
          const subscriber = result[0];

          logger.businessEvent('newsletter_resubscribed', 'newsletter_subscriber', subscriber.id, '');

          return {
            success: true,
            data: { subscriber, action: 'resubscribed' }
          };
        }
      }

      // Create new subscription
      const result = await db.query(SQLQueries.NEWSLETTER_SUBSCRIBERS.CREATE, [
        email,
        firstName || null,
        lastName || null,
        source || 'website',
        ipAddress || null
      ]);

      const subscriber = result[0];

      logger.businessEvent('newsletter_subscribed', 'newsletter_subscriber', subscriber.id, '');

      return {
        success: true,
        data: { subscriber, action: 'subscribed' }
      };
    } catch (error) {
      logger.error('Error subscribing to newsletter', error as Error);
      throw new Error('Failed to subscribe to newsletter');
    }
  }

  /**
   * Unsubscribe from newsletter
   */
  async unsubscribeFromNewsletter(email: string, reason?: string): Promise<any> {
    try {
      logger.info('Unsubscribing from newsletter', { email });

      const result = await db.query(SQLQueries.NEWSLETTER_SUBSCRIBERS.UNSUBSCRIBE, [email, reason || null]);
      const subscriber = result[0];

      if (!subscriber) {
        throw new Error('Subscriber not found');
      }

      logger.businessEvent('newsletter_unsubscribed', 'newsletter_subscriber', subscriber.id, '');

      return {
        success: true,
        data: { subscriber }
      };
    } catch (error) {
      logger.error('Error unsubscribing from newsletter', error as Error);
      throw new Error('Failed to unsubscribe from newsletter');
    }
  }

  /**
   * Get newsletter statistics
   */
  async getNewsletterStats(): Promise<any> {
    try {
      logger.info('Getting newsletter statistics');

      const result = await db.query(SQLQueries.NEWSLETTER_SUBSCRIBERS.GET_STATS);
      const stats = result[0];

      logger.info('Newsletter statistics fetched successfully');

      return {
        success: true,
        data: { stats }
      };
    } catch (error) {
      logger.error('Error getting newsletter statistics', error as Error);
      throw new Error('Failed to get newsletter statistics');
    }
  }

  /**
   * Track content analytics
   */
  async trackContentAnalytics(analyticsData: any): Promise<any> {
    try {
      const {
        contentType,
        contentId,
        action,
        userId,
        ipAddress,
        userAgent,
        referrerUrl,
        sessionId
      } = analyticsData;

      logger.info('Tracking content analytics', { contentType, contentId, action });

      const result = await db.query(SQLQueries.CONTENT_ANALYTICS.CREATE, [
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
    } catch (error) {
      logger.error('Error tracking content analytics', error as Error);
      throw new Error('Failed to track analytics');
    }
  }

  /**
   * Get content statistics
   */
  async getContentStats(contentId: string, contentType: string): Promise<any> {
    try {
      logger.info('Getting content statistics', { contentId, contentType });

      const result = await db.query(SQLQueries.CONTENT_ANALYTICS.GET_CONTENT_STATS, [contentId, contentType]);
      const stats = result;

      logger.info('Content statistics fetched successfully', { contentId, contentType });

      return {
        success: true,
        data: { stats }
      };
    } catch (error) {
      logger.error('Error getting content statistics', error as Error);
      throw new Error('Failed to get content statistics');
    }
  }
}

// Export service instance
export const contentManagementService = new ContentManagementService();