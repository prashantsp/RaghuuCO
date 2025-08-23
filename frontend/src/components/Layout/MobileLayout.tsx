/**
 * Mobile Layout Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Mobile-responsive layout component for better mobile experience
 */

import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Mobile Layout Props Interface
 */
interface MobileLayoutProps {
  children: React.ReactNode;
}

/**
 * Navigation Item Interface
 */
interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

/**
 * Mobile Layout Component
 * 
 * @param props - MobileLayoutProps
 * @returns JSX.Element
 */
const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  /**
   * Navigation items based on user role
   */
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client']
    },
    {
      label: 'Users',
      path: '/users',
      icon: <PeopleIcon />,
      roles: ['super_admin', 'partner']
    },
    {
      label: 'Clients',
      path: '/clients',
      icon: <BusinessIcon />,
      roles: ['super_admin', 'partner', 'senior_associate']
    },
    {
      label: 'Cases',
      path: '/cases',
      icon: <AssignmentIcon />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client']
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: <DocumentIcon />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal', 'client']
    },
    {
      label: 'Time Tracking',
      path: '/time-tracking',
      icon: <AssessmentIcon />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate']
    },
    {
      label: 'Calendar',
      path: '/calendar',
      icon: <CalendarTodayIcon />,
      roles: ['super_admin', 'partner', 'senior_associate', 'junior_associate', 'paralegal']
    },
    {
      label: 'Billing',
      path: '/billing',
      icon: <PaymentIcon />,
      roles: ['super_admin', 'partner', 'senior_associate']
    }
  ];

  /**
   * Filter navigation items based on user role
   */
  const filteredNavigationItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  /**
   * Speed dial actions
   */
  const speedDialActions = [
    { icon: <AddIcon />, name: 'Add Case', action: () => navigate('/cases') },
    { icon: <AddIcon />, name: 'Add Client', action: () => navigate('/clients') },
    { icon: <AddIcon />, name: 'Upload Document', action: () => navigate('/documents') }
  ];

  /**
   * Handle navigation
   */
  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    setUserMenuAnchor(null);
  };

  /**
   * Toggle drawer
   */
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  /**
   * Handle user menu
   */
  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  /**
   * Handle notifications menu
   */
  const handleNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RAGHUU CO
          </Typography>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotificationsMenu}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleUserMenu}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            top: 0,
            height: '100%'
          }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          {/* User Info */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 48, height: 48 }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Navigation List */}
          <List>
            {filteredNavigationItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: location.pathname === item.path ? 'primary.main' : 'inherit',
                        fontWeight: location.pathname === item.path ? 'medium' : 'normal'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider />

          {/* Settings */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/profile')}>
                <ListItemIcon>
                  <AccountIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/settings')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 7, sm: 8 },
          mb: { xs: 7, sm: 0 }
        }}
      >
        {children}
      </Box>

      {/* Speed Dial for Quick Actions */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={speedDialOpen}
          onOpen={() => setSpeedDialOpen(true)}
          onClose={() => setSpeedDialOpen(false)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                setSpeedDialOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => { handleNavigation('/profile'); setUserMenuAnchor(null); }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleNavigation('/settings'); setUserMenuAnchor(null); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={() => setNotificationsAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <MenuItem>
          <Typography variant="subtitle2" sx={{ p: 1 }}>
            Notifications
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Box>
            <Typography variant="body2">New case assigned</Typography>
            <Typography variant="caption" color="text.secondary">
              2 minutes ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Document uploaded</Typography>
            <Typography variant="caption" color="text.secondary">
              1 hour ago
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2">Client message received</Typography>
            <Typography variant="caption" color="text.secondary">
              3 hours ago
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MobileLayout;