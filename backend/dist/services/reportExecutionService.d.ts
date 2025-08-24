interface ReportParameter {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'array';
    value: any;
    required: boolean;
    defaultValue?: any;
}
interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    query: string;
    parameters: ReportParameter[];
    dataSource: string;
    outputFormat: 'json' | 'csv' | 'pdf' | 'excel';
    schedule?: string;
}
interface ReportExecutionResult {
    executionId: string;
    templateId: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    duration?: number;
    rowCount: number;
    data: any[];
    error?: string;
    parameters: ReportParameter[];
    outputUrl?: string;
}
export declare class ReportExecutionService {
    executeReport(templateId: string, parameters: ReportParameter[], userId: string): Promise<ReportExecutionResult>;
    getReportTemplate(templateId: string): Promise<ReportTemplate | null>;
    validateParameters(templateParams: ReportParameter[], providedParams: ReportParameter[]): void;
    validateParameterValue(param: ReportParameter): void;
    executeQuery(query: string, parameters: ReportParameter[]): Promise<{
        data: any[];
        rowCount: number;
    }>;
    generateOutputFile(result: ReportExecutionResult, format: string): Promise<string>;
    generateCSV(data: any[], filePath: string): Promise<void>;
    generatePDF(result: ReportExecutionResult, filePath: string): Promise<void>;
    generateExcel(data: any[], filePath: string): Promise<void>;
    logExecutionStart(executionId: string, templateId: string, userId: string, parameters: ReportParameter[]): Promise<void>;
    logExecutionCompletion(executionId: string, result: ReportExecutionResult): Promise<void>;
    logExecutionError(executionId: string, templateId: string, userId: string, error: string): Promise<void>;
    getExecutionHistory(userId: string, templateId?: string, limit?: number, offset?: number): Promise<{
        executions: any[];
        total: number;
    }>;
    cancelExecution(executionId: string, userId: string): Promise<void>;
}
export declare const reportExecutionService: ReportExecutionService;
export {};
//# sourceMappingURL=reportExecutionService.d.ts.map