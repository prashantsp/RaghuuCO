import { Request, Response, NextFunction } from 'express';
export declare const require2FA: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const ipWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const decryptRequest: (req: Request, res: Response, next: NextFunction) => void;
export declare const encryptResponse: (req: Request, res: Response, next: NextFunction) => void;
export declare const sessionSecurity: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const sensitiveOperationRateLimit: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityAudit: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimit: (options: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
declare const _default: {
    require2FA: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    ipWhitelist: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    decryptRequest: (req: Request, res: Response, next: NextFunction) => void;
    encryptResponse: (req: Request, res: Response, next: NextFunction) => void;
    sessionSecurity: (req: Request, res: Response, next: NextFunction) => void;
    securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
    sensitiveOperationRateLimit: (req: Request, res: Response, next: NextFunction) => void;
    securityAudit: (req: Request, res: Response, next: NextFunction) => void;
    rateLimit: (options: {
        windowMs: number;
        maxRequests: number;
        keyGenerator?: (req: Request) => string;
        skipSuccessfulRequests?: boolean;
        skipFailedRequests?: boolean;
    }) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
};
export default _default;
//# sourceMappingURL=security.d.ts.map