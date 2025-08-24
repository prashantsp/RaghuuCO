import { Request, Response } from 'express';
export declare const globalSearch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSearchSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getSearchStatistics: (req: Request, res: Response) => Promise<void>;
export declare const getPopularSearchTerms: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    globalSearch: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getSearchSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getSearchStatistics: (req: Request, res: Response) => Promise<void>;
    getPopularSearchTerms: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=globalSearchController.d.ts.map