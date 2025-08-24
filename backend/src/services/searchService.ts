/**
 * Search Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This service provides comprehensive search functionality including
 * full-text search, search suggestions, and advanced filtering capabilities.
 */

import { DatabaseService } from '@/services/DatabaseService';
import { logger } from '@/utils/logger';
import cacheService from '@/services/cacheService';

const db = new DatabaseService();

/**
 * Search entity types
 */
export enum SearchEntityType {
  CASES = 'cases',
  CLIENTS = 'clients',
  DOCUMENTS = 'documents',
  USERS = 'users',
  EXPENSES = 'expenses',
  ARTICLES = 'articles',
  TASKS = 'tasks',
  INVOICES = 'invoices',
  TIME_ENTRIES = 'time_entries'
}

/**
 * Search result interface
 */
export interface SearchResult {
  id: string;
  type: SearchEntityType;
  title: string;
  description?: string;
  relevance: number;
  metadata: Record<string, any>;
  url: string;
  timestamp: string;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  query: string;
  entities?: SearchEntityType[];
  filters?: Record<string, any>;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  userId?: string;
  includeArchived?: boolean;
}

/**
 * Search statistics interface
 */
export interface SearchStats {
  totalResults: number;
  resultsByEntity: Record<SearchEntityType, number>;
  queryTime: number;
  suggestions: string[];
  popularTerms: string[];
}

/**
 * Search service class
 */
