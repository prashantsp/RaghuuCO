/**
 * Report Execution Service
 * RAGHUU CO Legal Practice Management System - Backend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Service for dynamic report execution and generation
 */

import DatabaseService from '@/services/DatabaseService';
import logger from '@/utils/logger';

const db = new DatabaseService();

/**
 * Report Parameter Interface
 * Defines the structure of report parameters
 * 
 * @interface ReportParameter
 * @property {string} name - Parameter name
 * @property {'string' | 'number' | 'date' | 'boolean' | 'array'} type - Parameter data type
 * @property {any} value - Parameter value
 * @property {boolean} required - Whether the parameter is required
 * @property {any} [defaultValue] - Default value for the parameter
 */
interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  value: any;
  required: boolean;
  defaultValue?: any;
}

/**
 * Report Template Interface
 * Defines the structure of report templates
 * 
 * @interface ReportTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} query - SQL query for the report
 * @property {ReportParameter[]} parameters - Array of template parameters
 * @property {string} dataSource - Data source identifier
 * @property {'json' | 'csv' | 'pdf' | 'excel'} outputFormat - Output format
 * @property {string} [schedule] - Cron expression for scheduled reports
 */
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  query: string;
  parameters: ReportParameter[];
  dataSource: string;
  outputFormat: 'json' | 'csv' | 'pdf' | 'excel';
  schedule?: string; // Cron expression for scheduled reports
}

/**
 * Report Execution Result Interface
 * Defines the structure of report execution results
 * 
 * @interface ReportExecutionResult
 * @property {string} executionId - Unique execution identifier
 * @property {string} templateId - Template ID that was executed
 * @property {'running' | 'completed' | 'failed' | 'cancelled'} status - Execution status
 * @property {Date} startTime - When execution started
 * @property {Date} [endTime] - When execution completed
 * @property {number} [duration] - Execution duration in milliseconds
 * @property {number} rowCount - Number of rows returned
 * @property {any[]} data - Report data
 * @property {string} [error] - Error message if failed
 * @property {ReportParameter[]} parameters - Parameters used for execution
 * @property {string} [outputUrl] - URL to output file if generated
 */
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

/**
 * Report Execution Service Class
 * Handles dynamic report generation and execution
 */
