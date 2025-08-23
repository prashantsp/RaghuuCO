/**
 * User Experience Service
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This service provides comprehensive user experience testing,
 * feedback collection, and usability analysis for the legal practice
 * management system.
 */

import { logger } from '@/utils/logger';

/**
 * UX event types
 */
export enum UXEventType {
  PAGE_VIEW = 'page_view',
  CLICK = 'click',
  SCROLL = 'scroll',
  FORM_SUBMIT = 'form_submit',
  FORM_ERROR = 'form_error',
  NAVIGATION = 'navigation',
  SEARCH = 'search',
  FEEDBACK = 'feedback',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility'
}

/**
 * UX event interface
 */
export interface UXEvent {
  id: string;
  type: UXEventType;
  timestamp: string;
  userId?: string;
  sessionId: string;
  pageUrl: string;
  elementId?: string;
  elementType?: string;
  elementText?: string;
  metadata: Record<string, any>;
  performance?: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
  };
  accessibility?: {
    screenReaderUsed: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    fontSize: string;
  };
}

/**
 * User feedback interface
 */
export interface UserFeedback {
  id: string;
  userId?: string;
  sessionId: string;
  type: 'bug' | 'feature_request' | 'usability' | 'general';
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  pageUrl: string;
  userAgent: string;
  browserInfo: {
    name: string;
    version: string;
    os: string;
    screenResolution: string;
  };
  attachments?: string[];
  rating?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolution?: string;
}

/**
 * Usability test interface
 */
export interface UsabilityTest {
  id: string;
  name: string;
  description: string;
  tasks: UsabilityTask[];
  participants: UsabilityParticipant[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  createdAt: string;
  createdBy: string;
  results?: UsabilityTestResult[];
}

/**
 * Usability task interface
 */
export interface UsabilityTask {
  id: string;
  title: string;
  description: string;
  instructions: string;
  startUrl: string;
  successCriteria: string[];
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

/**
 * Usability participant interface
 */
export interface UsabilityParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  experience: 'beginner' | 'intermediate' | 'expert';
  demographics: {
    age: string;
    gender: string;
    location: string;
    deviceType: string;
  };
  status: 'invited' | 'started' | 'completed' | 'dropped';
  startedAt?: string;
  completedAt?: string;
  sessionId?: string;
}

/**
 * Usability test result interface
 */
export interface UsabilityTestResult {
  id: string;
  testId: string;
  participantId: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  success: boolean;
  successRate: number;
  errors: string[];
  clicks: number;
  scrolls: number;
  navigationSteps: number;
  satisfaction: number;
  difficulty: number;
  comments: string;
  screenRecording?: string;
  heatmapData?: any;
  eyeTrackingData?: any;
}

/**
 * A/B test interface
 */
export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variantA: ABTestVariant;
  variantB: ABTestVariant;
  metrics: string[];
  trafficSplit: number; // Percentage for variant B
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  minSampleSize: number;
  confidenceLevel: number;
  results?: ABTestResult;
}

/**
 * A/B test variant interface
 */
export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  changes: Record<string, any>;
  trafficPercentage: number;
}

/**
 * A/B test result interface
 */
export interface ABTestResult {
  variantA: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    averageOrderValue: number;
    revenue: number;
  };
  variantB: {
    impressions: number;
    conversions: number;
    conversionRate: number;
    averageOrderValue: number;
    revenue: number;
  };
  winner: 'A' | 'B' | 'tie' | null;
  confidence: number;
  lift: number;
  statisticalSignificance: boolean;
}

/**
 * User experience service class
 */
class UserExperienceService {
  private sessionId: string;
  private events: UXEvent[] = [];
  private isTracking: boolean = false;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  /**
   * Initialize UX tracking
   */
  private initializeTracking(): void {
    try {
      // Start tracking on page load
      this.startTracking();
      
      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        this.trackEvent(UXEventType.PAGE_VIEW, {
          visibility: document.hidden ? 'hidden' : 'visible',
          timestamp: Date.now()
        });
      });

      // Track performance metrics
      this.initializePerformanceTracking();

      logger.info('User experience tracking initialized', {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error initializing UX tracking:', error as Error);
    }
  }

  /**
   * Start UX tracking
   */
  startTracking(): void {
    if (this.isTracking) return;

    this.isTracking = true;
    
    // Track initial page view
    this.trackEvent(UXEventType.PAGE_VIEW, {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackEvent(UXEventType.CLICK, {
        elementId: target.id,
        elementType: target.tagName.toLowerCase(),
        elementText: target.textContent?.trim().substring(0, 100),
        elementClasses: target.className,
        elementPath: this.getElementPath(target),
        coordinates: { x: event.clientX, y: event.clientY }
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent(UXEventType.FORM_SUBMIT, {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method,
        fieldCount: form.elements.length
      });
    });

    // Track form errors
    document.addEventListener('invalid', (event) => {
      const element = event.target as HTMLInputElement;
      this.trackEvent(UXEventType.FORM_ERROR, {
        elementId: element.id,
        elementType: element.type,
        elementName: element.name,
        validationMessage: element.validationMessage
      });
    });

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackEvent(UXEventType.SCROLL, {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight
        });
      }, 100);
    });

    logger.info('UX tracking started', { sessionId: this.sessionId });
  }

  /**
   * Stop UX tracking
   */
  stopTracking(): void {
    this.isTracking = false;
    this.performanceObserver?.disconnect();
    logger.info('UX tracking stopped', { sessionId: this.sessionId });
  }

  /**
   * Track UX event
   */
  trackEvent(type: UXEventType, metadata: Record<string, any> = {}): void {
    if (!this.isTracking) return;

    try {
      const event: UXEvent = {
        id: this.generateEventId(),
        type,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        metadata: {
          ...metadata,
          url: window.location.href,
          title: document.title,
          timestamp: Date.now()
        }
      };

      // Add performance data if available
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        event.performance = {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          renderTime: timing.domContentLoadedEventEnd - timing.navigationStart,
          interactionTime: timing.domInteractive - timing.navigationStart
        };
      }

      // Add accessibility data
      event.accessibility = {
        screenReaderUsed: this.detectScreenReader(),
        keyboardNavigation: this.detectKeyboardNavigation(),
        highContrast: this.detectHighContrast(),
        fontSize: this.getCurrentFontSize()
      };

      this.events.push(event);
      this.sendEventToServer(event);

      logger.debug('UX event tracked', {
        type,
        sessionId: this.sessionId,
        metadata: Object.keys(metadata)
      });
    } catch (error) {
      logger.error('Error tracking UX event:', error as Error);
    }
  }

  /**
   * Initialize performance tracking
   */
  private initializePerformanceTracking(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.trackEvent(UXEventType.PERFORMANCE, {
                loadTime: navEntry.loadEventEnd - navEntry.navigationStart,
                domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                firstPaint: navEntry.responseStart - navEntry.navigationStart,
                firstContentfulPaint: navEntry.responseStart - navEntry.navigationStart,
                domInteractive: navEntry.domInteractive - navEntry.navigationStart,
                domComplete: navEntry.domComplete - navEntry.navigationStart
              });
            }
          }
        });

        this.performanceObserver.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        logger.error('Error initializing performance tracking:', error as Error);
      }
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(feedback: Omit<UserFeedback, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const feedbackData: UserFeedback = {
        ...feedback,
        id: this.generateFeedbackId(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        browserInfo: this.getBrowserInfo(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Send feedback to server
      await this.sendFeedbackToServer(feedbackData);

      // Track feedback event
      this.trackEvent(UXEventType.FEEDBACK, {
        feedbackId: feedbackData.id,
        feedbackType: feedback.type,
        feedbackCategory: feedback.category,
        feedbackSeverity: feedback.severity
      });

      logger.info('User feedback submitted', {
        feedbackId: feedbackData.id,
        type: feedback.type,
        category: feedback.category
      });

      return feedbackData.id;
    } catch (error) {
      logger.error('Error submitting feedback:', error as Error);
      throw error;
    }
  }

  /**
   * Create usability test
   */
  async createUsabilityTest(test: Omit<UsabilityTest, 'id' | 'createdAt'>): Promise<string> {
    try {
      const testData: UsabilityTest = {
        ...test,
        id: this.generateTestId(),
        createdAt: new Date().toISOString()
      };

      // Send test to server
      await this.sendTestToServer(testData);

      logger.info('Usability test created', {
        testId: testData.id,
        name: testData.name,
        taskCount: testData.tasks.length,
        participantCount: testData.participants.length
      });

      return testData.id;
    } catch (error) {
      logger.error('Error creating usability test:', error as Error);
      throw error;
    }
  }

  /**
   * Start usability test session
   */
  async startUsabilityTestSession(testId: string, participantId: string): Promise<void> {
    try {
      const sessionData = {
        testId,
        participantId,
        sessionId: this.sessionId,
        startTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        browserInfo: this.getBrowserInfo(),
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      };

      await this.sendSessionToServer(sessionData);

      // Start enhanced tracking for usability test
      this.startUsabilityTracking(testId, participantId);

      logger.info('Usability test session started', {
        testId,
        participantId,
        sessionId: this.sessionId
      });
    } catch (error) {
      logger.error('Error starting usability test session:', error as Error);
      throw error;
    }
  }

  /**
   * Complete usability test task
   */
  async completeUsabilityTask(
    testId: string,
    taskId: string,
    result: Omit<UsabilityTestResult, 'id' | 'testId' | 'taskId' | 'startTime'>
  ): Promise<void> {
    try {
      const taskResult: UsabilityTestResult = {
        ...result,
        id: this.generateResultId(),
        testId,
        taskId,
        startTime: new Date().toISOString()
      };

      await this.sendTaskResultToServer(taskResult);

      logger.info('Usability task completed', {
        testId,
        taskId,
        resultId: taskResult.id,
        success: taskResult.success,
        duration: taskResult.duration
      });
    } catch (error) {
      logger.error('Error completing usability task:', error as Error);
      throw error;
    }
  }

  /**
   * Create A/B test
   */
  async createABTest(test: Omit<ABTest, 'id'>): Promise<string> {
    try {
      const testData: ABTest = {
        ...test,
        id: this.generateABTestId()
      };

      await this.sendABTestToServer(testData);

      logger.info('A/B test created', {
        testId: testData.id,
        name: testData.name,
        status: testData.status
      });

      return testData.id;
    } catch (error) {
      logger.error('Error creating A/B test:', error as Error);
      throw error;
    }
  }

  /**
   * Get A/B test variant
   */
  async getABTestVariant(testId: string): Promise<'A' | 'B' | null> {
    try {
      // Check if user is already assigned to a variant
      const storedVariant = localStorage.getItem(`ab_test_${testId}`);
      if (storedVariant) {
        return storedVariant as 'A' | 'B';
      }

      // Get test configuration from server
      const test = await this.getABTestFromServer(testId);
      if (!test || test.status !== 'active') {
        return null;
      }

      // Assign variant based on traffic split
      const random = Math.random() * 100;
      const variant = random < test.trafficSplit ? 'B' : 'A';

      // Store variant assignment
      localStorage.setItem(`ab_test_${testId}`, variant);

      // Track A/B test assignment
      this.trackEvent(UXEventType.PERFORMANCE, {
        abTestId: testId,
        variant,
        testName: test.name
      });

      logger.info('A/B test variant assigned', {
        testId,
        variant,
        testName: test.name
      });

      return variant;
    } catch (error) {
      logger.error('Error getting A/B test variant:', error as Error);
      return null;
    }
  }

  /**
   * Track A/B test conversion
   */
  async trackABTestConversion(testId: string, conversionType: string, value?: number): Promise<void> {
    try {
      const variant = localStorage.getItem(`ab_test_${testId}`);
      if (!variant) return;

      const conversionData = {
        testId,
        variant,
        conversionType,
        value,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId
      };

      await this.sendConversionToServer(conversionData);

      this.trackEvent(UXEventType.PERFORMANCE, {
        abTestId: testId,
        variant,
        conversionType,
        value
      });

      logger.info('A/B test conversion tracked', {
        testId,
        variant,
        conversionType,
        value
      });
    } catch (error) {
      logger.error('Error tracking A/B test conversion:', error as Error);
    }
  }

  /**
   * Get UX analytics
   */
  async getUXAnalytics(timeRange: string = '7d'): Promise<any> {
    try {
      const analytics = await this.getAnalyticsFromServer(timeRange);
      
      logger.info('UX analytics retrieved', {
        timeRange,
        eventCount: analytics.totalEvents,
        uniqueUsers: analytics.uniqueUsers
      });

      return analytics;
    } catch (error) {
      logger.error('Error getting UX analytics:', error as Error);
      throw error;
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate feedback ID
   */
  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate test ID
   */
  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate result ID
   */
  private generateResultId(): string {
    return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate A/B test ID
   */
  private generateABTestId(): string {
    return `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get element path
   */
  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        selector += `.${current.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      current = current.parentElement as HTMLElement;
    }

    return path.join(' > ');
  }

  /**
   * Detect screen reader usage
   */
  private detectScreenReader(): boolean {
    // Check for screen reader specific properties
    return !!(window as any).speechSynthesis || 
           !!(window as any).webkitSpeechSynthesis ||
           document.querySelector('[aria-live]') !== null;
  }

  /**
   * Detect keyboard navigation
   */
  private detectKeyboardNavigation(): boolean {
    // This would be enhanced with actual keyboard navigation detection
    return false;
  }

  /**
   * Detect high contrast mode
   */
  private detectHighContrast(): boolean {
    // Check for high contrast media query
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Get current font size
   */
  private getCurrentFontSize(): string {
    const computedStyle = window.getComputedStyle(document.body);
    return computedStyle.fontSize;
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): { name: string; version: string; os: string; screenResolution: string } {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    return {
      name: browserName,
      version: browserVersion,
      os,
      screenResolution: `${screen.width}x${screen.height}`
    };
  }

  /**
   * Start usability tracking
   */
  private startUsabilityTracking(testId: string, participantId: string): void {
    // Enhanced tracking for usability tests
    this.trackEvent(UXEventType.PERFORMANCE, {
      usabilityTestId: testId,
      participantId,
      trackingMode: 'usability'
    });
  }

  // Server communication methods (stubs for implementation)
  private async sendEventToServer(event: UXEvent): Promise<void> {
    // Implementation would send event to analytics server
    console.log('Sending UX event to server:', event.id);
  }

  private async sendFeedbackToServer(feedback: UserFeedback): Promise<void> {
    // Implementation would send feedback to server
    console.log('Sending feedback to server:', feedback.id);
  }

  private async sendTestToServer(test: UsabilityTest): Promise<void> {
    // Implementation would send test to server
    console.log('Sending usability test to server:', test.id);
  }

  private async sendSessionToServer(session: any): Promise<void> {
    // Implementation would send session to server
    console.log('Sending session to server:', session.sessionId);
  }

  private async sendTaskResultToServer(result: UsabilityTestResult): Promise<void> {
    // Implementation would send task result to server
    console.log('Sending task result to server:', result.id);
  }

  private async sendABTestToServer(test: ABTest): Promise<void> {
    // Implementation would send A/B test to server
    console.log('Sending A/B test to server:', test.id);
  }

  private async getABTestFromServer(testId: string): Promise<ABTest | null> {
    // Implementation would get A/B test from server
    return null;
  }

  private async sendConversionToServer(conversion: any): Promise<void> {
    // Implementation would send conversion to server
    console.log('Sending conversion to server:', conversion);
  }

  private async getAnalyticsFromServer(timeRange: string): Promise<any> {
    // Implementation would get analytics from server
    return {
      totalEvents: this.events.length,
      uniqueUsers: 1,
      timeRange
    };
  }
}

export default new UserExperienceService();
export { UserExperienceService, UXEventType };