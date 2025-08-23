/**
 * Create User Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Create user page component for adding new users to the system
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { usersApi } from '@/services/api';
import { User } from '@/types';
import UserForm from './UserForm';
import { toast } from 'react-hot-toast';

/**
 * Create User Page Component
 * 
 * @returns JSX.Element
 */
const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handle user creation
   */
  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      await usersApi.createUser(userData);
      toast.success('User created successfully');
      navigate('/users');
    } catch (error: any) {
      toast.error('Failed to create user');
      throw error;
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    navigate('/users');
  };

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
        <Typography color="text.primary">Create User</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Create New User
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          Back to Users
        </Button>
      </Box>

      {/* Content */}
      <Card>
        <CardContent>
          <UserForm
            user={null}
            onSubmit={handleCreateUser}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateUserPage;