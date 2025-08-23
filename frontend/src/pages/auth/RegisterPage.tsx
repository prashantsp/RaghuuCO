/**
 * Register Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description User registration page with form validation and social login options
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Google as GoogleIcon,
  LinkedIn as LinkedInIcon,
  Microsoft as MicrosoftIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { toast } from 'react-hot-toast';

/**
 * Registration form validation schema
 */
const registerSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
  phone: yup.string().matches(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number'),
  role: yup.string().required('Role is required')
});

/**
 * Register Page Component
 * 
 * @returns JSX.Element
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: ''
    }
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError('');

      // Remove confirmPassword from data
      const { confirmPassword, ...registerData } = data;

      await registerUser(registerData);
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/auth/login');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Registration failed');
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle social login
   */
  const handleSocialLogin = (provider: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${baseUrl}/auth/${provider}`;
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
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join RAGHUU CO Legal Practice Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
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

              <Grid item xs={12}>
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
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Button>
                        )
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <Button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            sx={{ minWidth: 'auto', p: 1 }}
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </Button>
                        )
                      }}
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
                        <MenuItem value="client">Client</MenuItem>
                        <MenuItem value="guest">Guest</MenuItem>
                      </Select>
                      {errors.role && (
                        <FormHelperText>{errors.role.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Social Login Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LinkedInIcon />}
              onClick={() => handleSocialLogin('linkedin')}
              disabled={loading}
            >
              Continue with LinkedIn
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<MicrosoftIcon />}
              onClick={() => handleSocialLogin('microsoft')}
              disabled={loading}
            >
              Continue with Microsoft 365
            </Button>
          </Box>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
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
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;