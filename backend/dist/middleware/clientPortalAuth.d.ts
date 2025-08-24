import { Request, Response, NextFunction } from 'express';
export declare const authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => any;
export declare const validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    authenticateClientUser: (req: Request, res: Response, next: NextFunction) => Promise<any>;
    optionalClientAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    clientPortalRateLimit: (req: Request, res: Response, next: NextFunction) => any;
    validateCaseAccess: (req: Request, res: Response, next: NextFunction) => Promise<any>;
    validateDocumentAccess: (req: Request, res: Response, next: NextFunction) => Promise<any>;
    logClientActivity: (action: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
};
export default _default;
//# sourceMappingURL=clientPortalAuth.d.ts.map