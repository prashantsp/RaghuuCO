import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getDocumentById(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare const uploadDocument: (import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> | ((req: AuthenticatedRequest, res: Response) => Promise<void>))[];
export declare function updateDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function downloadDocument(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function searchDocuments(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getDocumentStats(req: AuthenticatedRequest, res: Response): Promise<void>;
declare const _default: {
    getDocuments: typeof getDocuments;
    getDocumentById: typeof getDocumentById;
    uploadDocument: (import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>> | ((req: AuthenticatedRequest, res: Response) => Promise<void>))[];
    updateDocument: typeof updateDocument;
    deleteDocument: typeof deleteDocument;
    downloadDocument: typeof downloadDocument;
    searchDocuments: typeof searchDocuments;
    getDocumentStats: typeof getDocumentStats;
};
export default _default;
//# sourceMappingURL=documentController.d.ts.map