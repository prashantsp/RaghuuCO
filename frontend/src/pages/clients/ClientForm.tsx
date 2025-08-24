/**
 * Client Form Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Client form component for creating and editing clients with validation
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Client } from '@/types';
import { clientsApi } from '@/services/api';

/**
 * Client form validation schema
 */
const clientSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().matches(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  company: yup.string(),
  address: yup.string(),
  isActive: yup.boolean()
});

/**
 * Client Form Props Interface
 */
interface ClientFormProps {
  client?: Client | null;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Client Form Component
 * 
 * @param props - ClientFormProps
 * @returns JSX.Element
 */
const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [conflicts, setConflicts] = useState<any[]>([]);

  const isEdit = !!client;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      firstName: client?.firstName || '',
      lastName: client?.lastName || '',
      email: client?.email || '',
      phone: client?.phone || '',
      company: client?.company || '',
      address: client?.address || '',
      isActive: client?.isActive ?? true
    }
  });

  const watchedValues = watch();

  /**
   * Check for conflicts
   */
  const checkConflicts = async () => {
    try {
      const params = new URLSearchParams({
        firstName: watchedValues.firstName,
        lastName: watchedValues.lastName,
        email: watchedValues.email,
        phone: watchedValues.phone
      });

      const response = await clientsApi.checkConflicts(params.toString());
      setConflicts(response.data.conflicts);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      await onSubmit(data);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Check conflicts when form values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedValues.firstName || watchedValues.lastName || watchedValues.email || watchedValues.phone) {
        checkConflicts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedValues.firstName, watchedValues.lastName, watchedValues.email, watchedValues.phone]);

  // Reset form when client prop changes
  useEffect(() => {
    if (client) {
      reset({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        isActive: client.isActive
      });
    }
  }, [client, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {conflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Potential conflicts detected:
          </Typography>
          {conflicts.map((conflict, index) => (
            <Typography key={index} variant="body2">
              • {conflict.type} conflict: {conflict.value} (Found {conflict.conflicts.length} existing record{conflict.conflicts.length > 1 ? 's' : ''})
            </Typography>
          ))}
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
            name="company"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Company"
                error={!!errors.company}
                helperText={errors.company?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Address"
                multiline
                rows={3}
                error={!!errors.address}
                helperText={errors.address?.message}
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
                label="Active Client"
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
          {loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Create Client')}
        </Button>
      </Box>
    </Box>
  );
};

export default ClientForm;