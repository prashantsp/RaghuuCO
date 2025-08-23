/**
 * Tax Calculation Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Service for tax calculations including GST, TDS, and other applicable taxes
 */

import logger from '@/utils/logger';

/**
 * Tax Configuration Interface
 */
interface TaxConfig {
  gstRate: number;
  tdsRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate: number;
}

/**
 * Tax Calculation Result Interface
 */
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

/**
 * Tax Service Class
 * Handles all tax calculations for the billing system
 */
export class TaxService {
  private defaultConfig: TaxConfig = {
    gstRate: 18, // 18% GST
    tdsRate: 10, // 10% TDS
    cgstRate: 9, // 9% CGST (half of GST)
    sgstRate: 9, // 9% SGST (half of GST)
    igstRate: 18, // 18% IGST (for inter-state transactions)
    cessRate: 0 // Additional cess if applicable
  };

  /**
   * Calculate GST for a given amount
   */
  calculateGST(amount: number, gstRate: number = this.defaultConfig.gstRate): number {
    try {
      logger.info('Calculating GST', { amount, gstRate });
      
      const gstAmount = (amount * gstRate) / 100;
      
      logger.info('GST calculation completed', { amount, gstRate, gstAmount });
      
      return Math.round(gstAmount * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Error calculating GST', error as Error);
      throw new Error('Failed to calculate GST');
    }
  }

  /**
   * Calculate CGST and SGST (for intra-state transactions)
   */
  calculateCGSTSGST(amount: number, gstRate: number = this.defaultConfig.gstRate): { cgst: number; sgst: number } {
    try {
      logger.info('Calculating CGST and SGST', { amount, gstRate });
      
      const totalGST = this.calculateGST(amount, gstRate);
      const cgst = totalGST / 2;
      const sgst = totalGST / 2;
      
      logger.info('CGST and SGST calculation completed', { amount, cgst, sgst });
      
      return {
        cgst: Math.round(cgst * 100) / 100,
        sgst: Math.round(sgst * 100) / 100
      };
    } catch (error) {
      logger.error('Error calculating CGST and SGST', error as Error);
      throw new Error('Failed to calculate CGST and SGST');
    }
  }

  /**
   * Calculate IGST (for inter-state transactions)
   */
  calculateIGST(amount: number, igstRate: number = this.defaultConfig.igstRate): number {
    try {
      logger.info('Calculating IGST', { amount, igstRate });
      
      const igstAmount = (amount * igstRate) / 100;
      
      logger.info('IGST calculation completed', { amount, igstRate, igstAmount });
      
      return Math.round(igstAmount * 100) / 100;
    } catch (error) {
      logger.error('Error calculating IGST', error as Error);
      throw new Error('Failed to calculate IGST');
    }
  }

  /**
   * Calculate TDS (Tax Deducted at Source)
   */
  calculateTDS(amount: number, tdsRate: number = this.defaultConfig.tdsRate): number {
    try {
      logger.info('Calculating TDS', { amount, tdsRate });
      
      const tdsAmount = (amount * tdsRate) / 100;
      
      logger.info('TDS calculation completed', { amount, tdsRate, tdsAmount });
      
      return Math.round(tdsAmount * 100) / 100;
    } catch (error) {
      logger.error('Error calculating TDS', error as Error);
      throw new Error('Failed to calculate TDS');
    }
  }

  /**
   * Calculate Cess (additional tax)
   */
  calculateCess(amount: number, cessRate: number = this.defaultConfig.cessRate): number {
    try {
      logger.info('Calculating Cess', { amount, cessRate });
      
      const cessAmount = (amount * cessRate) / 100;
      
      logger.info('Cess calculation completed', { amount, cessRate, cessAmount });
      
      return Math.round(cessAmount * 100) / 100;
    } catch (error) {
      logger.error('Error calculating Cess', error as Error);
      throw new Error('Failed to calculate Cess');
    }
  }

  /**
   * Comprehensive tax calculation for invoices
   */
  calculateInvoiceTax(params: {
    subtotal: number;
    isInterState: boolean;
    isTDSApplicable: boolean;
    gstRate?: number;
    tdsRate?: number;
    cessRate?: number;
    clientType?: 'individual' | 'company';
  }): TaxCalculationResult {
    try {
      logger.info('Starting comprehensive tax calculation', params);
      
      const {
        subtotal,
        isInterState,
        isTDSApplicable,
        gstRate = this.defaultConfig.gstRate,
        tdsRate = this.defaultConfig.tdsRate,
        cessRate = this.defaultConfig.cessRate
      } = params;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;
      let tdsAmount = 0;
      let cessAmount = 0;

      // Calculate GST based on transaction type
      if (isInterState) {
        // Inter-state transaction - IGST applies
        igstAmount = this.calculateIGST(subtotal, gstRate);
      } else {
        // Intra-state transaction - CGST and SGST apply
        const cgstSgst = this.calculateCGSTSGST(subtotal, gstRate);
        cgstAmount = cgstSgst.cgst;
        sgstAmount = cgstSgst.sgst;
      }

      // Calculate TDS if applicable
      if (isTDSApplicable) {
        tdsAmount = this.calculateTDS(subtotal, tdsRate);
      }

      // Calculate Cess if applicable
      if (cessRate > 0) {
        cessAmount = this.calculateCess(subtotal, cessRate);
      }

      // Calculate totals
      const gstAmount = cgstAmount + sgstAmount + igstAmount;
      const totalTax = gstAmount + tdsAmount + cessAmount;
      const grandTotal = subtotal + totalTax;

      const result: TaxCalculationResult = {
        subtotal,
        gstAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        tdsAmount,
        cessAmount,
        totalTax,
        grandTotal,
        breakdown: {
          subtotal,
          cgst: cgstAmount,
          sgst: sgstAmount,
          igst: igstAmount,
          tds: tdsAmount,
          cess: cessAmount,
          total: grandTotal
        }
      };

      logger.info('Comprehensive tax calculation completed', result);
      
      return result;
    } catch (error) {
      logger.error('Error in comprehensive tax calculation', error as Error);
      throw new Error('Failed to calculate invoice tax');
    }
  }

  /**
   * Calculate tax for expense items
   */
  calculateExpenseTax(params: {
    amount: number;
    expenseType: string;
    isReimbursable: boolean;
    gstRate?: number;
  }): TaxCalculationResult {
    try {
      logger.info('Calculating expense tax', params);
      
      const { amount, expenseType, isReimbursable, gstRate = this.defaultConfig.gstRate } = params;

      let gstAmount = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      // GST calculation for expenses
      if (isReimbursable) {
        // For reimbursable expenses, GST is typically not applicable
        gstAmount = 0;
      } else {
        // For direct expenses, GST applies
        const cgstSgst = this.calculateCGSTSGST(amount, gstRate);
        cgstAmount = cgstSgst.cgst;
        sgstAmount = cgstSgst.sgst;
        gstAmount = cgstAmount + sgstAmount;
      }

      const totalTax = gstAmount;
      const grandTotal = amount + totalTax;

      const result: TaxCalculationResult = {
        subtotal: amount,
        gstAmount,
        cgstAmount,
        sgstAmount,
        igstAmount: 0,
        tdsAmount: 0,
        cessAmount: 0,
        totalTax,
        grandTotal,
        breakdown: {
          subtotal: amount,
          cgst: cgstAmount,
          sgst: sgstAmount,
          total: grandTotal
        }
      };

      logger.info('Expense tax calculation completed', result);
      
      return result;
    } catch (error) {
      logger.error('Error calculating expense tax', error as Error);
      throw new Error('Failed to calculate expense tax');
    }
  }

  /**
   * Get tax rates for different client types
   */
  getTaxRates(clientType: 'individual' | 'company' = 'individual'): TaxConfig {
    try {
      logger.info('Getting tax rates for client type', { clientType });
      
      const rates: TaxConfig = {
        gstRate: this.defaultConfig.gstRate,
        tdsRate: clientType === 'company' ? 10 : 5, // Higher TDS for companies
        cgstRate: this.defaultConfig.cgstRate,
        sgstRate: this.defaultConfig.sgstRate,
        igstRate: this.defaultConfig.igstRate,
        cessRate: this.defaultConfig.cessRate
      };

      logger.info('Tax rates retrieved', rates);
      
      return rates;
    } catch (error) {
      logger.error('Error getting tax rates', error as Error);
      throw new Error('Failed to get tax rates');
    }
  }

  /**
   * Validate tax calculation
   */
  validateTaxCalculation(result: TaxCalculationResult): boolean {
    try {
      logger.info('Validating tax calculation', result);
      
      // Check if totals match
      const calculatedTotal = result.subtotal + result.totalTax;
      const isValid = Math.abs(calculatedTotal - result.grandTotal) < 0.01;
      
      // Check if GST components add up
      const gstComponents = result.cgstAmount + result.sgstAmount + result.igstAmount;
      const gstValid = Math.abs(gstComponents - result.gstAmount) < 0.01;
      
      const isValidCalculation = isValid && gstValid;
      
      logger.info('Tax calculation validation result', { isValidCalculation, isValid, gstValid });
      
      return isValidCalculation;
    } catch (error) {
      logger.error('Error validating tax calculation', error as Error);
      return false;
    }
  }

  /**
   * Format tax breakdown for display
   */
  formatTaxBreakdown(result: TaxCalculationResult): string {
    try {
      const breakdown = [];
      
      if (result.cgstAmount > 0) {
        breakdown.push(`CGST: ₹${result.cgstAmount.toFixed(2)}`);
      }
      
      if (result.sgstAmount > 0) {
        breakdown.push(`SGST: ₹${result.sgstAmount.toFixed(2)}`);
      }
      
      if (result.igstAmount > 0) {
        breakdown.push(`IGST: ₹${result.igstAmount.toFixed(2)}`);
      }
      
      if (result.tdsAmount > 0) {
        breakdown.push(`TDS: ₹${result.tdsAmount.toFixed(2)}`);
      }
      
      if (result.cessAmount > 0) {
        breakdown.push(`Cess: ₹${result.cessAmount.toFixed(2)}`);
      }
      
      return breakdown.join(', ');
    } catch (error) {
      logger.error('Error formatting tax breakdown', error as Error);
      return 'Tax calculation error';
    }
  }
}

// Export service instance
export const taxService = new TaxService();