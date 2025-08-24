/**
 * Search Analytics Dashboard Component
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This component provides a comprehensive search analytics dashboard
 * for monitoring search performance, user behavior, and search optimization
 * in the legal practice management system.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  LinearProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Click as ClickIcon,
  Timer as TimerIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Psychology as PsychologyIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';
import { logger } from '@/utils/logger';

/**
 * Search analytics data interface
 */
export interface SearchAnalyticsData {
  // Search performance metrics
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  averageResponseTime: number;
  searchSuccessRate: number;
  
  // User behavior metrics
  uniqueUsers: number;
  searchesPerUser: number;
  averageSessionDuration: number;
  bounceRate: number;
  
  // Search content metrics
  popularSearchTerms: Array<{
    term: string;
    count: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  
  // Search suggestions metrics
  suggestionUsage: number;
  suggestionClickRate: number;
  popularSuggestions: Array<{
    suggestion: string;
    usage: number;
    clickRate: number;
  }>;
  
  // Search filters metrics
  filterUsage: number;
  popularFilters: Array<{
    filter: string;
    usage: number;
    effectiveness: number;
  }>;
  
  // Search results metrics
  averageResultsPerSearch: number;
  clickThroughRate: number;
  timeToFirstResult: number;
  
  // Search errors
  commonErrors: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
  
  // Search trends
  searchTrends: Array<{
    date: string;
    searches: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  
  // Search categories
  searchByCategory: Array<{
    category: string;
    searches: number;
    successRate: number;
  }>;
  
  // Search performance by time
  searchByTime: Array<{
    hour: number;
    searches: number;
    avgResponseTime: number;
  }>;
}

/**
 * Search analytics dashboard props
 */
export interface SearchAnalyticsDashboardProps {
  data: SearchAnalyticsData;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  onTimeRangeChange?: (range: string) => void;
  onFilterChange?: (filters: any) => void;
}

/**
 * Search analytics dashboard component
 */
const SearchAnalyticsDashboard: React.FC<SearchAnalyticsDashboardProps> = ({
  data,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onTimeRangeChange,
  onFilterChange
}) => {
  const { announceToScreenReader } = useAccessibility();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tab labels
  const tabLabels = ['Overview', 'Performance', 'User Behavior', 'Content Analysis', 'Trends', 'Errors'];

  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    announceToScreenReader(`Switched to ${tabLabels[newValue]} tab`);
  };

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    onTimeRangeChange?.(range);
    announceToScreenReader(`Time range changed to ${range}`);
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    onRefresh?.();
    announceToScreenReader('Refreshing search analytics data');
  };

