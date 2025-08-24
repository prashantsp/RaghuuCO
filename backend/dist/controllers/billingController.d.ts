import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare const getInvoices: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInvoiceById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInvoiceStats: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBillingRates: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createBillingRate: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getInvoices: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getInvoiceById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    createInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteInvoice: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getInvoiceStats: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getBillingRates: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    createBillingRate: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=billingController.d.ts.map