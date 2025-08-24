import * as winston from 'winston';
declare const logger: winston.Logger;
declare class Logger {
    private logger;
    constructor();
    error(message: string, error?: Error, context?: any): void;
    warn(message: string, context?: any): void;
    info(message: string, context?: any): void;
    http(message: string, context?: any): void;
    debug(message: string, context?: any): void;
    dbQuery(query: string, params?: any[], duration?: number): void;
    apiRequest(method: string, url: string, userId?: string, duration?: number): void;
    authEvent(event: string, userId: string, success: boolean, ipAddress?: string): void;
    securityEvent(event: string, userId?: string, ipAddress?: string, details?: any): void;
    businessEvent(event: string, entityType: string, entityId: string, userId: string, details?: any): void;
    performance(metric: string, value: number, unit?: string, context?: any): void;
    private formatMessage;
    child(context: any): Logger;
}
declare const appLogger: Logger;
export { logger as winstonLogger, appLogger as logger };
export default appLogger;
//# sourceMappingURL=logger.d.ts.map