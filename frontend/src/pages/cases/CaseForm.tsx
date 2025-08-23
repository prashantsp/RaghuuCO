/**
 * Case Form Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Case form component for creating and editing cases with validation
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
  Typography,
  Alert,
  Autocomplete,
  Chip
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Case, Client, User } from '@/types';
import { casesApi, clientsApi, usersApi } from '@/services/api';

/**
 * Case form validation schema
 */
const caseSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  clientId: yup.string().required('Client is required'),
  assignedTo: yup.string(),
  priority: yup.string().required('Priority is required'),
  dueDate: yup.date().min(new Date(), 'Due date cannot be in the past'),
  category: yup.string().required('Category is required'),
  estimatedHours: yup.number().min(0, 'Estimated hours must be positive'),
  billingRate: yup.number().min(0, 'Billing rate must be positive'),
  tags: yup.array().of(yup.string())
});

/**
 * Case Form Props Interface
 */
interface CaseFormProps {
  caseData?: Case | null;
  onSubmit: (data: Partial<Case>) => Promise<void>;
  onCancel: () => void;
}

/**
 * Case Form Component
 * 
 * @param props - CaseFormProps
 * @returns JSX.Element
 */
const CaseForm: React.FC<CaseFormProps> = ({ caseData, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(caseData?.tags || []);

  const isEdit = !!caseData;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(caseSchema),
    defaultValues: {
      title: caseData?.title || '',
      description: caseData?.description || '',
      clientId: caseData?.clientId || '',
      assignedTo: caseData?.assignedTo || '',
      priority: caseData?.priority || 'medium',
      dueDate: caseData?.dueDate ? new Date(caseData.dueDate).toISOString().split('T')[0] : '',
      category: caseData?.category || 'general',
      estimatedHours: caseData?.estimatedHours || 0,
      billingRate: caseData?.billingRate || 0,
      tags: caseData?.tags || []
    }
  });

  /**
   * Load clients
   */
  const loadClients = async () => {
    try {
      const response = await clientsApi.getClients('limit=1000&isActive=true');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  /**
   * Load users
   */
  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers('limit=1000&isActive=true');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      // Add tags to the data
      data.tags = selectedTags;

      await onSubmit(data);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle tag addition
   */
  const handleTagAdd = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  /**
   * Handle tag removal
   */
  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  // Load data on component mount
  useEffect(() => {
    loadClients();
    loadUsers();
  }, []);

  // Reset form when caseData prop changes
  useEffect(() => {
    if (caseData) {
      reset({
        title: caseData.title,
        description: caseData.description,
        clientId: caseData.clientId,
        assignedTo: caseData.assignedTo,
        priority: caseData.priority,
        dueDate: caseData.dueDate ? new Date(caseData.dueDate).toISOString().split('T')[0] : '',
        category: caseData.category,
        estimatedHours: caseData.estimatedHours,
        billingRate: caseData.billingRate,
        tags: caseData.tags
      });
      setSelectedTags(caseData.tags || []);
    }
  }, [caseData, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Case Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Description"
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.clientId}>
                <InputLabel>Client</InputLabel>
                <Select
                  {...field}
                  label="Client"
                  disabled={loading}
                >
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} {client.company ? `(${client.company})` : ''}
                    </MenuItem>
                  ))}
                </Select>
                {errors.clientId && (
                  <FormHelperText>{errors.clientId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.assignedTo}>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  {...field}
                  label="Assigned To"
                  disabled={loading}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedTo && (
                  <FormHelperText>{errors.assignedTo.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel>Priority</InputLabel>
                <Select
                  {...field}
                  label="Priority"
                  disabled={loading}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
                {errors.priority && (
                  <FormHelperText>{errors.priority.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  {...field}
                  label="Category"
                  disabled={loading}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="litigation">Litigation</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                  <MenuItem value="family">Family Law</MenuItem>
                  <MenuItem value="criminal">Criminal</MenuItem>
                  <MenuItem value="real_estate">Real Estate</MenuItem>
                  <MenuItem value="intellectual_property">Intellectual Property</MenuItem>
                  <MenuItem value="employment">Employment</MenuItem>
                  <MenuItem value="tax">Tax</MenuItem>
                  <MenuItem value="bankruptcy">Bankruptcy</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="dueDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.dueDate}
                helperText={errors.dueDate?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="estimatedHours"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Estimated Hours"
                type="number"
                error={!!errors.estimatedHours}
                helperText={errors.estimatedHours?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="billingRate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Billing Rate (per hour)"
                type="number"
                error={!!errors.billingRate}
                helperText={errors.billingRate?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleTagRemove(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
          <TextField
            fullWidth
            label="Add Tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                handleTagAdd(input.value);
                input.value = '';
              }
            }}
            disabled={loading}
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
          {loading ? 'Saving...' : (isEdit ? 'Update Case' : 'Create Case')}
        </Button>
      </Box>
    </Box>
  );
};

export default CaseForm;