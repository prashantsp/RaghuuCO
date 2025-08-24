declare class CacheService {
    private redis;
    private isConnected;
    constructor();
    isCacheConnected(): boolean;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    delete(key: string): Promise<void>;
    deleteMultiple(keys: string[]): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<any>;
    private parseRedisInfo;
    cache<T>(key: string, ttl?: number): (target: any, propertyName: string, descriptor: PropertyDescriptor) => void;
    invalidatePattern(pattern: string): Promise<void>;
    hset<T>(key: string, field: string, value: T, ttl?: number): Promise<void>;
    hget<T>(key: string, field: string): Promise<T | null>;
    hgetall<T>(key: string): Promise<Record<string, T> | null>;
    hdel(key: string, field: string): Promise<void>;
    setList<T>(key: string, values: T[], ttl?: number): Promise<void>;
    getList<T>(key: string): Promise<T[] | null>;
    close(): Promise<void>;
}
declare const cacheService: CacheService;
export default cacheService;
export { CacheService };
//# sourceMappingURL=cacheService.d.ts.map