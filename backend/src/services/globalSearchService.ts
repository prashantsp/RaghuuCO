/**
 * Global Search Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for global search functionality across all system entities
 */

import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Global Search Service Class
 * Handles comprehensive search across all system entities
 */
export class GlobalSearchService {
  /**
   * Perform global search across all entities
   */
  async globalSearch(query: string, entityTypes: string[] = [], limit: number = 20, offset: number = 0): Promise<any> {
    try {
      logger.info('Performing global search', { query, entityTypes, limit, offset });

      const results: any = {
        cases: [],
        clients: [],
        documents: [],
        users: [],
        expenses: [],
        articles: [],
        totalResults: 0
      };

      // Search cases
      if (entityTypes.length === 0 || entityTypes.includes('cases')) {
        const casesResult = await db.query(`
          SELECT 
            'case' as entity_type,
            id,
            case_number as title,
            title as subtitle,
            status,
            created_at,
            'Case' as entity_label
          FROM cases 
          WHERE case_number ILIKE $1 OR title ILIKE $1 OR description ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.cases = casesResult.rows;
      }

      // Search clients
      if (entityTypes.length === 0 || entityTypes.includes('clients')) {
        const clientsResult = await db.query(`
          SELECT 
            'client' as entity_type,
            id,
            name as title,
            email as subtitle,
            client_type as status,
            created_at,
            'Client' as entity_label
          FROM clients 
          WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.clients = clientsResult.rows;
      }

      // Search documents
      if (entityTypes.length === 0 || entityTypes.includes('documents')) {
        const documentsResult = await db.query(`
          SELECT 
            'document' as entity_type,
            id,
            title,
            file_name as subtitle,
            document_type as status,
            created_at,
            'Document' as entity_label
          FROM documents 
          WHERE title ILIKE $1 OR file_name ILIKE $1 OR description ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.documents = documentsResult.rows;
      }

      // Search users
      if (entityTypes.length === 0 || entityTypes.includes('users')) {
        const usersResult = await db.query(`
          SELECT 
            'user' as entity_type,
            id,
            CONCAT(first_name, ' ', last_name) as title,
            email as subtitle,
            role as status,
            created_at,
            'User' as entity_label
          FROM users 
          WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.users = usersResult.rows;
      }

      // Search expenses
      if (entityTypes.length === 0 || entityTypes.includes('expenses')) {
        const expensesResult = await db.query(`
          SELECT 
            'expense' as entity_type,
            id,
            description as title,
            category as subtitle,
            CASE WHEN is_approved THEN 'approved' ELSE 'pending' END as status,
            created_at,
            'Expense' as entity_label
          FROM expenses 
          WHERE description ILIKE $1 OR category ILIKE $1 OR notes ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.expenses = expensesResult.rows;
      }

      // Search articles
      if (entityTypes.length === 0 || entityTypes.includes('articles')) {
        const articlesResult = await db.query(`
          SELECT 
            'article' as entity_type,
            id,
            title,
            excerpt as subtitle,
            status,
            created_at,
            'Article' as entity_label
          FROM articles 
          WHERE title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1
          ORDER BY created_at DESC
          LIMIT $2 OFFSET $3
        `, [`%${query}%`, limit, offset]);
        results.articles = articlesResult.rows;
      }

      // Calculate total results
      results.totalResults = results.cases.length + results.clients.length + 
                            results.documents.length + results.users.length + 
                            results.expenses.length + results.articles.length;

      logger.info('Global search completed successfully', { 
        query, 
        totalResults: results.totalResults,
        entityTypes: entityTypes.length === 0 ? 'all' : entityTypes 
      });

      return {
        success: true,
        data: { results }
      };
    } catch (error) {
      logger.error('Error performing global search', error as Error);
      throw new Error('Failed to perform global search');
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<any> {
    try {
      logger.info('Getting search suggestions', { query, limit });

      const suggestions: any = {
        cases: [],
        clients: [],
        documents: [],
        users: [],
        expenses: [],
        articles: []
      };

      // Get case suggestions
      const casesResult = await db.query(`
        SELECT DISTINCT case_number, title
        FROM cases 
        WHERE case_number ILIKE $1 OR title ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.cases = casesResult.rows;

      // Get client suggestions
      const clientsResult = await db.query(`
        SELECT DISTINCT name, email
        FROM clients 
        WHERE name ILIKE $1 OR email ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.clients = clientsResult.rows;

      // Get document suggestions
      const documentsResult = await db.query(`
        SELECT DISTINCT title, file_name
        FROM documents 
        WHERE title ILIKE $1 OR file_name ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.documents = documentsResult.rows;

      // Get user suggestions
      const usersResult = await db.query(`
        SELECT DISTINCT CONCAT(first_name, ' ', last_name) as full_name, email
        FROM users 
        WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.users = usersResult.rows;

      // Get expense suggestions
      const expensesResult = await db.query(`
        SELECT DISTINCT description, category
        FROM expenses 
        WHERE description ILIKE $1 OR category ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.expenses = expensesResult.rows;

      // Get article suggestions
      const articlesResult = await db.query(`
        SELECT DISTINCT title, excerpt
        FROM articles 
        WHERE title ILIKE $1 OR excerpt ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
      suggestions.articles = articlesResult.rows;

      logger.info('Search suggestions fetched successfully', { query, limit });

      return {
        success: true,
        data: { suggestions }
      };
    } catch (error) {
      logger.error('Error getting search suggestions', error as Error);
      throw new Error('Failed to get search suggestions');
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStatistics(): Promise<any> {
    try {
      logger.info('Getting search statistics');

      const statsResult = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM cases) as total_cases,
          (SELECT COUNT(*) FROM clients) as total_clients,
          (SELECT COUNT(*) FROM documents) as total_documents,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM expenses) as total_expenses,
          (SELECT COUNT(*) FROM articles) as total_articles
      `);

      const stats = statsResult.rows[0];

      logger.info('Search statistics fetched successfully');

      return {
        success: true,
        data: { stats }
      };
    } catch (error) {
      logger.error('Error getting search statistics', error as Error);
      throw new Error('Failed to get search statistics');
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(limit: number = 10): Promise<any> {
    try {
      logger.info('Getting popular search terms', { limit });

      // This would typically come from a search analytics table
      // For now, we'll return some common search patterns
      const popularTerms = [
        'case',
        'client',
        'document',
        'expense',
        'invoice',
        'payment',
        'court',
        'hearing',
        'contract',
        'agreement'
      ];

      logger.info('Popular search terms fetched successfully');

      return {
        success: true,
        data: { popularTerms: popularTerms.slice(0, limit) }
      };
    } catch (error) {
      logger.error('Error getting popular search terms', error as Error);
      throw new Error('Failed to get popular search terms');
    }
  }
}

// Export service instance
export const globalSearchService = new GlobalSearchService();