import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission } from '@/utils/roleAccess';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: UserRole;
        permissions: Permission[];
        iat: number;
        exp: number;
    };
}
interface JWTPayload {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
    iat: number;
    exp: number;
}
export declare function generateAccessToken(userId: string, email: string, role: UserRole): Promise<string>;
export declare function generateRefreshToken(userId: string): Promise<string>;
export declare function verifyToken(token: string): Promise<JWTPayload>;
export declare function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function authorizeRole(roles: UserRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function authorizePermission(permission: Permission): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function authorizeAnyPermission(permissions: Permission[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function authorizeAllPermissions(permissions: Permission[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function hashPassword(password: string, saltRounds?: number): Promise<string>;
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
declare const _default: {
    generateAccessToken: typeof generateAccessToken;
    generateRefreshToken: typeof generateRefreshToken;
    verifyToken: typeof verifyToken;
    authenticateToken: typeof authenticateToken;
    authorizeRole: typeof authorizeRole;
    authorizePermission: typeof authorizePermission;
    authorizeAnyPermission: typeof authorizeAnyPermission;
    authorizeAllPermissions: typeof authorizeAllPermissions;
    hashPassword: typeof hashPassword;
    comparePassword: typeof comparePassword;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map