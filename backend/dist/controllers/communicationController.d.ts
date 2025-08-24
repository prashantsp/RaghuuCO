import { Request, Response } from 'express';
export declare const getInternalMessages: (req: Request, res: Response) => Promise<void>;
export declare const getInternalMessageById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createInternalMessage: (req: Request, res: Response) => Promise<void>;
export declare const updateInternalMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteInternalMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getReceivedMessages: (req: Request, res: Response) => Promise<void>;
export declare const updateMessageStatus: (req: Request, res: Response) => Promise<void>;
export declare const getEmailTemplates: (req: Request, res: Response) => Promise<void>;
export declare const createEmailTemplate: (req: Request, res: Response) => Promise<void>;
export declare const updateEmailTemplate: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getInternalMessages: (req: Request, res: Response) => Promise<void>;
    getInternalMessageById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createInternalMessage: (req: Request, res: Response) => Promise<void>;
    updateInternalMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteInternalMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getReceivedMessages: (req: Request, res: Response) => Promise<void>;
    updateMessageStatus: (req: Request, res: Response) => Promise<void>;
    getEmailTemplates: (req: Request, res: Response) => Promise<void>;
    createEmailTemplate: (req: Request, res: Response) => Promise<void>;
    updateEmailTemplate: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=communicationController.d.ts.map