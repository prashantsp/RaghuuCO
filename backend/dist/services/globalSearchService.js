"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearchService = exports.GlobalSearchService = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
class GlobalSearchService {
    async globalSearch(query, entityTypes = [], limit = 20, offset = 0) {
        try {
            logger_1.default.info('Performing global search', { query, entityTypes, limit, offset });
            const results = {
                cases: [],
                clients: [],
                documents: [],
                users: [],
                expenses: [],
                articles: [],
                totalResults: 0
            };
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
                results.cases = casesResult[0];
            }
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
                results.clients = clientsResult[0];
            }
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
                results.documents = documentsResult[0];
            }
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
                results.users = usersResult[0];
            }
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
                results.expenses = expensesResult[0];
            }
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
                results.articles = articlesResult[0];
            }
            results.totalResults = results.cases.length + results.clients.length +
                results.documents.length + results.users.length +
                results.expenses.length + results.articles.length;
            logger_1.default.info('Global search completed successfully', {
                query,
                totalResults: results.totalResults,
                entityTypes: entityTypes.length === 0 ? 'all' : entityTypes
            });
            return {
                success: true,
                data: { results }
            };
        }
        catch (error) {
            logger_1.default.error('Error performing global search', error);
            throw new Error('Failed to perform global search');
        }
    }
    async getSearchSuggestions(query, limit = 10) {
        try {
            logger_1.default.info('Getting search suggestions', { query, limit });
            const suggestions = {
                cases: [],
                clients: [],
                documents: [],
                users: [],
                expenses: [],
                articles: []
            };
            const casesResult = await db.query(`
        SELECT DISTINCT case_number, title
        FROM cases 
        WHERE case_number ILIKE $1 OR title ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.cases = casesResult[0];
            const clientsResult = await db.query(`
        SELECT DISTINCT name, email
        FROM clients 
        WHERE name ILIKE $1 OR email ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.clients = clientsResult[0];
            const documentsResult = await db.query(`
        SELECT DISTINCT title, file_name
        FROM documents 
        WHERE title ILIKE $1 OR file_name ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.documents = documentsResult[0];
            const usersResult = await db.query(`
        SELECT DISTINCT CONCAT(first_name, ' ', last_name) as full_name, email
        FROM users 
        WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.users = usersResult[0];
            const expensesResult = await db.query(`
        SELECT DISTINCT description, category
        FROM expenses 
        WHERE description ILIKE $1 OR category ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.expenses = expensesResult[0];
            const articlesResult = await db.query(`
        SELECT DISTINCT title, excerpt
        FROM articles 
        WHERE title ILIKE $1 OR excerpt ILIKE $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [`%${query}%`, limit]);
            suggestions.articles = articlesResult[0];
            logger_1.default.info('Search suggestions fetched successfully', { query, limit });
            return {
                success: true,
                data: { suggestions }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting search suggestions', error);
            throw new Error('Failed to get search suggestions');
        }
    }
    async getSearchStatistics() {
        try {
            logger_1.default.info('Getting search statistics');
            const statsResult = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM cases) as total_cases,
          (SELECT COUNT(*) FROM clients) as total_clients,
          (SELECT COUNT(*) FROM documents) as total_documents,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM expenses) as total_expenses,
          (SELECT COUNT(*) FROM articles) as total_articles
      `);
            const stats = statsResult[0][0];
            logger_1.default.info('Search statistics fetched successfully');
            return {
                success: true,
                data: { stats }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting search statistics', error);
            throw new Error('Failed to get search statistics');
        }
    }
    async getPopularSearchTerms(limit = 10) {
        try {
            logger_1.default.info('Getting popular search terms', { limit });
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
            logger_1.default.info('Popular search terms fetched successfully');
            return {
                success: true,
                data: { popularTerms: popularTerms.slice(0, limit) }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting popular search terms', error);
            throw new Error('Failed to get popular search terms');
        }
    }
}
exports.GlobalSearchService = GlobalSearchService;
exports.globalSearchService = new GlobalSearchService();
//# sourceMappingURL=globalSearchService.js.map