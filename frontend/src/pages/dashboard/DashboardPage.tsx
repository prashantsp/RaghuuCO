/**
 * Dashboard Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Main dashboard page with statistics, recent activities, and quick actions
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Description as DocumentIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { dashboardApi } from '@/services/api';
import { toast } from 'react-hot-toast';

/**
 * Dashboard Page Component
 * 
 * @returns JSX.Element
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  /**
   * Load dashboard data
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load statistics
      const statsResponse = await dashboardApi.getStats();
      setStats(statsResponse.data);

      // Load recent activities
      const activitiesResponse = await dashboardApi.getRecentActivities();
      setRecentActivities(activitiesResponse.data.activities || []);
    } catch (error: any) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Get stat card color based on trend
   */
  const getStatColor = (trend: number) => {
    return trend > 0 ? 'success' : trend < 0 ? 'error' : 'default';
  };

  /**
   * Get stat icon based on type
   */
  const getStatIcon = (type: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      cases: <BusinessIcon />,
      clients: <PeopleIcon />,
      documents: <DocumentIcon />,
      time: <AssessmentIcon />,
      calendar: <CalendarIcon />,
      billing: <PaymentIcon />
    };
    return icons[type] || <TrendingUpIcon />;
  };

  /**
   * Format activity date
   */
  const formatActivityDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your legal practice today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(stats).map(([key, value]: [string, any]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {value.count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {key.replace('_', ' ')}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getStatIcon(key)}
                    </Avatar>
                  </Box>
                  {value.trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {value.trend > 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
                      <Typography
                        variant="body2"
                        color={getStatColor(value.trend)}
                        sx={{ ml: 0.5 }}
                      >
                        {Math.abs(value.trend)}% from last month
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentIcon />}
                    onClick={() => navigate('/cases/create')}
                    sx={{ height: 56 }}
                  >
                    New Case
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/clients/create')}
                    sx={{ height: 56 }}
                  >
                    New Client
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DocumentIcon />}
                    onClick={() => navigate('/documents/upload')}
                    sx={{ height: 56 }}
                  >
                    Upload Document
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => navigate('/calendar')}
                    sx={{ height: 56 }}
                  >
                    Schedule Event
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {recentActivities.length > 0 ? (
                <List>
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                          {activity.icon || <AssignmentIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={formatActivityDate(activity.createdAt)}
                      />
                      <Chip
                        label={activity.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No recent activities
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Events */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upcoming Events
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Calendar integration will be available in Milestone 3
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;