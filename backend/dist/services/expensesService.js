"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expensesService = exports.ExpensesService = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
class ExpensesService {
    async createExpense(expenseData) {
        try {
            const { description, amount, category, expenseDate, caseId, clientId, createdBy, notes, receiptUrl, isBillable } = expenseData;
            logger_1.default.info('Creating expense', { description, amount, category, createdBy });
            const result = await db.query(SQLQueries.EXPENSES.CREATE, [
                description,
                amount,
                category,
                expenseDate,
                caseId || null,
                clientId || null,
                createdBy,
                notes || null,
                receiptUrl || null,
                isBillable || false
            ]);
            const expense = result.rows[0];
            logger_1.default.businessEvent('expense_created', 'expense', expense.id, createdBy);
            return {
                success: true,
                data: { expense }
            };
        }
        catch (error) {
            logger_1.default.error('Error creating expense', error);
            throw new Error('Failed to create expense');
        }
    }
    async getExpenseById(expenseId) {
        try {
            logger_1.default.info('Getting expense by ID', { expenseId });
            const result = await db.query(SQLQueries.EXPENSES.GET_BY_ID, [expenseId]);
            const expense = result.rows[0];
            if (!expense) {
                throw new Error('Expense not found');
            }
            logger_1.default.info('Expense fetched successfully', { expenseId });
            return {
                success: true,
                data: { expense }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting expense by ID', error);
            throw new Error('Failed to get expense');
        }
    }
    async getExpenses(filters = {}, limit = 20, offset = 0) {
        try {
            const { caseId, clientId, category, isBillable, isApproved } = filters;
            logger_1.default.info('Getting expenses', { filters, limit, offset });
            const result = await db.query(SQLQueries.EXPENSES.GET_ALL, [
                caseId || null,
                clientId || null,
                category || null,
                isBillable !== undefined ? isBillable : null,
                isApproved !== undefined ? isApproved : null,
                limit,
                offset
            ]);
            const expenses = result.rows;
            logger_1.default.info('Expenses fetched successfully', { count: expenses.length });
            return {
                success: true,
                data: { expenses }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting expenses', error);
            throw new Error('Failed to get expenses');
        }
    }
    async getExpensesByCase(caseId) {
        try {
            logger_1.default.info('Getting expenses by case', { caseId });
            const result = await db.query(SQLQueries.EXPENSES.GET_BY_CASE, [caseId]);
            const expenses = result.rows;
            logger_1.default.info('Case expenses fetched successfully', { caseId, count: expenses.length });
            return {
                success: true,
                data: { expenses }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting case expenses', error);
            throw new Error('Failed to get case expenses');
        }
    }
    async getExpensesByClient(clientId) {
        try {
            logger_1.default.info('Getting expenses by client', { clientId });
            const result = await db.query(SQLQueries.EXPENSES.GET_BY_CLIENT, [clientId]);
            const expenses = result.rows;
            logger_1.default.info('Client expenses fetched successfully', { clientId, count: expenses.length });
            return {
                success: true,
                data: { expenses }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting client expenses', error);
            throw new Error('Failed to get client expenses');
        }
    }
    async updateExpense(expenseId, expenseData) {
        try {
            const { description, amount, category, expenseDate, caseId, clientId, notes, receiptUrl, isBillable } = expenseData;
            logger_1.default.info('Updating expense', { expenseId });
            const result = await db.query(SQLQueries.EXPENSES.UPDATE, [
                expenseId,
                description,
                amount,
                category,
                expenseDate,
                caseId || null,
                clientId || null,
                notes || null,
                receiptUrl || null,
                isBillable || false
            ]);
            const expense = result.rows[0];
            if (!expense) {
                throw new Error('Expense not found');
            }
            logger_1.default.businessEvent('expense_updated', 'expense', expenseId, null);
            return {
                success: true,
                data: { expense }
            };
        }
        catch (error) {
            logger_1.default.error('Error updating expense', error);
            throw new Error('Failed to update expense');
        }
    }
    async deleteExpense(expenseId) {
        try {
            logger_1.default.info('Deleting expense', { expenseId });
            const result = await db.query(SQLQueries.EXPENSES.DELETE, [expenseId]);
            if (result.rowCount === 0) {
                throw new Error('Expense not found');
            }
            logger_1.default.businessEvent('expense_deleted', 'expense', expenseId, null);
            return {
                success: true,
                message: 'Expense deleted successfully'
            };
        }
        catch (error) {
            logger_1.default.error('Error deleting expense', error);
            throw new Error('Failed to delete expense');
        }
    }
    async approveExpense(expenseId, approvedBy) {
        try {
            logger_1.default.info('Approving expense', { expenseId, approvedBy });
            const result = await db.query(SQLQueries.EXPENSES.APPROVE, [expenseId, approvedBy]);
            const expense = result.rows[0];
            if (!expense) {
                throw new Error('Expense not found');
            }
            logger_1.default.businessEvent('expense_approved', 'expense', expenseId, approvedBy);
            return {
                success: true,
                data: { expense }
            };
        }
        catch (error) {
            logger_1.default.error('Error approving expense', error);
            throw new Error('Failed to approve expense');
        }
    }
    async getExpenseCategories() {
        try {
            logger_1.default.info('Getting expense categories');
            const result = await db.query(SQLQueries.EXPENSES.GET_CATEGORIES);
            const categories = result.rows;
            logger_1.default.info('Expense categories fetched successfully', { count: categories.length });
            return {
                success: true,
                data: { categories }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting expense categories', error);
            throw new Error('Failed to get expense categories');
        }
    }
    async getMonthlyExpenseTotals(startDate, endDate) {
        try {
            logger_1.default.info('Getting monthly expense totals', { startDate, endDate });
            const result = await db.query(SQLQueries.EXPENSES.GET_MONTHLY_TOTALS, [startDate, endDate]);
            const totals = result.rows;
            logger_1.default.info('Monthly expense totals fetched successfully', { count: totals.length });
            return {
                success: true,
                data: { totals }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting monthly expense totals', error);
            throw new Error('Failed to get monthly expense totals');
        }
    }
    async getCaseExpenseTotals(caseId) {
        try {
            logger_1.default.info('Getting case expense totals', { caseId });
            const result = await db.query(SQLQueries.EXPENSES.GET_CASE_TOTALS, [caseId]);
            const totals = result.rows[0];
            logger_1.default.info('Case expense totals fetched successfully', { caseId });
            return {
                success: true,
                data: { totals }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting case expense totals', error);
            throw new Error('Failed to get case expense totals');
        }
    }
    async getClientExpenseTotals(clientId) {
        try {
            logger_1.default.info('Getting client expense totals', { clientId });
            const result = await db.query(SQLQueries.EXPENSES.GET_CLIENT_TOTALS, [clientId]);
            const totals = result.rows[0];
            logger_1.default.info('Client expense totals fetched successfully', { clientId });
            return {
                success: true,
                data: { totals }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting client expense totals', error);
            throw new Error('Failed to get client expense totals');
        }
    }
    async searchExpenses(query, limit = 20, offset = 0) {
        try {
            logger_1.default.info('Searching expenses', { query, limit, offset });
            const result = await db.query(SQLQueries.EXPENSES.SEARCH, [
                `%${query}%`,
                limit,
                offset
            ]);
            const expenses = result.rows;
            logger_1.default.info('Expense search completed successfully', { query, count: expenses.length });
            return {
                success: true,
                data: { expenses }
            };
        }
        catch (error) {
            logger_1.default.error('Error searching expenses', error);
            throw new Error('Failed to search expenses');
        }
    }
}
exports.ExpensesService = ExpensesService;
exports.expensesService = new ExpensesService();
//# sourceMappingURL=expensesService.js.map