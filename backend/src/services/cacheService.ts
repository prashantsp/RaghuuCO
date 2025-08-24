/**
 * Cache Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This service provides Redis-based caching functionality for
 * improving application performance and reducing database load.
 */

import Redis from 'ioredis';
import { logger } from '@/utils/logger';

/**
 * Cache configuration interface
 */
interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
}

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache service class for Redis operations
 */
class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    const config: CacheConfig = {
      host: (process as any).env.REDIS_HOST || 'localhost',
      port: parseInt((process as any).env.REDIS_PORT || '6379'),
      password: (process as any).env.REDIS_PASSWORD,
      db: parseInt((process as any).env.REDIS_DB || '0'),
      keyPrefix: 'raghuuco:',
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    };

    this.redis = new Redis(config);

    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis cache connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis cache connection error:', error);
    });

    this.redis.on('disconnect', () => {
      this.isConnected = false;
      logger.warn('Redis cache disconnected');
    });
  }

  /**
   * Check if cache is connected
   */
  isCacheConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Set a value in cache with TTL
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, skipping set operation');
        return;
      }

      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl
      };

      await this.redis.setex(key, ttl, JSON.stringify(entry));
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Error setting cache value:', error as Error);
    }
  }

  /**
   * Get a value from cache
   * 
   * @param key - Cache key
   * @returns Cached value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Cache not connected, returning null');
        return null;
      }

      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(value);
      
      // Check if entry is expired
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      logger.debug(`Cache hit: ${key}`);
      return entry.data;
    } catch (error) {
      logger.error('Error getting cache value:', error as Error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   * 
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      await this.redis.del(key);
      logger.debug(`Cache delete: ${key}`);
    } catch (error) {
      logger.error('Error deleting cache value:', error as Error);
    }
  }

  /**
   * Delete multiple keys from cache
   * 
   * @param keys - Array of cache keys
   */
  async deleteMultiple(keys: string[]): Promise<void> {
    try {
      if (!this.isConnected || keys.length === 0) {
        return;
      }

      await this.redis.del(...keys);
      logger.debug(`Cache delete multiple: ${keys.length} keys`);
    } catch (error) {
      logger.error('Error deleting multiple cache values:', error as Error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      await this.redis.flushdb();
      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Error clearing cache:', error as Error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
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
    } catch (error) {
      logger.error('Error getting cache stats:', error as Error);
      return null;
    }
  }

  /**
   * Parse Redis info output
   */
  private parseRedisInfo(info: string): Record<string, string> {
    const lines = info.split('\r\n');
    const result: Record<string, string> = {};

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Cache decorator for methods
   * 
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  cache<T>(key: string, ttl: number = 3600) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;

      descriptor.value = async function (...args: any[]): Promise<T> {
        const cacheKey = `${key}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        const cached = await cacheService.get<T>(cacheKey);
        if (cached !== null) {
          return cached;
        }

        // Execute method and cache result
        const result = await method.apply(this, args);
        await cacheService.set(cacheKey, result, ttl);
        
        return result;
      };
    };
  }

  /**
   * Invalidate cache by pattern
   * 
   * @param pattern - Cache key pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache invalidated pattern: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      logger.error('Error invalidating cache pattern:', error as Error);
    }
  }

  /**
   * Set hash field in cache
   * 
   * @param key - Cache key
   * @param field - Hash field
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  async hset<T>(key: string, field: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      await this.redis.hset(key, field, JSON.stringify(value));
      await this.redis.expire(key, ttl);
      logger.debug(`Cache hset: ${key}:${field} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Error setting hash cache value:', error as Error);
    }
  }

  /**
   * Get hash field from cache
   * 
   * @param key - Cache key
   * @param field - Hash field
   * @returns Cached value or null if not found
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const value = await this.redis.hget(key, field);
      if (!value) {
        return null;
      }

      logger.debug(`Cache hget: ${key}:${field}`);
      return JSON.parse(value);
    } catch (error) {
      logger.error('Error getting hash cache value:', error as Error);
      return null;
    }
  }

  /**
   * Get all hash fields from cache
   * 
   * @param key - Cache key
   * @returns Object with field-value pairs
   */
  async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const values = await this.redis.hgetall(key);
      if (!values || Object.keys(values).length === 0) {
        return null;
      }

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(values)) {
        result[field] = JSON.parse(value);
      }

      logger.debug(`Cache hgetall: ${key}`);
      return result;
    } catch (error) {
      logger.error('Error getting all hash cache values:', error as Error);
      return null;
    }
  }

  /**
   * Delete hash field from cache
   * 
   * @param key - Cache key
   * @param field - Hash field
   */
  async hdel(key: string, field: string): Promise<void> {
    try {
      if (!this.isConnected) {
        return;
      }

      await this.redis.hdel(key, field);
      logger.debug(`Cache hdel: ${key}:${field}`);
    } catch (error) {
      logger.error('Error deleting hash cache field:', error as Error);
    }
  }

  /**
   * Set list in cache
   * 
   * @param key - Cache key
   * @param values - Array of values
   * @param ttl - Time to live in seconds
   */
  async setList<T>(key: string, values: T[], ttl: number = 3600): Promise<void> {
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
      
      logger.debug(`Cache setList: ${key} (${values.length} items, TTL: ${ttl}s)`);
    } catch (error) {
      logger.error('Error setting list cache:', error as Error);
    }
  }

  /**
   * Get list from cache
   * 
   * @param key - Cache key
   * @returns Array of values or null if not found
   */
  async getList<T>(key: string): Promise<T[] | null> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const values = await this.redis.lrange(key, 0, -1);
      if (!values || values.length === 0) {
        return null;
      }

      const result = values.map(value => JSON.parse(value));
      logger.debug(`Cache getList: ${key} (${result.length} items)`);
      return result;
    } catch (error) {
      logger.error('Error getting list cache:', error as Error);
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.redis.quit();
        this.isConnected = false;
        logger.info('Redis cache connection closed');
      }
    } catch (error) {
      logger.error('Error closing cache connection:', error as Error);
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

export default cacheService;
export { CacheService };