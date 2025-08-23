/**
 * Unauthorized Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description 401/403 error page for handling unauthorized access
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container
} from '@mui/material';
import {
  Security as SecurityIcon,
  Login as LoginIcon,
  Home as HomeIcon
} from '@mui/icons-material';

/**
 * Unauthorized Page Component
 * 
 * @returns JSX.Element
 */
const UnauthorizedPage: React.FC = () => {
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
      <Container maxWidth="md">
        <Card sx={{ textAlign: 'center', boxShadow: 3 }}>
          <CardContent sx={{ p: 6 }}>
            {/* Security Icon */}
            <Box sx={{ mb: 4 }}>
              <SecurityIcon
                sx={{
                  fontSize: '6rem',
                  color: 'error.main',
                  mb: 2
                }}
              />
            </Box>

            {/* Error Message */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Access Denied
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              You don't have permission to access this page. Please sign in with an account 
              that has the required permissions or contact your administrator.
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/auth/login"
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
              >
                Sign In
              </Button>
              
              <Button
                component={Link}
                to="/dashboard"
                variant="outlined"
                size="large"
                startIcon={<HomeIcon />}
              >
                Go to Dashboard
              </Button>
            </Box>

            {/* Additional Help */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                If you believe you should have access to this page, please contact your system administrator.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default UnauthorizedPage;