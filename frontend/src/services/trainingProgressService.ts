/**
 * Training Progress Service
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This service provides comprehensive training progress tracking,
 * certification management, and learning analytics for the training system.
 */

import { api } from './api';
import { logger } from '@/utils/logger';

/**
 * Training module interface
 */
export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  version: string;
  lastUpdated: Date;
}

/**
 * User progress interface
 */
export interface UserProgress {
  moduleId: string;
  userId: string;
  completedSteps: string[];
  currentStep: number;
  score: number;
  timeSpent: number;
  attempts: Record<string, number>;
  completedAt?: Date;
  startedAt: Date;
  lastAccessed: Date;
  certification?: Certification;
}

/**
 * Certification interface
 */
export interface Certification {
  id: string;
  moduleId: string;
  userId: string;
  issuedAt: Date;
  expiresAt?: Date;
  score: number;
  status: 'active' | 'expired' | 'revoked';
  certificateUrl?: string;
  validUntil?: Date;
}

/**
 * Training analytics interface
 */
export interface TrainingAnalytics {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  totalTimeSpent: number;
  averageScore: number;
  certifications: number;
  learningStreak: number;
  lastActivity: Date;
  progressByCategory: Record<string, number>;
  progressByDifficulty: Record<string, number>;
  timeSpentByModule: Record<string, number>;
  scoreByModule: Record<string, number>;
}

/**
 * Module completion data interface
 */
export interface ModuleCompletionData {
  score: number;
  timeSpent: number;
  completedSteps: string[];
  finalAttempt: boolean;
  feedback?: string;
}

/**
 * Learning path interface
 */