class SearchService {
  /**
   * Perform global search across all entities
   */
  async globalSearch(options: SearchOptions): Promise<{ results: SearchResult[], stats: SearchStats }> {
    const startTime = Date.now();
    const cacheKey = `search:${JSON.stringify(options)}`;
    
    try {
      // Try to get from cache first
      const cached = await cacheService.get<{ results: SearchResult[], stats: SearchStats }>(cacheKey);
      if (cached) {
        return cached;
      }

      const { query, entities = Object.values(SearchEntityType), filters = {}, sortBy = 'relevance', sortOrder = 'desc', page = 1, limit = 50, userId, includeArchived = false } = options;

      // Validate query
      if (!query || query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      // Prepare search query
      const searchQuery = this.prepareSearchQuery(query);
      const offset = (page - 1) * limit;

      // Perform search across all entities
      const allResults: SearchResult[] = [];
      const resultsByEntity: Record<SearchEntityType, number> = {} as Record<SearchEntityType, number>;

      for (const entity of entities) {
        const entityResults = await this.searchEntity(entity, searchQuery, filters, userId, includeArchived);
        allResults.push(...entityResults);
        resultsByEntity[entity] = entityResults.length;
      }

      // Sort results by relevance
      allResults.sort((a, b) => {
        if (sortBy === 'relevance') {
          return sortOrder === 'desc' ? b.relevance - a.relevance : a.relevance - b.relevance;
        } else if (sortBy === 'date') {
          return sortOrder === 'desc' 
            ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } else {
          return sortOrder === 'desc' 
            ? b.title.localeCompare(a.title)
            : a.title.localeCompare(b.title);
        }
      });

      // Apply pagination
      const paginatedResults = allResults.slice(offset, offset + limit);

      // Calculate statistics
      const queryTime = Date.now() - startTime;
      const suggestions = await this.generateSearchSuggestions(query);
      const popularTerms = await this.getPopularSearchTerms();

      const stats: SearchStats = {
        totalResults: allResults.length,
        resultsByEntity,
        queryTime,
        suggestions,
        popularTerms
      };

      const result = { results: paginatedResults, stats };

      // Cache results for 5 minutes
      await cacheService.set(cacheKey, result, 300);

      return result;
    } catch (error) {
      logger.error('Error performing global search:', error as Error);
      throw error;
    }
  }

  /**
   * Search within a specific entity
   */
  private async searchEntity(
    entity: SearchEntityType, 
    query: string, 
    filters: Record<string, any>, 
    userId?: string, 
    includeArchived = false
  ): Promise<SearchResult[]> {
    try {
      switch (entity) {
        case SearchEntityType.CASES:
          return await this.searchCases(query, filters, userId, includeArchived);
        case SearchEntityType.CLIENTS:
          return await this.searchClients(query, filters, userId, includeArchived);
        case SearchEntityType.DOCUMENTS:
          return await this.searchDocuments(query, filters, userId, includeArchived);
        case SearchEntityType.USERS:
          return await this.searchUsers(query, filters, userId);
        case SearchEntityType.EXPENSES:
          return await this.searchExpenses(query, filters, userId, includeArchived);
        case SearchEntityType.ARTICLES:
          return await this.searchArticles(query, filters, includeArchived);
        case SearchEntityType.TASKS:
          return await this.searchTasks(query, filters, userId, includeArchived);
        case SearchEntityType.INVOICES:
          return await this.searchInvoices(query, filters, userId, includeArchived);
        case SearchEntityType.TIME_ENTRIES:
          return await this.searchTimeEntries(query, filters, userId, includeArchived);
        default:
          return [];
      }
    } catch (error) {
      logger.error(`Error searching entity ${entity}:`, error as Error);
      return [];
    }
  }

  /**
   * Search cases
   */
  private async searchCases(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.case_number,
        c.status,
        c.priority,
        c.created_at,
        c.updated_at,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        cl.company_name as client_company,
        ts_rank(
          to_tsvector('english', 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(c.description, '') || ' ' || 
            COALESCE(c.case_number, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM cases c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE 
        (c.status != 'deleted' OR $2 = true)
        AND (
          to_tsvector('english', 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(c.description, '') || ' ' || 
            COALESCE(c.case_number, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND (c.created_by = $3 OR c.assigned_to = $3)' : ''}
        ${filters.status ? 'AND c.status = $4' : ''}
        ${filters.priority ? 'AND c.priority = $5' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, includeArchived, userId, filters.status, filters.priority].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.CASES,
      title: row.title,
      description: row.description,
      relevance: parseFloat(row.relevance),
      metadata: {
        caseNumber: row.case_number,
        status: row.status,
        priority: row.priority,
        clientName: `${row.client_first_name} ${row.client_last_name}`.trim() || row.client_company,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/cases/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search clients
   */
  private async searchClients(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.company_name,
        c.email,
        c.phone,
        c.created_at,
        c.updated_at,
        ts_rank(
          to_tsvector('english', 
            COALESCE(c.first_name, '') || ' ' || 
            COALESCE(c.last_name, '') || ' ' || 
            COALESCE(c.email, '') || ' ' || 
            COALESCE(c.phone, '') || ' ' || 
            COALESCE(c.company_name, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM clients c
      WHERE 
        (c.is_active = true OR $2 = true)
        AND (
          to_tsvector('english', 
            COALESCE(c.first_name, '') || ' ' || 
            COALESCE(c.last_name, '') || ' ' || 
            COALESCE(c.email, '') || ' ' || 
            COALESCE(c.phone, '') || ' ' || 
            COALESCE(c.company_name, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND c.created_by = $3' : ''}
        ${filters.clientType ? 'AND c.client_type = $4' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, includeArchived, userId, filters.clientType].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.CLIENTS,
      title: `${row.first_name} ${row.last_name}`.trim() || row.company_name,
      description: row.email || row.phone,
      relevance: parseFloat(row.relevance),
      metadata: {
        firstName: row.first_name,
        lastName: row.last_name,
        companyName: row.company_name,
        email: row.email,
        phone: row.phone,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/clients/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search documents
   */
  private async searchDocuments(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        d.id,
        d.title,
        d.description,
        d.file_name,
        d.file_type,
        d.created_at,
        d.updated_at,
        c.title as case_title,
        ts_rank(
          to_tsvector('english', 
            COALESCE(d.title, '') || ' ' || 
            COALESCE(d.description, '') || ' ' || 
            COALESCE(d.file_name, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM documents d
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE 
        (d.is_deleted = false OR $2 = true)
        AND (
          to_tsvector('english', 
            COALESCE(d.title, '') || ' ' || 
            COALESCE(d.description, '') || ' ' || 
            COALESCE(d.file_name, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND d.uploaded_by = $3' : ''}
        ${filters.fileType ? 'AND d.file_type = $4' : ''}
        ${filters.caseId ? 'AND d.case_id = $5' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, includeArchived, userId, filters.fileType, filters.caseId].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.DOCUMENTS,
      title: row.title || row.file_name,
      description: row.description,
      relevance: parseFloat(row.relevance),
      metadata: {
        fileName: row.file_name,
        fileType: row.file_type,
        caseTitle: row.case_title,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/documents/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search users
   */
  private async searchUsers(query: string, filters: Record<string, any>, userId?: string): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        ts_rank(
          to_tsvector('english', 
            COALESCE(u.first_name, '') || ' ' || 
            COALESCE(u.last_name, '') || ' ' || 
            COALESCE(u.email, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM users u
      WHERE 
        u.is_active = true
        AND (
          to_tsvector('english', 
            COALESCE(u.first_name, '') || ' ' || 
            COALESCE(u.last_name, '') || ' ' || 
            COALESCE(u.email, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${filters.role ? 'AND u.role = $2' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, filters.role].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.USERS,
      title: `${row.first_name} ${row.last_name}`,
      description: row.email,
      relevance: parseFloat(row.relevance),
      metadata: {
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/users/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search expenses
   */
  private async searchExpenses(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        e.id,
        e.description,
        e.amount,
        e.category,
        e.expense_date,
        e.created_at,
        e.updated_at,
        c.title as case_title,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        ts_rank(
          to_tsvector('english', 
            COALESCE(e.description, '') || ' ' || 
            COALESCE(e.category, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM expenses e
      LEFT JOIN cases c ON e.case_id = c.id
      LEFT JOIN clients cl ON e.client_id = cl.id
      WHERE 
        (
          to_tsvector('english', 
            COALESCE(e.description, '') || ' ' || 
            COALESCE(e.category, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND e.created_by = $2' : ''}
        ${filters.category ? 'AND e.category = $3' : ''}
        ${filters.isApproved !== undefined ? 'AND e.is_approved = $4' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, userId, filters.category, filters.isApproved].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.EXPENSES,
      title: row.description,
      description: `$${row.amount} - ${row.category}`,
      relevance: parseFloat(row.relevance),
      metadata: {
        amount: row.amount,
        category: row.category,
        expenseDate: row.expense_date,
        caseTitle: row.case_title,
        clientName: `${row.client_first_name} ${row.client_last_name}`.trim(),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/expenses/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search articles
   */
  private async searchArticles(query: string, filters: Record<string, any>, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        a.id,
        a.title,
        a.content,
        a.excerpt,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        cc.name as category_name,
        ts_rank(
          to_tsvector('english', 
            COALESCE(a.title, '') || ' ' || 
            COALESCE(a.content, '') || ' ' || 
            COALESCE(a.excerpt, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM articles a
      LEFT JOIN content_categories cc ON a.category_id = cc.id
      WHERE 
        (a.status = 'published' OR $2 = true)
        AND (
          to_tsvector('english', 
            COALESCE(a.title, '') || ' ' || 
            COALESCE(a.content, '') || ' ' || 
            COALESCE(a.excerpt, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${filters.status ? 'AND a.status = $3' : ''}
        ${filters.categoryId ? 'AND a.category_id = $4' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, includeArchived, filters.status, filters.categoryId].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.ARTICLES,
      title: row.title,
      description: row.excerpt,
      relevance: parseFloat(row.relevance),
      metadata: {
        content: row.content,
        status: row.status,
        categoryName: row.category_name,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/articles/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search tasks
   */
  private async searchTasks(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.updated_at,
        c.title as case_title,
        ts_rank(
          to_tsvector('english', 
            COALESCE(t.title, '') || ' ' || 
            COALESCE(t.description, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM tasks t
      LEFT JOIN cases c ON t.case_id = c.id
      WHERE 
        (
          to_tsvector('english', 
            COALESCE(t.title, '') || ' ' || 
            COALESCE(t.description, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND t.assigned_to = $2' : ''}
        ${filters.status ? 'AND t.status = $3' : ''}
        ${filters.priority ? 'AND t.priority = $4' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, userId, filters.status, filters.priority].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.TASKS,
      title: row.title,
      description: row.description,
      relevance: parseFloat(row.relevance),
      metadata: {
        status: row.status,
        priority: row.priority,
        dueDate: row.due_date,
        caseTitle: row.case_title,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/tasks/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search invoices
   */
  private async searchInvoices(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        i.id,
        i.invoice_number,
        i.amount,
        i.status,
        i.due_date,
        i.created_at,
        i.updated_at,
        c.title as case_title,
        cl.first_name as client_first_name,
        cl.last_name as client_last_name,
        ts_rank(
          to_tsvector('english', 
            COALESCE(i.invoice_number, '') || ' ' || 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(cl.first_name, '') || ' ' || 
            COALESCE(cl.last_name, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM invoices i
      LEFT JOIN cases c ON i.case_id = c.id
      LEFT JOIN clients cl ON i.client_id = cl.id
      WHERE 
        (
          to_tsvector('english', 
            COALESCE(i.invoice_number, '') || ' ' || 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(cl.first_name, '') || ' ' || 
            COALESCE(cl.last_name, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND i.created_by = $2' : ''}
        ${filters.status ? 'AND i.status = $3' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, userId, filters.status].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.INVOICES,
      title: `Invoice ${row.invoice_number}`,
      description: `$${row.amount} - ${row.status}`,
      relevance: parseFloat(row.relevance),
      metadata: {
        invoiceNumber: row.invoice_number,
        amount: row.amount,
        status: row.status,
        dueDate: row.due_date,
        caseTitle: row.case_title,
        clientName: `${row.client_first_name} ${row.client_last_name}`.trim(),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/invoices/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Search time entries
   */
  private async searchTimeEntries(query: string, filters: Record<string, any>, userId?: string, includeArchived = false): Promise<SearchResult[]> {
    const sql = `
      SELECT 
        te.id,
        te.description,
        te.duration_minutes,
        te.date,
        te.created_at,
        te.updated_at,
        c.title as case_title,
        t.title as task_title,
        ts_rank(
          to_tsvector('english', 
            COALESCE(te.description, '') || ' ' || 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(t.title, '')
          ), 
          plainto_tsquery('english', $1)
        ) as relevance
      FROM time_entries te
      LEFT JOIN cases c ON te.case_id = c.id
      LEFT JOIN tasks t ON te.task_id = t.id
      WHERE 
        (
          to_tsvector('english', 
            COALESCE(te.description, '') || ' ' || 
            COALESCE(c.title, '') || ' ' || 
            COALESCE(t.title, '')
          ) @@ plainto_tsquery('english', $1)
        )
        ${userId ? 'AND te.user_id = $2' : ''}
        ${filters.dateFrom ? 'AND te.date >= $3' : ''}
        ${filters.dateTo ? 'AND te.date <= $4' : ''}
      ORDER BY relevance DESC
    `;

    const params = [query, userId, filters.dateFrom, filters.dateTo].filter(Boolean);
    const result = await db.query(sql, params);

    return result.rows.map(row => ({
      id: row.id,
      type: SearchEntityType.TIME_ENTRIES,
      title: row.description,
      description: `${row.duration_minutes} minutes - ${row.date}`,
      relevance: parseFloat(row.relevance),
      metadata: {
        durationMinutes: row.duration_minutes,
        date: row.date,
        caseTitle: row.case_title,
        taskTitle: row.task_title,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      },
      url: `/time-entries/${row.id}`,
      timestamp: row.updated_at
    }));
  }

  /**
   * Prepare search query for PostgreSQL full-text search
   */
  private prepareSearchQuery(query: string): string {
    // Remove special characters and normalize
    return query
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /**
   * Generate search suggestions
   */
  async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      const cacheKey = `search_suggestions:${query}`;
      const cached = await cacheService.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const suggestions: string[] = [];
      
      // Get suggestions from search history
      const historySql = `
        SELECT DISTINCT query, COUNT(*) as count
        FROM search_history
        WHERE query ILIKE $1
        GROUP BY query
        ORDER BY count DESC
        LIMIT 5
      `;
      
      const historyResult = await db.query(historySql, [`%${query}%`]);
      suggestions.push(...historyResult.rows.map(row => row.query));

      // Get suggestions from popular terms
      const popularSql = `
        SELECT term, COUNT(*) as count
        FROM search_popular_terms
        WHERE term ILIKE $1
        GROUP BY term
        ORDER BY count DESC
        LIMIT 5
      `;
      
      const popularResult = await db.query(popularSql, [`%${query}%`]);
      suggestions.push(...popularResult.rows.map(row => row.term));

      // Remove duplicates and limit results
      const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10);

      // Cache suggestions for 1 hour
      await cacheService.set(cacheKey, uniqueSuggestions, 3600);

      return uniqueSuggestions;
    } catch (error) {
      logger.error('Error generating search suggestions:', error as Error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(): Promise<string[]> {
    try {
      const cacheKey = 'popular_search_terms';
      const cached = await cacheService.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const sql = `
        SELECT term, COUNT(*) as count
        FROM search_popular_terms
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY term
        ORDER BY count DESC
        LIMIT 20
      `;
      
      const result = await db.query(sql);
      const terms = result.rows.map(row => row.term);

      // Cache for 1 hour
      await cacheService.set(cacheKey, terms, 3600);

      return terms;
    } catch (error) {
      logger.error('Error getting popular search terms:', error as Error);
      return [];
    }
  }

  /**
   * Log search query for analytics
   */
  async logSearchQuery(query: string, userId?: string, resultsCount = 0): Promise<void> {
    try {
      const sql = `
        INSERT INTO search_history (query, user_id, results_count, created_at)
        VALUES ($1, $2, $3, NOW())
      `;
      
      await db.query(sql, [query, userId, resultsCount]);

      // Update popular terms
      const terms = query.toLowerCase().split(/\s+/);
      for (const term of terms) {
        if (term.length >= 3) {
          const termSql = `
            INSERT INTO search_popular_terms (term, user_id, created_at)
            VALUES ($1, $2, NOW())
          `;
          await db.query(termSql, [term, userId]);
        }
      }
    } catch (error) {
      logger.error('Error logging search query:', error as Error);
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<any> {
    try {
      const cacheKey = 'search_stats';
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_searches,
          COUNT(DISTINCT user_id) as unique_users,
          AVG(results_count) as avg_results,
          MAX(created_at) as last_search
        FROM search_history
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);

      const result = stats.rows[0];

      // Cache for 1 hour
      await cacheService.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      logger.error('Error getting search stats:', error as Error);
      return {};
    }
  }
}

export default new SearchService();
export { SearchService, SearchEntityType };