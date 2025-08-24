/**
 * Training Progress Hook
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This hook provides comprehensive training progress tracking,
 * certification management, and learning analytics for the training system.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { trainingProgressService } from '@/services/trainingProgressService';
import { logger } from '@/utils/logger';

/**
 * Training module interface
 */
interface TrainingModule {
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
interface UserProgress {
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
interface Certification {
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
interface TrainingAnalytics {
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
 * Training Progress Hook
 */
export const useTrainingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [analytics, setAnalytics] = useState<TrainingAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user progress on mount
  useEffect(() => {
    if (user?.id) {
      loadUserProgress();
      loadTrainingModules();
      loadAnalytics();
    }
  }, [user?.id]);

  /**
   * Load user progress from server
   */
  const loadUserProgress = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const userProgress = await trainingProgressService.getUserProgress(user.id);
      setProgress(userProgress);
      
      logger.info('User training progress loaded', { userId: user.id, modulesCount: Object.keys(userProgress).length });
    } catch (err) {
      setError('Failed to load training progress');
      logger.error('Error loading user progress:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Load training modules
   */
  const loadTrainingModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trainingModules = await trainingProgressService.getTrainingModules();
      setModules(trainingModules);
      
      logger.info('Training modules loaded', { modulesCount: trainingModules.length });
    } catch (err) {
      setError('Failed to load training modules');
      logger.error('Error loading training modules:', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load training analytics
   */
  const loadAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const userAnalytics = await trainingProgressService.getUserAnalytics(user.id);
      setAnalytics(userAnalytics);
      
      logger.info('Training analytics loaded', { userId: user.id });
    } catch (err) {
      setError('Failed to load training analytics');
      logger.error('Error loading training analytics:', err as Error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Update progress for a specific module
   */
  const updateProgress = useCallback(async (moduleId: string, moduleProgress: Partial<UserProgress>) => {
    if (!user?.id) return;

    try {
      setError(null);
      
      const updatedProgress = await trainingProgressService.updateProgress(user.id, moduleId, moduleProgress);
      
      setProgress(prev => ({
        ...prev,
        [moduleId]: updatedProgress
      }));

      // Update analytics
      await loadAnalytics();
      
      logger.info('Training progress updated', { userId: user.id, moduleId, progress: moduleProgress });
    } catch (err) {
      setError('Failed to update training progress');
      logger.error('Error updating training progress:', err as Error);
    }
  }, [user?.id, loadAnalytics]);

  /**
   * Get progress for a specific module
   */
  const getProgress = useCallback((moduleId: string): UserProgress | null => {
    return progress[moduleId] || null;
  }, [progress]);

  /**
   * Mark module as completed
   */
  const completeModule = useCallback(async (moduleId: string, finalScore: number, timeSpent: number) => {
    if (!user?.id) return;

    try {
      setError(null);
      
      const completionData = {
        completedAt: new Date(),
        score: finalScore,
        timeSpent,
        currentStep: modules.find(m => m.id === moduleId)?.steps?.length || 0
      };

      const updatedProgress = await trainingProgressService.completeModule(user.id, moduleId, completionData);
      
      setProgress(prev => ({
        ...prev,
        [moduleId]: updatedProgress
      }));

      // Update analytics
      await loadAnalytics();
      
      logger.info('Module completed', { userId: user.id, moduleId, score: finalScore });
    } catch (err) {
      setError('Failed to complete module');
      logger.error('Error completing module:', err as Error);
    }
  }, [user?.id, modules, loadAnalytics]);

  /**
   * Get certification for a module
   */
  const getCertification = useCallback(async (moduleId: string): Promise<Certification | null> => {
    if (!user?.id) return null;

    try {
      const certification = await trainingProgressService.getCertification(user.id, moduleId);
      return certification;
    } catch (err) {
      logger.error('Error getting certification:', err as Error);
      return null;
    }
  }, [user?.id]);

  /**
   * Generate certificate for completed module
   */
  const generateCertificate = useCallback(async (moduleId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const certificateUrl = await trainingProgressService.generateCertificate(user.id, moduleId);
      return certificateUrl;
    } catch (err) {
      logger.error('Error generating certificate:', err as Error);
      return null;
    }
  }, [user?.id]);

  /**
   * Get recommended modules based on user progress
   */
  const getRecommendedModules = useCallback(async (): Promise<TrainingModule[]> => {
    if (!user?.id) return [];

    try {
      const recommendations = await trainingProgressService.getRecommendedModules(user.id);
      return recommendations;
    } catch (err) {
      logger.error('Error getting recommended modules:', err as Error);
      return [];
    }
  }, [user?.id]);

  /**
   * Get learning path for a specific role
   */
  const getLearningPath = useCallback(async (role: string): Promise<TrainingModule[]> => {
    try {
      const learningPath = await trainingProgressService.getLearningPath(role);
      return learningPath;
    } catch (err) {
      logger.error('Error getting learning path:', err as Error);
      return [];
    }
  }, []);

  /**
   * Check if user has completed prerequisites for a module
   */
  const checkPrerequisites = useCallback((moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || !module.prerequisites.length) return true;

    return module.prerequisites.every(prereqId => {
      const prereqProgress = progress[prereqId];
      return prereqProgress?.completedAt;
    });
  }, [modules, progress]);

  /**
   * Get completion percentage for a module
   */
  const getCompletionPercentage = useCallback((moduleId: string): number => {
    const moduleProgress = progress[moduleId];
    if (!moduleProgress) return 0;

    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;

    const totalSteps = module.steps?.length || 1;
    return (moduleProgress.completedSteps.length / totalSteps) * 100;
  }, [progress, modules]);

  /**
   * Get overall completion statistics
   */
  const getCompletionStats = useCallback(() => {
    const totalModules = modules.length;
    const completedModules = Object.values(progress).filter(p => p.completedAt).length;
    const inProgressModules = Object.values(progress).filter(p => !p.completedAt && p.currentStep > 0).length;
    const notStartedModules = totalModules - completedModules - inProgressModules;

    return {
      total: totalModules,
      completed: completedModules,
      inProgress: inProgressModules,
      notStarted: notStartedModules,
      completionRate: totalModules > 0 ? (completedModules / totalModules) * 100 : 0
    };
  }, [modules, progress]);

  /**
   * Get learning streak
   */
  const getLearningStreak = useCallback((): number => {
    if (!analytics) return 0;
    return analytics.learningStreak;
  }, [analytics]);

  /**
   * Get time spent on training
   */
  const getTotalTimeSpent = useCallback((): number => {
    if (!analytics) return 0;
    return analytics.totalTimeSpent;
  }, [analytics]);

  /**
   * Get average score
   */
  const getAverageScore = useCallback((): number => {
    if (!analytics) return 0;
    return analytics.averageScore;
  }, [analytics]);

  /**
   * Get certifications count
   */
  const getCertificationsCount = useCallback((): number => {
    if (!analytics) return 0;
    return analytics.certifications;
  }, [analytics]);

  /**
   * Get progress by category
   */
  const getProgressByCategory = useCallback((): Record<string, number> => {
    if (!analytics) return {};
    return analytics.progressByCategory;
  }, [analytics]);

  /**
   * Get progress by difficulty
   */
  const getProgressByDifficulty = useCallback((): Record<string, number> => {
    if (!analytics) return {};
    return analytics.progressByDifficulty;
  }, [analytics]);

  /**
   * Reset progress for a module
   */
  const resetProgress = useCallback(async (moduleId: string) => {
    if (!user?.id) return;

    try {
      setError(null);
      
      await trainingProgressService.resetProgress(user.id, moduleId);
      
      setProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[moduleId];
        return newProgress;
      });

      // Update analytics
      await loadAnalytics();
      
      logger.info('Module progress reset', { userId: user.id, moduleId });
    } catch (err) {
      setError('Failed to reset module progress');
      logger.error('Error resetting module progress:', err as Error);
    }
  }, [user?.id, loadAnalytics]);

