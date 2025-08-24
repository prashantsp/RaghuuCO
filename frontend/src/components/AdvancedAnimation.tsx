/**
 * Advanced Animation Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This component provides advanced animation capabilities
 * including smooth transitions, micro-interactions, and performance
 * optimized animations for enhanced user experience.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  Grow,
  Collapse,
  Fab,
  Tooltip,
  useTheme,
  keyframes,
  styled
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Refresh,
  Speed,
  Timeline,
  Animation,
  TrendingUp,
  TrendingDown,
  Star,
  Favorite,
  Share,
  Download,
  Print,
  Email,
  Phone,
  LocationOn,
  Schedule,
  Assignment,
  Description,
  People,
  Business,
  Assessment,
  Dashboard,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useAccessibility } from '@/hooks/useAccessibility';
import { logger } from '@/utils/logger';

/**
 * Animation type interface
 */
interface AnimationType {
  name: string;
  component: React.ComponentType<any>;
  duration: number;
  easing: string;
  description: string;
}

/**
 * Animation state interface
 */
interface AnimationState {
  isPlaying: boolean;
  currentAnimation: string;
  speed: number;
  isLooping: boolean;
  showProgress: boolean;
  progress: number;
  animationCount: number;
  lastAnimationTime: number;
}

/**
 * Custom keyframes for advanced animations
 */
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -30px, 0); }
  70% { transform: translate3d(0, -15px, 0); }
  90% { transform: translate3d(0, -4px, 0); }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
`;

const rotateAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideInDown = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleIn = keyframes`
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const flipIn = keyframes`
  from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
  to { transform: perspective(400px) rotateY(0deg); opacity: 1; }
`;

/**
 * Styled components with animations
 */
const AnimatedCard = styled(Card)<{ animation: string; duration: number; isPlaying: boolean }>`
  animation: ${({ animation, duration, isPlaying }) => 
    isPlaying ? `${animation} ${duration}ms ease-in-out` : 'none'};
  animation-fill-mode: both;
  animation-iteration-count: ${({ isPlaying }) => isPlaying ? 'infinite' : 1};
`;

const AnimatedBox = styled(Box)<{ animation: string; duration: number; isPlaying: boolean }>`
  animation: ${({ animation, duration, isPlaying }) => 
    isPlaying ? `${animation} ${duration}ms ease-in-out` : 'none'};
  animation-fill-mode: both;
  animation-iteration-count: ${({ isPlaying }) => isPlaying ? 'infinite' : 1};
`;

const AnimatedIcon = styled(Box)<{ animation: string; duration: number; isPlaying: boolean }>`
  display: inline-block;
  animation: ${({ animation, duration, isPlaying }) => 
    isPlaying ? `${animation} ${duration}ms ease-in-out` : 'none'};
  animation-fill-mode: both;
  animation-iteration-count: ${({ isPlaying }) => isPlaying ? 'infinite' : 1};
`;

/**
 * Animation types configuration
 */
const animationTypes: Record<string, AnimationType> = {
  pulse: {
    name: 'Pulse',
    component: AnimatedBox,
    duration: 1000,
    easing: 'ease-in-out',
    description: 'Gentle pulsing effect'
  },
  bounce: {
    name: 'Bounce',
    component: AnimatedBox,
    duration: 1000,
    easing: 'ease-in-out',
    description: 'Bouncing animation'
  },
  shake: {
    name: 'Shake',
    component: AnimatedBox,
    duration: 500,
    easing: 'ease-in-out',
    description: 'Shaking effect'
  },
  rotate: {
    name: 'Rotate',
    component: AnimatedIcon,
    duration: 2000,
    easing: 'linear',
    description: 'Continuous rotation'
  },
  slideInLeft: {
    name: 'Slide In Left',
    component: AnimatedBox,
    duration: 800,
    easing: 'ease-out',
    description: 'Slide in from left'
  },
  slideInRight: {
    name: 'Slide In Right',
    component: AnimatedBox,
    duration: 800,
    easing: 'ease-out',
    description: 'Slide in from right'
  },
  slideInUp: {
    name: 'Slide In Up',
    component: AnimatedBox,
    duration: 800,
    easing: 'ease-out',
    description: 'Slide in from bottom'
  },
  slideInDown: {
    name: 'Slide In Down',
    component: AnimatedBox,
    duration: 800,
    easing: 'ease-out',
    description: 'Slide in from top'
  },
  fadeIn: {
    name: 'Fade In',
    component: AnimatedBox,
    duration: 600,
    easing: 'ease-in',
    description: 'Fade in effect'
  },
  scaleIn: {
    name: 'Scale In',
    component: AnimatedBox,
    duration: 600,
    easing: 'ease-out',
    description: 'Scale in effect'
  },
  flipIn: {
    name: 'Flip In',
    component: AnimatedBox,
    duration: 800,
    easing: 'ease-out',
    description: '3D flip effect'
  }
};

