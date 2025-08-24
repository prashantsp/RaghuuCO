import { Request, Response } from 'express';
export declare const setup2FA: (req: Request, res: Response) => Promise<void>;
export declare const verify2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const disable2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const get2FAStatus: (req: Request, res: Response) => Promise<void>;
export declare const generateBackupCodes: (req: Request, res: Response) => Promise<void>;
export declare const verifyBackupCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSecuritySettings: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    setup2FA: (req: Request, res: Response) => Promise<void>;
    verify2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    disable2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    get2FAStatus: (req: Request, res: Response) => Promise<void>;
    generateBackupCodes: (req: Request, res: Response) => Promise<void>;
    verifyBackupCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getSecuritySettings: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=securityController.d.ts.map