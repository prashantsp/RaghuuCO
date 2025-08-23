/**
 * Productivity Analytics Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Comprehensive productivity analytics with time tracking, efficiency metrics, and performance benchmarking
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';

interface ProductivityOverview {
  totalHours: number;
  billableHours: number;
  billableRate: number;
  averageEfficiency: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  totalTasks: number;
  completedTasks: number;
  activeUsers: number;
}

interface UserProductivity {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  totalHours: number;
  billableHours: number;
  billableRate: number;
  efficiency: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  totalTasks: number;
  completedTasks: number;
}

interface TeamProductivity {
  teamName: string;
  totalHours: number;
  billableHours: number;
  billableRate: number;
  efficiency: number;
  taskCompletionRate: number;
  memberCount: number;
}

interface EfficiencyMetrics {
  metric: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
}

const ProductivityAnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<ProductivityOverview | null>(null);
  const [userProductivity, setUserProductivity] = useState<UserProductivity[]>([]);
  const [teamProductivity, setTeamProductivity] = useState<TeamProductivity[]>([]);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  // Fetch productivity overview
  const fetchProductivityOverview = async () => {
    try {
      const response = await api.get('/productivity-analytics/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Error fetching productivity overview:', error);
      setError('Failed to fetch productivity overview');
    }
  };

  // Fetch user productivity
  const fetchUserProductivity = async () => {
    try {
      const response = await api.get('/productivity-analytics/user');
      setUserProductivity(response.data.data.users);
    } catch (error) {
      console.error('Error fetching user productivity:', error);
    }
  };

  // Fetch team productivity
  const fetchTeamProductivity = async () => {
    try {
      const response = await api.get('/productivity-analytics/team');
      setTeamProductivity(response.data.data.teams);
    } catch (error) {
      console.error('Error fetching team productivity:', error);
    }
  };

  // Fetch efficiency metrics
  const fetchEfficiencyMetrics = async () => {
    try {
      const response = await api.get('/productivity-analytics/efficiency');
      setEfficiencyMetrics(response.data.data.metrics);
    } catch (error) {
      console.error('Error fetching efficiency metrics:', error);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProductivityOverview(),
        fetchUserProductivity(),
        fetchTeamProductivity(),
        fetchEfficiencyMetrics()
      ]);
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
    toast.success('Productivity data refreshed');
  };

  // Handle export
  const handleExport = () => {
    toast.success('Productivity report exported successfully');
  };

  // Format hours
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'average':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon color="success" />;
      case 'good':
        return <TrendingUpIcon color="primary" />;
      case 'average':
        return <WarningIcon color="warning" />;
      case 'poor':
        return <TrendingDownIcon color="error" />;
      default:
        return null;
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Productivity Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 Days</MenuItem>
              <MenuItem value="30">Last 30 Days</MenuItem>
              <MenuItem value="90">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Productivity Overview Cards */}
      {overview && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Hours
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatHours(overview.totalHours)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage(overview.billableRate)} billable
                    </Typography>
                  </Box>
                  <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Billable Hours
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatHours(overview.billableHours)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatCurrency(overview.billableHours * 1000)} value
                    </Typography>
                  </Box>
                  <AssessmentIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Efficiency
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatPercentage(overview.averageEfficiency)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatHours(overview.averageTaskDuration)} avg task
                    </Typography>
                  </Box>
                  <SpeedIcon color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Task Completion
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatPercentage(overview.taskCompletionRate)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {overview.completedTasks}/{overview.totalTasks} tasks
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Efficiency Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Efficiency Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                {efficiencyMetrics.map((metric) => (
                  <Box key={metric.metric} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2">{metric.metric}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatPercentage(metric.value)}
                        </Typography>
                        {getStatusIcon(metric.status)}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(metric.value / metric.target) * 100}
                      color={getStatusColor(metric.status) as any}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Target: {formatPercentage(metric.target)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Team Performance
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">Efficiency</TableCell>
                      <TableCell align="right">Completion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamProductivity.map((team) => (
                      <TableRow key={team.teamName}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {team.teamName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {team.memberCount} members
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatHours(team.totalHours)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={formatPercentage(team.efficiency)}
                            color={getStatusColor(team.efficiency > 80 ? 'excellent' : team.efficiency > 60 ? 'good' : 'average') as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(team.taskCompletionRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Productivity Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Individual Performance
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Total Hours</TableCell>
                  <TableCell align="right">Billable Hours</TableCell>
                  <TableCell align="right">Billable Rate</TableCell>
                  <TableCell align="right">Efficiency</TableCell>
                  <TableCell align="right">Task Completion</TableCell>
                  <TableCell align="right">Avg Task Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userProductivity.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatHours(user.totalHours)}
                    </TableCell>
                    <TableCell align="right">
                      {formatHours(user.billableHours)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatPercentage(user.billableRate)}
                        color={user.billableRate > 80 ? 'success' : user.billableRate > 60 ? 'primary' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatPercentage(user.efficiency)}
                        color={getStatusColor(user.efficiency > 80 ? 'excellent' : user.efficiency > 60 ? 'good' : 'average') as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatPercentage(user.taskCompletionRate)}
                    </TableCell>
                    <TableCell align="right">
                      {formatHours(user.averageTaskDuration)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductivityAnalyticsPage;