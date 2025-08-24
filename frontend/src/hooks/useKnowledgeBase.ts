/**
 * Knowledge Base Hook
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This hook provides comprehensive knowledge base functionality
 * including search, filtering, and article management for the help system.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
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
 * Knowledge Base Hook
 */
export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Load categories and tags on mount
  useEffect(() => {
    loadCategories();
    loadTags();
  }, []);

  /**
   * Load all categories
   */
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoriesData = await knowledgeBaseService.getCategories();
      setCategories(categoriesData);
      logger.info('Knowledge base categories loaded successfully');
    } catch (error) {
      logger.error('Error loading knowledge base categories:', error as Error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load all tags
   */
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const tagsData = await knowledgeBaseService.getTags();
      setTags(tagsData);
      logger.info('Knowledge base tags loaded successfully');
    } catch (error) {
      logger.error('Error loading knowledge base tags:', error as Error);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search articles
   */
  const searchArticles = useCallback(async (
    query: string,
    searchFilters: SearchFilters = {},
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await knowledgeBaseService.searchArticles(query, searchFilters, page, limit);
      setSearchResults(results);
      setSearchQuery(query);
      setFilters(searchFilters);
      setCurrentPage(page);
      
      logger.info('Knowledge base search completed successfully', { query, results: results.total });
    } catch (error) {
      logger.error('Error searching knowledge base:', error as Error);
      setError('Failed to search articles');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get article by ID
   */
  const getArticle = useCallback(async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const article = await knowledgeBaseService.getArticle(articleId);
      setSelectedArticle(article);
      
      // Increment view count
      await knowledgeBaseService.incrementViews(articleId);
      
      logger.info('Knowledge base article loaded successfully', { articleId });
    } catch (error) {
      logger.error('Error loading knowledge base article:', error as Error);
      setError('Failed to load article');
      setSelectedArticle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get articles by category
   */
  const getArticlesByCategory = useCallback(async (category: string, page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await knowledgeBaseService.getArticlesByCategory(category, page, limit);
      setSearchResults(results);
      setCurrentPage(page);
      
      logger.info('Knowledge base articles by category loaded successfully', { category, results: results.total });
    } catch (error) {
      logger.error('Error loading knowledge base articles by category:', error as Error);
      setError('Failed to load articles by category');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get featured articles
   */
  const getFeaturedArticles = useCallback(async (limit: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      const articles = await knowledgeBaseService.getFeaturedArticles(limit);
      setArticles(articles);
      
      logger.info('Featured knowledge base articles loaded successfully', { count: articles.length });
    } catch (error) {
      logger.error('Error loading featured knowledge base articles:', error as Error);
      setError('Failed to load featured articles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get recent articles
   */
  const getRecentArticles = useCallback(async (limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const articles = await knowledgeBaseService.getRecentArticles(limit);
      setArticles(articles);
      
      logger.info('Recent knowledge base articles loaded successfully', { count: articles.length });
    } catch (error) {
      logger.error('Error loading recent knowledge base articles:', error as Error);
      setError('Failed to load recent articles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get related articles
   */
  const getRelatedArticles = useCallback(async (articleId: string, limit: number = 5) => {
    try {
      setLoading(true);
      setError(null);
      
      const articles = await knowledgeBaseService.getRelatedArticles(articleId, limit);
      setArticles(articles);
      
      logger.info('Related knowledge base articles loaded successfully', { articleId, count: articles.length });
    } catch (error) {
      logger.error('Error loading related knowledge base articles:', error as Error);
      setError('Failed to load related articles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit article feedback
   */
  const submitFeedback = useCallback(async (feedback: ArticleFeedback) => {
    try {
      setLoading(true);
      setError(null);
      
      await knowledgeBaseService.submitFeedback(feedback);
      
      // Update the selected article if it's the same one
      if (selectedArticle && selectedArticle.id === feedback.articleId) {
        const updatedArticle = await knowledgeBaseService.getArticle(feedback.articleId);
        setSelectedArticle(updatedArticle);
      }
      
      logger.info('Knowledge base article feedback submitted successfully', { articleId: feedback.articleId });
    } catch (error) {
      logger.error('Error submitting knowledge base article feedback:', error as Error);
      setError('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  }, [selectedArticle]);

  /**
   * Rate article
   */
  const rateArticle = useCallback(async (articleId: string, rating: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await knowledgeBaseService.rateArticle(articleId, rating);
      
      // Update the selected article if it's the same one
      if (selectedArticle && selectedArticle.id === articleId) {
        const updatedArticle = await knowledgeBaseService.getArticle(articleId);
        setSelectedArticle(updatedArticle);
      }
      
      logger.info('Knowledge base article rated successfully', { articleId, rating });
    } catch (error) {
      logger.error('Error rating knowledge base article:', error as Error);
      setError('Failed to rate article');
    } finally {
      setLoading(false);
    }
  }, [selectedArticle]);

  /**
   * Bookmark article
   */
  const bookmarkArticle = useCallback(async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await knowledgeBaseService.bookmarkArticle(articleId);
      
      logger.info('Knowledge base article bookmarked successfully', { articleId });
    } catch (error) {
      logger.error('Error bookmarking knowledge base article:', error as Error);
      setError('Failed to bookmark article');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get bookmarked articles
   */
  const getBookmarkedArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const articles = await knowledgeBaseService.getBookmarkedArticles();
      setArticles(articles);
      
      logger.info('Bookmarked knowledge base articles loaded successfully', { count: articles.length });
    } catch (error) {
      logger.error('Error loading bookmarked knowledge base articles:', error as Error);
      setError('Failed to load bookmarked articles');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get search suggestions
   */
  const getSearchSuggestions = useCallback(async (query: string) => {
    try {
      const suggestions = await knowledgeBaseService.getSearchSuggestions(query);
      return suggestions;
    } catch (error) {
      logger.error('Error getting search suggestions:', error as Error);
      return [];
    }
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
    setError(null);
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Load next page
   */
  const loadNextPage = useCallback(() => {
    if (searchResults && searchResults.hasMore) {
      searchArticles(searchQuery, filters, currentPage + 1);
    }
  }, [searchResults, searchQuery, filters, currentPage, searchArticles]);

  /**
   * Load previous page
   */
  const loadPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      searchArticles(searchQuery, filters, currentPage - 1);
    }
  }, [searchQuery, filters, currentPage, searchArticles]);

  /**
   * Memoized computed values
   */
  const computedValues = useMemo(() => {
    return {
      hasSearchResults: searchResults !== null,
      totalResults: searchResults?.total || 0,
      hasMorePages: searchResults?.hasMore || false,
      currentPageInfo: searchResults ? `${currentPage} of ${Math.ceil(searchResults.total / searchResults.limit)}` : '',
      filteredCategories: categories.filter(cat => 
        !filters.category || cat === filters.category
      ),
      filteredTags: tags.filter(tag => 
        !filters.tags || filters.tags.includes(tag)
      )
    };
  }, [searchResults, currentPage, categories, tags, filters]);

  return {
    // State
    articles,
    searchResults,
    categories,
    tags,
    loading,
    error,
    searchQuery,
    filters,
    currentPage,
    selectedArticle,
    
    // Actions
    searchArticles,
    getArticle,
    getArticlesByCategory,
    getFeaturedArticles,
    getRecentArticles,
    getRelatedArticles,
    submitFeedback,
    rateArticle,
    bookmarkArticle,
    getBookmarkedArticles,
    getSearchSuggestions,
    clearSearch,
    updateFilters,
    loadNextPage,
    loadPreviousPage,
    
    // Computed values
    ...computedValues
  };
};