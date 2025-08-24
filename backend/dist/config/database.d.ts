export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}
export declare const defaultDatabaseConfig: DatabaseConfig;
export declare function getDatabaseConfig(overrides?: Partial<DatabaseConfig>): DatabaseConfig;
export declare function validateDatabaseConfig(config: DatabaseConfig): boolean;
//# sourceMappingURL=database.d.ts.map