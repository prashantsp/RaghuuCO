import { Request, Response, NextFunction } from 'express';
export declare const authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=clientPortalAuth.d.ts.map