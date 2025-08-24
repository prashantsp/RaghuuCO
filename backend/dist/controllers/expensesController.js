"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchExpenses = exports.getClientExpenseTotals = exports.getCaseExpenseTotals = exports.getMonthlyExpenseTotals = exports.getExpenseCategories = exports.approveExpense = exports.deleteExpense = exports.updateExpense = exports.getExpensesByClient = exports.getExpensesByCase = exports.getExpenses = exports.getExpenseById = exports.createExpense = void 0;
const expensesService_1 = require("@/services/expensesService");
const logger_1 = __importDefault(require("@/utils/logger"));
const createExpense = async (req, res) => {
    try {
        const userId = req.user?.id;
        const expenseData = {
            ...req.body,
            createdBy: userId
        };
        logger_1.default.info('Creating expense', { userId, description: expenseData.description });
        const result = await expensesService_1.expensesService.createExpense(expenseData);
        res.status(201).json(result);
    }
    catch (error) {
        logger_1.default.error('Error creating expense', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_CREATE_ERROR',
                message: 'Failed to create expense'
            }
        });
    }
};
exports.createExpense = createExpense;
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_EXPENSE_ID',
                    message: 'Expense ID is required'
                }
            });
        }
        logger_1.default.info('Getting expense by ID', { expenseId: id });
        const result = await expensesService_1.expensesService.getExpenseById(id);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting expense by ID', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_FETCH_ERROR',
                message: 'Failed to get expense'
            }
        });
    }
};
exports.getExpenseById = getExpenseById;
const getExpenses = async (req, res) => {
    try {
        const { caseId, clientId, category, isBillable, isApproved, limit = 20, offset = 0 } = req.query;
        logger_1.default.info('Getting expenses', { filters: req.query });
        const result = await expensesService_1.expensesService.getExpenses({ caseId, clientId, category, isBillable, isApproved }, parseInt(limit), parseInt(offset));
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting expenses', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSES_FETCH_ERROR',
                message: 'Failed to get expenses'
            }
        });
    }
};
exports.getExpenses = getExpenses;
const getExpensesByCase = async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CASE_ID',
                    message: 'Case ID is required'
                }
            });
        }
        logger_1.default.info('Getting expenses by case', { caseId });
        const result = await expensesService_1.expensesService.getExpensesByCase(caseId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting case expenses', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CASE_EXPENSES_ERROR',
                message: 'Failed to get case expenses'
            }
        });
    }
};
exports.getExpensesByCase = getExpensesByCase;
const getExpensesByClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CLIENT_ID',
                    message: 'Client ID is required'
                }
            });
        }
        logger_1.default.info('Getting expenses by client', { clientId });
        const result = await expensesService_1.expensesService.getExpensesByClient(clientId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting client expenses', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_EXPENSES_ERROR',
                message: 'Failed to get client expenses'
            }
        });
    }
};
exports.getExpensesByClient = getExpensesByClient;
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const expenseData = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_EXPENSE_ID',
                    message: 'Expense ID is required'
                }
            });
        }
        logger_1.default.info('Updating expense', { expenseId: id });
        const result = await expensesService_1.expensesService.updateExpense(id, expenseData);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error updating expense', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_UPDATE_ERROR',
                message: 'Failed to update expense'
            }
        });
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_EXPENSE_ID',
                    message: 'Expense ID is required'
                }
            });
        }
        logger_1.default.info('Deleting expense', { expenseId: id });
        const result = await expensesService_1.expensesService.deleteExpense(id);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error deleting expense', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_DELETE_ERROR',
                message: 'Failed to delete expense'
            }
        });
    }
};
exports.deleteExpense = deleteExpense;
const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_EXPENSE_ID',
                    message: 'Expense ID is required'
                }
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'User ID is required'
                }
            });
        }
        logger_1.default.info('Approving expense', { expenseId: id, userId });
        const result = await expensesService_1.expensesService.approveExpense(id, userId);
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error approving expense', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_APPROVE_ERROR',
                message: 'Failed to approve expense'
            }
        });
    }
};
exports.approveExpense = approveExpense;
const getExpenseCategories = async (req, res) => {
    try {
        logger_1.default.info('Getting expense categories');
        const result = await expensesService_1.expensesService.getExpenseCategories();
        res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting expense categories', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_CATEGORIES_ERROR',
                message: 'Failed to get expense categories'
            }
        });
    }
};
exports.getExpenseCategories = getExpenseCategories;
const getMonthlyExpenseTotals = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DATE_PARAMETERS',
                    message: 'Start date and end date are required'
                }
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DATE_FORMAT',
                    message: 'Invalid date format. Please use YYYY-MM-DD format'
                }
            });
        }
        if (start > end) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_DATE_RANGE',
                    message: 'Start date cannot be after end date'
                }
            });
        }
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'DATE_RANGE_TOO_LARGE',
                    message: 'Date range cannot exceed 365 days'
                }
            });
        }
        logger_1.default.info('Getting monthly expense totals', { startDate, endDate });
        const result = await expensesService_1.expensesService.getMonthlyExpenseTotals(startDate || '', endDate || '');
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting monthly expense totals', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'MONTHLY_EXPENSE_TOTALS_ERROR',
                message: 'Failed to get monthly expense totals'
            }
        });
    }
};
exports.getMonthlyExpenseTotals = getMonthlyExpenseTotals;
const getCaseExpenseTotals = async (req, res) => {
    try {
        const { caseId } = req.params;
        if (!caseId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CASE_ID',
                    message: 'Case ID is required'
                }
            });
        }
        logger_1.default.info('Getting case expense totals', { caseId });
        const result = await expensesService_1.expensesService.getCaseExpenseTotals(caseId);
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting case expense totals', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CASE_EXPENSE_TOTALS_ERROR',
                message: 'Failed to get case expense totals'
            }
        });
    }
};
exports.getCaseExpenseTotals = getCaseExpenseTotals;
const getClientExpenseTotals = async (req, res) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CLIENT_ID',
                    message: 'Client ID is required'
                }
            });
        }
        logger_1.default.info('Getting client expense totals', { clientId });
        const result = await expensesService_1.expensesService.getClientExpenseTotals(clientId);
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error getting client expense totals', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'CLIENT_EXPENSE_TOTALS_ERROR',
                message: 'Failed to get client expense totals'
            }
        });
    }
};
exports.getClientExpenseTotals = getClientExpenseTotals;
const searchExpenses = async (req, res) => {
    try {
        const { q, limit = 20, offset = 0 } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SEARCH_QUERY_REQUIRED',
                    message: 'Search query is required'
                }
            });
        }
        logger_1.default.info('Searching expenses', { query: q, limit, offset });
        const result = await expensesService_1.expensesService.searchExpenses(q, parseInt(limit), parseInt(offset));
        return res.json(result);
    }
    catch (error) {
        logger_1.default.error('Error searching expenses', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'EXPENSE_SEARCH_ERROR',
                message: 'Failed to search expenses'
            }
        });
    }
};
exports.searchExpenses = searchExpenses;
exports.default = {
    createExpense: exports.createExpense,
    getExpenseById: exports.getExpenseById,
    getExpenses: exports.getExpenses,
    getExpensesByCase: exports.getExpensesByCase,
    getExpensesByClient: exports.getExpensesByClient,
    updateExpense: exports.updateExpense,
    deleteExpense: exports.deleteExpense,
    approveExpense: exports.approveExpense,
    getExpenseCategories: exports.getExpenseCategories,
    getMonthlyExpenseTotals: exports.getMonthlyExpenseTotals,
    getCaseExpenseTotals: exports.getCaseExpenseTotals,
    getClientExpenseTotals: exports.getClientExpenseTotals,
    searchExpenses: exports.searchExpenses
};
//# sourceMappingURL=expensesController.js.map