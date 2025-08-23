/**
 * Content Management Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Controller for content management functionality including articles, categories, newsletters, and analytics
 */

import { Request, Response } from 'express';
import { contentManagementService } from '@/services/contentManagementService';
import logger from '@/utils/logger';

/**
 * Create content category
 * 
 * @route POST /api/v1/content/categories
 * @access Private
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const categoryData = req.body;

    logger.info('Creating content category', { userId, name: categoryData.name });

    const result = await contentManagementService.createCategory(categoryData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating content category', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTENT_CATEGORY_CREATE_ERROR',
        message: 'Failed to create content category'
      }
    });
  }
};

/**
 * Get all content categories
 * 
 * @route GET /api/v1/content/categories
 * @access Public
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    logger.info('Getting content categories');

    const result = await contentManagementService.getCategories();

    res.json(result);
  } catch (error) {
    logger.error('Error getting content categories', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTENT_CATEGORIES_FETCH_ERROR',
        message: 'Failed to get content categories'
      }
    });
  }
};

/**
 * Get hierarchical content categories
 * 
 * @route GET /api/v1/content/categories/hierarchical
 * @access Public
 */
export const getHierarchicalCategories = async (req: Request, res: Response) => {
  try {
    logger.info('Getting hierarchical content categories');

    const result = await contentManagementService.getHierarchicalCategories();

    res.json(result);
  } catch (error) {
    logger.error('Error getting hierarchical categories', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HIERARCHICAL_CATEGORIES_ERROR',
        message: 'Failed to get hierarchical categories'
      }
    });
  }
};

/**
 * Create article
 * 
 * @route POST /api/v1/content/articles
 * @access Private
 */
export const createArticle = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const articleData = {
      ...req.body,
      authorId: userId
    };

    logger.info('Creating article', { userId, title: articleData.title });

    const result = await contentManagementService.createArticle(articleData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating article', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARTICLE_CREATE_ERROR',
        message: 'Failed to create article'
      }
    });
  }
};

/**
 * Get article by ID
 * 
 * @route GET /api/v1/content/articles/:id
 * @access Public
 */
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Getting article by ID', { articleId: id });

    const result = await contentManagementService.getArticleById(id);

    res.json(result);
  } catch (error) {
    logger.error('Error getting article by ID', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARTICLE_FETCH_ERROR',
        message: 'Failed to get article'
      }
    });
  }
};

/**
 * Get article by slug
 * 
 * @route GET /api/v1/content/articles/slug/:slug
 * @access Public
 */
export const getArticleBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    logger.info('Getting article by slug', { slug });

    const result = await contentManagementService.getArticleBySlug(slug);

    res.json(result);
  } catch (error) {
    logger.error('Error getting article by slug', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARTICLE_SLUG_FETCH_ERROR',
        message: 'Failed to get article'
      }
    });
  }
};

/**
 * Get published articles
 * 
 * @route GET /api/v1/content/articles
 * @access Public
 */
export const getPublishedArticles = async (req: Request, res: Response) => {
  try {
    const { categoryId, limit = 10, offset = 0 } = req.query;

    logger.info('Getting published articles', { categoryId, limit, offset });

    const result = await contentManagementService.getPublishedArticles(
      categoryId as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting published articles', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PUBLISHED_ARTICLES_ERROR',
        message: 'Failed to get published articles'
      }
    });
  }
};

/**
 * Search articles
 * 
 * @route GET /api/v1/content/articles/search
 * @access Public
 */
export const searchArticles = async (req: Request, res: Response) => {
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

    logger.info('Searching articles', { query: q, limit, offset });

    const result = await contentManagementService.searchArticles(
      q as string,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error searching articles', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARTICLE_SEARCH_ERROR',
        message: 'Failed to search articles'
      }
    });
  }
};

/**
 * Get featured articles
 * 
 * @route GET /api/v1/content/articles/featured
 * @access Public
 */
export const getFeaturedArticles = async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;

    logger.info('Getting featured articles', { limit });

    const result = await contentManagementService.getFeaturedArticles(parseInt(limit as string));

    res.json(result);
  } catch (error) {
    logger.error('Error getting featured articles', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FEATURED_ARTICLES_ERROR',
        message: 'Failed to get featured articles'
      }
    });
  }
};

/**
 * Create article comment
 * 
 * @route POST /api/v1/content/articles/:id/comments
 * @access Public
 */
export const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const commentData = {
      ...req.body,
      articleId: id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    logger.info('Creating article comment', { articleId: id });

    const result = await contentManagementService.createComment(commentData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating article comment', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENT_CREATE_ERROR',
        message: 'Failed to create comment'
      }
    });
  }
};

