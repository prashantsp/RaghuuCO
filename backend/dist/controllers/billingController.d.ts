import { Request, Response } from 'express';
export declare const getInvoices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvoiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getInvoiceStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getBillingRates: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createBillingRate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    getInvoices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getInvoiceById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteInvoice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getInvoiceStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getBillingRates: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createBillingRate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=billingController.d.ts.map