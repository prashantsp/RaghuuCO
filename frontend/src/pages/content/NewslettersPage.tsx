/**
 * Newsletters Management Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Main newsletters management page with data table, filtering, and CRUD operations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_at: string;
  sent_at: string;
  recipient_count: number;
  opened_count: number;
  clicked_count: number;
  created_by: string;
  created_by_first_name: string;
  created_by_last_name: string;
  created_at: string;
  updated_at: string;
}

const NewslettersPage: React.FC = () => {
  const navigate = useNavigate();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  // Fetch newsletters
  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: rowsPerPage.toString(),
        offset: (page * rowsPerPage).toString(),
        ...filters
      });

      const response = await api.get(`/content/newsletters?${params}`);
      setNewsletters(response.data.data.newsletters);
      setTotalCount(response.data.data.total || response.data.data.newsletters.length);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      setError('Failed to fetch newsletters');
      toast.error('Failed to fetch newsletters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, [page, rowsPerPage, filters]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  // Apply filters
  const applyFilters = () => {
    fetchNewsletters();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ search: '', status: '' });
    setPage(0);
  };

  // Handle delete
  const handleDelete = async (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedNewsletter) return;

    try {
      await api.delete(`/content/newsletters/${selectedNewsletter.id}`);
      toast.success('Newsletter deleted successfully');
      fetchNewsletters();
      setDeleteDialogOpen(false);
      setSelectedNewsletter(null);
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast.error('Failed to delete newsletter');
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'scheduled':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get open rate
  const getOpenRate = (newsletter: Newsletter) => {
    if (newsletter.recipient_count === 0) return 0;
    return ((newsletter.opened_count / newsletter.recipient_count) * 100).toFixed(1);
  };

  // Get click rate
  const getClickRate = (newsletter: Newsletter) => {
    if (newsletter.recipient_count === 0) return 0;
    return ((newsletter.clicked_count / newsletter.recipient_count) * 100).toFixed(1);
  };

  if (loading && newsletters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Newsletters Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/content/newsletters/create')}
            >
              Create Newsletter
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={applyFilters}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Newsletters Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Open Rate</TableCell>
                  <TableCell>Click Rate</TableCell>
                  <TableCell>Scheduled/Sent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {newsletter.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {newsletter.created_by_first_name} {newsletter.created_by_last_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {newsletter.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={newsletter.status}
                        color={getStatusColor(newsletter.status) as any}
                        size="small"
                        icon={newsletter.status === 'scheduled' ? <ScheduleIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={newsletter.recipient_count} color="primary">
                        <Typography variant="body2">
                          {newsletter.recipient_count}
                        </Typography>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getOpenRate(newsletter)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getClickRate(newsletter)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {newsletter.status === 'scheduled' && newsletter.scheduled_at
                          ? new Date(newsletter.scheduled_at).toLocaleDateString()
                          : newsletter.status === 'sent' && newsletter.sent_at
                          ? new Date(newsletter.sent_at).toLocaleDateString()
                          : '-'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/content/newsletters/${newsletter.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/content/newsletters/${newsletter.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                        {newsletter.status === 'draft' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/content/newsletters/${newsletter.id}/send`)}
                          >
                            <SendIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(newsletter)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Newsletter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedNewsletter?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewslettersPage;