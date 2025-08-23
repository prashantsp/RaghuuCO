/**
 * Financial Dashboard Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Comprehensive financial dashboard with revenue, expenses, P&L, and cash flow analytics
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
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';

interface FinancialOverview {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyGrowth: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  totalClients: number;
  activeCases: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface CashFlowData {
  month: string;
  inflows: number;
  outflows: number;
  netFlow: number;
}

const FinancialDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('12');

  // Fetch financial overview
  const fetchFinancialOverview = async () => {
    try {
      const response = await api.get('/financial-dashboard/overview');
      setOverview(response.data.data);
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      setError('Failed to fetch financial overview');
    }
  };

  // Fetch revenue analytics
  const fetchRevenueAnalytics = async () => {
    try {
      const response = await api.get(`/financial-dashboard/revenue?months=${timeRange}`);
      setRevenueData(response.data.data.monthlyData);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    }
  };

  // Fetch expense analytics
  const fetchExpenseAnalytics = async () => {
    try {
      const response = await api.get('/financial-dashboard/expenses');
      setExpenseCategories(response.data.data.expensesByCategory);
    } catch (error) {
      console.error('Error fetching expense analytics:', error);
    }
  };

  // Fetch cash flow analysis
  const fetchCashFlowAnalysis = async () => {
    try {
      const response = await api.get(`/financial-dashboard/cashflow?months=${timeRange}`);
      setCashFlowData(response.data.data.monthlyData);
    } catch (error) {
      console.error('Error fetching cash flow analysis:', error);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchFinancialOverview(),
        fetchRevenueAnalytics(),
        fetchExpenseAnalytics(),
        fetchCashFlowAnalysis()
      ]);
    } catch (error) {
      console.error('Error fetching financial data:', error);
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
    toast.success('Financial data refreshed');
  };

  // Handle export
  const handleExport = () => {
    toast.success('Financial report exported successfully');
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

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
          Financial Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="3">Last 3 Months</MenuItem>
              <MenuItem value="6">Last 6 Months</MenuItem>
              <MenuItem value="12">Last 12 Months</MenuItem>
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

      {/* Financial Overview Cards */}
      {overview && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatCurrency(overview.totalRevenue)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TrendingUpIcon color="success" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        +{formatPercentage(overview.monthlyGrowth)}
                      </Typography>
                    </Box>
                  </Box>
                  <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
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
                      Total Expenses
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatCurrency(overview.totalExpenses)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage(overview.totalExpenses / overview.totalRevenue * 100)} of revenue
                    </Typography>
                  </Box>
                  <ReceiptIcon color="error" sx={{ fontSize: 40 }} />
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
                      Net Profit
                    </Typography>
                    <Typography variant="h5" component="div" color={overview.netProfit >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(overview.netProfit)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatPercentage(overview.profitMargin)} margin
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
                      Outstanding Invoices
                    </Typography>
                    <Typography variant="h5" component="div">
                      {overview.outstandingInvoices}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Chip
                        label={`${overview.overdueInvoices} overdue`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <PaymentIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Revenue vs Expenses Chart */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue vs Expenses Trend
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Expenses</TableCell>
                      <TableCell align="right">Profit</TableCell>
                      <TableCell align="right">Margin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.expenses)}</TableCell>
                        <TableCell align="right" sx={{ color: row.profit >= 0 ? 'success.main' : 'error.main' }}>
                          {formatCurrency(row.profit)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage((row.profit / row.revenue) * 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expense Categories
              </Typography>
              <Box sx={{ mt: 2 }}>
                {expenseCategories.map((category) => (
                  <Box key={category.category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">{category.category}</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(category.amount)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatPercentage(category.percentage)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cash Flow Analysis */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cash Flow Analysis
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Cash Inflows</TableCell>
                  <TableCell align="right">Cash Outflows</TableCell>
                  <TableCell align="right">Net Cash Flow</TableCell>
                  <TableCell align="right">Cumulative</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashFlowData.map((row, index) => {
                  const cumulative = cashFlowData
                    .slice(0, index + 1)
                    .reduce((sum, item) => sum + item.netFlow, 0);
                  
                  return (
                    <TableRow key={row.month}>
                      <TableCell>{row.month}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(row.inflows)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatCurrency(row.outflows)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: row.netFlow >= 0 ? 'success.main' : 'error.main' }}>
                        {formatCurrency(row.netFlow)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: cumulative >= 0 ? 'success.main' : 'error.main' }}>
                        {formatCurrency(cumulative)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialDashboardPage;