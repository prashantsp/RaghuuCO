/**
 * Forgot Password Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Forgot password page for password reset functionality
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '@/services/api';
import { toast } from 'react-hot-toast';

/**
 * Forgot password form validation schema
 */
const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required')
});

/**
 * Forgot Password Page Component
 * 
 * @returns JSX.Element
 */
const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      // This would call the backend API for password reset
      // await authApi.forgotPassword(data.email);
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      reset();
      toast.success('Password reset email sent successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to send reset email');
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Forgot Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email address to reset your password
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 3 }}>
                Password reset email sent successfully! Please check your email for further instructions.
              </Alert>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                fullWidth
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            /* Forgot Password Form */
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={loading}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Reset Email'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Remember your password?{' '}
                  <Link to="/auth/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    >
                      Sign In
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;