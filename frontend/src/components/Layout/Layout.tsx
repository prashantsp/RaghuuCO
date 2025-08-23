/**
 * Main Layout Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Main layout component with responsive sidebar, header, and content area
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  Logout,
  Dashboard,
  Business,
  Folder,
  Description,
  People,
  Assessment,
  CalendarToday,
  Payment,
  Help,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { RootState } from '@/store';
import { toggleSidebar, selectSidebarOpen } from '@/store/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from './Sidebar';
import { LayoutProps } from '@/types';

/**
 * Main Layout Component
 * 
 * @param props - Layout props
 * @returns JSX.Element
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, getFullName, getInitials } = useAuth();
  const sidebarOpen = useSelector(selectSidebarOpen);
  const unreadNotifications = useSelector((state: RootState) => state.notifications.unreadCount);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    dispatch(toggleSidebar());
  };

  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle notification menu
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      dispatch(toggleSidebar());
    }
  }, [location.pathname, isMobile]);

  // Navigation items
  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client'],
    },
    {
      title: 'Cases',
      path: '/cases',
      icon: <Business />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client'],
    },
    {
      title: 'Clients',
      path: '/clients',
      icon: <People />,
      roles: ['super_admin', 'partner', 'senior_associate'],
    },
    {
      title: 'Documents',
      path: '/documents',
      icon: <Description />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client'],
    },
    {
      title: 'Time Tracking',
      path: '/time-tracking',
      icon: <Assessment />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate'],
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: <CalendarToday />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal'],
    },
    {
      title: 'Billing',
      path: '/billing',
      icon: <Payment />,
      roles: ['super_admin', 'partner', 'senior_associate'],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          ml: { md: `${sidebarOpen ? 240 : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleSidebarToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            RAGHUU CO Legal Practice Management
          </Typography>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={handleNotificationMenuOpen}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Menu */}
          <Tooltip title="User Menu">
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {getInitials()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => dispatch(toggleSidebar())}
        navigationItems={filteredNavigationItems}
        onNavigation={handleNavigation}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          ml: { md: `${sidebarOpen ? 240 : 0}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ p: 3, height: 'calc(100vh - 64px)', overflow: 'auto' }}>
          {children}
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
            {getInitials()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">{getFullName()}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => navigate('/profile')}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/help')}>
          <Help sx={{ mr: 2 }} />
          Help & Support
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            minWidth: 300,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Typography variant="h6" sx={{ p: 2 }}>
            Notifications
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {unreadNotifications > 0
              ? `You have ${unreadNotifications} unread notification${unreadNotifications > 1 ? 's' : ''}`
              : 'No new notifications'}
          </Typography>
        </MenuItem>
        {unreadNotifications > 0 && (
          <MenuItem onClick={() => navigate('/notifications')}>
            <Typography variant="body2">View all notifications</Typography>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Layout;