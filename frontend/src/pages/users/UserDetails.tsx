/**
 * User Details Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description User details component to display comprehensive user information
 * including profile, activity, and statistics
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  Activity as ActivityIcon,
  History as HistoryIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { User } from '@/types';
import { usersApi } from '@/services/api';

/**
 * User Details Props Interface
 */
interface UserDetailsProps {
  user: User;
  onClose: () => void;
  onEdit?: () => void;
}

/**
 * Tab Panel Component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * User Details Component
 * 
 * @param props - UserDetailsProps
 * @returns JSX.Element
 */
const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose, onEdit }) => {
  const [tabValue, setTabValue] = useState(0);
  const [activityData, setActivityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Load user activity data
   */
  const loadUserActivity = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUserActivity(user.id);
      setActivityData(response.data);
    } catch (error) {
      setError('Failed to load user activity');
      console.error('Error loading user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get role display name
   */
  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  /**
   * Get role color
   */
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      super_admin: 'error',
      partner: 'primary',
      senior_associate: 'secondary',
      junior_associate: 'info',
      paralegal: 'warning',
      client: 'success',
      guest: 'default'
    };
    return colors[role] || 'default';
  };

  // Load activity data on component mount
  useEffect(() => {
    loadUserActivity();
  }, [user.id]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user details tabs">
          <Tab label="Profile" />
          <Tab label="Activity" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${user.firstName} ${user.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={user.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={user.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={
                        <Chip
                          label={getRoleDisplayName(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member Since"
                      secondary={formatDate(user.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Login"
                      secondary={user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Verified"
                      secondary={
                        <Chip
                          label={user.emailVerified ? 'Verified' : 'Not Verified'}
                          color={user.emailVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Card>

      {/* Activity Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : activityData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List>
                    {activityData.auditLogs?.slice(0, 10).map((log: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ActivityIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          secondary={formatDate(log.created_at)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Login History
                  </Typography>
                  <List>
                    {activityData.loginHistory?.slice(0, 10).map((login: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={login.ip_address}
                          secondary={formatDate(login.created_at)}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            No activity data available
          </Typography>
        )}
      </Card>

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : activityData ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Activity Summary
                  </Typography>
                  <List>
                    {activityData.activitySummary?.map((summary: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={summary.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          secondary={`${summary.count} times`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Activity Period
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data shown for the last {activityData.period}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            No statistics available
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default UserDetails;