/**
 * User Detail Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description User detail page component for viewing individual user information
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { usersApi } from '@/services/api';
import { User } from '@/types';
import UserDetails from './UserDetails';
import UserForm from './UserForm';
import { toast } from 'react-hot-toast';

/**
 * User Detail Page Component
 * 
 * @returns JSX.Element
 */
const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editing, setEditing] = useState(false);

  /**
   * Load user data
   */
  const loadUser = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await usersApi.getUser(id);
      setUser(response.data.user);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load user');
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user update
   */
  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      await usersApi.updateUser(user.id, userData);
      toast.success('User updated successfully');
      setEditing(false);
      loadUser(); // Reload user data
    } catch (error: any) {
      toast.error('Failed to update user');
      throw error;
    }
  };

  // Load user on component mount
  useEffect(() => {
    loadUser();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'User not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
        >
          Back to Users
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/users');
          }}
        >
          Users
        </Link>
        <Typography color="text.primary">{user.firstName} {user.lastName}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
          >
            Edit User
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Card>
        <CardContent>
          {editing ? (
            <UserForm
              user={user}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <UserDetails
              user={user}
              onClose={() => navigate('/users')}
              onEdit={() => setEditing(true)}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserDetailPage;