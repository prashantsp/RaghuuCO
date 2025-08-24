"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = exports.SearchEntityType = void 0;
const DatabaseService_1 = require("@/services/DatabaseService");
const logger_1 = require("@/utils/logger");
const cacheService_1 = __importDefault(require("@/services/cacheService"));
const db = new DatabaseService_1.DatabaseService();
var SearchEntityType;
(function (SearchEntityType) {
    SearchEntityType["CASES"] = "cases";
    SearchEntityType["CLIENTS"] = "clients";
    SearchEntityType["DOCUMENTS"] = "documents";
    SearchEntityType["USERS"] = "users";
    SearchEntityType["EXPENSES"] = "expenses";
    SearchEntityType["ARTICLES"] = "articles";
    SearchEntityType["TASKS"] = "tasks";
    SearchEntityType["INVOICES"] = "invoices";
    SearchEntityType["TIME_ENTRIES"] = "time_entries";
})(SearchEntityType || (exports.SearchEntityType = SearchEntityType = {}));
class SearchService {
    async globalSearch(options) {
        const startTime = Date.now();
        const cacheKey = `search:${JSON.stringify(options)}`;
        try {
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const { query, entities = Object.values(SearchEntityType), filters = {}, sortBy = 'relevance', sortOrder = 'desc', page = 1, limit = 50, userId, includeArchived = false } = options;
            if (!query || query.trim().length < 2) {
                throw new Error('Search query must be at least 2 characters long');
            }
            const searchQuery = this.prepareSearchQuery(query);
            const offset = (page - 1) * limit;
            const allResults = [];
            const resultsByEntity = {};
            for (const entity of entities) {
                const entityResults = await this.searchEntity(entity, searchQuery, filters, userId, includeArchived);
                allResults.push(...entityResults);
                resultsByEntity[entity] = entityResults.length;
            }
            allResults.sort((a, b) => {
                if (sortBy === 'relevance') {
                    return sortOrder === 'desc' ? b.relevance - a.relevance : a.relevance - b.relevance;
                }
                else if (sortBy === 'date') {
                    return sortOrder === 'desc'
                        ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                }
                else {
                    return sortOrder === 'desc'
                        ? b.title.localeCompare(a.title)
                        : a.title.localeCompare(b.title);
                }
            });
            const paginatedResults = allResults.slice(offset, offset + limit);
            const queryTime = Date.now() - startTime;
            const suggestions = await this.generateSearchSuggestions(query);
            const popularTerms = await this.getPopularSearchTerms();
            const stats = {
                totalResults: allResults.length,
                resultsByEntity,
                queryTime,
                suggestions,
                popularTerms
            };
            const result = { results: paginatedResults, stats };
            await cacheService_1.default.set(cacheKey, result, 300);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error performing global search:', error);
            throw error;
        }
    }
    async searchEntity(entity, query, filters, userId, includeArchived = false) {
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
        }
        catch (error) {
            logger_1.logger.error(`Error searching entity ${entity}:`, error);
            return [];
        }
    }
    async searchCases(query, filters, userId, includeArchived = false) {
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
        ${filters["status"] ? 'AND c.status = $4' : ''}
        ${filters["priority"] ? 'AND c.priority = $5' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, includeArchived, userId, filters["status"], filters["priority"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchClients(query, filters, userId, includeArchived = false) {
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
        ${filters["clientType"] ? 'AND c.client_type = $4' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, includeArchived, userId, filters["clientType"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchDocuments(query, filters, userId, includeArchived = false) {
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
        ${filters["fileType"] ? 'AND d.file_type = $4' : ''}
        ${filters["caseId"] ? 'AND d.case_id = $5' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, includeArchived, userId, filters["fileType"], filters["caseId"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchUsers(query, filters, _userId) {
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
        ${filters["role"] ? 'AND u.role = $2' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, filters["role"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchExpenses(query, filters, userId, _includeArchived = false) {
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
        ${filters["category"] ? 'AND e.category = $3' : ''}
        ${filters["isApproved"] !== undefined ? 'AND e.is_approved = $4' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, userId, filters["category"], filters["isApproved"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchArticles(query, filters, includeArchived = false) {
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
        ${filters["status"] ? 'AND a.status = $3' : ''}
        ${filters["categoryId"] ? 'AND a.category_id = $4' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, includeArchived, filters["status"], filters["categoryId"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchTasks(query, filters, userId, _includeArchived = false) {
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
        ${filters["status"] ? 'AND t.status = $3' : ''}
        ${filters["priority"] ? 'AND t.priority = $4' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, userId, filters["status"], filters["priority"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchInvoices(query, filters, userId, _includeArchived = false) {
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
        ${filters["status"] ? 'AND i.status = $3' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, userId, filters["status"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    async searchTimeEntries(query, filters, userId, _includeArchived = false) {
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
        ${filters["dateFrom"] ? 'AND te.date >= $3' : ''}
        ${filters["dateTo"] ? 'AND te.date <= $4' : ''}
      ORDER BY relevance DESC
    `;
        const params = [query, userId, filters["dateFrom"], filters["dateTo"]].filter(Boolean);
        const result = await db.query(sql, params);
        return result.map((row) => ({
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
    prepareSearchQuery(query) {
        return query
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }
    async generateSearchSuggestions(query) {
        try {
            const cacheKey = `search_suggestions:${query}`;
            const cached = await cacheService_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const suggestions = [];
            const historySql = `
        SELECT DISTINCT query, COUNT(*) as count
        FROM search_history
        WHERE query ILIKE $1
        GROUP BY query
        ORDER BY count DESC
        LIMIT 5
      `;
            const historyResult = await db.query(historySql, [`%${query}%`]);
            suggestions.push(...historyResult.map((row) => row.query));
            const popularSql = `
        SELECT term, COUNT(*) as count
        FROM search_popular_terms
        WHERE term ILIKE $1
        GROUP BY term
        ORDER BY count DESC
        LIMIT 5
      `;
            const popularResult = await db.query(popularSql, [`%${query}%`]);
            suggestions.push(...popularResult.map((row) => row.term));
            const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10);
            await cacheService_1.default.set(cacheKey, uniqueSuggestions, 3600);
            return uniqueSuggestions;
        }
        catch (error) {
            logger_1.logger.error('Error generating search suggestions:', error);
            return [];
        }
    }
    async getPopularSearchTerms() {
        try {
            const cacheKey = 'popular_search_terms';
            const cached = await cacheService_1.default.get(cacheKey);
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
            const terms = result.map((row) => row.term);
            await cacheService_1.default.set(cacheKey, terms, 3600);
            return terms;
        }
        catch (error) {
            logger_1.logger.error('Error getting popular search terms:', error);
            return [];
        }
    }
    async logSearchQuery(query, userId, resultsCount = 0) {
        try {
            const sql = `
        INSERT INTO search_history (query, user_id, results_count, created_at)
        VALUES ($1, $2, $3, NOW())
      `;
            await db.query(sql, [query, userId, resultsCount]);
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
        }
        catch (error) {
            logger_1.logger.error('Error logging search query:', error);
        }
    }
    async getSearchStats() {
        try {
            const cacheKey = 'search_stats';
            const cached = await cacheService_1.default.get(cacheKey);
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
            const result = stats[0];
            await cacheService_1.default.set(cacheKey, result, 3600);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error getting search stats:', error);
            return {};
        }
    }
}
exports.SearchService = SearchService;
exports.default = new SearchService();
//# sourceMappingURL=searchService.js.map