/**
 * Advanced Animation Component
 */
export const AdvancedAnimation: React.FC = () => {
  const theme = useTheme();
  const { announceToScreenReader } = useAccessibility();
  const animationRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    currentAnimation: 'pulse',
    speed: 1,
    isLooping: false,
    showProgress: false,
    progress: 0,
    animationCount: 0,
    lastAnimationTime: 0
  });

  // Handle animation start
  const startAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: true, progress: 0 }));
    announceToScreenReader(`Started ${animationTypes[animationState.currentAnimation].name} animation`);
    logger.info('Animation started', { animation: animationState.currentAnimation });
  }, [animationState.currentAnimation, announceToScreenReader]);

  // Handle animation pause
  const pauseAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isPlaying: false }));
    announceToScreenReader('Animation paused');
    logger.info('Animation paused');
  }, [announceToScreenReader]);

  // Handle animation stop
  const stopAnimation = useCallback(() => {
    setAnimationState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      progress: 0,
      animationCount: 0 
    }));
    announceToScreenReader('Animation stopped');
    logger.info('Animation stopped');
  }, [announceToScreenReader]);

  // Handle animation reset
  const resetAnimation = useCallback(() => {
    setAnimationState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      progress: 0,
      animationCount: 0 
    }));
    announceToScreenReader('Animation reset');
    logger.info('Animation reset');
  }, [announceToScreenReader]);

  // Handle animation change
  const changeAnimation = useCallback((animationName: string) => {
    setAnimationState(prev => ({ 
      ...prev, 
      currentAnimation: animationName,
      isPlaying: false,
      progress: 0
    }));
    announceToScreenReader(`Changed to ${animationTypes[animationName].name} animation`);
    logger.info('Animation changed', { animation: animationName });
  }, [announceToScreenReader]);

  // Handle speed change
  const changeSpeed = useCallback((newSpeed: number) => {
    setAnimationState(prev => ({ ...prev, speed: newSpeed }));
    announceToScreenReader(`Animation speed set to ${newSpeed}x`);
    logger.info('Animation speed changed', { speed: newSpeed });
  }, [announceToScreenReader]);

  // Handle loop toggle
  const toggleLoop = useCallback(() => {
    setAnimationState(prev => ({ ...prev, isLooping: !prev.isLooping }));
    announceToScreenReader(animationState.isLooping ? 'Loop disabled' : 'Loop enabled');
    logger.info('Loop toggled', { isLooping: !animationState.isLooping });
  }, [animationState.isLooping, announceToScreenReader]);

  // Handle progress toggle
  const toggleProgress = useCallback(() => {
    setAnimationState(prev => ({ ...prev, showProgress: !prev.showProgress }));
    announceToScreenReader(animationState.showProgress ? 'Progress hidden' : 'Progress shown');
    logger.info('Progress toggled', { showProgress: !animationState.showProgress });
  }, [animationState.showProgress, announceToScreenReader]);

  // Progress tracking
  useEffect(() => {
    if (animationState.isPlaying && animationState.showProgress) {
      progressIntervalRef.current = setInterval(() => {
        setAnimationState(prev => {
          const newProgress = prev.progress + (100 / (animationTypes[prev.currentAnimation].duration / 100));
          if (newProgress >= 100) {
            if (prev.isLooping) {
              return { ...prev, progress: 0, animationCount: prev.animationCount + 1 };
            } else {
              return { ...prev, isPlaying: false, progress: 100 };
            }
          }
          return { ...prev, progress: newProgress };
        });
      }, 100);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [animationState.isPlaying, animationState.showProgress, animationState.isLooping]);

  // Animation completion tracking
  useEffect(() => {
    if (animationState.animationCount > 0) {
      announceToScreenReader(`Animation completed ${animationState.animationCount} times`);
      logger.info('Animation completed', { count: animationState.animationCount });
    }
  }, [animationState.animationCount, announceToScreenReader]);

  // Get current animation configuration
  const currentAnimation = animationTypes[animationState.currentAnimation];
  const AnimatedComponent = currentAnimation.component;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Animation Library
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Experience smooth, performance-optimized animations with micro-interactions
        and advanced transition effects for enhanced user experience.
      </Typography>

      {/* Animation Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Animation Controls
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={startAnimation}
              disabled={animationState.isPlaying}
            >
              Start
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Pause />}
              onClick={pauseAnimation}
              disabled={!animationState.isPlaying}
            >
              Pause
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Stop />}
              onClick={stopAnimation}
            >
              Stop
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetAnimation}
            >
              Reset
            </Button>
          </Box>

          {/* Animation Selection */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Animation Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.keys(animationTypes).map((animationName) => (
                <Chip
                  key={animationName}
                  label={animationTypes[animationName].name}
                  color={animationState.currentAnimation === animationName ? 'primary' : 'default'}
                  onClick={() => changeAnimation(animationName)}
                  variant={animationState.currentAnimation === animationName ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          {/* Animation Settings */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Speed ({animationState.speed}x)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => changeSpeed(Math.max(0.1, animationState.speed - 0.1))}
                >
                  -
                </Button>
                <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'center' }}>
                  {animationState.speed.toFixed(1)}
                </Typography>
                <Button
                  size="small"
                  onClick={() => changeSpeed(Math.min(3, animationState.speed + 0.1))}
                >
                  +
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="Loop"
                  color={animationState.isLooping ? 'primary' : 'default'}
                  onClick={toggleLoop}
                  size="small"
                />
                <Chip
                  label="Progress"
                  color={animationState.showProgress ? 'primary' : 'default'}
                  onClick={toggleProgress}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Animation Display */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentAnimation.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {currentAnimation.description}
          </Typography>

          {/* Progress Bar */}
          {animationState.showProgress && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption">Progress</Typography>
                <Typography variant="caption">
                  {Math.round(animationState.progress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={animationState.progress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              {animationState.isLooping && (
                <Typography variant="caption" color="text.secondary">
                  Loops: {animationState.animationCount}
                </Typography>
              )}
            </Box>
          )}

          {/* Animation Container */}
          <Box
            ref={animationRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 200,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 3
            }}
          >
            <AnimatedComponent
              animation={animationState.currentAnimation}
              duration={currentAnimation.duration / animationState.speed}
              isPlaying={animationState.isPlaying}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Typography variant="h4" color="primary">
                {currentAnimation.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <StarIcon color="primary" />
                <FavoriteIcon color="secondary" />
                <ShareIcon color="action" />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Duration: {currentAnimation.duration}ms
              </Typography>
            </AnimatedComponent>
          </Box>
        </CardContent>
      </Card>

      {/* Animation Statistics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Animation Statistics
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {animationState.animationCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Animations
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {currentAnimation.duration}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Duration (ms)
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {animationState.speed.toFixed(1)}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current Speed
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {animationState.isPlaying ? 'Active' : 'Idle'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};