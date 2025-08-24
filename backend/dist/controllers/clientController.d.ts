import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function getClients(req: Request, res: Response): Promise<void>;
export declare function getClientById(req: Request, res: Response): Promise<void>;
export declare function createClient(req: Request, res: Response): Promise<void>;
export declare function updateClient(req: Request, res: Response): Promise<void>;
export declare function deleteClient(req: Request, res: Response): Promise<void>;
export declare function checkClientConflicts(req: Request, res: Response): Promise<void>;
export declare function getClientStats(req: AuthenticatedRequest, res: Response): Promise<void>;
declare const _default: {
    getClients: typeof getClients;
    getClientById: typeof getClientById;
    createClient: typeof createClient;
    updateClient: typeof updateClient;
    deleteClient: typeof deleteClient;
    checkClientConflicts: typeof checkClientConflicts;
    getClientStats: typeof getClientStats;
};
export default _default;
//# sourceMappingURL=clientController.d.ts.map