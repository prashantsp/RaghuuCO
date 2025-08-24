/**
 * Users Management Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Main users management page with data table, filtering, and CRUD operations
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
  Visibility as ViewIcon
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/services/api';
import { User, UserRole } from '@/types';
import UserForm from './UserForm';
import UserDetails from './UserDetails';
import { toast } from 'react-hot-toast';

/**
 * Users Management Page Component
 * 
 * @returns JSX.Element
 */
const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  /**
   * Load users data
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await usersApi.getUsers(params.toString());
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user creation
   */
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await usersApi.createUser(userData);
      toast.success('User created successfully');
      setOpenForm(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  /**
   * Handle user update
   */
  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!editingUser) return;
    
    try {
      await usersApi.updateUser(editingUser.id, userData);
      toast.success('User updated successfully');
      setOpenForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  /**
   * Handle user deletion
   */
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersApi.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
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
    loadUsers();
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilters({ search: '', role: '', isActive: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'fullName',
      valueGetter: (params) => `${params.data.firstName} ${params.data.lastName}`,
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Email',
      field: 'email',
      flex: 1,
      minWidth: 200
    },
    {
      headerName: 'Role',
      field: 'role',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value} 
          size="small" 
          color={params.value === 'super_admin' ? 'error' : 'primary'}
        />
      )
    },
    {
      headerName: 'Status',
      field: 'isActive',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value ? 'Active' : 'Inactive'} 
          size="small" 
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      headerName: 'Last Login',
      field: 'lastLogin',
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'Never'
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
                setSelectedUser(params.data);
                setOpenDetails(true);
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User">
            <IconButton 
              size="small" 
              onClick={() => {
                setEditingUser(params.data);
                setOpenForm(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteUser(params.data.id)}
              disabled={params.data.id === currentUser?.id}
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
              User Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenForm(true)}
            >
              Add User
            </Button>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={filters.role}
                      label="Role"
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="super_admin">Super Admin</MenuItem>
                      <MenuItem value="partner">Partner</MenuItem>
                      <MenuItem value="senior_associate">Senior Associate</MenuItem>
                      <MenuItem value="junior_associate">Junior Associate</MenuItem>
                      <MenuItem value="paralegal">Paralegal</MenuItem>
                      <MenuItem value="client">Client</MenuItem>
                      <MenuItem value="guest">Guest</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.isActive}
                      label="Status"
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
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

          {/* Users Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs}
                rowData={users}
                pagination={true}
                paginationPageSize={pagination.limit}
                onGridReady={(params: GridReadyEvent) => setGridApi(params.api)}
                rowSelection="single"
                suppressRowClickSelection={true}
                loadingOverlayComponent={() => <CircularProgress />}
                loadingOverlayComponentParams={{ loadingMessage: 'Loading users...' }}
                overlayLoadingTemplate={
                  '<span class="ag-overlay-loading-center">Loading users...</span>'
                }
                overlayNoRowsTemplate={
                  '<span class="ag-overlay-no-rows-center">No users found</span>'
                }
              />
            </div>
          </Box>

          {/* Pagination Info */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadUsers}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => {
          setOpenForm(false);
          setEditingUser(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <UserForm
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
            onCancel={() => {
              setOpenForm(false);
              setEditingUser(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <UserDetails 
              user={selectedUser}
              onClose={() => setOpenDetails(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UsersPage;