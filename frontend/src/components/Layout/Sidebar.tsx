/**
 * Sidebar Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Sidebar navigation component with collapsible menu and role-based access
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  useTheme,
  Toolbar,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  onNavigation: (path: string) => void;
  isMobile: boolean;
}

/**
 * Sidebar Component
 * 
 * @param props - Sidebar props
 * @returns JSX.Element
 */
const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  navigationItems,
  onNavigation,
  isMobile,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const { user, getFullName, getInitials } = useAuth();

  const drawerWidth = 240;

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              mr: 2,
              fontWeight: 'bold',
            }}
          >
            RC
          </Avatar>
          <Box>
            <Typography variant="h6" noWrap>
              RAGHUU CO
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Legal Practice Management
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* User Info */}
      {user && (
        <>
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'secondary.main',
                  mr: 2,
                  fontWeight: 'bold',
                }}
              >
                {getInitials()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" noWrap>
                  {getFullName()}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.role.replace('_', ' ').toUpperCase()}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Divider />
        </>
      )}

      {/* Navigation Menu */}
      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => onNavigation(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.contrastText' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Version 1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2025 RAGHUU CO
        </Typography>
      </Box>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: theme.shadows[1],
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;