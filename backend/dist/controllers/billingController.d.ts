import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare const getInvoices: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInvoiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getInvoiceStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getBillingRates: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createBillingRate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getInvoices: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getInvoiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getInvoiceStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getBillingRates: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createBillingRate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=billingController.d.ts.map