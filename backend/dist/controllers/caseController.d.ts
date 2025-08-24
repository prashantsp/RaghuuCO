import { Request, Response } from 'express';
export declare function getCases(req: Request, res: Response): Promise<void>;
export declare function getCaseById(req: Request, res: Response): Promise<void>;
export declare function createCase(req: Request, res: Response): Promise<void>;
export declare function updateCase(req: Request, res: Response): Promise<void>;
export declare function deleteCase(req: Request, res: Response): Promise<void>;
export declare function getCaseStats(req: Request, res: Response): Promise<void>;
declare const _default: {
    getCases: typeof getCases;
    getCaseById: typeof getCaseById;
    createCase: typeof createCase;
    updateCase: typeof updateCase;
    deleteCase: typeof deleteCase;
    getCaseStats: typeof getCaseStats;
};
export default _default;
//# sourceMappingURL=caseController.d.ts.map