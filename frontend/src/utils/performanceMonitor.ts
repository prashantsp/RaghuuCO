/**
 * Performance Monitor Utility
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This utility provides comprehensive performance monitoring,
 * metrics collection, and performance optimization capabilities for the
 * frontend application.
 */

import { logger } from './logger';

/**
 * Performance metric types
 */
export enum MetricType {
  NAVIGATION = 'navigation',
  RESOURCE = 'resource',
  PAINT = 'paint',
  LAYOUT = 'layout',
  MEMORY = 'memory',
  NETWORK = 'network',
  CUSTOM = 'custom'
}

/**
 * Performance metric interface
 */
export interface PerformanceMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * Performance threshold interface
 */
export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

/**
 * Performance alert interface
 */
export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
  message: string;
  context?: Record<string, any>;
}

/**
 * Performance configuration interface
 */
export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableRealUserMonitoring: boolean;
  enableResourceMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  enableCustomMetrics: boolean;
  samplingRate: number;
  maxMetricsPerMinute: number;
  alertThresholds: PerformanceThreshold[];
  reportingEndpoint?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Navigation timing interface
 */
export interface NavigationTiming {
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

/**
 * Resource timing interface
 */
export interface ResourceTiming {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  download: number;
}

/**
 * Memory usage interface
 */
export interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedMemoryMB: number;
  totalMemoryMB: number;
  memoryLimitMB: number;
  memoryUsagePercent: number;
}

/**
 * Network performance interface
 */
