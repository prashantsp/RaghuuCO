import { Request, Response } from 'express';
export declare function getDocuments(req: Request, res: Response): Promise<void>;
export declare function getDocumentById(req: Request, res: Response): Promise<void>;
export declare const uploadDocument: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
export declare function updateDocument(req: Request, res: Response): Promise<void>;
export declare function deleteDocument(req: Request, res: Response): Promise<void>;
export declare function downloadDocument(req: Request, res: Response): Promise<void>;
export declare function searchDocuments(req: Request, res: Response): Promise<void>;
export declare function getDocumentStats(req: Request, res: Response): Promise<void>;
declare const _default: {
    getDocuments: typeof getDocuments;
    getDocumentById: typeof getDocumentById;
    uploadDocument: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
    updateDocument: typeof updateDocument;
    deleteDocument: typeof deleteDocument;
    downloadDocument: typeof downloadDocument;
    searchDocuments: typeof searchDocuments;
    getDocumentStats: typeof getDocumentStats;
};
export default _default;
//# sourceMappingURL=documentController.d.ts.map