/**
 * Cases Management Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Main cases management page with data table, filtering, and CRUD operations
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
  Alert,
  CircularProgress,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { useAuth } from '@/hooks/useAuth';
import { casesApi } from '@/services/api';
import { Case } from '@/types';
import { toast } from 'react-hot-toast';
import CaseForm from './CaseForm';
import CaseDetails from './CaseDetails';

/**
 * Cases Management Page Component
 * 
 * @returns JSX.Element
 */
const CasesPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    clientId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  /**
   * Load cases data
   */
  const loadCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await casesApi.getCases(params.toString());
      setCases(response.data.cases);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load cases');
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle case creation
   */
  const handleCreateCase = async (caseData: Partial<Case>) => {
    try {
      await casesApi.createCase(caseData);
      toast.success('Case created successfully');
      setOpenForm(false);
      loadCases();
    } catch (error) {
      toast.error('Failed to create case');
      console.error('Error creating case:', error);
    }
  };

  /**
   * Handle case update
   */
  const handleUpdateCase = async (caseData: Partial<Case>) => {
    if (!editingCase) return;
    
    try {
      await casesApi.updateCase(editingCase.id, caseData);
      toast.success('Case updated successfully');
      setOpenForm(false);
      setEditingCase(null);
      loadCases();
    } catch (error) {
      toast.error('Failed to update case');
      console.error('Error updating case:', error);
    }
  };

  /**
   * Handle case deletion
   */
  const handleDeleteCase = async (caseId: string) => {
    if (!confirm('Are you sure you want to delete this case?')) return;
    
    try {
      await casesApi.deleteCase(caseId);
      toast.success('Case deleted successfully');
      loadCases();
    } catch (error) {
      toast.error('Failed to delete case');
      console.error('Error deleting case:', error);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    loadCases();
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilters({ search: '', status: '', priority: '', assignedTo: '', clientId: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load cases on component mount
  useEffect(() => {
    loadCases();
  }, [pagination.page, pagination.limit]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = [
    {
      headerName: 'Case Number',
      field: 'caseNumber',
      flex: 1,
      minWidth: 120
    },
    {
      headerName: 'Title',
      field: 'title',
      flex: 1,
      minWidth: 200
    },
    {
      headerName: 'Client',
      field: 'clientName',
      valueGetter: (params) => `${params.data.clientFirstName} ${params.data.clientLastName}`,
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Status',
      field: 'status',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={
            params.value === 'open' ? 'success' : 
            params.value === 'in_progress' ? 'warning' : 
            params.value === 'closed' ? 'default' : 'primary'
          }
        />
      )
    },
    {
      headerName: 'Priority',
      field: 'priority',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={
            params.value === 'high' ? 'error' : 
            params.value === 'medium' ? 'warning' : 'success'
          }
        />
      )
    },
    {
      headerName: 'Assigned To',
      field: 'assignedToName',
      valueGetter: (params) => params.data.assignedFirstName && params.data.assignedLastName ? 
        `${params.data.assignedFirstName} ${params.data.assignedLastName}` : 'Unassigned',
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Due Date',
      field: 'dueDate',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'No due date'
    },
    {
      headerName: 'Documents',
      field: 'documentCount',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value || 0} 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      headerName: 'Actions',
      field: 'actions',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => {
                setSelectedCase(params.data);
                setOpenDetails(true);
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Case">
            <IconButton 
              size="small" 
              onClick={() => {
                setEditingCase(params.data);
                setOpenForm(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Case">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteCase(params.data.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Case Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              Add Case
            </Button>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
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
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={filters.priority}
                      label="Priority"
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <MenuItem value="">All Priority</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Assigned To</InputLabel>
                    <Select
                      value={filters.assignedTo}
                      label="Assigned To"
                      onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    >
                      <MenuItem value="">All Users</MenuItem>
                      <MenuItem value="unassigned">Unassigned</MenuItem>
                      {/* Would be populated with actual users */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
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
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Cases Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs}
                rowData={cases}
                pagination={true}
                paginationPageSize={pagination.limit}
                onGridReady={(params: GridReadyEvent) => setGridApi(params.api)}
                rowSelection="single"
                suppressRowClickSelection={true}
                loadingOverlayComponent={() => <CircularProgress />}
                loadingOverlayComponentParams={{ loadingMessage: 'Loading cases...' }}
                overlayLoadingTemplate={
                  '<span class="ag-overlay-loading-center">Loading cases...</span>'
                }
                overlayNoRowsTemplate={
                  '<span class="ag-overlay-no-rows-center">No cases found</span>'
                }
              />
            </div>
          </Box>

          {/* Pagination Info */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} cases
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadCases}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Case Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => {
          setOpenForm(false);
          setEditingCase(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCase ? 'Edit Case' : 'Add New Case'}
        </DialogTitle>
        <DialogContent>
          <CaseForm
            caseData={editingCase}
            onSubmit={editingCase ? handleUpdateCase : handleCreateCase}
            onCancel={() => {
              setOpenForm(false);
              setEditingCase(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Case Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Case Details</DialogTitle>
        <DialogContent>
          {selectedCase && (
            <CaseDetails
              caseData={selectedCase}
              onClose={() => setOpenDetails(false)}
              onEdit={() => {
                setEditingCase(selectedCase);
                setOpenDetails(false);
                setOpenForm(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CasesPage;