import { Request, Response } from 'express';
export declare const getDataSources: (req: Request, res: Response) => Promise<void>;
export declare const executeCustomReport: (req: Request, res: Response) => Promise<void>;
export declare const saveReportTemplate: (req: Request, res: Response) => Promise<void>;
export declare const getReportTemplates: (req: Request, res: Response) => Promise<void>;
export declare const getReportTemplateById: (req: Request, res: Response) => Promise<void>;
export declare const updateReportTemplate: (req: Request, res: Response) => Promise<void>;
export declare const deleteReportTemplate: (req: Request, res: Response) => Promise<void>;
export declare const getPreBuiltTemplates: (req: Request, res: Response) => Promise<void>;
export declare const executeReportFromTemplate: (req: Request, res: Response) => Promise<void>;
export declare const exportReport: (req: Request, res: Response) => Promise<void>;
export declare const getReportBuilderAnalytics: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    getDataSources: (req: Request, res: Response) => Promise<void>;
    executeCustomReport: (req: Request, res: Response) => Promise<void>;
    saveReportTemplate: (req: Request, res: Response) => Promise<void>;
    getReportTemplates: (req: Request, res: Response) => Promise<void>;
    getReportTemplateById: (req: Request, res: Response) => Promise<void>;
    updateReportTemplate: (req: Request, res: Response) => Promise<void>;
    deleteReportTemplate: (req: Request, res: Response) => Promise<void>;
    getPreBuiltTemplates: (req: Request, res: Response) => Promise<void>;
    executeReportFromTemplate: (req: Request, res: Response) => Promise<void>;
    exportReport: (req: Request, res: Response) => Promise<void>;
    getReportBuilderAnalytics: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=customReportBuilderController.d.ts.map