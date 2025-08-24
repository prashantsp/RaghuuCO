/**
 * Login Page Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Login page with email/password authentication and social login options
 */

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  LinkedIn,
  Microsoft,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/api';
import { LoginCredentials } from '@/types';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
}).required();

/**
 * Login Page Component
 * 
 * @returns JSX.Element
 */
const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the useAuth hook
    }
  };

  // Handle social authentication
  const handleSocialAuth = async (provider: string) => {
    setSocialLoading(provider);
    try {
      switch (provider) {
        case 'google':
          authApi.googleAuth();
          break;
        case 'linkedin':
          authApi.linkedinAuth();
          break;
        case 'microsoft':
          authApi.microsoftAuth();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`${provider} authentication failed:`, error);
    } finally {
      setSocialLoading(null);
    }
  };

  // Handle password visibility toggle
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clear error when component mounts
  React.useEffect(() => {
    clearError();
  }, []);

  return (
    <>
      <Helmet>
        <title>Login - RAGHUU CO Legal Practice Management</title>
        <meta name="description" content="Sign in to your RAGHUU CO legal practice management account" />
      </Helmet>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* Forgot Password Link */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Link
            component={RouterLink}
            to="/auth/forgot-password"
            variant="body2"
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot your password?
          </Link>
        </Box>

        {/* Login Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || isSubmitting}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}
        >
          {isLoading || isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Sign In'
          )}
        </Button>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {/* Social Login Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Google */}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => handleSocialAuth('google')}
            disabled={socialLoading !== null}
            startIcon={
              socialLoading === 'google' ? (
                <CircularProgress size={20} />
              ) : (
                <Google />
              )
            }
            sx={{
              borderColor: '#db4437',
              color: '#db4437',
              '&:hover': {
                borderColor: '#c23321',
                backgroundColor: 'rgba(219, 68, 55, 0.04)',
              },
            }}
          >
            Continue with Google
          </Button>

          {/* LinkedIn */}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => handleSocialAuth('linkedin')}
            disabled={socialLoading !== null}
            startIcon={
              socialLoading === 'linkedin' ? (
                <CircularProgress size={20} />
              ) : (
                <LinkedIn />
              )
            }
            sx={{
              borderColor: '#0077b5',
              color: '#0077b5',
              '&:hover': {
                borderColor: '#005885',
                backgroundColor: 'rgba(0, 119, 181, 0.04)',
              },
            }}
          >
            Continue with LinkedIn
          </Button>

          {/* Microsoft */}
          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => handleSocialAuth('microsoft')}
            disabled={socialLoading !== null}
            startIcon={
              socialLoading === 'microsoft' ? (
                <CircularProgress size={20} />
              ) : (
                <Microsoft />
              )
            }
            sx={{
              borderColor: '#00a1f1',
              color: '#00a1f1',
              '&:hover': {
                borderColor: '#0078d4',
                backgroundColor: 'rgba(0, 161, 241, 0.04)',
              },
            }}
          >
            Continue with Microsoft 365
          </Button>
        </Box>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/auth/register"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>

        {/* Terms and Privacy */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Privacy Policy
            </Link>
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;