/**
 * Authentication Layout Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Authentication layout component for login, register, and password reset pages
 */

import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { LayoutProps } from '@/types';

/**
 * Authentication Layout Component
 * 
 * @param props - Layout props
 * @returns JSX.Element
 */
const AuthLayout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          {/* Logo and Brand */}
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'white',
              color: theme.palette.primary.main,
              mb: 2,
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            RC
          </Avatar>
          
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 1,
            }}
          >
            RAGHUU CO
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              opacity: 0.9,
              textAlign: 'center',
              mb: 3,
            }}
          >
            Legal Practice Management System
          </Typography>
        </Box>

        {/* Auth Form Container */}
        <Paper
          elevation={24}
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Form Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
                mb: 2,
              }}
            >
              <LockOutlined />
            </Avatar>
            
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                textAlign: 'center',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: 'center',
              }}
            >
              Sign in to access your legal practice management dashboard
            </Typography>
          </Box>

          {/* Auth Form Content */}
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              © 2025 RAGHUU CO. All rights reserved.
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
                display: 'block',
                mt: 1,
              }}
            >
              Version 1.0.0
            </Typography>
          </Box>
        </Paper>

        {/* Additional Info */}
        <Box
          sx={{
            mt: 4,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              opacity: 0.8,
            }}
          >
            Secure • Reliable • Professional
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;