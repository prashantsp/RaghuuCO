/**
 * Knowledge Base Service
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This service provides comprehensive knowledge base functionality
 * including search, filtering, and article management for the help system.
 */

import { api } from './api';
import { logger } from '@/utils/logger';

/**
 * Knowledge article interface
 */
export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  tags: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  helpful: number;
  notHelpful: number;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  attachments?: string[];
  relatedArticles?: string[];
}

/**
 * Search filters interface
 */
export interface SearchFilters {
  category?: string;
  subcategory?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

/**
 * Search results interface
 */
export interface SearchResults {
  articles: KnowledgeArticle[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  suggestions: string[];
  categories: Record<string, number>;
  tags: Record<string, number>;
}

/**
 * Article feedback interface
 */
export interface ArticleFeedback {
  articleId: string;
  helpful: boolean;
  comment?: string;
  rating?: number;
}

/**
 * Knowledge Base Service Class
 */
class KnowledgeBaseService {
  /**
   * Search articles
   * @param query - Search query
   * @param filters - Search filters
   * @param page - Page number
   * @param limit - Results per page
   * @returns Promise<SearchResults>
   */
  async searchArticles(
    query: string,
    filters: SearchFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResults> {
    try {
      logger.info('Searching knowledge base articles', { query, filters, page, limit });
      
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString()
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else if (typeof value === 'object') {
            params.append(`${key}_start`, value.start.toISOString());
            params.append(`${key}_end`, value.end.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await api.get(`/api/v1/knowledge/search?${params.toString()}`);
      
      if (response.status === 200) {
        logger.info('Knowledge base search completed successfully', { query, results: response.data.total });
        return response.data;
      } else {
        throw new Error(`Failed to search articles: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error searching knowledge base articles:', error as Error);
      throw error;
    }
  }

  /**
   * Get article by ID
   * @param articleId - The article ID
   * @returns Promise<KnowledgeArticle>
   */
  async getArticle(articleId: string): Promise<KnowledgeArticle> {
    try {
      logger.info('Fetching knowledge base article', { articleId });
      
      const response = await api.get(`/api/v1/knowledge/articles/${articleId}`);
      
      if (response.status === 200) {
        logger.info('Knowledge base article fetched successfully', { articleId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base article:', error as Error);
      throw error;
    }
  }

  /**
   * Get articles by category
   * @param category - The category
   * @param page - Page number
   * @param limit - Results per page
   * @returns Promise<SearchResults>
   */
  async getArticlesByCategory(
    category: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SearchResults> {
    try {
      logger.info('Fetching knowledge base articles by category', { category, page, limit });
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`/api/v1/knowledge/categories/${category}?${params.toString()}`);
      
      if (response.status === 200) {
        logger.info('Knowledge base articles by category fetched successfully', { category, results: response.data.total });
        return response.data;
      } else {
        throw new Error(`Failed to fetch articles by category: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base articles by category:', error as Error);
      throw error;
    }
  }

  /**
   * Get featured articles
   * @param limit - Number of articles to fetch
   * @returns Promise<KnowledgeArticle[]>
   */
  async getFeaturedArticles(limit: number = 5): Promise<KnowledgeArticle[]> {
    try {
      logger.info('Fetching featured knowledge base articles', { limit });
      
      const response = await api.get(`/api/v1/knowledge/featured?limit=${limit}`);
      
      if (response.status === 200) {
        logger.info('Featured knowledge base articles fetched successfully', { count: response.data.length });
        return response.data;
      } else {
        throw new Error(`Failed to fetch featured articles: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching featured knowledge base articles:', error as Error);
      throw error;
    }
  }

  /**
   * Get recent articles
   * @param limit - Number of articles to fetch
   * @returns Promise<KnowledgeArticle[]>
   */
  async getRecentArticles(limit: number = 10): Promise<KnowledgeArticle[]> {
    try {
      logger.info('Fetching recent knowledge base articles', { limit });
      
      const response = await api.get(`/api/v1/knowledge/recent?limit=${limit}`);
      
      if (response.status === 200) {
        logger.info('Recent knowledge base articles fetched successfully', { count: response.data.length });
        return response.data;
      } else {
        throw new Error(`Failed to fetch recent articles: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching recent knowledge base articles:', error as Error);
      throw error;
    }
  }

  /**
   * Get related articles
   * @param articleId - The article ID
   * @param limit - Number of articles to fetch
   * @returns Promise<KnowledgeArticle[]>
   */
  async getRelatedArticles(articleId: string, limit: number = 5): Promise<KnowledgeArticle[]> {
    try {
      logger.info('Fetching related knowledge base articles', { articleId, limit });
      
      const response = await api.get(`/api/v1/knowledge/articles/${articleId}/related?limit=${limit}`);
      
      if (response.status === 200) {
        logger.info('Related knowledge base articles fetched successfully', { articleId, count: response.data.length });
        return response.data;
      } else {
        throw new Error(`Failed to fetch related articles: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching related knowledge base articles:', error as Error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns Promise<string[]>
   */
  async getCategories(): Promise<string[]> {
    try {
      logger.info('Fetching knowledge base categories');
      
      const response = await api.get('/api/v1/knowledge/categories');
      
      if (response.status === 200) {
        logger.info('Knowledge base categories fetched successfully');
        return response.data;
      } else {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base categories:', error as Error);
      throw error;
    }
  }

  /**
   * Get all tags
   * @returns Promise<string[]>
   */
  async getTags(): Promise<string[]> {
    try {
      logger.info('Fetching knowledge base tags');
      
      const response = await api.get('/api/v1/knowledge/tags');
      
      if (response.status === 200) {
        logger.info('Knowledge base tags fetched successfully');
        return response.data;
      } else {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base tags:', error as Error);
      throw error;
    }
  }

  /**
   * Submit article feedback
   * @param feedback - The feedback data
   * @returns Promise<void>
   */
  async submitFeedback(feedback: ArticleFeedback): Promise<void> {
    try {
      logger.info('Submitting knowledge base article feedback', { articleId: feedback.articleId });
      
      const response = await api.post(`/api/v1/knowledge/articles/${feedback.articleId}/feedback`, feedback);
      
      if (response.status === 200) {
        logger.info('Knowledge base article feedback submitted successfully', { articleId: feedback.articleId });
      } else {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error submitting knowledge base article feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Rate article
   * @param articleId - The article ID
   * @param rating - The rating (1-5)
   * @returns Promise<void>
   */
  async rateArticle(articleId: string, rating: number): Promise<void> {
    try {
      logger.info('Rating knowledge base article', { articleId, rating });
      
      const response = await api.post(`/api/v1/knowledge/articles/${articleId}/rate`, { rating });
      
      if (response.status === 200) {
        logger.info('Knowledge base article rated successfully', { articleId, rating });
      } else {
        throw new Error(`Failed to rate article: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error rating knowledge base article:', error as Error);
      throw error;
    }
  }

  /**
   * Increment article views
   * @param articleId - The article ID
   * @returns Promise<void>
   */
  async incrementViews(articleId: string): Promise<void> {
    try {
      logger.info('Incrementing knowledge base article views', { articleId });
      
      const response = await api.post(`/api/v1/knowledge/articles/${articleId}/view`);
      
      if (response.status === 200) {
        logger.info('Knowledge base article views incremented successfully', { articleId });
      } else {
        throw new Error(`Failed to increment views: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error incrementing knowledge base article views:', error as Error);
      throw error;
    }
  }

  /**
   * Bookmark article
   * @param articleId - The article ID
   * @returns Promise<void>
   */
  async bookmarkArticle(articleId: string): Promise<void> {
    try {
      logger.info('Bookmarking knowledge base article', { articleId });
      
      const response = await api.post(`/api/v1/knowledge/articles/${articleId}/bookmark`);
      
      if (response.status === 200) {
        logger.info('Knowledge base article bookmarked successfully', { articleId });
      } else {
        throw new Error(`Failed to bookmark article: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error bookmarking knowledge base article:', error as Error);
      throw error;
    }
  }

  /**
   * Get bookmarked articles
   * @returns Promise<KnowledgeArticle[]>
   */
  async getBookmarkedArticles(): Promise<KnowledgeArticle[]> {
    try {
      logger.info('Fetching bookmarked knowledge base articles');
      
      const response = await api.get('/api/v1/knowledge/bookmarks');
      
      if (response.status === 200) {
        logger.info('Bookmarked knowledge base articles fetched successfully', { count: response.data.length });
        return response.data;
      } else {
        throw new Error(`Failed to fetch bookmarked articles: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching bookmarked knowledge base articles:', error as Error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   * @param query - Search query
   * @returns Promise<string[]>
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      logger.info('Fetching knowledge base search suggestions', { query });
      
      const response = await api.get(`/api/v1/knowledge/suggestions?q=${encodeURIComponent(query)}`);
      
      if (response.status === 200) {
        logger.info('Knowledge base search suggestions fetched successfully', { query, count: response.data.length });
        return response.data;
      } else {
        throw new Error(`Failed to fetch search suggestions: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base search suggestions:', error as Error);
      throw error;
    }
  }

  /**
   * Get article statistics
   * @param articleId - The article ID
   * @returns Promise<Record<string, any>>
   */
  async getArticleStatistics(articleId: string): Promise<Record<string, any>> {
    try {
      logger.info('Fetching knowledge base article statistics', { articleId });
      
      const response = await api.get(`/api/v1/knowledge/articles/${articleId}/statistics`);
      
      if (response.status === 200) {
        logger.info('Knowledge base article statistics fetched successfully', { articleId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch article statistics: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base article statistics:', error as Error);
      throw error;
    }
  }

  /**
   * Get knowledge base analytics
   * @returns Promise<Record<string, any>>
   */
  async getAnalytics(): Promise<Record<string, any>> {
    try {
      logger.info('Fetching knowledge base analytics');
      
      const response = await api.get('/api/v1/knowledge/analytics');
      
      if (response.status === 200) {
        logger.info('Knowledge base analytics fetched successfully');
        return response.data;
      } else {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching knowledge base analytics:', error as Error);
      throw error;
    }
  }

  /**
   * Export article
   * @param articleId - The article ID
   * @param format - Export format (pdf, docx, html)
   * @returns Promise<string> - Export URL
   */
  async exportArticle(articleId: string, format: 'pdf' | 'docx' | 'html' = 'pdf'): Promise<string> {
    try {
      logger.info('Exporting knowledge base article', { articleId, format });
      
      const response = await api.get(`/api/v1/knowledge/articles/${articleId}/export?format=${format}`);
      
      if (response.status === 200) {
        logger.info('Knowledge base article exported successfully', { articleId, format });
        return response.data.exportUrl;
      } else {
        throw new Error(`Failed to export article: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error exporting knowledge base article:', error as Error);
      throw error;
    }
  }

  /**
   * Share article
   * @param articleId - The article ID
   * @param shareData - Share data (email, message, etc.)
   * @returns Promise<void>
   */
  async shareArticle(articleId: string, shareData: { email?: string; message?: string; platform?: string }): Promise<void> {
    try {
      logger.info('Sharing knowledge base article', { articleId, shareData });
      
      const response = await api.post(`/api/v1/knowledge/articles/${articleId}/share`, shareData);
      
      if (response.status === 200) {
        logger.info('Knowledge base article shared successfully', { articleId });
      } else {
        throw new Error(`Failed to share article: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error sharing knowledge base article:', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();