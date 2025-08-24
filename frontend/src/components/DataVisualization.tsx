/**
 * Data Visualization Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This component provides comprehensive data visualization capabilities
 * including charts, graphs, analytics dashboards, and interactive data exploration
 * for enhanced business intelligence and reporting.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  LinearProgress,
  CircularProgress,
  useTheme,
  styled
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  FunnelChart,
  Funnel,
  Treemap,
  TreemapItem,
  HeatMap,
  HeatMapItem,
  Sankey,
  SankeyNode,
  SankeyLink
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Analytics,
  Assessment,
  Timeline,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart,
  ScatterPlot,
  BubbleChart,
  Timeline as TimelineIcon,
  FilterList,
  Refresh,
  Download,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  Settings,
  Info,
  Warning,
  Error,
  CheckCircle,
  Visibility,
  VisibilityOff,
  ExpandMore,
  ExpandLess,
  MoreVert,
  Print,
  Share,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Chart data interface
 */
interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

/**
 * Chart configuration interface
 */
interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'funnel' | 'treemap' | 'heatmap' | 'sankey';
  title: string;
  description: string;
  data: ChartData[];
  xAxis?: string;
  yAxis?: string;
  color?: string;
  colors?: string[];
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

/**
 * Dashboard interface
 */
interface Dashboard {
  id: string;
  title: string;
  description: string;
  charts: ChartConfig[];
  layout: 'grid' | 'flexible' | 'single';
  refreshInterval?: number;
  lastUpdated: Date;
  isPublic: boolean;
  tags: string[];
}

/**
 * Analytics metrics interface
 */
interface AnalyticsMetrics {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalRevenue: number;
  averageCaseDuration: number;
  clientSatisfaction: number;
  caseSuccessRate: number;
  averageResponseTime: number;
  topPracticeAreas: ChartData[];
  monthlyTrends: ChartData[];
  revenueByMonth: ChartData[];
  caseStatusDistribution: ChartData[];
  clientDistribution: ChartData[];
  performanceMetrics: ChartData[];
}

/**
 * Styled components
 */
const ChartContainer = styled(Paper)<{ fullscreen?: boolean }>`
  position: relative;
  padding: ${({ fullscreen }) => fullscreen ? '24px' : '16px'};
  height: ${({ fullscreen }) => fullscreen ? '100vh' : '400px'};
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[8]};
  }
`;

const MetricCard = styled(Card)<{ trend?: 'up' | 'down' | 'neutral' }>`
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: ${({ trend, theme }) => {
      switch (trend) {
        case 'up': return theme.palette.success.main;
        case 'down': return theme.palette.error.main;
        default: return theme.palette.info.main;
      }
    }};
  }
`;

const ChartToolbar = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

/**
 * Data Visualization Component
 */
