/**
 * Expenses Controller Tests
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Unit tests for expenses controller functionality
 */

import request from 'supertest';
import { app } from '../../index';
import { expensesService } from '../../services/expensesService';

// Mock the expenses service
jest.mock('../../services/expensesService');

describe('Expenses Controller', () => {
  const mockExpense = {
    id: 'test-expense-id',
    description: 'Test Expense',
    amount: 1000,
    category: 'Office Supplies',
    expense_date: '2025-08-24',
    case_id: 'test-case-id',
    client_id: 'test-client-id',
    created_by: 'test-user-id',
    notes: 'Test notes',
    receipt_url: 'https://example.com/receipt.pdf',
    is_billable: true,
    is_approved: false,
    created_at: '2025-08-24T10:00:00Z',
    updated_at: '2025-08-24T10:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/expenses', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        description: 'Test Expense',
        amount: 1000,
        category: 'Office Supplies',
        expenseDate: '2025-08-24',
        caseId: 'test-case-id',
        clientId: 'test-client-id',
        notes: 'Test notes',
        receiptUrl: 'https://example.com/receipt.pdf',
        isBillable: true
      };

      (expensesService.createExpense as jest.Mock).mockResolvedValue({
        success: true,
        data: { expense: mockExpense }
      });

      const response = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer test-token')
        .send(expenseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expense).toEqual(mockExpense);
      expect(expensesService.createExpense).toHaveBeenCalledWith({
        ...expenseData,
        createdBy: 'test-user-id'
      });
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.createExpense as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/expenses')
        .set('Authorization', 'Bearer test-token')
        .send({
          description: 'Test Expense',
          amount: 1000,
          category: 'Office Supplies',
          expenseDate: '2025-08-24'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSE_CREATE_ERROR');
    });
  });

  describe('GET /api/v1/expenses', () => {
    it('should get all expenses with filters', async () => {
      const mockExpenses = [mockExpense];

      (expensesService.getExpenses as jest.Mock).mockResolvedValue({
        success: true,
        data: { expenses: mockExpenses }
      });

      const response = await request(app)
        .get('/api/v1/expenses?caseId=test-case-id&category=Office Supplies&limit=10&offset=0')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expenses).toEqual(mockExpenses);
      expect(expensesService.getExpenses).toHaveBeenCalledWith(
        { caseId: 'test-case-id', category: 'Office Supplies' },
        10,
        0
      );
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.getExpenses as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/expenses')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSES_FETCH_ERROR');
    });
  });

  describe('GET /api/v1/expenses/:id', () => {
    it('should get expense by ID', async () => {
      (expensesService.getExpenseById as jest.Mock).mockResolvedValue({
        success: true,
        data: { expense: mockExpense }
      });

      const response = await request(app)
        .get('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expense).toEqual(mockExpense);
      expect(expensesService.getExpenseById).toHaveBeenCalledWith('test-expense-id');
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.getExpenseById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSE_FETCH_ERROR');
    });
  });

  describe('PUT /api/v1/expenses/:id', () => {
    it('should update expense', async () => {
      const updateData = {
        description: 'Updated Expense',
        amount: 1500,
        category: 'Travel',
        expenseDate: '2025-01-16',
        notes: 'Updated notes',
        isBillable: false
      };

      const updatedExpense = { ...mockExpense, ...updateData };

      (expensesService.updateExpense as jest.Mock).mockResolvedValue({
        success: true,
        data: { expense: updatedExpense }
      });

      const response = await request(app)
        .put('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expense).toEqual(updatedExpense);
      expect(expensesService.updateExpense).toHaveBeenCalledWith('test-expense-id', updateData);
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.updateExpense as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .send({ description: 'Updated Expense' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSE_UPDATE_ERROR');
    });
  });

  describe('DELETE /api/v1/expenses/:id', () => {
    it('should delete expense', async () => {
      (expensesService.deleteExpense as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Expense deleted successfully'
      });

      const response = await request(app)
        .delete('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Expense deleted successfully');
      expect(expensesService.deleteExpense).toHaveBeenCalledWith('test-expense-id');
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.deleteExpense as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/v1/expenses/test-expense-id')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSE_DELETE_ERROR');
    });
  });

  describe('POST /api/v1/expenses/:id/approve', () => {
    it('should approve expense', async () => {
      const approvedExpense = { ...mockExpense, is_approved: true, approved_by: 'test-user-id' };

      (expensesService.approveExpense as jest.Mock).mockResolvedValue({
        success: true,
        data: { expense: approvedExpense }
      });

      const response = await request(app)
        .post('/api/v1/expenses/test-expense-id/approve')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expense).toEqual(approvedExpense);
      expect(expensesService.approveExpense).toHaveBeenCalledWith('test-expense-id', 'test-user-id');
    });

    it('should return 500 when service throws error', async () => {
      (expensesService.approveExpense as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/v1/expenses/test-expense-id/approve')
        .set('Authorization', 'Bearer test-token')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EXPENSE_APPROVE_ERROR');
    });
  });
});