import { Request, Response } from 'express';
export declare const getInvoices: (req: Request, res: Response) => Promise<void>;
export declare const getInvoiceById: (req: Request, res: Response) => Promise<any>;
export declare const createInvoice: (req: Request, res: Response) => Promise<void>;
export declare const updateInvoice: (req: Request, res: Response) => Promise<any>;
export declare const deleteInvoice: (req: Request, res: Response) => Promise<any>;
export declare const getInvoiceStats: (req: Request, res: Response) => Promise<void>;
export declare const getBillingRates: (req: Request, res: Response) => Promise<void>;
export declare const createBillingRate: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getInvoices: (req: Request, res: Response) => Promise<void>;
    getInvoiceById: (req: Request, res: Response) => Promise<any>;
    createInvoice: (req: Request, res: Response) => Promise<void>;
    updateInvoice: (req: Request, res: Response) => Promise<any>;
    deleteInvoice: (req: Request, res: Response) => Promise<any>;
    getInvoiceStats: (req: Request, res: Response) => Promise<void>;
    getBillingRates: (req: Request, res: Response) => Promise<void>;
    createBillingRate: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=billingController.d.ts.map