/**
 * Authentication Hook
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Custom hook for authentication state management and operations
 */

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { RootState, AppDispatch } from '@/store';
import {
  selectAuth,
  selectUser,
  selectTokens,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  clearError,
} from '@/store/slices/authSlice';
import { LoginCredentials, RegisterData, User } from '@/types';

/**
 * Custom hook for authentication management
 * 
 * @returns Authentication state and operations
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  // Select authentication state from Redux store
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const tokens = useSelector(selectTokens);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  /**
   * Login function
   * 
   * @param credentials - Login credentials
   * @returns Promise<void>
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await dispatch(login(credentials)).unwrap();
      toast.success('Login successful!');
      
      // Redirect to intended page or dashboard
      const intendedPath = location.state?.from || '/dashboard';
      navigate(intendedPath, { replace: true });
    } catch (error) {
      toast.error(error as string);
    }
  };

  /**
   * Register function
   * 
   * @param userData - Registration data
   * @returns Promise<void>
   */
  const handleRegister = async (userData: RegisterData) => {
    try {
      await dispatch(register(userData)).unwrap();
      toast.success('Registration successful! Welcome to RAGHUU CO.');
      
      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error as string);
    }
  };

  /**
   * Logout function
   * 
   * @returns Promise<void>
   */
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/auth/login', { replace: true });
    } catch (error) {
      // Still logout locally even if API call fails
      toast.error('Logout failed, but you have been logged out locally');
      navigate('/auth/login', { replace: true });
    }
  };

  /**
   * Refresh token function
   * 
   * @returns Promise<void>
   */
  const handleRefreshToken = async () => {
    try {
      await dispatch(refreshToken()).unwrap();
    } catch (error) {
      // If refresh fails, logout user
      await handleLogout();
    }
  };

  /**
   * Get user profile function
   * 
   * @returns Promise<void>
   */
  const handleGetProfile = async () => {
    try {
      await dispatch(getProfile()).unwrap();
    } catch (error) {
      toast.error(error as string);
    }
  };

  /**
   * Update user profile function
   * 
   * @param profileData - Profile data to update
   * @returns Promise<void>
   */
  const handleUpdateProfile = async (profileData: Partial<User>) => {
    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error as string);
    }
  };

  /**
   * Clear error function
   */
  const handleClearError = () => {
    dispatch(clearError());
  };

  /**
   * Check if user has specific role
   * 
   * @param role - Role to check
   * @returns boolean
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * 
   * @param roles - Array of roles to check
   * @returns boolean
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user?.role || '');
  };

  /**
   * Check if user has all of the specified roles
   * 
   * @param roles - Array of roles to check
   * @returns boolean
   */
  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every((role) => user?.role === role);
  };

  /**
   * Get user's full name
   * 
   * @returns string
   */
  const getFullName = (): string => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  };

  /**
   * Get user's initials
   * 
   * @returns string
   */
  const getInitials = (): string => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  /**
   * Check if user is admin
   * 
   * @returns boolean
   */
  const isAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  /**
   * Check if user is partner
   * 
   * @returns boolean
   */
  const isPartner = (): boolean => {
    return hasRole('partner');
  };

  /**
   * Check if user is associate
   * 
   * @returns boolean
   */
  const isAssociate = (): boolean => {
    return hasAnyRole(['senior_associate', 'junior_associate']);
  };

  /**
   * Check if user is client
   * 
   * @returns boolean
   */
  const isClient = (): boolean => {
    return hasRole('client');
  };

  /**
   * Check if user can manage cases
   * 
   * @returns boolean
   */
  const canManageCases = (): boolean => {
    return hasAnyRole(['super_admin', 'partner', 'senior_associate', 'junior_associate']);
  };

  /**
   * Check if user can manage clients
   * 
   * @returns boolean
   */
  const canManageClients = (): boolean => {
    return hasAnyRole(['super_admin', 'partner', 'senior_associate']);
  };

  /**
   * Check if user can manage users
   * 
   * @returns boolean
   */
  const canManageUsers = (): boolean => {
    return hasAnyRole(['super_admin', 'partner']);
  };

  /**
   * Check if user can view billing
   * 
   * @returns boolean
   */
  const canViewBilling = (): boolean => {
    return hasAnyRole(['super_admin', 'partner', 'senior_associate']);
  };

  /**
   * Check if user can manage billing
   * 
   * @returns boolean
   */
  const canManageBilling = (): boolean => {
    return hasAnyRole(['super_admin', 'partner']);
  };

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!tokens?.accessToken) return;

    const tokenExpiration = getTokenExpiration(tokens.accessToken);
    const now = Date.now();
    const timeUntilExpiry = tokenExpiration - now;

    // Refresh token 5 minutes before it expires
    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
      const refreshTimeout = setTimeout(() => {
        handleRefreshToken();
      }, timeUntilExpiry - 5 * 60 * 1000);

      return () => clearTimeout(refreshTimeout);
    }
  }, [tokens?.accessToken]);

  // Auto-refresh token on mount if needed
  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      const tokenExpiration = getTokenExpiration(tokens.accessToken);
      const now = Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (tokenExpiration - now < 5 * 60 * 1000) {
        handleRefreshToken();
      }
    }
  }, [isAuthenticated]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    getProfile: handleGetProfile,
    updateProfile: handleUpdateProfile,
    clearError: handleClearError,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // User info
    getFullName,
    getInitials,
    
    // Permission checks
    isAdmin,
    isPartner,
    isAssociate,
    isClient,
    canManageCases,
    canManageClients,
    canManageUsers,
    canViewBilling,
    canManageBilling,
  };
};

/**
 * Get token expiration time
 * 
 * @param token - JWT token
 * @returns number - Expiration timestamp
 */
const getTokenExpiration = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return 0;
  }
};

export default useAuth;