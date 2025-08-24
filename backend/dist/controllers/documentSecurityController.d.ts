import { Request, Response } from 'express';
export declare const uploadSecureDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const downloadSecureDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDocumentSecurity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDocumentSecurityMetadata: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getDocumentAuditLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const checkDocumentAccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    uploadSecureDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    downloadSecureDocument: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateDocumentSecurity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getDocumentSecurityMetadata: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getDocumentAuditLog: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    checkDocumentAccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=documentSecurityController.d.ts.map