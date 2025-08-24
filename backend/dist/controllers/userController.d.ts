import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function getUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getUserById(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function createUser(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getUserActivity(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getAssignableRoles(req: AuthenticatedRequest, res: Response): Promise<void>;
declare const _default: {
    getUsers: typeof getUsers;
    getUserById: typeof getUserById;
    createUser: typeof createUser;
    updateUser: typeof updateUser;
    deleteUser: typeof deleteUser;
    getUserActivity: typeof getUserActivity;
    getAssignableRoles: typeof getAssignableRoles;
};
export default _default;
//# sourceMappingURL=userController.d.ts.map