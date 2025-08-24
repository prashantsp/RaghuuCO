import { Request, Response, NextFunction } from 'express';
export declare const authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=clientPortalAuth.d.ts.map