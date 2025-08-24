"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxService = exports.TaxService = void 0;
const logger_1 = __importDefault(require("@/utils/logger"));
class TaxService {
    constructor() {
        this.defaultConfig = {
            gstRate: 18,
            tdsRate: 10,
            cgstRate: 9,
            sgstRate: 9,
            igstRate: 18,
            cessRate: 0
        };
    }
    calculateGST(amount, gstRate = this.defaultConfig.gstRate) {
        try {
            logger_1.default.info('Calculating GST', { amount, gstRate });
            const gstAmount = (amount * gstRate) / 100;
            logger_1.default.info('GST calculation completed', { amount, gstRate, gstAmount });
            return Math.round(gstAmount * 100) / 100;
        }
        catch (error) {
            logger_1.default.error('Error calculating GST', error);
            throw new Error('Failed to calculate GST');
        }
    }
    calculateCGSTSGST(amount, gstRate = this.defaultConfig.gstRate) {
        try {
            logger_1.default.info('Calculating CGST and SGST', { amount, gstRate });
            const totalGST = this.calculateGST(amount, gstRate);
            const cgst = totalGST / 2;
            const sgst = totalGST / 2;
            logger_1.default.info('CGST and SGST calculation completed', { amount, cgst, sgst });
            return {
                cgst: Math.round(cgst * 100) / 100,
                sgst: Math.round(sgst * 100) / 100
            };
        }
        catch (error) {
            logger_1.default.error('Error calculating CGST and SGST', error);
            throw new Error('Failed to calculate CGST and SGST');
        }
    }
    calculateIGST(amount, igstRate = this.defaultConfig.igstRate) {
        try {
            logger_1.default.info('Calculating IGST', { amount, igstRate });
            const igstAmount = (amount * igstRate) / 100;
            logger_1.default.info('IGST calculation completed', { amount, igstRate, igstAmount });
            return Math.round(igstAmount * 100) / 100;
        }
        catch (error) {
            logger_1.default.error('Error calculating IGST', error);
            throw new Error('Failed to calculate IGST');
        }
    }
    calculateTDS(amount, tdsRate = this.defaultConfig.tdsRate) {
        try {
            logger_1.default.info('Calculating TDS', { amount, tdsRate });
            const tdsAmount = (amount * tdsRate) / 100;
            logger_1.default.info('TDS calculation completed', { amount, tdsRate, tdsAmount });
            return Math.round(tdsAmount * 100) / 100;
        }
        catch (error) {
            logger_1.default.error('Error calculating TDS', error);
            throw new Error('Failed to calculate TDS');
        }
    }
    calculateCess(amount, cessRate = this.defaultConfig.cessRate) {
        try {
            logger_1.default.info('Calculating Cess', { amount, cessRate });
            const cessAmount = (amount * cessRate) / 100;
            logger_1.default.info('Cess calculation completed', { amount, cessRate, cessAmount });
            return Math.round(cessAmount * 100) / 100;
        }
        catch (error) {
            logger_1.default.error('Error calculating Cess', error);
            throw new Error('Failed to calculate Cess');
        }
    }
    calculateInvoiceTax(params) {
        try {
            logger_1.default.info('Starting comprehensive tax calculation', params);
            const { subtotal, isInterState, isTDSApplicable, gstRate = this.defaultConfig.gstRate, tdsRate = this.defaultConfig.tdsRate, cessRate = this.defaultConfig.cessRate } = params;
            let cgstAmount = 0;
            let sgstAmount = 0;
            let tdsAmount = 0;
            let cessAmount = 0;
            if (isInterState) {
                const igstAmount = this.calculateIGST(subtotal, gstRate);
            }
            else {
                const cgstSgst = this.calculateCGSTSGST(subtotal, gstRate);
                cgstAmount = cgstSgst.cgst;
                sgstAmount = cgstSgst.sgst;
            }
            if (isTDSApplicable) {
                tdsAmount = this.calculateTDS(subtotal, tdsRate);
            }
            if (cessRate > 0) {
                cessAmount = this.calculateCess(subtotal, cessRate);
            }
            const gstAmount = cgstAmount + sgstAmount + igstAmount;
            const totalTax = gstAmount + tdsAmount + cessAmount;
            const grandTotal = subtotal + totalTax;
            const result = {
                subtotal,
                gstAmount,
                cgstAmount,
                sgstAmount,
                igstAmount: igstAmount,
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
            logger_1.default.info('Comprehensive tax calculation completed', result);
            return result;
        }
        catch (error) {
            logger_1.default.error('Error in comprehensive tax calculation', error);
            throw new Error('Failed to calculate invoice tax');
        }
    }
    calculateExpenseTax(params) {
        try {
            logger_1.default.info('Calculating expense tax', params);
            const { amount, isReimbursable, gstRate = this.defaultConfig.gstRate } = params;
            let gstAmount = 0;
            let cgstAmount = 0;
            let sgstAmount = 0;
            if (isReimbursable) {
                gstAmount = 0;
            }
            else {
                const cgstSgst = this.calculateCGSTSGST(amount, gstRate);
                cgstAmount = cgstSgst.cgst;
                sgstAmount = cgstSgst.sgst;
                gstAmount = cgstAmount + sgstAmount;
            }
            const totalTax = gstAmount;
            const grandTotal = amount + totalTax;
            const result = {
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
            logger_1.default.info('Expense tax calculation completed', result);
            return result;
        }
        catch (error) {
            logger_1.default.error('Error calculating expense tax', error);
            throw new Error('Failed to calculate expense tax');
        }
    }
    getTaxRates(clientType = 'individual') {
        try {
            logger_1.default.info('Getting tax rates for client type', { clientType });
            const rates = {
                gstRate: this.defaultConfig.gstRate,
                tdsRate: clientType === 'company' ? 10 : 5,
                cgstRate: this.defaultConfig.cgstRate,
                sgstRate: this.defaultConfig.sgstRate,
                igstRate: this.defaultConfig.igstRate,
                cessRate: this.defaultConfig.cessRate
            };
            logger_1.default.info('Tax rates retrieved', rates);
            return rates;
        }
        catch (error) {
            logger_1.default.error('Error getting tax rates', error);
            throw new Error('Failed to get tax rates');
        }
    }
    validateTaxCalculation(result) {
        try {
            logger_1.default.info('Validating tax calculation', result);
            const calculatedTotal = result.subtotal + result.totalTax;
            const isValid = Math.abs(calculatedTotal - result.grandTotal) < 0.01;
            const gstComponents = result.cgstAmount + result.sgstAmount + result.igstAmount;
            const gstValid = Math.abs(gstComponents - result.gstAmount) < 0.01;
            const isValidCalculation = isValid && gstValid;
            logger_1.default.info('Tax calculation validation result', { isValidCalculation, isValid, gstValid });
            return isValidCalculation;
        }
        catch (error) {
            logger_1.default.error('Error validating tax calculation', error);
            return false;
        }
    }
    formatTaxBreakdown(result) {
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
        }
        catch (error) {
            logger_1.default.error('Error formatting tax breakdown', error);
            return 'Tax calculation error';
        }
    }
}
exports.TaxService = TaxService;
exports.taxService = new TaxService();
//# sourceMappingURL=taxService.js.map