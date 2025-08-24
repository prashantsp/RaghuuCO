import { Request, Response } from 'express';
export declare const globalSearch: (req: Request, res: Response) => Promise<any>;
export declare const getSearchSuggestions: (req: Request, res: Response) => Promise<any>;
export declare const getSearchStatistics: (req: Request, res: Response) => Promise<void>;
export declare const getPopularSearchTerms: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    globalSearch: (req: Request, res: Response) => Promise<any>;
    getSearchSuggestions: (req: Request, res: Response) => Promise<any>;
    getSearchStatistics: (req: Request, res: Response) => Promise<void>;
    getPopularSearchTerms: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=globalSearchController.d.ts.map