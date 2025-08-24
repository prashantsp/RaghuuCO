import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function getClients(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getClientById(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function createClient(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateClient(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteClient(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function checkClientConflicts(req: AuthenticatedRequest, res: Response): Promise<void>;
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