  /**
   * Handle export
   */
  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExport?.(format);
    announceToScreenReader(`Exporting search analytics in ${format.toUpperCase()} format`);
  };

  /**
   * Calculate performance indicators
   */
  const performanceIndicators = useMemo(() => {
    const {
      totalSearches,
      successfulSearches,
      averageResponseTime,
      searchSuccessRate,
      uniqueUsers,
      searchesPerUser,
      averageSessionDuration,
      bounceRate
    } = data;

    return {
      searchVolume: {
        value: totalSearches,
        label: 'Total Searches',
        trend: '+12.5%',
        trendDirection: 'up' as const,
        icon: <SearchIcon />
      },
      successRate: {
        value: `${searchSuccessRate.toFixed(1)}%`,
        label: 'Success Rate',
        trend: '+2.3%',
        trendDirection: 'up' as const,
        icon: <TrendingUpIcon />
      },
      responseTime: {
        value: `${averageResponseTime.toFixed(0)}ms`,
        label: 'Avg Response Time',
        trend: '-15.2%',
        trendDirection: 'down' as const,
        icon: <SpeedIcon />
      },
      userEngagement: {
        value: searchesPerUser.toFixed(1),
        label: 'Searches per User',
        trend: '+8.7%',
        trendDirection: 'up' as const,
        icon: <PsychologyIcon />
      }
    };
  }, [data]);

  /**
   * Get performance color
   */
  const getPerformanceColor = (trendDirection: 'up' | 'down') => {
    return trendDirection === 'up' ? 'success' : 'error';
  };

  /**
   * Render performance card
   */
  const renderPerformanceCard = (indicator: any) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
              {indicator.icon}
            </Avatar>
            <Typography variant="h6" component="h3">
              {indicator.label}
            </Typography>
          </Box>
          <Chip
            label={indicator.trend}
            color={getPerformanceColor(indicator.trendDirection)}
            size="small"
            icon={indicator.trendDirection === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
          />
        </Box>
        <Typography variant="h4" component="div" gutterBottom>
          {indicator.value}
        </Typography>
      </CardContent>
    </Card>
  );

  /**
   * Render search trends chart
   */
  const renderSearchTrends = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Search Trends
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShowChartIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Chart visualization would be implemented here
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  /**
   * Render popular search terms table
   */
  const renderPopularSearchTerms = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Popular Search Terms
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Search Term</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Success Rate</TableCell>
                <TableCell align="right">Avg Response Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.popularSearchTerms.slice(0, 10).map((term, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {term.term}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={term.count} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {term.successRate.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={term.successRate}
                        sx={{ width: 60, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {term.avgResponseTime.toFixed(0)}ms
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  /**
   * Render search errors
   */
  const renderSearchErrors = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom>
          Common Search Errors
        </Typography>
        <List>
          {data.commonErrors.map((error, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Badge badgeContent={error.count} color="error">
                  <Alert severity="error" sx={{ p: 0.5 }} />
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={error.error}
                secondary={`${error.percentage.toFixed(1)}% of total errors`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  /**
   * Render user behavior metrics
   */
  const renderUserBehavior = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              User Engagement
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PsychologyIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{data.uniqueUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Unique Users
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <TimerIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{data.averageSessionDuration.toFixed(1)}m</Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg Session Duration
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                <ClickIcon />
              </Avatar>
              <Box>
                <Typography variant="h4">{(data.bounceRate * 100).toFixed(1)}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Bounce Rate
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Search Suggestions Performance
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {data.suggestionUsage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suggestions Used
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h4" sx={{ mr: 2 }}>
                {(data.suggestionClickRate * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click Rate
              </Typography>
            </Box>
            <Typography variant="subtitle2" gutterBottom>
              Popular Suggestions:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {data.popularSuggestions.slice(0, 5).map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion.suggestion}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  /**
   * Render content analysis
   */
  const renderContentAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Search by Category
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Searches</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.searchByCategory.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell>{category.category}</TableCell>
                      <TableCell align="right">
                        <Chip label={category.searches} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {category.successRate.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" gutterBottom>
              Search Performance by Time
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChartIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                Time-based chart would be implemented here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Log component interactions
  useEffect(() => {
    logger.info('SearchAnalyticsDashboard rendered', {
      totalSearches: data.totalSearches,
      successRate: data.searchSuccessRate,
      uniqueUsers: data.uniqueUsers,
      timestamp: new Date().toISOString()
    });
  }, [data]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <AnalyticsIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              Search Analytics Dashboard
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                <MenuItem value="1d">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export data">
              <IconButton onClick={() => handleExport('csv')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search and filters */}
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search analytics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="cases">Cases</MenuItem>
              <MenuItem value="clients">Clients</MenuItem>
              <MenuItem value="documents">Documents</MenuItem>
              <MenuItem value="invoices">Invoices</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Loading indicator */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Performance indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {Object.entries(performanceIndicators).map(([key, indicator]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            {renderPerformanceCard(indicator)}
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab content */}
      <Box>
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {renderSearchTrends()}
            </Grid>
            <Grid item xs={12} md={4}>
              {renderSearchErrors()}
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderPopularSearchTerms()}
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && renderUserBehavior()}

        {activeTab === 3 && renderContentAnalysis()}

        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderSearchTrends()}
            </Grid>
          </Grid>
        )}

        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderSearchErrors()}
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default SearchAnalyticsDashboard;