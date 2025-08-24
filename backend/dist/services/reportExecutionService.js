"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportExecutionService = exports.ReportExecutionService = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
class ReportExecutionService {
    async executeReport(templateId, parameters, userId) {
        try {
            logger_1.default.info('Starting report execution', { templateId, userId });
            const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const startTime = new Date();
            const template = await this.getReportTemplate(templateId);
            if (!template) {
                throw new Error('Report template not found');
            }
            this.validateParameters(template.parameters, parameters);
            await this.logExecutionStart(executionId, templateId, userId, parameters);
            const { data, rowCount } = await this.executeQuery(template.query, parameters);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            const result = {
                executionId,
                templateId,
                status: 'completed',
                startTime,
                endTime,
                duration,
                rowCount,
                data,
                parameters
            };
            await this.logExecutionCompletion(executionId, result);
            if (template.outputFormat !== 'json') {
                result.outputUrl = await this.generateOutputFile(result, template.outputFormat);
            }
            logger_1.default.info('Report execution completed', { executionId, rowCount, duration });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error executing report', error);
            const result = {
                executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                templateId,
                status: 'failed',
                startTime: new Date(),
                rowCount: 0,
                data: [],
                error: error instanceof Error ? error.message : 'Unknown error',
                parameters
            };
            await this.logExecutionError(result.executionId, templateId, userId, result.error);
            throw error;
        }
    }
    async getReportTemplate(templateId) {
        try {
            const result = await db.query(`
        SELECT * FROM custom_report_templates WHERE id = $1
      `, [templateId]);
            if (result.rows.length === 0) {
                return null;
            }
            const template = result.rows[0];
            return {
                id: template.id,
                name: template.name,
                description: template.description,
                query: template.query,
                parameters: template.parameters || [],
                dataSource: template.data_source,
                outputFormat: template.output_format,
                schedule: template.schedule
            };
        }
        catch (error) {
            logger_1.default.error('Error getting report template', error);
            throw new Error('Failed to get report template');
        }
    }
    validateParameters(templateParams, providedParams) {
        try {
            const providedParamsMap = new Map(providedParams.map(p => [p.name, p]));
            for (const templateParam of templateParams) {
                const providedParam = providedParamsMap.get(templateParam.name);
                if (templateParam.required && !providedParam) {
                    throw new Error(`Required parameter '${templateParam.name}' is missing`);
                }
                if (providedParam) {
                    if (templateParam.type !== providedParam.type) {
                        throw new Error(`Parameter '${templateParam.name}' type mismatch. Expected ${templateParam.type}, got ${providedParam.type}`);
                    }
                    this.validateParameterValue(providedParam);
                }
            }
        }
        catch (error) {
            logger_1.default.error('Parameter validation failed', error);
            throw error;
        }
    }
    validateParameterValue(param) {
        switch (param.type) {
            case 'string':
                if (typeof param.value !== 'string') {
                    throw new Error(`Parameter '${param.name}' must be a string`);
                }
                break;
            case 'number':
                if (typeof param.value !== 'number' || isNaN(param.value)) {
                    throw new Error(`Parameter '${param.name}' must be a valid number`);
                }
                break;
            case 'date':
                if (!(param.value instanceof Date) && isNaN(Date.parse(param.value))) {
                    throw new Error(`Parameter '${param.name}' must be a valid date`);
                }
                break;
            case 'boolean':
                if (typeof param.value !== 'boolean') {
                    throw new Error(`Parameter '${param.name}' must be a boolean`);
                }
                break;
            case 'array':
                if (!Array.isArray(param.value)) {
                    throw new Error(`Parameter '${param.name}' must be an array`);
                }
                break;
        }
    }
    async executeQuery(query, parameters) {
        try {
            logger_1.default.info('Executing dynamic query', { query, parameterCount: parameters.length });
            const queryParams = [];
            let processedQuery = query;
            for (let i = 0; i < parameters.length; i++) {
                const param = parameters[i];
                const placeholder = `$${i + 1}`;
                let value = param.value;
                if (param.type === 'date' && typeof value === 'string') {
                    value = new Date(value);
                }
                queryParams.push(value);
            }
            const result = await db.query(processedQuery, queryParams);
            logger_1.default.info('Query executed successfully', { rowCount: result.rows.length });
            return {
                data: result.rows,
                rowCount: result.rows.length
            };
        }
        catch (error) {
            logger_1.default.error('Error executing query', error);
            throw new Error('Failed to execute report query');
        }
    }
    async generateOutputFile(result, format) {
        try {
            logger_1.default.info('Generating output file', { format, executionId: result.executionId });
            const fileName = `report_${result.executionId}.${format}`;
            const outputDir = process.env.REPORT_OUTPUT_DIR || 'reports';
            const filePath = `${outputDir}/${fileName}`;
            const fs = require('fs');
            const path = require('path');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            switch (format) {
                case 'csv':
                    await this.generateCSV(result.data, filePath);
                    break;
                case 'pdf':
                    await this.generatePDF(result, filePath);
                    break;
                case 'excel':
                    await this.generateExcel(result.data, filePath);
                    break;
                default:
                    throw new Error(`Unsupported output format: ${format}`);
            }
            logger_1.default.info('Output file generated', { filePath });
            return filePath;
        }
        catch (error) {
            logger_1.default.error('Error generating output file', error);
            throw new Error('Failed to generate output file');
        }
    }
    async generateCSV(data, filePath) {
        try {
            if (data.length === 0) {
                throw new Error('No data to export');
            }
            const fs = require('fs');
            const headers = Object.keys(data[0]);
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
            ].join('\n');
            fs.writeFileSync(filePath, csvContent, 'utf8');
        }
        catch (error) {
            logger_1.default.error('Error generating CSV', error);
            throw new Error('Failed to generate CSV file');
        }
    }
    async generatePDF(result, filePath) {
        try {
            const fs = require('fs');
            const pdfContent = `
Report Execution Summary
=======================

Execution ID: ${result.executionId}
Template ID: ${result.templateId}
Status: ${result.status}
Start Time: ${result.startTime}
End Time: ${result.endTime}
Duration: ${result.duration}ms
Row Count: ${result.rowCount}

Data Preview:
${JSON.stringify(result.data.slice(0, 5), null, 2)}
      `;
            fs.writeFileSync(filePath, pdfContent, 'utf8');
        }
        catch (error) {
            logger_1.default.error('Error generating PDF', error);
            throw new Error('Failed to generate PDF file');
        }
    }
    async generateExcel(data, filePath) {
        try {
            const fs = require('fs');
            if (data.length === 0) {
                throw new Error('No data to export');
            }
            const headers = Object.keys(data[0]);
            const excelContent = [
                headers.join('\t'),
                ...data.map(row => headers.map(header => row[header] || '').join('\t'))
            ].join('\n');
            fs.writeFileSync(filePath, excelContent, 'utf8');
        }
        catch (error) {
            logger_1.default.error('Error generating Excel', error);
            throw new Error('Failed to generate Excel file');
        }
    }
    async logExecutionStart(executionId, templateId, userId, parameters) {
        try {
            await db.query(`
        INSERT INTO report_executions 
        (execution_id, template_id, user_id, status, started_at, parameters)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
                executionId,
                templateId,
                userId,
                'running',
                new Date(),
                JSON.stringify(parameters)
            ]);
        }
        catch (error) {
            logger_1.default.error('Error logging execution start', error);
        }
    }
    async logExecutionCompletion(executionId, result) {
        try {
            await db.query(`
        UPDATE report_executions 
        SET status = $1, completed_at = $2, duration_ms = $3, row_count = $4, output_url = $5
        WHERE execution_id = $6
      `, [
                result.status,
                result.endTime,
                result.duration,
                result.rowCount,
                result.outputUrl,
                executionId
            ]);
        }
        catch (error) {
            logger_1.default.error('Error logging execution completion', error);
        }
    }
    async logExecutionError(executionId, templateId, userId, error) {
        try {
            await db.query(`
        UPDATE report_executions 
        SET status = $1, completed_at = $2, error_message = $3
        WHERE execution_id = $4
      `, [
                'failed',
                new Date(),
                error,
                executionId
            ]);
        }
        catch (error) {
            logger_1.default.error('Error logging execution error', error);
        }
    }
    async getExecutionHistory(userId, templateId, limit = 50, offset = 0) {
        try {
            const whereClause = templateId
                ? 'WHERE user_id = $1 AND template_id = $2'
                : 'WHERE user_id = $1';
            const params = templateId
                ? [userId, templateId, limit, offset]
                : [userId, limit, offset];
            const result = await db.query(`
        SELECT * FROM report_executions 
        ${whereClause}
        ORDER BY started_at DESC
        LIMIT $${templateId ? 3 : 2} OFFSET $${templateId ? 4 : 3}
      `, params);
            const countResult = await db.query(`
        SELECT COUNT(*) as total FROM report_executions 
        ${whereClause}
      `, templateId ? [userId, templateId] : [userId]);
            return {
                executions: result.rows,
                total: parseInt(countResult.rows[0]?.total || '0')
            };
        }
        catch (error) {
            logger_1.default.error('Error getting execution history', error);
            throw new Error('Failed to get execution history');
        }
    }
    async cancelExecution(executionId, userId) {
        try {
            const result = await db.query(`
        UPDATE report_executions 
        SET status = $1, completed_at = $2
        WHERE execution_id = $3 AND user_id = $4 AND status = 'running'
      `, ['cancelled', new Date(), executionId, userId]);
            if (result.rowCount === 0) {
                throw new Error('Execution not found or cannot be cancelled');
            }
            logger_1.default.info('Execution cancelled', { executionId, userId });
        }
        catch (error) {
            logger_1.default.error('Error cancelling execution', error);
            throw new Error('Failed to cancel execution');
        }
    }
}
exports.ReportExecutionService = ReportExecutionService;
exports.reportExecutionService = new ReportExecutionService();
//# sourceMappingURL=reportExecutionService.js.map