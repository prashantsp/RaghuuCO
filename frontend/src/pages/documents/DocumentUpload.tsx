/**
 * Document Upload Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Document upload component with drag-and-drop functionality
 */

import React, { useState, useCallback } from 'react';
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
  Paper,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDropzone } from 'react-dropzone';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { Document, Case, Client } from '@/types';
import { casesApi, clientsApi } from '@/services/api';

/**
 * Document upload validation schema
 */
const documentSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string(),
  caseId: yup.string(),
  clientId: yup.string(),
  tags: yup.array().of(yup.string())
});

/**
 * Document Upload Props Interface
 */
interface DocumentUploadProps {
  document?: Document | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * File Upload Status Interface
 */
interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * Document Upload Component
 * 
 * @param props - DocumentUploadProps
 * @returns JSX.Element
 */
const DocumentUpload: React.FC<DocumentUploadProps> = ({ document, onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<FileUploadStatus[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(document?.tags || []);

  const isEdit = !!document;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(documentSchema),
    defaultValues: {
      title: document?.title || '',
      description: document?.description || '',
      caseId: document?.caseId || '',
      clientId: document?.clientId || '',
      tags: document?.tags || []
    }
  });

  /**
   * Load cases
   */
  const loadCases = async () => {
    try {
      const response = await casesApi.getCases('limit=1000');
      setCases(response.data.cases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

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
   * Handle file drop
   */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);
    setUploadStatuses(prev => [
      ...prev,
      ...acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }))
    ]);
  }, []);

  /**
   * Dropzone configuration
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  /**
   * Remove file
   */
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadStatuses(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle form submission
   */
  const handleFormSubmit = async (data: any) => {
    if (selectedFiles.length === 0 && !isEdit) {
      setError('Please select at least one file to upload');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Add tags to the data
      data.tags = selectedTags;

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('caseId', data.caseId || '');
      formData.append('clientId', data.clientId || '');
      formData.append('tags', JSON.stringify(selectedTags));

      // Add files
      selectedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      await onSubmit(formData);
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

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load data on component mount
  React.useEffect(() => {
    loadCases();
    loadClients();
  }, []);

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
                label="Document Title"
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
                rows={3}
                error={!!errors.description}
                helperText={errors.description?.message}
                disabled={loading}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="caseId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.caseId}>
                <InputLabel>Case (Optional)</InputLabel>
                <Select
                  {...field}
                  label="Case (Optional)"
                  disabled={loading}
                >
                  <MenuItem value="">No Case</MenuItem>
                  {cases.map((caseItem) => (
                    <MenuItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.caseNumber} - {caseItem.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.caseId && (
                  <FormHelperText>{errors.caseId.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.clientId}>
                <InputLabel>Client (Optional)</InputLabel>
                <Select
                  {...field}
                  label="Client (Optional)"
                  disabled={loading}
                >
                  <MenuItem value="">No Client</MenuItem>
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

        {/* File Upload Area */}
        {!isEdit && (
          <Grid item xs={12}>
            <Paper
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select files
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG (Max 50MB per file)
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Selected Files ({selectedFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {selectedFiles.map((file, index) => (
                <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <DescriptionIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)} • {file.type}
                    </Typography>
                    {uploadStatuses[index] && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadStatuses[index].progress}
                          color={uploadStatuses[index].status === 'error' ? 'error' : 'primary'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {uploadStatuses[index].status === 'uploading' && `${uploadStatuses[index].progress}%`}
                          {uploadStatuses[index].status === 'success' && 'Uploaded successfully'}
                          {uploadStatuses[index].status === 'error' && uploadStatuses[index].error}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                  >
                    <CloseIcon />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Grid>
        )}

        {/* Tags */}
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
          disabled={loading || (selectedFiles.length === 0 && !isEdit)}
        >
          {loading ? 'Uploading...' : (isEdit ? 'Update Document' : 'Upload Documents')}
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentUpload;