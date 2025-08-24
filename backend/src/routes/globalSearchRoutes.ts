/**
 * Global Search Routes
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description API routes for global search functionality across all system entities
 */

import { Router } from 'express';
import { authenticateToken, authorizePermission } from '@/middleware/auth';
import { Permission } from '@/utils/roleAccess';
import globalSearchController from '@/controllers/globalSearchController';

const router = Router();

/**
 * @route GET /api/v1/search/global
 * @desc Perform global search across all entities
 * @access Private
 */
router.get('/global', 
  authenticateToken, 
  authorizePermission(Permission.USE_GLOBAL_SEARCH),
  globalSearchController.globalSearch
);

/**
 * @route GET /api/v1/search/suggestions
 * @desc Get search suggestions
 * @access Private
 */
router.get('/suggestions', 
  authenticateToken, 
  authorizePermission(Permission.USE_GLOBAL_SEARCH),
  globalSearchController.getSearchSuggestions
);

/**
 * @route GET /api/v1/search/statistics
 * @desc Get search statistics
 * @access Private
 */
router.get('/statistics', 
  authenticateToken, 
  authorizePermission(Permission.VIEW_SEARCH_STATISTICS),
  globalSearchController.getSearchStatistics
);

/**
 * @route GET /api/v1/search/popular
 * @desc Get popular search terms
 * @access Private
 */
router.get('/popular', 
  authenticateToken, 
  authorizePermission(Permission.USE_GLOBAL_SEARCH),
  globalSearchController.getPopularSearchTerms
);

export default router;