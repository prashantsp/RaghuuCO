/**
 * Content Management Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for content management functionality including articles, categories, newsletters, and analytics
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import contentManagementController from '@/controllers/contentManagementController';

const router = Router();

/**
 * @route POST /api/v1/content/categories
 * @desc Create content category
 * @access Private
 */
router.post('/categories', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_CONTENT),
  contentManagementController.createCategory
);

/**
 * @route GET /api/v1/content/categories
 * @desc Get all content categories
 * @access Public
 */
router.get('/categories', 
  contentManagementController.getCategories
);

/**
 * @route GET /api/v1/content/categories/hierarchical
 * @desc Get hierarchical content categories
 * @access Public
 */
router.get('/categories/hierarchical', 
  contentManagementController.getHierarchicalCategories
);

/**
 * @route POST /api/v1/content/articles
 * @desc Create article
 * @access Private
 */
router.post('/articles', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_CONTENT),
  contentManagementController.createArticle
);

/**
 * @route GET /api/v1/content/articles
 * @desc Get published articles
 * @access Public
 */
router.get('/articles', 
  contentManagementController.getPublishedArticles
);

/**
 * @route GET /api/v1/content/articles/search
 * @desc Search articles
 * @access Public
 */
router.get('/articles/search', 
  contentManagementController.searchArticles
);

/**
 * @route GET /api/v1/content/articles/featured
 * @desc Get featured articles
 * @access Public
 */
router.get('/articles/featured', 
  contentManagementController.getFeaturedArticles
);

/**
 * @route GET /api/v1/content/articles/:id
 * @desc Get article by ID
 * @access Public
 */
router.get('/articles/:id', 
  contentManagementController.getArticleById
);

/**
 * @route GET /api/v1/content/articles/slug/:slug
 * @desc Get article by slug
 * @access Public
 */
router.get('/articles/slug/:slug', 
  contentManagementController.getArticleBySlug
);

/**
 * @route GET /api/v1/content/articles/:id/comments
 * @desc Get article comments
 * @access Public
 */
router.get('/articles/:id/comments', 
  contentManagementController.getArticleComments
);

/**
 * @route POST /api/v1/content/articles/:id/comments
 * @desc Create article comment
 * @access Public
 */
router.post('/articles/:id/comments', 
  contentManagementController.createComment
);

/**
 * @route POST /api/v1/content/newsletters
 * @desc Create newsletter
 * @access Private
 */
router.post('/newsletters', 
  authenticateToken, 
  authorizePermission(Permission.CREATE_CONTENT),
  contentManagementController.createNewsletter
);

/**
 * @route GET /api/v1/content/newsletters
 * @desc Get newsletters
 * @access Private
 */
router.get('/newsletters', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CONTENT),
  contentManagementController.getNewsletters
);

/**
 * @route POST /api/v1/content/newsletters/subscribe
 * @desc Subscribe to newsletter
 * @access Public
 */
router.post('/newsletters/subscribe', 
  contentManagementController.subscribeToNewsletter
);

/**
 * @route POST /api/v1/content/newsletters/unsubscribe
 * @desc Unsubscribe from newsletter
 * @access Public
 */
router.post('/newsletters/unsubscribe', 
  contentManagementController.unsubscribeFromNewsletter
);

/**
 * @route GET /api/v1/content/newsletters/stats
 * @desc Get newsletter statistics
 * @access Private
 */
router.get('/newsletters/stats', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CONTENT),
  contentManagementController.getNewsletterStats
);

/**
 * @route POST /api/v1/content/analytics
 * @desc Track content analytics
 * @access Public
 */
router.post('/analytics', 
  contentManagementController.trackContentAnalytics
);

/**
 * @route GET /api/v1/content/analytics/:contentType/:contentId
 * @desc Get content statistics
 * @access Private
 */
router.get('/analytics/:contentType/:contentId', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_CONTENT),
  contentManagementController.getContentStats
);

export default router;