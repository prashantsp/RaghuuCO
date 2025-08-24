"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("@/utils/logger");
class CacheService {
    constructor() {
        this.isConnected = false;
        const config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            keyPrefix: 'raghuuco:',
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3
        };
        this.redis = new ioredis_1.default(config);
        this.redis.on('connect', () => {
            this.isConnected = true;
            logger_1.logger.info('Redis cache connected successfully');
        });
        this.redis.on('error', (error) => {
            this.isConnected = false;
            logger_1.logger.error('Redis cache connection error:', error);
        });
        this.redis.on('disconnect', () => {
            this.isConnected = false;
            logger_1.logger.warn('Redis cache disconnected');
        });
    }
    isCacheConnected() {
        return this.isConnected;
    }
    async set(key, value, ttl = 3600) {
        try {
            if (!this.isConnected) {
                logger_1.logger.warn('Cache not connected, skipping set operation');
                return;
            }
            const entry = {
                data: value,
                timestamp: Date.now(),
                ttl: ttl
            };
            await this.redis.setex(key, ttl, JSON.stringify(entry));
            logger_1.logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
        }
        catch (error) {
            logger_1.logger.error('Error setting cache value:', error);
        }
    }
    async get(key) {
        try {
            if (!this.isConnected) {
                logger_1.logger.warn('Cache not connected, returning null');
                return null;
            }
            const value = await this.redis.get(key);
            if (!value) {
                return null;
            }
            const entry = JSON.parse(value);
            const now = Date.now();
            if (now - entry.timestamp > entry.ttl * 1000) {
                await this.delete(key);
                return null;
            }
            logger_1.logger.debug(`Cache hit: ${key}`);
            return entry.data;
        }
        catch (error) {
            logger_1.logger.error('Error getting cache value:', error);
            return null;
        }
    }
    async delete(key) {
        try {
            if (!this.isConnected) {
                return;
            }
            await this.redis.del(key);
            logger_1.logger.debug(`Cache delete: ${key}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting cache value:', error);
        }
    }
    async deleteMultiple(keys) {
        try {
            if (!this.isConnected || keys.length === 0) {
                return;
            }
            await this.redis.del(...keys);
            logger_1.logger.debug(`Cache delete multiple: ${keys.length} keys`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting multiple cache values:', error);
        }
    }
    async clear() {
        try {
            if (!this.isConnected) {
                return;
            }
            await this.redis.flushdb();
            logger_1.logger.info('Cache cleared successfully');
        }
        catch (error) {
            logger_1.logger.error('Error clearing cache:', error);
        }
    }
    async getStats() {
        try {
            if (!this.isConnected) {
                return null;
            }
            const info = await this.redis.info();
            const keyspace = await this.redis.info('keyspace');
            return {
                info: this.parseRedisInfo(info),
                keyspace: this.parseRedisInfo(keyspace),
                connected: this.isConnected
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting cache stats:', error);
            return null;
        }
    }
    parseRedisInfo(info) {
        const lines = info.split('\r\n');
        const result = {};
        for (const line of lines) {
            if (line.includes(':')) {
                const [key, value] = line.split(':');
                result[key] = value;
            }
        }
        return result;
    }
    cache(key, ttl = 3600) {
        return function (_target, _propertyName, descriptor) {
            const method = descriptor.value;
            descriptor.value = async function (...args) {
                const cacheKey = `${key}:${JSON.stringify(args)}`;
                const cached = await cacheService.get(cacheKey);
                if (cached !== null) {
                    return cached;
                }
                const result = await method.apply(this, args);
                await cacheService.set(cacheKey, result, ttl);
                return result;
            };
        };
    }
    async invalidatePattern(pattern) {
        try {
            if (!this.isConnected) {
                return;
            }
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                logger_1.logger.debug(`Cache invalidated pattern: ${pattern} (${keys.length} keys)`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error invalidating cache pattern:', error);
        }
    }
    async hset(key, field, value, ttl = 3600) {
        try {
            if (!this.isConnected) {
                return;
            }
            await this.redis.hset(key, field, JSON.stringify(value));
            await this.redis.expire(key, ttl);
            logger_1.logger.debug(`Cache hset: ${key}:${field} (TTL: ${ttl}s)`);
        }
        catch (error) {
            logger_1.logger.error('Error setting hash cache value:', error);
        }
    }
    async hget(key, field) {
        try {
            if (!this.isConnected) {
                return null;
            }
            const value = await this.redis.hget(key, field);
            if (!value) {
                return null;
            }
            logger_1.logger.debug(`Cache hget: ${key}:${field}`);
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Error getting hash cache value:', error);
            return null;
        }
    }
    async hgetall(key) {
        try {
            if (!this.isConnected) {
                return null;
            }
            const values = await this.redis.hgetall(key);
            if (!values || Object.keys(values).length === 0) {
                return null;
            }
            const result = {};
            for (const [field, value] of Object.entries(values)) {
                result[field] = JSON.parse(value);
            }
            logger_1.logger.debug(`Cache hgetall: ${key}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error getting all hash cache values:', error);
            return null;
        }
    }
    async hdel(key, field) {
        try {
            if (!this.isConnected) {
                return;
            }
            await this.redis.hdel(key, field);
            logger_1.logger.debug(`Cache hdel: ${key}:${field}`);
        }
        catch (error) {
            logger_1.logger.error('Error deleting hash cache field:', error);
        }
    }
    async setList(key, values, ttl = 3600) {
        try {
            if (!this.isConnected) {
                return;
            }
            const pipeline = this.redis.pipeline();
            pipeline.del(key);
            for (const value of values) {
                pipeline.rpush(key, JSON.stringify(value));
            }
            pipeline.expire(key, ttl);
            await pipeline.exec();
            logger_1.logger.debug(`Cache setList: ${key} (${values.length} items, TTL: ${ttl}s)`);
        }
        catch (error) {
            logger_1.logger.error('Error setting list cache:', error);
        }
    }
    async getList(key) {
        try {
            if (!this.isConnected) {
                return null;
            }
            const values = await this.redis.lrange(key, 0, -1);
            if (!values || values.length === 0) {
                return null;
            }
            const result = values.map(value => JSON.parse(value));
            logger_1.logger.debug(`Cache getList: ${key} (${result.length} items)`);
            return result;
        }
        catch (error) {
            logger_1.logger.error('Error getting list cache:', error);
            return null;
        }
    }
    async close() {
        try {
            if (this.isConnected) {
                await this.redis.quit();
                this.isConnected = false;
                logger_1.logger.info('Redis cache connection closed');
            }
        }
        catch (error) {
            logger_1.logger.error('Error closing cache connection:', error);
        }
    }
}
exports.CacheService = CacheService;
const cacheService = new CacheService();
exports.default = cacheService;
//# sourceMappingURL=cacheService.js.map