export interface NetworkPerformance {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  connectionType: string;
}

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  private config: PerformanceConfig;
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isInitialized = false;
  private metricCount = 0;
  private lastMetricTime = 0;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      enableRealUserMonitoring: true,
      enableResourceMonitoring: true,
      enableMemoryMonitoring: true,
      enableNetworkMonitoring: true,
      enableCustomMetrics: true,
      samplingRate: 1.0,
      maxMetricsPerMinute: 100,
      alertThresholds: [
        { metric: 'pageLoadTime', warning: 3000, critical: 5000, unit: 'ms' },
        { metric: 'firstContentfulPaint', warning: 1500, critical: 2500, unit: 'ms' },
        { metric: 'largestContentfulPaint', warning: 2500, critical: 4000, unit: 'ms' },
        { metric: 'firstInputDelay', warning: 100, critical: 300, unit: 'ms' },
        { metric: 'memoryUsage', warning: 80, critical: 90, unit: '%' }
      ],
      logLevel: 'info',
      ...config
    };
  }

  /**
   * Initialize performance monitor
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      if (this.config.enableRealUserMonitoring) {
        this.setupRealUserMonitoring();
      }

      if (this.config.enableResourceMonitoring) {
        this.setupResourceMonitoring();
      }

      if (this.config.enableMemoryMonitoring) {
        this.setupMemoryMonitoring();
      }

      if (this.config.enableNetworkMonitoring) {
        this.setupNetworkMonitoring();
      }

      this.isInitialized = true;
      logger.info('Performance monitor initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize performance monitor:', error as Error);
    }
  }

  /**
   * Setup real user monitoring
   */
  private setupRealUserMonitoring(): void {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    }

    // Monitor paint timing
    if ('PerformanceObserver' in window) {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            this.recordPaintTiming(entry as PerformancePaintTiming);
          }
        }
      });

      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.set('paint', paintObserver);
    }

    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            this.recordLargestContentfulPaint(entry as PerformanceEntry);
          }
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    }

    // Monitor first input delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            this.recordFirstInputDelay(entry as PerformanceEntry);
          }
        }
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    }

    // Monitor layout shifts
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            this.recordLayoutShift(entry as PerformanceEntry);
          }
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    }
  }

  /**
   * Setup resource monitoring
   */
  private setupResourceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.recordResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 30000); // Check every 30 seconds
    }
  }

  /**
   * Setup network monitoring
   */
  private setupNetworkMonitoring(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        this.recordNetworkPerformance(connection);
        
        connection.addEventListener('change', () => {
          this.recordNetworkPerformance(connection);
        });
      }
    }
  }

  /**
   * Record navigation timing
   */
  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const timing: NavigationTiming = {
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnection: entry.connectEnd - entry.connectStart,
      serverResponse: entry.responseEnd - entry.requestStart,
      domContentLoaded: entry.domContentLoadedEventEnd - entry.navigationStart,
      loadComplete: entry.loadEventEnd - entry.navigationStart,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };

    this.addMetric('pageLoadTime', timing.loadComplete, 'ms', MetricType.NAVIGATION, {
      timing,
      url: window.location.href
    });

    this.addMetric('domContentLoaded', timing.domContentLoaded, 'ms', MetricType.NAVIGATION);
    this.addMetric('serverResponse', timing.serverResponse, 'ms', MetricType.NAVIGATION);
    this.addMetric('tcpConnection', timing.tcpConnection, 'ms', MetricType.NAVIGATION);
    this.addMetric('dnsLookup', timing.dnsLookup, 'ms', MetricType.NAVIGATION);
  }

  /**
   * Record paint timing
   */
  private recordPaintTiming(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-paint') {
      this.addMetric('firstPaint', entry.startTime, 'ms', MetricType.PAINT);
    } else if (entry.name === 'first-contentful-paint') {
      this.addMetric('firstContentfulPaint', entry.startTime, 'ms', MetricType.PAINT);
    }
  }

  /**
   * Record largest contentful paint
   */
  private recordLargestContentfulPaint(entry: PerformanceEntry): void {
    this.addMetric('largestContentfulPaint', entry.startTime, 'ms', MetricType.PAINT);
  }

  /**
   * Record first input delay
   */
  private recordFirstInputDelay(entry: PerformanceEntry): void {
    const fid = entry.processingStart - entry.startTime;
    this.addMetric('firstInputDelay', fid, 'ms', MetricType.NAVIGATION);
  }

  /**
   * Record layout shift
   */
  private recordLayoutShift(entry: PerformanceEntry): void {
    const cls = (entry as any).value;
    this.addMetric('cumulativeLayoutShift', cls, '', MetricType.LAYOUT);
  }

  /**
   * Record resource timing
   */
  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    const resource: ResourceTiming = {
      name: entry.name,
      type: entry.initiatorType,
      size: entry.transferSize,
      duration: entry.duration,
      startTime: entry.startTime,
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnection: entry.connectEnd - entry.connectStart,
      serverResponse: entry.responseEnd - entry.requestStart,
      download: entry.responseEnd - entry.responseStart
    };

    this.addMetric('resourceLoadTime', resource.duration, 'ms', MetricType.RESOURCE, {
      resource,
      url: resource.name
    });
  }

  /**
   * Record memory usage
   */
  private recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usage: MemoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usedMemoryMB: memory.usedJSHeapSize / 1024 / 1024,
        totalMemoryMB: memory.totalJSHeapSize / 1024 / 1024,
        memoryLimitMB: memory.jsHeapSizeLimit / 1024 / 1024,
        memoryUsagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };

      this.addMetric('memoryUsage', usage.memoryUsagePercent, '%', MetricType.MEMORY, { usage });
      this.addMetric('usedMemoryMB', usage.usedMemoryMB, 'MB', MetricType.MEMORY);
      this.addMetric('totalMemoryMB', usage.totalMemoryMB, 'MB', MetricType.MEMORY);
    }
  }

  /**
   * Record network performance
   */
  private recordNetworkPerformance(connection: any): void {
    const network: NetworkPerformance = {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
      connectionType: connection.type || 'unknown'
    };

    this.addMetric('networkDownlink', network.downlink, 'Mbps', MetricType.NETWORK, { network });
    this.addMetric('networkRTT', network.rtt, 'ms', MetricType.NETWORK);
  }

  /**
   * Add custom metric
   */
  addCustomMetric(
    name: string,
    value: number,
    unit: string,
    metadata?: Record<string, any>,
    tags?: string[]
  ): void {
    if (!this.config.enableCustomMetrics) {
      return;
    }

    this.addMetric(name, value, unit, MetricType.CUSTOM, metadata, tags);
  }

  /**
   * Add metric
   */
  private addMetric(
    name: string,
    value: number,
    unit: string,
    type: MetricType,
    metadata?: Record<string, any>,
    tags?: string[]
  ): void {
    // Check sampling rate
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    // Check rate limiting
    if (this.isRateLimited()) {
      return;
    }

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      type,
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata,
      tags
    };

    this.metrics.push(metric);
    this.checkThresholds(metric);
    this.logMetric(metric);

    // Keep only recent metrics (last hour)
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > oneHourAgo);
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.config.alertThresholds.find(t => t.metric === metric.name);
    
    if (!threshold) {
      return;
    }

    let severity: 'warning' | 'critical' | null = null;
    let thresholdValue = 0;

    if (metric.value >= threshold.critical) {
      severity = 'critical';
      thresholdValue = threshold.critical;
    } else if (metric.value >= threshold.warning) {
      severity = 'warning';
      thresholdValue = threshold.warning;
    }

    if (severity) {
      const alert: PerformanceAlert = {
        id: this.generateAlertId(),
        metric: metric.name,
        value: metric.value,
        threshold: thresholdValue,
        severity,
        timestamp: new Date(),
        message: `${metric.name} exceeded ${severity} threshold: ${metric.value}${metric.unit} >= ${thresholdValue}${threshold.unit}`,
        context: {
          metricId: metric.id,
          threshold
        }
      };

      this.alerts.push(alert);
      this.logAlert(alert);
    }
  }

  /**
   * Generate metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${++this.metricCount}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check rate limiting
   */
  private isRateLimited(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (now - this.lastMetricTime < oneMinuteAgo) {
      this.metricCount = 0;
    }

    if (this.metricCount >= this.config.maxMetricsPerMinute) {
      return true;
    }

    this.lastMetricTime = now;
    return false;
  }

  /**
   * Log metric
   */
  private logMetric(metric: PerformanceMetric): void {
    const logData = {
      id: metric.id,
      type: metric.type,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      timestamp: metric.timestamp
    };

    switch (this.config.logLevel) {
      case 'debug':
        logger.debug('Performance metric recorded', logData);
        break;
      case 'info':
        logger.info('Performance metric recorded', logData);
        break;
      case 'warn':
        if (metric.value > 1000) { // Log slow operations
          logger.warn('Slow performance detected', logData);
        }
        break;
    }
  }

  /**
   * Log alert
   */
  private logAlert(alert: PerformanceAlert): void {
    const logData = {
      id: alert.id,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      severity: alert.severity,
      message: alert.message
    };

    if (alert.severity === 'critical') {
      logger.error('Critical performance alert', logData);
    } else {
      logger.warn('Performance warning', logData);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStatistics(): {
    totalMetrics: number;
    metricsByType: Record<MetricType, number>;
    recentMetrics: PerformanceMetric[];
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    recentAlerts: PerformanceAlert[];
  } {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > oneHourAgo);
    const recentAlerts = this.alerts.filter(a => a.timestamp.getTime() > oneHourAgo);

    const metricsByType: Record<MetricType, number> = {
      [MetricType.NAVIGATION]: 0,
      [MetricType.RESOURCE]: 0,
      [MetricType.PAINT]: 0,
      [MetricType.LAYOUT]: 0,
      [MetricType.MEMORY]: 0,
      [MetricType.NETWORK]: 0,
      [MetricType.CUSTOM]: 0
    };

    const alertsBySeverity: Record<string, number> = {
      warning: 0,
      critical: 0
    };

    this.metrics.forEach(metric => {
      metricsByType[metric.type]++;
    });

    this.alerts.forEach(alert => {
      alertsBySeverity[alert.severity]++;
    });

    return {
      totalMetrics: this.metrics.length,
      metricsByType,
      recentMetrics,
      totalAlerts: this.alerts.length,
      alertsBySeverity,
      recentAlerts
    };
  }

  /**
   * Get metric by name
   */
  getMetricByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(minutes: number = 60): PerformanceMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.metricCount = 0;
    logger.info('Performance metrics cleared');
  }

  /**
   * Clear alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    logger.info('Performance alerts cleared');
  }

  /**
   * Get configuration
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Performance monitor configuration updated', { newConfig });
  }

  /**
   * Disconnect observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.isInitialized = false;
    logger.info('Performance monitor disconnected');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export utility functions
export const addCustomMetric = (name: string, value: number, unit: string, metadata?: Record<string, any>, tags?: string[]) => 
  performanceMonitor.addCustomMetric(name, value, unit, metadata, tags);