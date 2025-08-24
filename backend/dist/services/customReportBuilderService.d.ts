export declare class CustomReportBuilderService {
    private dataSources;
    getDataSources(): Promise<any>;
    buildQuery(queryDefinition: any): Promise<string>;
    executeReport(queryDefinition: any, parameters?: any): Promise<any>;
    saveReportTemplate(template: any): Promise<any>;
    getReportTemplates(userId: string): Promise<any>;
    getReportTemplateById(templateId: string, userId: string): Promise<any>;
    updateReportTemplate(templateId: string, updates: any, userId: string): Promise<any>;
    deleteReportTemplate(templateId: string, userId: string): Promise<any>;
    getPreBuiltTemplates(): Promise<any>;
}
export declare const customReportBuilderService: CustomReportBuilderService;
//# sourceMappingURL=customReportBuilderService.d.ts.map