export class ReportExecutionService {
  /**
   * Execute a report from template
   * 
   * @param templateId - The ID of the report template to execute
   * @param parameters - Array of report parameters with values
   * @param userId - The ID of the user executing the report
   * @returns Promise<ReportExecutionResult> - Complete execution result
   * @throws Error if template not found or execution fails
   * 
   * @example
   * ```typescript
   * const result = await reportExecutionService.executeReport(
   *   'template-123',
   *   [{ name: 'startDate', type: 'date', value: '2025-01-01', required: true }],
   *   'user-456'
   * );
   * ```
   */
  async executeReport(
    templateId: string,
    parameters: ReportParameter[],
    userId: string
  ): Promise<ReportExecutionResult> {
    try {
      logger.info('Starting report execution', { templateId, userId });

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = new Date();

      // Get report template
      const template = await this.getReportTemplate(templateId);
      if (!template) {
        throw new Error('Report template not found');
      }

      // Validate parameters
      this.validateParameters(template.parameters, parameters);

      // Log execution start
      await this.logExecutionStart(executionId, templateId, userId, parameters);

      // Execute the report query
      const { data, rowCount } = await this.executeQuery(template.query, parameters);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const result: ReportExecutionResult = {
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

      // Log execution completion
      await this.logExecutionCompletion(executionId, result);

      // Generate output file if needed
      if (template.outputFormat !== 'json') {
        result.outputUrl = await this.generateOutputFile(result, template.outputFormat);
      }

      logger.info('Report execution completed', { executionId, rowCount, duration });

      return result;
    } catch (error) {
      logger.error('Error executing report', error as Error);
      
      const result: ReportExecutionResult = {
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

  /**
   * Get report template by ID
   * 
   * @param templateId - The ID of the report template
   * @returns Promise<ReportTemplate | null> - The report template or null if not found
   * @throws Error if database query fails
   * 
   * @example
   * ```typescript
   * const template = await reportExecutionService.getReportTemplate('template-123');
   * if (template) {
   *   console.log('Template found:', template.name);
   * }
   * ```
   */
  async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
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
    } catch (error) {
      logger.error('Error getting report template', error as Error);
      throw new Error('Failed to get report template');
    }
  }

  /**
   * Validate report parameters
   * 
   * @param templateParams - Array of template parameter definitions
   * @param providedParams - Array of provided parameter values
   * @throws Error if validation fails (missing required params, type mismatch, etc.)
   * 
   * @example
   * ```typescript
   * const templateParams = [{ name: 'startDate', type: 'date', required: true }];
   * const providedParams = [{ name: 'startDate', type: 'date', value: '2025-01-01', required: true }];
   * reportExecutionService.validateParameters(templateParams, providedParams);
   * ```
   */
  validateParameters(templateParams: ReportParameter[], providedParams: ReportParameter[]): void {
    try {
      const providedParamsMap = new Map(providedParams.map(p => [p.name, p]));

      for (const templateParam of templateParams) {
        const providedParam = providedParamsMap.get(templateParam.name);

        if (templateParam.required && !providedParam) {
          throw new Error(`Required parameter '${templateParam.name}' is missing`);
        }

        if (providedParam) {
          // Type validation
          if (templateParam.type !== providedParam.type) {
            throw new Error(`Parameter '${templateParam.name}' type mismatch. Expected ${templateParam.type}, got ${providedParam.type}`);
          }

          // Value validation based on type
          this.validateParameterValue(providedParam);
        }
      }
    } catch (error) {
      logger.error('Parameter validation failed', error as Error);
      throw error;
    }
  }

  /**
   * Validate parameter value based on type
   */
  validateParameterValue(param: ReportParameter): void {
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

  /**
   * Execute dynamic query with parameters
   */
  async executeQuery(query: string, parameters: ReportParameter[]): Promise<{ data: any[]; rowCount: number }> {
    try {
      logger.info('Executing dynamic query', { query, parameterCount: parameters.length });

      // Build parameter array for database query
      const queryParams: any[] = [];
      let processedQuery = query;

      // Replace parameter placeholders with actual values
      for (let i = 0; i < parameters.length; i++) {
        const param = parameters[i];
        const placeholder = `$${i + 1}`;
        
        // Handle different parameter types
        let value = param.value;
        if (param.type === 'date' && typeof value === 'string') {
          value = new Date(value);
        }
        
        queryParams.push(value);
      }

      // Execute the query
      const result = await db.query(processedQuery, queryParams);

      logger.info('Query executed successfully', { rowCount: result.rows.length });

      return {
        data: result.rows,
        rowCount: result.rows.length
      };
    } catch (error) {
      logger.error('Error executing query', error as Error);
      throw new Error('Failed to execute report query');
    }
  }

  /**
   * Generate output file for report
   */
  async generateOutputFile(result: ReportExecutionResult, format: string): Promise<string> {
    try {
      logger.info('Generating output file', { format, executionId: result.executionId });

      const fileName = `report_${result.executionId}.${format}`;
      const outputDir = process.env.REPORT_OUTPUT_DIR || 'reports';
      const filePath = `${outputDir}/${fileName}`;

      // Ensure output directory exists
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

      logger.info('Output file generated', { filePath });

      return filePath;
    } catch (error) {
      logger.error('Error generating output file', error as Error);
      throw new Error('Failed to generate output file');
    }
  }

  /**
   * Generate CSV file
   */
  async generateCSV(data: any[], filePath: string): Promise<void> {
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
    } catch (error) {
      logger.error('Error generating CSV', error as Error);
      throw new Error('Failed to generate CSV file');
    }
  }

  /**
   * Generate PDF file
   */
  async generatePDF(result: ReportExecutionResult, filePath: string): Promise<void> {
    try {
      // This is a simplified PDF generation
      // In production, you'd use a library like PDFKit or Puppeteer
      const fs = require('fs');
      
      // Create a simple text-based PDF content
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
    } catch (error) {
      logger.error('Error generating PDF', error as Error);
      throw new Error('Failed to generate PDF file');
    }
  }

  /**
   * Generate Excel file
   */
  async generateExcel(data: any[], filePath: string): Promise<void> {
    try {
      // This is a simplified Excel generation
      // In production, you'd use a library like ExcelJS
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
    } catch (error) {
      logger.error('Error generating Excel', error as Error);
      throw new Error('Failed to generate Excel file');
    }
  }

  /**
   * Log execution start
   */
  async logExecutionStart(
    executionId: string,
    templateId: string,
    userId: string,
    parameters: ReportParameter[]
  ): Promise<void> {
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
    } catch (error) {
      logger.error('Error logging execution start', error as Error);
    }
  }

  /**
   * Log execution completion
   */
  async logExecutionCompletion(executionId: string, result: ReportExecutionResult): Promise<void> {
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
    } catch (error) {
      logger.error('Error logging execution completion', error as Error);
    }
  }

  /**
   * Log execution error
   */
  async logExecutionError(executionId: string, templateId: string, userId: string, error: string): Promise<void> {
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
    } catch (error) {
      logger.error('Error logging execution error', error as Error);
    }
  }

  /**
   * Get execution history
   */
  async getExecutionHistory(
    userId: string,
    templateId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ executions: any[]; total: number }> {
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
    } catch (error) {
      logger.error('Error getting execution history', error as Error);
      throw new Error('Failed to get execution history');
    }
  }

  /**
   * Cancel running execution
   */
  async cancelExecution(executionId: string, userId: string): Promise<void> {
    try {
      const result = await db.query(`
        UPDATE report_executions 
        SET status = $1, completed_at = $2
        WHERE execution_id = $3 AND user_id = $4 AND status = 'running'
      `, ['cancelled', new Date(), executionId, userId]);

      if (result.rowCount === 0) {
        throw new Error('Execution not found or cannot be cancelled');
      }

      logger.info('Execution cancelled', { executionId, userId });
    } catch (error) {
      logger.error('Error cancelling execution', error as Error);
      throw new Error('Failed to cancel execution');
    }
  }
}

// Export service instance
export const reportExecutionService = new ReportExecutionService();