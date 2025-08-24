/**
 * Mobile Optimization Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This component provides enhanced mobile responsiveness
 * with touch-friendly interactions, optimized mobile navigation,
 * and mobile-specific features for better user experience.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
  Drawer,
  Divider,
  Chip,
  Badge,
  Tooltip,
  Zoom,
  Slide,
  Fade,
  Grow
} from '@mui/material';
import {
  Menu,
  Home,
  Search,
  Notifications,
  AccountCircle,
  Add,
  Close,
  KeyboardArrowUp,
  KeyboardArrowDown,
  TouchApp,
  Gesture,
  Swipe,
  PanTool,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  FullscreenExit,
  VolumeUp,
  VolumeOff,
  Brightness4,
  Brightness7,
  Settings,
  Help,
  Feedback,
  Share,
  Bookmark,
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
  Timeline,
  TrendingUp,
  NotificationsActive,
  NotificationsNone,
  NotificationsOff
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Mobile optimization interface
 */
interface MobileOptimizationProps {
  children: React.ReactNode;
  onNavigationChange?: (route: string) => void;
  onQuickAction?: (action: string) => void;
  showFloatingActions?: boolean;
  showBottomNavigation?: boolean;
  showSpeedDial?: boolean;
  enableGestures?: boolean;
  enableTouchFeedback?: boolean;
}

/**
 * Mobile optimization state interface
 */
interface MobileState {
  isDrawerOpen: boolean;
  isSpeedDialOpen: boolean;
  currentRoute: string;
  isFullscreen: boolean;
  isMuted: boolean;
  isDarkMode: boolean;
  touchFeedback: boolean;
  gestureEnabled: boolean;
  zoomLevel: number;
  lastTouchTime: number;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
}

/**
 * Quick action interface
 */
interface QuickAction {
  name: string;
  icon: React.ReactNode;
  action: string;
  color?: string;
  badge?: number;
}

/**
 * Navigation item interface
 */
interface NavigationItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

/**
 * Mobile Optimization Component
 */