export const DataVisualization: React.FC = () => {
  const theme = useTheme();
  const { announceToScreenReader } = useAccessibility();
  const { user } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [chartType, setChartType] = useState('bar');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedCharts, setBookmarkedCharts] = useState<string[]>([]);

  // Sample data
  const sampleData: ChartData[] = [
    { name: 'Jan', cases: 120, revenue: 45000, clients: 45, satisfaction: 4.2 },
    { name: 'Feb', cases: 135, revenue: 52000, clients: 52, satisfaction: 4.3 },
    { name: 'Mar', cases: 150, revenue: 58000, clients: 58, satisfaction: 4.1 },
    { name: 'Apr', cases: 140, revenue: 54000, clients: 54, satisfaction: 4.4 },
    { name: 'May', cases: 160, revenue: 62000, clients: 62, satisfaction: 4.5 },
    { name: 'Jun', cases: 175, revenue: 68000, clients: 68, satisfaction: 4.6 },
    { name: 'Jul', cases: 190, revenue: 75000, clients: 75, satisfaction: 4.7 },
    { name: 'Aug', cases: 210, revenue: 82000, clients: 82, satisfaction: 4.8 },
    { name: 'Sep', cases: 195, revenue: 78000, clients: 78, satisfaction: 4.6 },
    { name: 'Oct', cases: 220, revenue: 86000, clients: 86, satisfaction: 4.9 },
    { name: 'Nov', cases: 240, revenue: 92000, clients: 92, satisfaction: 4.8 },
    { name: 'Dec', cases: 260, revenue: 100000, clients: 100, satisfaction: 4.9 }
  ];

  const pieData: ChartData[] = [
    { name: 'Civil Litigation', value: 35, color: '#8884d8' },
    { name: 'Criminal Defense', value: 25, color: '#82ca9d' },
    { name: 'Family Law', value: 20, color: '#ffc658' },
    { name: 'Corporate Law', value: 15, color: '#ff7300' },
    { name: 'Real Estate', value: 5, color: '#00ff00' }
  ];

  const radarData: ChartData[] = [
    { subject: 'Case Success Rate', A: 95, B: 85, fullMark: 100 },
    { subject: 'Client Satisfaction', A: 92, B: 78, fullMark: 100 },
    { subject: 'Response Time', A: 88, B: 72, fullMark: 100 },
    { subject: 'Revenue Growth', A: 96, B: 82, fullMark: 100 },
    { subject: 'Case Efficiency', A: 90, B: 80, fullMark: 100 },
    { subject: 'Team Performance', A: 94, B: 85, fullMark: 100 }
  ];

  const funnelData: ChartData[] = [
    { name: 'Initial Consultations', value: 1000, fill: '#8884d8' },
    { name: 'Case Evaluations', value: 800, fill: '#82ca9d' },
    { name: 'Case Acceptance', value: 600, fill: '#ffc658' },
    { name: 'Active Cases', value: 400, fill: '#ff7300' },
    { name: 'Completed Cases', value: 350, fill: '#00ff00' }
  ];

  // Analytics metrics
  const analyticsMetrics: AnalyticsMetrics = {
    totalCases: 260,
    activeCases: 85,
    completedCases: 175,
    totalRevenue: 1000000,
    averageCaseDuration: 45,
    clientSatisfaction: 4.9,
    caseSuccessRate: 95,
    averageResponseTime: 2.5,
    topPracticeAreas: pieData,
    monthlyTrends: sampleData,
    revenueByMonth: sampleData.map(item => ({ name: item.name, revenue: item.revenue })),
    caseStatusDistribution: [
      { name: 'Active', value: 85 },
      { name: 'Pending', value: 45 },
      { name: 'Completed', value: 175 },
      { name: 'Closed', value: 30 }
    ],
    clientDistribution: [
      { name: 'Individual', value: 60 },
      { name: 'Corporate', value: 25 },
      { name: 'Government', value: 10 },
      { name: 'Non-Profit', value: 5 }
    ],
    performanceMetrics: radarData
  };

  // Chart configurations
  const chartConfigs: Record<string, ChartConfig> = {
    monthlyCases: {
      type: 'bar',
      title: 'Monthly Case Volume',
      description: 'Number of cases handled per month',
      data: sampleData,
      xAxis: 'name',
      yAxis: 'cases',
      color: theme.palette.primary.main,
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    },
    revenueTrend: {
      type: 'line',
      title: 'Revenue Trend',
      description: 'Monthly revenue progression',
      data: sampleData,
      xAxis: 'name',
      yAxis: 'revenue',
      color: theme.palette.success.main,
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    },
    practiceAreas: {
      type: 'pie',
      title: 'Practice Areas Distribution',
      description: 'Distribution of cases by practice area',
      data: pieData,
      colors: pieData.map(item => item.color),
      height: 300,
      showLegend: true,
      showTooltip: true,
      animate: true
    },
    clientSatisfaction: {
      type: 'area',
      title: 'Client Satisfaction Trend',
      description: 'Monthly client satisfaction scores',
      data: sampleData,
      xAxis: 'name',
      yAxis: 'satisfaction',
      color: theme.palette.warning.main,
      height: 300,
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      animate: true
    },
    performanceRadar: {
      type: 'radar',
      title: 'Performance Metrics',
      description: 'Multi-dimensional performance analysis',
      data: radarData,
      height: 300,
      showLegend: true,
      showTooltip: true,
      animate: true
    },
    caseFunnel: {
      type: 'funnel',
      title: 'Case Conversion Funnel',
      description: 'Case progression from consultation to completion',
      data: funnelData,
      height: 300,
      showLegend: true,
      showTooltip: true,
      animate: true
    }
  };

  // Load data
  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      announceToScreenReader('Data visualization loaded successfully');
      logger.info('Data visualization data loaded successfully');
    } catch (error) {
      logger.error('Error loading data visualization:', error as Error);
      setError('Failed to load data');
      announceToScreenReader('Error loading data visualization');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, announceToScreenReader]);

  // Handle tab change
  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    announceToScreenReader(`Switched to ${['Overview', 'Analytics', 'Reports', 'Custom'][newValue]} tab`);
  }, [announceToScreenReader]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    announceToScreenReader(isFullscreen ? 'Exited fullscreen mode' : 'Entered fullscreen mode');
  }, [isFullscreen, announceToScreenReader]);

  // Toggle bookmark
  const toggleBookmark = useCallback((chartId: string) => {
    setBookmarkedCharts(prev => 
      prev.includes(chartId) 
        ? prev.filter(id => id !== chartId)
        : [...prev, chartId]
    );
    announceToScreenReader('Chart bookmark toggled');
  }, [announceToScreenReader]);

  // Download chart
  const downloadChart = useCallback((chartId: string) => {
    // Simulate chart download
    logger.info('Chart download initiated', { chartId });
    announceToScreenReader('Chart download started');
  }, [announceToScreenReader]);

  // Share chart
  const shareChart = useCallback((chartId: string) => {
    // Simulate chart sharing
    logger.info('Chart sharing initiated', { chartId });
    announceToScreenReader('Chart sharing options opened');
  }, [announceToScreenReader]);

  // Render chart based on type
  const renderChart = useCallback((config: ChartConfig) => {
    const { type, data, xAxis, yAxis, color, colors, height = 300, showLegend = true, showGrid = true, showTooltip = true, animate = true } = config;

    const commonProps = {
      data,
      height,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              {showTooltip && <RechartsTooltip />}
              {showLegend && <Legend />}
              <Bar dataKey={yAxis} fill={color} animationDuration={animate ? 1000 : 0} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              {showTooltip && <RechartsTooltip />}
              {showLegend && <Legend />}
              <Line type="monotone" dataKey={yAxis} stroke={color} strokeWidth={2} animationDuration={animate ? 1000 : 0} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationDuration={animate ? 1000 : 0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors?.[index] || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                ))}
              </Pie>
              {showTooltip && <RechartsTooltip />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xAxis} />
              <YAxis />
              {showTooltip && <RechartsTooltip />}
              {showLegend && <Legend />}
              <Area type="monotone" dataKey={yAxis} stroke={color} fill={color} fillOpacity={0.3} animationDuration={animate ? 1000 : 0} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Current" dataKey="A" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
              <Radar name="Previous" dataKey="B" stroke={theme.palette.secondary.main} fill={theme.palette.secondary.main} fillOpacity={0.6} />
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <FunnelChart>
              <Funnel dataKey="value" data={data} isAnimationActive={animate}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
              {showTooltip && <RechartsTooltip />}
              {showLegend && <Legend />}
            </FunnelChart>
          </ResponsiveContainer>
        );

      default:
        return <Typography>Unsupported chart type: {type}</Typography>;
    }
  }, [theme.palette.primary.main, theme.palette.secondary.main]);

  // Render metric card
  const renderMetricCard = useCallback((title: string, value: number | string, trend?: 'up' | 'down' | 'neutral', subtitle?: string) => (
    <MetricCard trend={trend}>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {typeof value === 'number' && value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {trend === 'up' ? <TrendingUp color="success" /> : trend === 'down' ? <TrendingDown color="error" /> : <Timeline color="info" />}
            <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
              {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </MetricCard>
  ), []);

  const tabs = [
    { label: 'Overview', icon: <Analytics /> },
    { label: 'Analytics', icon: <Assessment /> },
    { label: 'Reports', icon: <Timeline /> },
    { label: 'Custom', icon: <Settings /> }
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: isFullscreen ? 0 : 3, height: isFullscreen ? '100vh' : 'auto', overflow: 'auto' }}>
      {!isFullscreen && (
        <Typography variant="h4" gutterBottom>
          Data Visualization & Analytics
        </Typography>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} icon={tab.icon} />
        ))}
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Key Performance Indicators
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                {renderMetricCard('Total Cases', analyticsMetrics.totalCases, 'up', 'All time')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderMetricCard('Active Cases', analyticsMetrics.activeCases, 'neutral', 'Currently open')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderMetricCard('Total Revenue', analyticsMetrics.totalRevenue, 'up', 'This year')}
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                {renderMetricCard('Success Rate', `${analyticsMetrics.caseSuccessRate}%`, 'up', 'Case completion')}
              </Grid>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} lg={8}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Monthly Case Volume</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('monthlyCases')}>
                    {bookmarkedCharts.includes('monthlyCases') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('monthlyCases')}>
                    <Download />
                  </IconButton>
                  <IconButton onClick={() => shareChart('monthlyCases')}>
                    <Share />
                  </IconButton>
                  <IconButton onClick={toggleFullscreen}>
                    <Fullscreen />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.monthlyCases)}
            </ChartContainer>
          </Grid>

          <Grid item xs={12} lg={4}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Practice Areas</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('practiceAreas')}>
                    {bookmarkedCharts.includes('practiceAreas') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('practiceAreas')}>
                    <Download />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.practiceAreas)}
            </ChartContainer>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Revenue Trend</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('revenueTrend')}>
                    {bookmarkedCharts.includes('revenueTrend') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('revenueTrend')}>
                    <Download />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.revenueTrend)}
            </ChartContainer>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Client Satisfaction</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('clientSatisfaction')}>
                    {bookmarkedCharts.includes('clientSatisfaction') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('clientSatisfaction')}>
                    <Download />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.clientSatisfaction)}
            </ChartContainer>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Performance Metrics</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('performanceRadar')}>
                    {bookmarkedCharts.includes('performanceRadar') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('performanceRadar')}>
                    <Download />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.performanceRadar)}
            </ChartContainer>
          </Grid>

          <Grid item xs={12} lg={6}>
            <ChartContainer>
              <ChartToolbar>
                <Typography variant="h6">Case Conversion Funnel</Typography>
                <Box>
                  <IconButton onClick={() => toggleBookmark('caseFunnel')}>
                    {bookmarkedCharts.includes('caseFunnel') ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                  <IconButton onClick={() => downloadChart('caseFunnel')}>
                    <Download />
                  </IconButton>
                </Box>
              </ChartToolbar>
              {renderChart(chartConfigs.caseFunnel)}
            </ChartContainer>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Custom Reports
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Advanced reporting and custom analytics features coming soon.
          </Typography>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Custom Dashboards
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create and customize your own dashboards and visualizations.
          </Typography>
        </Box>
      )}
    </Box>
  );
};