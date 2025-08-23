/**
 * Not Found Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description 404 error page for handling not found routes
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
  Home as HomeIcon,
  Search as SearchIcon
} from '@mui/icons-material';

/**
 * Not Found Page Component
 * 
 * @returns JSX.Element
 */
const NotFoundPage: React.FC = () => {
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
            {/* 404 Icon */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h1"
                component="div"
                sx={{
                  fontSize: '8rem',
                  fontWeight: 'bold',
                  color: 'primary.main',
                  lineHeight: 1
                }}
              >
                404
              </Typography>
            </Box>

            {/* Error Message */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Page Not Found
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or navigate back to the dashboard.
            </Typography>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/dashboard"
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
              >
                Go to Dashboard
              </Button>
              
              <Button
                component={Link}
                to="/cases"
                variant="outlined"
                size="large"
                startIcon={<SearchIcon />}
              >
                Browse Cases
              </Button>
            </Box>

            {/* Additional Help */}
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                If you believe this is an error, please contact support.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default NotFoundPage;