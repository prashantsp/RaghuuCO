import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function register(req: Request, res: Response): Promise<void>;
export declare function login(req: Request, res: Response): Promise<void>;
export declare function refreshToken(req: Request, res: Response): Promise<void>;
export declare function logout(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
declare const _default: {
    register: typeof register;
    login: typeof login;
    refreshToken: typeof refreshToken;
    logout: typeof logout;
    getProfile: typeof getProfile;
    updateProfile: typeof updateProfile;
};
export default _default;
//# sourceMappingURL=authController.d.ts.map