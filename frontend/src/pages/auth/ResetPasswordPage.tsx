/**
 * Reset Password Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Reset password page for setting new password after reset token
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { authApi } from '@/services/api';
import { toast } from 'react-hot-toast';

/**
 * Reset password form validation schema
 */
const resetPasswordSchema = yup.object().shape({
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password')
});

/**
 * Reset Password Page Component
 * 
 * @returns JSX.Element
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  /**
   * Validate reset token on component mount
   */
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setError('Invalid reset link. Please request a new password reset.');
        return;
      }

      try {
        // This would call the backend API to validate the token
        // await authApi.validateResetToken(token);
        
        // For now, simulate token validation
        await new Promise(resolve => setTimeout(resolve, 500));
        setTokenValid(true);
      } catch (error: any) {
        setTokenValid(false);
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    validateToken();
  }, [token]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: any) => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      // This would call the backend API to reset password
      // await authApi.resetPassword(token, data.password);
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      reset();
      toast.success('Password reset successfully!');
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to reset password');
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
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
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Validating reset link...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your new password
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
                Password reset successfully! You can now sign in with your new password.
              </Alert>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                fullWidth
              >
                Sign In
              </Button>
            </Box>
          ) : !tokenValid ? (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                Invalid or expired reset link. Please request a new password reset.
              </Alert>
              <Button
                component={Link}
                to="/auth/forgot-password"
                variant="contained"
                fullWidth
              >
                Request New Reset
              </Button>
            </Box>
          ) : (
            /* Reset Password Form */
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={loading}
                    sx={{ mb: 3 }}
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    disabled={loading}
                    sx={{ mb: 3 }}
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

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ResetPasswordPage;