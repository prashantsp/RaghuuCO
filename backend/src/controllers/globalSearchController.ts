/**
 * Global Search Controller
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Controller for global search functionality across all system entities
 */

import { Request, Response } from 'express';
import { globalSearchService } from '@/services/globalSearchService';
import logger from '@/utils/logger';

/**
 * Perform global search across all entities
 * 
 * @route GET /api/v1/search/global
 * @access Private
 */
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q, entityTypes, limit = 20, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Search query is required'
        }
      });
    }

    const entityTypesArray = entityTypes ? (entityTypes as string).split(',') : [];

    logger.info('Performing global search', { query: q, entityTypes: entityTypesArray });

    const result = await globalSearchService.globalSearch(
      q as string,
      entityTypesArray,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error performing global search', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GLOBAL_SEARCH_ERROR',
        message: 'Failed to perform global search'
      }
    });
  }
};

/**
 * Get search suggestions
 * 
 * @route GET /api/v1/search/suggestions
 * @access Private
 */
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Search query is required'
        }
      });
    }

    logger.info('Getting search suggestions', { query: q, limit });

    const result = await globalSearchService.getSearchSuggestions(
      q as string,
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting search suggestions', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_SUGGESTIONS_ERROR',
        message: 'Failed to get search suggestions'
      }
    });
  }
};

/**
 * Get search statistics
 * 
 * @route GET /api/v1/search/statistics
 * @access Private
 */
export const getSearchStatistics = async (req: Request, res: Response) => {
  try {
    logger.info('Getting search statistics');

    const result = await globalSearchService.getSearchStatistics();

    res.json(result);
  } catch (error) {
    logger.error('Error getting search statistics', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEARCH_STATISTICS_ERROR',
        message: 'Failed to get search statistics'
      }
    });
  }
};

/**
 * Get popular search terms
 * 
 * @route GET /api/v1/search/popular
 * @access Private
 */
export const getPopularSearchTerms = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    logger.info('Getting popular search terms', { limit });

    const result = await globalSearchService.getPopularSearchTerms(
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    logger.error('Error getting popular search terms', error as Error);
    res.status(500).json({
      success: false,
      error: {
        code: 'POPULAR_SEARCH_TERMS_ERROR',
        message: 'Failed to get popular search terms'
      }
    });
  }
};

export default {
  globalSearch,
  getSearchSuggestions,
  getSearchStatistics,
  getPopularSearchTerms
};