export const MobileOptimization: React.FC<MobileOptimizationProps> = ({
  children,
  onNavigationChange,
  onQuickAction,
  showFloatingActions = true,
  showBottomNavigation = true,
  showSpeedDial = true,
  enableGestures = true,
  enableTouchFeedback = true
}) => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const { user } = useAuth();
  const { announceToScreenReader } = useAccessibility();

  const [mobileState, setMobileState] = useState<MobileState>({
    isDrawerOpen: false,
    isSpeedDialOpen: false,
    currentRoute: 'home',
    isFullscreen: false,
    isMuted: false,
    isDarkMode: false,
    touchFeedback: enableTouchFeedback,
    gestureEnabled: enableGestures,
    zoomLevel: 1,
    lastTouchTime: 0,
    swipeDirection: null,
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0
  });

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { label: 'Home', value: 'home', icon: <Home /> },
    { label: 'Cases', value: 'cases', icon: <Assignment />, badge: 3 },
    { label: 'Documents', value: 'documents', icon: <Description /> },
    { label: 'Clients', value: 'clients', icon: <People /> },
    { label: 'Reports', value: 'reports', icon: <Assessment /> },
    { label: 'Settings', value: 'settings', icon: <Settings /> }
  ];

  // Quick actions
  const quickActions: QuickAction[] = [
    { name: 'New Case', icon: <Add />, action: 'new-case', color: 'primary' },
    { name: 'Search', icon: <Search />, action: 'search', color: 'secondary' },
    { name: 'Notifications', icon: <Notifications />, action: 'notifications', color: 'info', badge: 5 },
    { name: 'Help', icon: <Help />, action: 'help', color: 'success' },
    { name: 'Feedback', icon: <Feedback />, action: 'feedback', color: 'warning' },
    { name: 'Share', icon: <Share />, action: 'share', color: 'error' }
  ];

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    setMobileState(prev => ({
      ...prev,
      touchStartX: touch.clientX,
      touchStartY: touch.clientY,
      lastTouchTime: Date.now()
    }));

    // Provide touch feedback
    if (mobileState.touchFeedback) {
      const element = event.currentTarget as HTMLElement;
      element.style.transform = 'scale(0.95)';
      element.style.transition = 'transform 0.1s ease';
      
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 100);
    }

    logger.info('Touch start detected', { x: touch.clientX, y: touch.clientY });
  }, [mobileState.touchFeedback]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - mobileState.touchStartX;
    const deltaY = touch.clientY - mobileState.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeDiff = Date.now() - mobileState.lastTouchTime;

    // Determine swipe direction
    if (distance > 50 && timeDiff < 300) {
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setMobileState(prev => ({ ...prev, swipeDirection: direction }));

      // Handle swipe gestures
      if (mobileState.gestureEnabled) {
        handleSwipeGesture(direction, distance);
      }
    }

    logger.info('Touch end detected', { deltaX, deltaY, distance, timeDiff });
  }, [mobileState.touchStartX, mobileState.touchStartY, mobileState.lastTouchTime, mobileState.gestureEnabled]);

  // Handle swipe gestures
  const handleSwipeGesture = useCallback((direction: string, distance: number) => {
    switch (direction) {
      case 'left':
        // Navigate to next item
        announceToScreenReader('Swiped left - next item');
        break;
      case 'right':
        // Navigate to previous item
        announceToScreenReader('Swiped right - previous item');
        break;
      case 'up':
        // Scroll up or expand
        announceToScreenReader('Swiped up - scroll up');
        break;
      case 'down':
        // Scroll down or collapse
        announceToScreenReader('Swiped down - scroll down');
        break;
    }

    logger.info('Swipe gesture detected', { direction, distance });
  }, [announceToScreenReader]);

  // Handle navigation change
  const handleNavigationChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setMobileState(prev => ({ ...prev, currentRoute: newValue }));
    onNavigationChange?.(newValue);
    announceToScreenReader(`Navigated to ${newValue}`);
    logger.info('Navigation changed', { route: newValue });
  }, [onNavigationChange, announceToScreenReader]);

  // Handle quick action
  const handleQuickAction = useCallback((action: QuickAction) => {
    onQuickAction?.(action.action);
    announceToScreenReader(`Quick action: ${action.name}`);
    logger.info('Quick action triggered', { action: action.action });
  }, [onQuickAction, announceToScreenReader]);

  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    setMobileState(prev => ({ ...prev, isDrawerOpen: !prev.isDrawerOpen }));
    announceToScreenReader(mobileState.isDrawerOpen ? 'Navigation drawer closed' : 'Navigation drawer opened');
  }, [mobileState.isDrawerOpen, announceToScreenReader]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setMobileState(prev => ({ ...prev, isFullscreen: true }));
      announceToScreenReader('Entered fullscreen mode');
    } else {
      document.exitFullscreen();
      setMobileState(prev => ({ ...prev, isFullscreen: false }));
      announceToScreenReader('Exited fullscreen mode');
    }
  }, [announceToScreenReader]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMobileState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    announceToScreenReader(mobileState.isMuted ? 'Sound enabled' : 'Sound muted');
  }, [mobileState.isMuted, announceToScreenReader]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setMobileState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    announceToScreenReader(mobileState.isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
  }, [mobileState.isDarkMode, announceToScreenReader]);

  // Zoom in
  const zoomIn = useCallback(() => {
    if (mobileState.zoomLevel < 2) {
      setMobileState(prev => ({ ...prev, zoomLevel: prev.zoomLevel + 0.1 }));
      announceToScreenReader('Zoomed in');
    }
  }, [mobileState.zoomLevel, announceToScreenReader]);

  // Zoom out
  const zoomOut = useCallback(() => {
    if (mobileState.zoomLevel > 0.5) {
      setMobileState(prev => ({ ...prev, zoomLevel: prev.zoomLevel - 0.1 }));
      announceToScreenReader('Zoomed out');
    }
  }, [mobileState.zoomLevel, announceToScreenReader]);

  // Apply zoom level
  useEffect(() => {
    document.documentElement.style.zoom = mobileState.zoomLevel.toString();
  }, [mobileState.zoomLevel]);

  // Apply dark mode
  useEffect(() => {
    if (mobileState.isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [mobileState.isDarkMode]);

  // Mobile-specific styles
  const mobileStyles = {
    container: {
      minHeight: '100vh',
      paddingBottom: showBottomNavigation ? '80px' : '20px',
      transform: `scale(${mobileState.zoomLevel})`,
      transformOrigin: 'top left',
      transition: 'transform 0.3s ease'
    },
    floatingActions: {
      position: 'fixed' as const,
      bottom: showBottomNavigation ? 100 : 20,
      right: 20,
      zIndex: 1000
    },
    bottomNavigation: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    },
    drawer: {
      width: isMobile ? '100%' : 320
    }
  };

  if (!isMobile && !isTablet) {
    return <>{children}</>;
  }

  return (
    <Box sx={mobileStyles.container}>
      {/* Mobile App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1100 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Menu />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RAGHUU CO
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={toggleMute}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {mobileState.isMuted ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={toggleDarkMode}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {mobileState.isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={toggleFullscreen}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {mobileState.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: 8, pb: showBottomNavigation ? 8 : 2 }}>
        {children}
      </Box>

      {/* Mobile Navigation Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={mobileState.isDrawerOpen}
        onClose={toggleDrawer}
        onOpen={toggleDrawer}
        sx={mobileStyles.drawer}
      >
        <Box sx={{ width: '100%', height: '100%' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Navigation</Typography>
            <IconButton onClick={toggleDrawer}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider />
          
          <List>
            {navigationItems.map((item) => (
              <ListItem
                key={item.value}
                button
                selected={mobileState.currentRoute === item.value}
                onClick={() => handleNavigationChange({} as React.SyntheticEvent, item.value)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                disabled={item.disabled}
              >
                <ListItemIcon>
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          
          <Divider />
          
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mobile Features
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label="Touch Feedback"
                color={mobileState.touchFeedback ? 'primary' : 'default'}
                size="small"
                onClick={() => setMobileState(prev => ({ ...prev, touchFeedback: !prev.touchFeedback }))}
              />
              <Chip
                label="Gestures"
                color={mobileState.gestureEnabled ? 'primary' : 'default'}
                size="small"
                onClick={() => setMobileState(prev => ({ ...prev, gestureEnabled: !prev.gestureEnabled }))}
              />
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Floating Action Button */}
      {showFloatingActions && (
        <Box sx={mobileStyles.floatingActions}>
          <SpeedDial
            ariaLabel="Quick actions"
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            open={mobileState.isSpeedDialOpen}
            onOpen={() => setMobileState(prev => ({ ...prev, isSpeedDialOpen: true }))}
            onClose={() => setMobileState(prev => ({ ...prev, isSpeedDialOpen: false }))}
          >
            {quickActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={
                  <Badge badgeContent={action.badge} color="error">
                    {action.icon}
                  </Badge>
                }
                tooltipTitle={action.name}
                onClick={() => handleQuickAction(action)}
                sx={{ color: action.color }}
              />
            ))}
          </SpeedDial>
        </Box>
      )}

      {/* Bottom Navigation */}
      {showBottomNavigation && (
        <Paper sx={mobileStyles.bottomNavigation} elevation={3}>
          <BottomNavigation
            value={mobileState.currentRoute}
            onChange={handleNavigationChange}
            showLabels
          >
            {navigationItems.slice(0, 5).map((item) => (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                value={item.value}
                icon={
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                }
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* Zoom Controls */}
      <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 1000 }}>
        <Tooltip title="Zoom In">
          <IconButton
            onClick={zoomIn}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{ mb: 1 }}
          >
            <ZoomIn />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton
            onClick={zoomOut}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <ZoomOut />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};