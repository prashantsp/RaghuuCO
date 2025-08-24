import { Request, Response } from 'express';
export declare const uploadSecureDocument: (req: Request, res: Response) => Promise<any>;
export declare const downloadSecureDocument: (req: Request, res: Response) => Promise<any>;
export declare const updateDocumentSecurity: (req: Request, res: Response) => Promise<any>;
export declare const getDocumentSecurityMetadata: (req: Request, res: Response) => Promise<any>;
export declare const getDocumentAuditLog: (req: Request, res: Response) => Promise<void>;
export declare const checkDocumentAccess: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    uploadSecureDocument: (req: Request, res: Response) => Promise<any>;
    downloadSecureDocument: (req: Request, res: Response) => Promise<any>;
    updateDocumentSecurity: (req: Request, res: Response) => Promise<any>;
    getDocumentSecurityMetadata: (req: Request, res: Response) => Promise<any>;
    getDocumentAuditLog: (req: Request, res: Response) => Promise<void>;
    checkDocumentAccess: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=documentSecurityController.d.ts.map