/**
 * Get article comments
 * 
 * @route GET /api/v1/content/articles/:id/comments
 * @access Public
 */
export const getArticleComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    logger.info('Getting article comments', { articleId: id });

    const result = await contentManagementService.getArticleComments(id);

    res.json(result);
  } catch (error) {
    logger.error('Error getting article comments', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMENTS_FETCH_ERROR',
        message: 'Failed to get comments'
      }
    });
  }
};

/**
 * Create newsletter
 * 
 * @route POST /api/v1/content/newsletters
 * @access Private
 */
export const createNewsletter = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any)?.id;
    const newsletterData = {
      ...req.body,
      createdBy: userId
    };

    logger.info('Creating newsletter', { userId, title: newsletterData.title });

    const result = await contentManagementService.createNewsletter(newsletterData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error creating newsletter', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NEWSLETTER_CREATE_ERROR',
        message: 'Failed to create newsletter'
      }
    });
  }
};

/**
 * Get newsletters
 * 
 * @route GET /api/v1/content/newsletters
 * @access Private
 */
export const getNewsletters = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    logger.info('Getting newsletters', { limit, offset });

    const result = await contentManagementService.getNewsletters(
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting newsletters', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NEWSLETTERS_FETCH_ERROR',
        message: 'Failed to get newsletters'
      }
    });
  }
};

/**
 * Subscribe to newsletter
 * 
 * @route POST /api/v1/content/newsletters/subscribe
 * @access Public
 */
export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const subscriberData = {
      ...req.body,
      ipAddress: req.ip
    };

    logger.info('Subscribing to newsletter', { email: subscriberData.email });

    const result = await contentManagementService.subscribeToNewsletter(subscriberData);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Error subscribing to newsletter', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NEWSLETTER_SUBSCRIBE_ERROR',
        message: 'Failed to subscribe to newsletter'
      }
    });
  }
};

/**
 * Unsubscribe from newsletter
 * 
 * @route POST /api/v1/content/newsletters/unsubscribe
 * @access Public
 */
export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, reason } = req.body;

    logger.info('Unsubscribing from newsletter', { email });

    const result = await contentManagementService.unsubscribeFromNewsletter(email, reason);

    res.json(result);
  } catch (error) {
    logger.error('Error unsubscribing from newsletter', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NEWSLETTER_UNSUBSCRIBE_ERROR',
        message: 'Failed to unsubscribe from newsletter'
      }
    });
  }
};

/**
 * Get newsletter statistics
 * 
 * @route GET /api/v1/content/newsletters/stats
 * @access Private
 */
export const getNewsletterStats = async (req: Request, res: Response) => {
  try {
    logger.info('Getting newsletter statistics');

    const result = await contentManagementService.getNewsletterStats();

    res.json(result);
  } catch (error) {
    logger.error('Error getting newsletter statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NEWSLETTER_STATS_ERROR',
        message: 'Failed to get newsletter statistics'
      }
    });
  }
};

/**
 * Track content analytics
 * 
 * @route POST /api/v1/content/analytics
 * @access Public
 */
export const trackContentAnalytics = async (req: Request, res: Response) => {
  try {
    const analyticsData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.sessionID
    };

    logger.info('Tracking content analytics', { 
      contentType: analyticsData.contentType, 
      contentId: analyticsData.contentId,
      action: analyticsData.action 
    });

    const result = await contentManagementService.trackContentAnalytics(analyticsData);

    res.json(result);
  } catch (error) {
    logger.error('Error tracking content analytics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTENT_ANALYTICS_ERROR',
        message: 'Failed to track analytics'
      }
    });
  }
};

/**
 * Get content statistics
 * 
 * @route GET /api/v1/content/analytics/:contentType/:contentId
 * @access Private
 */
export const getContentStats = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId } = req.params;

    logger.info('Getting content statistics', { contentType, contentId });

    const result = await contentManagementService.getContentStats(contentId, contentType);

    res.json(result);
  } catch (error) {
    logger.error('Error getting content statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONTENT_STATS_ERROR',
        message: 'Failed to get content statistics'
      }
    });
  }
};

export default {
  createCategory,
  getCategories,
  getHierarchicalCategories,
  createArticle,
  getArticleById,
  getArticleBySlug,
  getPublishedArticles,
  searchArticles,
  getFeaturedArticles,
  createComment,
  getArticleComments,
  createNewsletter,
  getNewsletters,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getNewsletterStats,
  trackContentAnalytics,
  getContentStats
};