import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';
export declare function googleAuth(req: Request, res: Response): Promise<void>;
export declare function linkedinAuth(req: Request, res: Response): Promise<void>;
export declare function microsoftAuth(req: Request, res: Response): Promise<void>;
export declare function linkSocialAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
export declare function unlinkSocialAccount(req: AuthenticatedRequest, res: Response): Promise<void>;
declare const _default: {
    googleAuth: typeof googleAuth;
    linkedinAuth: typeof linkedinAuth;
    microsoftAuth: typeof microsoftAuth;
    linkSocialAccount: typeof linkSocialAccount;
    unlinkSocialAccount: typeof unlinkSocialAccount;
};
export default _default;
//# sourceMappingURL=socialAuthController.d.ts.map