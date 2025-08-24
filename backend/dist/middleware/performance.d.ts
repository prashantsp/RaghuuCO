import { Request, Response, NextFunction } from 'express';
export declare const responseTimeMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const compressionMiddleware: any;
export declare const cacheControl: (maxAge?: number) => (req: Request, res: Response, next: NextFunction) => any;
export declare const etagMiddleware: (req: Request, res: Response, next: NextFunction) => any;
export declare const requestSizeLimit: (limit?: string) => (req: Request, res: Response, next: NextFunction) => any;
export declare const queryOptimization: (req: Request, res: Response, next: NextFunction) => any;
export declare const responseOptimization: (req: Request, res: Response, next: NextFunction) => void;
export declare const dbQueryOptimization: (req: Request, res: Response, next: NextFunction) => void;
export declare const memoryMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const cacheWarming: (req: Request, res: Response, next: NextFunction) => void;
export declare const performanceMonitor: (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    responseTimeMonitor: (req: Request, res: Response, next: NextFunction) => void;
    compressionMiddleware: any;
    cacheControl: (maxAge?: number) => (req: Request, res: Response, next: NextFunction) => any;
    etagMiddleware: (req: Request, res: Response, next: NextFunction) => any;
    requestSizeLimit: (limit?: string) => (req: Request, res: Response, next: NextFunction) => any;
    queryOptimization: (req: Request, res: Response, next: NextFunction) => any;
    responseOptimization: (req: Request, res: Response, next: NextFunction) => void;
    dbQueryOptimization: (req: Request, res: Response, next: NextFunction) => void;
    memoryMonitor: (req: Request, res: Response, next: NextFunction) => void;
    cacheWarming: (req: Request, res: Response, next: NextFunction) => void;
    performanceMonitor: (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=performance.d.ts.map