import { Request, Response } from 'express';
export declare function getUsers(req: Request, res: Response): Promise<void>;
export declare function getUserById(req: Request, res: Response): Promise<void>;
export declare function createUser(req: Request, res: Response): Promise<void>;
export declare function updateUser(req: Request, res: Response): Promise<void>;
export declare function deleteUser(req: Request, res: Response): Promise<void>;
export declare function getUserActivity(req: Request, res: Response): Promise<void>;
export declare function getAssignableRoles(req: Request, res: Response): Promise<void>;
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