"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customReportBuilderService = exports.CustomReportBuilderService = void 0;
const DatabaseService_1 = __importDefault(require("@/services/DatabaseService"));
const logger_1 = __importDefault(require("@/utils/logger"));
const db = new DatabaseService_1.default();
class CustomReportBuilderService {
    constructor() {
        this.dataSources = {
            cases: {
                table: 'cases',
                fields: [
                    { name: 'id', type: 'uuid', label: 'Case ID' },
                    { name: 'case_number', type: 'text', label: 'Case Number' },
                    { name: 'title', type: 'text', label: 'Case Title' },
                    { name: 'case_type', type: 'enum', label: 'Case Type' },
                    { name: 'status', type: 'enum', label: 'Status' },
                    { name: 'priority', type: 'enum', label: 'Priority' },
                    { name: 'created_at', type: 'timestamp', label: 'Created Date' },
                    { name: 'updated_at', type: 'timestamp', label: 'Updated Date' }
                ],
                joins: [
                    { table: 'clients', on: 'cases.client_id = clients.id', type: 'LEFT' },
                    { table: 'users', on: 'cases.assigned_to = users.id', type: 'LEFT' }
                ]
            },
            clients: {
                table: 'clients',
                fields: [
                    { name: 'id', type: 'uuid', label: 'Client ID' },
                    { name: 'name', type: 'text', label: 'Client Name' },
                    { name: 'email', type: 'text', label: 'Email' },
                    { name: 'phone', type: 'text', label: 'Phone' },
                    { name: 'status', type: 'enum', label: 'Status' },
                    { name: 'created_at', type: 'timestamp', label: 'Created Date' }
                ]
            },
            invoices: {
                table: 'invoices',
                fields: [
                    { name: 'id', type: 'uuid', label: 'Invoice ID' },
                    { name: 'invoice_number', type: 'text', label: 'Invoice Number' },
                    { name: 'amount', type: 'decimal', label: 'Amount' },
                    { name: 'status', type: 'enum', label: 'Status' },
                    { name: 'due_date', type: 'date', label: 'Due Date' },
                    { name: 'created_at', type: 'timestamp', label: 'Created Date' }
                ],
                joins: [
                    { table: 'cases', on: 'invoices.case_id = cases.id', type: 'LEFT' },
                    { table: 'clients', on: 'cases.client_id = clients.id', type: 'LEFT' }
                ]
            },
            tasks: {
                table: 'tasks',
                fields: [
                    { name: 'id', type: 'uuid', label: 'Task ID' },
                    { name: 'title', type: 'text', label: 'Task Title' },
                    { name: 'task_type', type: 'enum', label: 'Task Type' },
                    { name: 'status', type: 'enum', label: 'Status' },
                    { name: 'priority', type: 'enum', label: 'Priority' },
                    { name: 'estimated_hours', type: 'decimal', label: 'Estimated Hours' },
                    { name: 'actual_hours', type: 'decimal', label: 'Actual Hours' },
                    { name: 'due_date', type: 'date', label: 'Due Date' },
                    { name: 'created_at', type: 'timestamp', label: 'Created Date' }
                ],
                joins: [
                    { table: 'cases', on: 'tasks.case_id = cases.id', type: 'LEFT' },
                    { table: 'users', on: 'tasks.assigned_to = users.id', type: 'LEFT' }
                ]
            },
            time_entries: {
                table: 'time_entries',
                fields: [
                    { name: 'id', type: 'uuid', label: 'Time Entry ID' },
                    { name: 'start_time', type: 'timestamp', label: 'Start Time' },
                    { name: 'end_time', type: 'timestamp', label: 'End Time' },
                    { name: 'duration_minutes', type: 'integer', label: 'Duration (Minutes)' },
                    { name: 'description', type: 'text', label: 'Description' },
                    { name: 'is_billable', type: 'boolean', label: 'Billable' },
                    { name: 'created_at', type: 'timestamp', label: 'Created Date' }
                ],
                joins: [
                    { table: 'cases', on: 'time_entries.case_id = cases.id', type: 'LEFT' },
                    { table: 'users', on: 'time_entries.user_id = users.id', type: 'LEFT' }
                ]
            }
        };
    }
    async getDataSources() {
        try {
            logger_1.default.info('Getting data sources for report builder');
            return {
                success: true,
                data: this.dataSources
            };
        }
        catch (error) {
            logger_1.default.error('Error getting data sources', error);
            throw new Error('Failed to get data sources');
        }
    }
    async buildQuery(queryDefinition) {
        try {
            const { dataSource, fields, filters, groupBy, orderBy, limit } = queryDefinition;
            let query = 'SELECT ';
            if (fields && fields.length > 0) {
                const fieldList = fields.map((field) => {
                    if (field.table) {
                        return `${field.table}.${field.name} as ${field.alias || field.name}`;
                    }
                    return field.name;
                }).join(', ');
                query += fieldList;
            }
            else {
                query += '*';
            }
            query += ` FROM ${dataSource}`;
            if (this.dataSources[dataSource]?.joins) {
                for (const join of this.dataSources[dataSource].joins) {
                    query += ` ${join.type} JOIN ${join.table} ON ${join.on}`;
                }
            }
            if (filters && filters.length > 0) {
                query += ' WHERE ';
                const conditions = filters.map((filter) => {
                    const { field, operator, value, table } = filter;
                    const fieldName = table ? `${table}.${field}` : field;
                    switch (operator) {
                        case 'equals':
                            return `${fieldName} = '${value}'`;
                        case 'not_equals':
                            return `${fieldName} != '${value}'`;
                        case 'contains':
                            return `${fieldName} ILIKE '%${value}%'`;
                        case 'starts_with':
                            return `${fieldName} ILIKE '${value}%'`;
                        case 'ends_with':
                            return `${fieldName} ILIKE '%${value}'`;
                        case 'greater_than':
                            return `${fieldName} > ${value}`;
                        case 'less_than':
                            return `${fieldName} < ${value}`;
                        case 'greater_than_or_equal':
                            return `${fieldName} >= ${value}`;
                        case 'less_than_or_equal':
                            return `${fieldName} <= ${value}`;
                        case 'is_null':
                            return `${fieldName} IS NULL`;
                        case 'is_not_null':
                            return `${fieldName} IS NOT NULL`;
                        case 'between':
                            return `${fieldName} BETWEEN '${value[0]}' AND '${value[1]}'`;
                        case 'in':
                            const values = Array.isArray(value) ? value.map(v => `'${v}'`).join(',') : `'${value}'`;
                            return `${fieldName} IN (${values})`;
                        default:
                            return `${fieldName} = '${value}'`;
                    }
                });
                query += conditions.join(' AND ');
            }
            if (groupBy && groupBy.length > 0) {
                query += ` GROUP BY ${groupBy.join(', ')}`;
            }
            if (orderBy && orderBy.length > 0) {
                const orderClauses = orderBy.map((order) => {
                    const { field, direction } = order;
                    return `${field} ${direction.toUpperCase()}`;
                });
                query += ` ORDER BY ${orderClauses.join(', ')}`;
            }
            if (limit) {
                query += ` LIMIT ${limit}`;
            }
            logger_1.default.info('Query built successfully', { query });
            return query;
        }
        catch (error) {
            logger_1.default.error('Error building query', error);
            throw new Error('Failed to build query');
        }
    }
    async executeReport(queryDefinition, parameters = {}) {
        try {
            logger_1.default.info('Executing custom report', { queryDefinition });
            const sqlQuery = await this.buildQuery(queryDefinition);
            const result = await db.query(sqlQuery, Object.values(parameters));
            const columns = result.fields.map(field => ({
                name: field.name,
                type: field.dataTypeID,
                label: field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }));
            logger_1.default.info('Custom report executed successfully', {
                rowCount: result.length,
                columnCount: columns.length
            });
            return {
                success: true,
                data: {
                    rows: result,
                    columns,
                    totalRows: result.length,
                    query: sqlQuery
                }
            };
        }
        catch (error) {
            logger_1.default.error('Error executing custom report', error);
            throw new Error('Failed to execute custom report');
        }
    }
    async saveReportTemplate(template) {
        try {
            const { name, description, templateType, queryDefinition, parameters, isPublic } = template;
            const userId = template.createdBy;
            logger_1.default.info('Saving custom report template', { name, templateType });
            const result = await db.query(`
        INSERT INTO custom_report_templates 
        (name, description, template_type, query_definition, parameters, created_by, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
                name,
                description,
                templateType,
                JSON.stringify(queryDefinition),
                JSON.stringify(parameters || {}),
                userId,
                isPublic || false
            ]);
            const savedTemplate = result[0];
            logger_1.default.businessEvent('custom_report_template_created', 'custom_report_template', savedTemplate.id, userId);
            return {
                success: true,
                data: { template: savedTemplate }
            };
        }
        catch (error) {
            logger_1.default.error('Error saving custom report template', error);
            throw new Error('Failed to save custom report template');
        }
    }
    async getReportTemplates(userId) {
        try {
            logger_1.default.info('Getting custom report templates', { userId });
            const result = await db.query(`
        SELECT crt.*, u.first_name, u.last_name
        FROM custom_report_templates crt
        LEFT JOIN users u ON crt.created_by = u.id
        WHERE crt.is_public = true OR crt.created_by = $1
        ORDER BY crt.created_at DESC
      `, [userId]);
            const templates = result;
            logger_1.default.info('Custom report templates fetched successfully', {
                userId,
                count: templates.length
            });
            return {
                success: true,
                data: { templates }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting custom report templates', error);
            throw new Error('Failed to get custom report templates');
        }
    }
    async getReportTemplateById(templateId, userId) {
        try {
            logger_1.default.info('Getting custom report template by ID', { templateId, userId });
            const result = await db.query(`
        SELECT crt.*, u.first_name, u.last_name
        FROM custom_report_templates crt
        LEFT JOIN users u ON crt.created_by = u.id
        WHERE crt.id = $1 AND (crt.is_public = true OR crt.created_by = $2)
      `, [templateId, userId]);
            const template = result[0];
            if (!template) {
                throw new Error('Report template not found or access denied');
            }
            logger_1.default.info('Custom report template fetched successfully', { templateId });
            return {
                success: true,
                data: { template }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting custom report template', error);
            throw new Error('Failed to get custom report template');
        }
    }
    async updateReportTemplate(templateId, updates, userId) {
        try {
            logger_1.default.info('Updating custom report template', { templateId, userId });
            const ownershipResult = await db.query(`
        SELECT created_by FROM custom_report_templates WHERE id = $1
      `, [templateId]);
            const template = ownershipResult[0];
            if (!template || template.created_by !== userId) {
                throw new Error('Access denied to update this template');
            }
            const { name, description, templateType, queryDefinition, parameters, isPublic } = updates;
            const result = await db.query(`
        UPDATE custom_report_templates 
        SET name = $2, description = $3, template_type = $4, query_definition = $5, 
            parameters = $6, is_public = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [
                templateId,
                name,
                description,
                templateType,
                JSON.stringify(queryDefinition),
                JSON.stringify(parameters || {}),
                isPublic
            ]);
            const updatedTemplate = result[0];
            logger_1.default.businessEvent('custom_report_template_updated', 'custom_report_template', templateId, userId);
            return {
                success: true,
                data: { template: updatedTemplate }
            };
        }
        catch (error) {
            logger_1.default.error('Error updating custom report template', error);
            throw new Error('Failed to update custom report template');
        }
    }
    async deleteReportTemplate(templateId, userId) {
        try {
            logger_1.default.info('Deleting custom report template', { templateId, userId });
            const ownershipResult = await db.query(`
        SELECT created_by FROM custom_report_templates WHERE id = $1
      `, [templateId]);
            const template = ownershipResult[0];
            if (!template || template.created_by !== userId) {
                throw new Error('Access denied to delete this template');
            }
            await db.query(`
        DELETE FROM custom_report_templates WHERE id = $1
      `, [templateId]);
            logger_1.default.businessEvent('custom_report_template_deleted', 'custom_report_template', templateId, userId);
            return {
                success: true,
                message: 'Report template deleted successfully'
            };
        }
        catch (error) {
            logger_1.default.error('Error deleting custom report template', error);
            throw new Error('Failed to delete custom report template');
        }
    }
    async getPreBuiltTemplates() {
        try {
            logger_1.default.info('Getting pre-built report templates');
            const preBuiltTemplates = [
                {
                    id: 'revenue_by_month',
                    name: 'Revenue by Month',
                    description: 'Monthly revenue analysis with trends',
                    templateType: 'financial',
                    queryDefinition: {
                        dataSource: 'invoices',
                        fields: [
                            { name: 'DATE_TRUNC(\'month\', created_at)', alias: 'month' },
                            { name: 'SUM(amount)', alias: 'total_revenue' },
                            { name: 'COUNT(*)', alias: 'invoice_count' }
                        ],
                        filters: [
                            { field: 'status', operator: 'equals', value: 'paid' }
                        ],
                        groupBy: ['month'],
                        orderBy: [{ field: 'month', direction: 'asc' }]
                    }
                },
                {
                    id: 'case_performance',
                    name: 'Case Performance Analysis',
                    description: 'Case completion rates and performance metrics',
                    templateType: 'operational',
                    queryDefinition: {
                        dataSource: 'cases',
                        fields: [
                            { name: 'case_type', alias: 'case_type' },
                            { name: 'status', alias: 'status' },
                            { name: 'COUNT(*)', alias: 'case_count' },
                            { name: 'AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400)', alias: 'avg_duration_days' }
                        ],
                        groupBy: ['case_type', 'status'],
                        orderBy: [{ field: 'case_count', direction: 'desc' }]
                    }
                },
                {
                    id: 'task_productivity',
                    name: 'Task Productivity Report',
                    description: 'Task completion and productivity metrics',
                    templateType: 'productivity',
                    queryDefinition: {
                        dataSource: 'tasks',
                        fields: [
                            { name: 'task_type', alias: 'task_type' },
                            { name: 'status', alias: 'status' },
                            { name: 'COUNT(*)', alias: 'task_count' },
                            { name: 'AVG(actual_hours)', alias: 'avg_actual_hours' },
                            { name: 'AVG(estimated_hours)', alias: 'avg_estimated_hours' }
                        ],
                        groupBy: ['task_type', 'status'],
                        orderBy: [{ field: 'task_count', direction: 'desc' }]
                    }
                },
                {
                    id: 'client_revenue',
                    name: 'Client Revenue Analysis',
                    description: 'Revenue breakdown by client',
                    templateType: 'financial',
                    queryDefinition: {
                        dataSource: 'invoices',
                        fields: [
                            { name: 'clients.name', alias: 'client_name' },
                            { name: 'SUM(invoices.amount)', alias: 'total_revenue' },
                            { name: 'COUNT(invoices.id)', alias: 'invoice_count' },
                            { name: 'AVG(invoices.amount)', alias: 'avg_invoice_value' }
                        ],
                        filters: [
                            { field: 'invoices.status', operator: 'equals', value: 'paid' }
                        ],
                        groupBy: ['clients.name'],
                        orderBy: [{ field: 'total_revenue', direction: 'desc' }]
                    }
                }
            ];
            logger_1.default.info('Pre-built templates fetched successfully', {
                count: preBuiltTemplates.length
            });
            return {
                success: true,
                data: { templates: preBuiltTemplates }
            };
        }
        catch (error) {
            logger_1.default.error('Error getting pre-built templates', error);
            throw new Error('Failed to get pre-built templates');
        }
    }
}
exports.CustomReportBuilderService = CustomReportBuilderService;
exports.customReportBuilderService = new CustomReportBuilderService();
//# sourceMappingURL=customReportBuilderService.js.map