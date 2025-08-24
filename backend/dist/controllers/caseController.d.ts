import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function getCases(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getCaseById(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function createCase(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateCase(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteCase(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getCaseStats(req: AuthenticatedRequest, res: Response): Promise<void>;
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