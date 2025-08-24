interface TaxConfig {
    gstRate: number;
    tdsRate: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cessRate: number;
}
interface TaxCalculationResult {
    subtotal: number;
    gstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    tdsAmount: number;
    cessAmount: number;
    totalTax: number;
    grandTotal: number;
    breakdown: {
        [key: string]: number;
    };
}
export declare class TaxService {
    private defaultConfig;
    calculateGST(amount: number, gstRate?: number): number;
    calculateCGSTSGST(amount: number, gstRate?: number): {
        cgst: number;
        sgst: number;
    };
    calculateIGST(amount: number, igstRate?: number): number;
    calculateTDS(amount: number, tdsRate?: number): number;
    calculateCess(amount: number, cessRate?: number): number;
    calculateInvoiceTax(params: {
        subtotal: number;
        isInterState: boolean;
        isTDSApplicable: boolean;
        gstRate?: number;
        tdsRate?: number;
        cessRate?: number;
        clientType?: 'individual' | 'company';
    }): TaxCalculationResult;
    calculateExpenseTax(params: {
        amount: number;
        expenseType: string;
        isReimbursable: boolean;
        gstRate?: number;
    }): TaxCalculationResult;
    getTaxRates(clientType?: 'individual' | 'company'): TaxConfig;
    validateTaxCalculation(result: TaxCalculationResult): boolean;
    formatTaxBreakdown(result: TaxCalculationResult): string;
}
export declare const taxService: TaxService;
export {};
//# sourceMappingURL=taxService.d.ts.map