  /**
   * Export training progress
   */
  const exportProgress = useCallback(async (): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const exportUrl = await trainingProgressService.exportProgress(user.id);
      return exportUrl;
    } catch (err) {
      logger.error('Error exporting progress:', err as Error);
      return null;
    }
  }, [user?.id]);

  /**
   * Get training history
   */
  const getTrainingHistory = useCallback(async (): Promise<UserProgress[]> => {
    if (!user?.id) return [];

    try {
      const history = await trainingProgressService.getTrainingHistory(user.id);
      return history;
    } catch (err) {
      logger.error('Error getting training history:', err as Error);
      return [];
    }
  }, [user?.id]);

  return {
    // State
    progress,
    modules,
    analytics,
    loading,
    error,

    // Actions
    updateProgress,
    getProgress,
    completeModule,
    getCertification,
    generateCertificate,
    getRecommendedModules,
    getLearningPath,
    resetProgress,
    exportProgress,
    getTrainingHistory,

    // Computed values
    checkPrerequisites,
    getCompletionPercentage,
    getCompletionStats,
    getLearningStreak,
    getTotalTimeSpent,
    getAverageScore,
    getCertificationsCount,
    getProgressByCategory,
    getProgressByDifficulty,

    // Utilities
    loadUserProgress,
    loadTrainingModules,
    loadAnalytics
  };
};