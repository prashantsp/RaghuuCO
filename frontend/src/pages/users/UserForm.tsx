/**
 * User Form Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description User form component for creating and editing users with validation
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, UserRole } from '@/types';
import { usersApi } from '@/services/api';

/**
 * User form validation schema
 */
const userSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().when('$isEdit', {
    is: true,
    then: yup.string().min(6, 'Password must be at least 6 characters'),
    otherwise: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
  }),
  role: yup.string().required('Role is required'),
  phone: yup.string().matches(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  isActive: yup.boolean()
});

/**
 * User Form Props Interface
 */
interface UserFormProps {
  user?: User | null;
  onSubmit: (data: Partial<User>) => Promise<void>;
  onCancel: () => void;
}

/**
 * User Form Component
 * 
 * @param props - UserFormProps
 * @returns JSX.Element
 */
const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [assignableRoles, setAssignableRoles] = useState<UserRole[]>([]);
  const [error, setError] = useState<string>('');

  const isEdit = !!user;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(userSchema),
    context: { isEdit },
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      role: user?.role || '',
      phone: user?.phone || '',
      isActive: user?.isActive ?? true
    }
  });

  /**
   * Load assignable roles
   */
  const loadAssignableRoles = async () => {
    try {
      const response = await usersApi.getAssignableRoles();
      setAssignableRoles(response.data.roles);
    } catch (error) {
      console.error('Error loading assignable roles:', error);
    }
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      // Remove password if empty in edit mode
      if (isEdit && !data.password) {
        delete data.password;
      }

      await onSubmit(data);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load assignable roles on component mount
  useEffect(() => {
    loadAssignableRoles();
  }, []);

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      });
    }
  }, [user, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  {...field}
                  label="Role"
                  disabled={loading}
                >
                  {assignableRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <FormHelperText>{errors.role.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Phone Number"
                error={!!errors.phone}
                helperText={errors.phone?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={loading}
                  />
                }
                label="Active User"
              />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEdit ? 'Update User' : 'Create User')}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;