export interface LearningPath {
  role: string;
  modules: string[];
  prerequisites: Record<string, string[]>;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Training Progress Service Class
 */
class TrainingProgressService {
  /**
   * Get user progress for all modules
   * @param userId - The user ID
   * @returns Promise<Record<string, UserProgress>>
   */
  async getUserProgress(userId: string): Promise<Record<string, UserProgress>> {
    try {
      logger.info('Fetching user training progress', { userId });
      
      const response = await api.get(`/api/v1/training/progress/${userId}`);
      
      if (response.status === 200) {
        logger.info('User training progress fetched successfully', { userId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch user progress: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching user training progress:', error as Error);
      throw error;
    }
  }

  /**
   * Get all available training modules
   * @returns Promise<TrainingModule[]>
   */
  async getTrainingModules(): Promise<TrainingModule[]> {
    try {
      logger.info('Fetching training modules');
      
      const response = await api.get('/api/v1/training/modules');
      
      if (response.status === 200) {
        logger.info('Training modules fetched successfully');
        return response.data;
      } else {
        throw new Error(`Failed to fetch training modules: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching training modules:', error as Error);
      throw error;
    }
  }

  /**
   * Get user training analytics
   * @param userId - The user ID
   * @returns Promise<TrainingAnalytics>
   */
  async getUserAnalytics(userId: string): Promise<TrainingAnalytics> {
    try {
      logger.info('Fetching user training analytics', { userId });
      
      const response = await api.get(`/api/v1/training/analytics/${userId}`);
      
      if (response.status === 200) {
        logger.info('User training analytics fetched successfully', { userId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch user analytics: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching user training analytics:', error as Error);
      throw error;
    }
  }

  /**
   * Update user progress for a module
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @param progress - The progress data
   * @returns Promise<UserProgress>
   */
  async updateProgress(userId: string, moduleId: string, progress: Partial<UserProgress>): Promise<UserProgress> {
    try {
      logger.info('Updating user training progress', { userId, moduleId });
      
      const response = await api.put(`/api/v1/training/progress/${userId}/${moduleId}`, progress);
      
      if (response.status === 200) {
        logger.info('User training progress updated successfully', { userId, moduleId });
        return response.data;
      } else {
        throw new Error(`Failed to update user progress: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error updating user training progress:', error as Error);
      throw error;
    }
  }

  /**
   * Mark a module as completed
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @param completionData - The completion data
   * @returns Promise<UserProgress>
   */
  async completeModule(userId: string, moduleId: string, completionData: ModuleCompletionData): Promise<UserProgress> {
    try {
      logger.info('Completing training module', { userId, moduleId, score: completionData.score });
      
      const response = await api.post(`/api/v1/training/complete/${userId}/${moduleId}`, completionData);
      
      if (response.status === 200) {
        logger.info('Training module completed successfully', { userId, moduleId });
        return response.data;
      } else {
        throw new Error(`Failed to complete module: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error completing training module:', error as Error);
      throw error;
    }
  }

  /**
   * Get user certification for a module
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @returns Promise<Certification | null>
   */
  async getCertification(userId: string, moduleId: string): Promise<Certification | null> {
    try {
      logger.info('Fetching user certification', { userId, moduleId });
      
      const response = await api.get(`/api/v1/training/certification/${userId}/${moduleId}`);
      
      if (response.status === 200) {
        logger.info('User certification fetched successfully', { userId, moduleId });
        return response.data;
      } else if (response.status === 404) {
        logger.info('No certification found for user', { userId, moduleId });
        return null;
      } else {
        throw new Error(`Failed to fetch certification: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching user certification:', error as Error);
      throw error;
    }
  }

  /**
   * Generate certificate for a completed module
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @returns Promise<string> - Certificate URL
   */
  async generateCertificate(userId: string, moduleId: string): Promise<string> {
    try {
      logger.info('Generating training certificate', { userId, moduleId });
      
      const response = await api.post(`/api/v1/training/certificate/${userId}/${moduleId}`);
      
      if (response.status === 200) {
        logger.info('Training certificate generated successfully', { userId, moduleId });
        return response.data.certificateUrl;
      } else {
        throw new Error(`Failed to generate certificate: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error generating training certificate:', error as Error);
      throw error;
    }
  }

  /**
   * Get recommended modules for a user
   * @param userId - The user ID
   * @returns Promise<TrainingModule[]>
   */
  async getRecommendedModules(userId: string): Promise<TrainingModule[]> {
    try {
      logger.info('Fetching recommended training modules', { userId });
      
      const response = await api.get(`/api/v1/training/recommendations/${userId}`);
      
      if (response.status === 200) {
        logger.info('Recommended training modules fetched successfully', { userId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching recommended training modules:', error as Error);
      throw error;
    }
  }

  /**
   * Get learning path for a specific role
   * @param role - The user role
   * @returns Promise<LearningPath>
   */
  async getLearningPath(role: string): Promise<LearningPath> {
    try {
      logger.info('Fetching learning path', { role });
      
      const response = await api.get(`/api/v1/training/learning-path/${role}`);
      
      if (response.status === 200) {
        logger.info('Learning path fetched successfully', { role });
        return response.data;
      } else {
        throw new Error(`Failed to fetch learning path: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching learning path:', error as Error);
      throw error;
    }
  }

  /**
   * Get training statistics
   * @returns Promise<Record<string, any>>
   */
  async getTrainingStatistics(): Promise<Record<string, any>> {
    try {
      logger.info('Fetching training statistics');
      
      const response = await api.get('/api/v1/training/statistics');
      
      if (response.status === 200) {
        logger.info('Training statistics fetched successfully');
        return response.data;
      } else {
        throw new Error(`Failed to fetch training statistics: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching training statistics:', error as Error);
      throw error;
    }
  }

  /**
   * Reset user progress for a module
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @returns Promise<void>
   */
  async resetProgress(userId: string, moduleId: string): Promise<void> {
    try {
      logger.info('Resetting user training progress', { userId, moduleId });
      
      const response = await api.delete(`/api/v1/training/progress/${userId}/${moduleId}`);
      
      if (response.status === 200) {
        logger.info('User training progress reset successfully', { userId, moduleId });
      } else {
        throw new Error(`Failed to reset progress: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error resetting user training progress:', error as Error);
      throw error;
    }
  }

  /**
   * Export user training progress
   * @param userId - The user ID
   * @returns Promise<string> - Export URL
   */
  async exportProgress(userId: string): Promise<string> {
    try {
      logger.info('Exporting user training progress', { userId });
      
      const response = await api.get(`/api/v1/training/export/${userId}`);
      
      if (response.status === 200) {
        logger.info('User training progress exported successfully', { userId });
        return response.data.exportUrl;
      } else {
        throw new Error(`Failed to export progress: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error exporting user training progress:', error as Error);
      throw error;
    }
  }

  /**
   * Get training history for a user
   * @param userId - The user ID
   * @returns Promise<UserProgress[]>
   */
  async getTrainingHistory(userId: string): Promise<UserProgress[]> {
    try {
      logger.info('Fetching user training history', { userId });
      
      const response = await api.get(`/api/v1/training/history/${userId}`);
      
      if (response.status === 200) {
        logger.info('User training history fetched successfully', { userId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch training history: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching user training history:', error as Error);
      throw error;
    }
  }

  /**
   * Search training modules
   * @param query - Search query
   * @param filters - Search filters
   * @returns Promise<TrainingModule[]>
   */
  async searchModules(query: string, filters?: Record<string, any>): Promise<TrainingModule[]> {
    try {
      logger.info('Searching training modules', { query, filters });
      
      const params = new URLSearchParams({ q: query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value.toString());
        });
      }
      
      const response = await api.get(`/api/v1/training/search?${params.toString()}`);
      
      if (response.status === 200) {
        logger.info('Training modules search completed successfully', { query });
        return response.data;
      } else {
        throw new Error(`Failed to search modules: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error searching training modules:', error as Error);
      throw error;
    }
  }

  /**
   * Get module details
   * @param moduleId - The module ID
   * @returns Promise<TrainingModule>
   */
  async getModuleDetails(moduleId: string): Promise<TrainingModule> {
    try {
      logger.info('Fetching module details', { moduleId });
      
      const response = await api.get(`/api/v1/training/modules/${moduleId}`);
      
      if (response.status === 200) {
        logger.info('Module details fetched successfully', { moduleId });
        return response.data;
      } else {
        throw new Error(`Failed to fetch module details: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error fetching module details:', error as Error);
      throw error;
    }
  }

  /**
   * Submit module feedback
   * @param userId - The user ID
   * @param moduleId - The module ID
   * @param feedback - The feedback data
   * @returns Promise<void>
   */
  async submitFeedback(userId: string, moduleId: string, feedback: { rating: number; comment?: string }): Promise<void> {
    try {
      logger.info('Submitting module feedback', { userId, moduleId, rating: feedback.rating });
      
      const response = await api.post(`/api/v1/training/feedback/${userId}/${moduleId}`, feedback);
      
      if (response.status === 200) {
        logger.info('Module feedback submitted successfully', { userId, moduleId });
      } else {
        throw new Error(`Failed to submit feedback: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Error submitting module feedback:', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const trainingProgressService = new TrainingProgressService();