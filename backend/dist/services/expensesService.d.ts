export declare class ExpensesService {
    createExpense(expenseData: any): Promise<any>;
    getExpenseById(expenseId: string): Promise<any>;
    getExpenses(filters?: any, limit?: number, offset?: number): Promise<any>;
    getExpensesByCase(caseId: string): Promise<any>;
    getExpensesByClient(clientId: string): Promise<any>;
    updateExpense(expenseId: string, expenseData: any): Promise<any>;
    deleteExpense(expenseId: string): Promise<any>;
    approveExpense(expenseId: string, approvedBy: string): Promise<any>;
    getExpenseCategories(): Promise<any>;
    getMonthlyExpenseTotals(startDate: string, endDate: string): Promise<any>;
    getCaseExpenseTotals(caseId: string): Promise<any>;
    getClientExpenseTotals(clientId: string): Promise<any>;
    searchExpenses(query: string, limit?: number, offset?: number): Promise<any>;
}
export declare const expensesService: ExpensesService;
//# sourceMappingURL=expensesService.d.ts.map