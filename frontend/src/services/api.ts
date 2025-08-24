/**
 * API Service Layer
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Centralized API service layer with authentication, HTTP client,
 * and request/response interceptors
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import logger from '@/utils/logger';
import { store } from '@/store';
import { clearAuth } from '@/store/slices/authSlice';
import { LoginCredentials, RegisterData, User, AuthTokens, ApiResponse } from '@/types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * HTTP Client Configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.tokens?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log API request
      logger.apiRequest(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        0, // Status will be logged in response interceptor
        0, // Duration will be calculated in response interceptor
        { headers: config.headers }
      );

      return config;
    },
    (error) => {
      logger.error('API request interceptor error', error, 'ApiService');
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful API response
      logger.apiRequest(
        response.config.method?.toUpperCase() || 'GET',
        response.config.url || '',
        response.status,
        Date.now() - (response.config.metadata?.startTime || Date.now()),
        { data: response.data }
      );
      
      return response;
    },
    async (error) => {
      // Log API error
      logger.error(
        `API Error: ${error.response?.status || 'Network Error'}`,
        error,
        'ApiService'
      );
      
      const originalRequest = error.config;

      // Handle 401 Unauthorized errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const state = store.getState();
          const refreshToken = state.auth.tokens?.refreshToken;

          if (refreshToken) {
            // Try to refresh the token
            const response = await client.post('/auth/refresh', {
              refreshToken,
            });

            const newTokens = response.data.data;
            store.dispatch(clearAuth()); // Clear old tokens
            store.dispatch({ type: 'auth/setTokens', payload: newTokens });

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, logout user
          store.dispatch(clearAuth());
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const errorMessage = error.response?.data?.error?.message || error.message || 'An error occurred';
      
      if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to perform this action.');
      } else if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Create API client instance
const apiClient = createApiClient();

/**
 * Authentication API Service
 */
export const authApi = {
  /**
   * User login
   * 
   * @param credentials - Login credentials
   * @returns Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * User registration
   * 
   * @param userData - Registration data
   * @returns Promise<ApiResponse<{ user: User; tokens: AuthTokens }>>
   */
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * User logout
   * 
   * @param refreshToken - Refresh token to invalidate
   * @returns Promise<ApiResponse<void>>
   */
  logout: async (refreshToken: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Refresh access token
   * 
   * @param refreshToken - Refresh token
   * @returns Promise<ApiResponse<AuthTokens>>
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<AuthTokens>> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get user profile
   * 
   * @returns Promise<ApiResponse<{ user: User }>>
   */
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   * 
   * @param profileData - Profile data to update
   * @returns Promise<ApiResponse<{ user: User }>>
   */
  updateProfile: async (profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  /**
   * Social authentication - Google
   * 
   * @returns void (redirects to Google OAuth)
   */
  googleAuth: (): void => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  },

  /**
   * Social authentication - LinkedIn
   * 
   * @returns void (redirects to LinkedIn OAuth)
   */
  linkedinAuth: (): void => {
    window.location.href = `${API_BASE_URL}/auth/linkedin`;
  },

  /**
   * Social authentication - Microsoft
   * 
   * @returns void (redirects to Microsoft OAuth)
   */
  microsoftAuth: (): void => {
    window.location.href = `${API_BASE_URL}/auth/microsoft`;
  },

  /**
   * Link social account
   * 
   * @param provider - Social provider
   * @param accessToken - OAuth access token
   * @param refreshToken - OAuth refresh token
   * @returns Promise<ApiResponse<any>>
   */
  linkSocialAccount: async (
    provider: string,
    accessToken: string,
    refreshToken: string
  ): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/auth/link-social', {
      provider,
      accessToken,
      refreshToken,
    });
    return response.data;
  },

  /**
   * Unlink social account
   * 
   * @param provider - Social provider
   * @returns Promise<ApiResponse<void>>
   */
  unlinkSocialAccount: async (provider: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/auth/unlink-social/${provider}`);
    return response.data;
  },
};

/**
 * Cases API Service
 */
export const casesApi = {
  /**
   * Get all cases
   * 
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any>>
   */
  getCases: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/cases', { params });
    return response.data;
  },

  /**
   * Get case by ID
   * 
   * @param id - Case ID
   * @returns Promise<ApiResponse<any>>
   */
  getCase: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/cases/${id}`);
    return response.data;
  },

  /**
   * Create new case
   * 
   * @param caseData - Case data
   * @returns Promise<ApiResponse<any>>
   */
  createCase: async (caseData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/cases', caseData);
    return response.data;
  },

  /**
   * Update case
   * 
   * @param id - Case ID
   * @param caseData - Case data
   * @returns Promise<ApiResponse<any>>
   */
  updateCase: async (id: string, caseData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/cases/${id}`, caseData);
    return response.data;
  },

  /**
   * Delete case
   * 
   * @param id - Case ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteCase: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/cases/${id}`);
    return response.data;
  },
};

/**
 * Clients API Service
 */
export const clientsApi = {
  /**
   * Get all clients
   * 
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any>>
   */
  getClients: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/clients', { params });
    return response.data;
  },

  /**
   * Get client by ID
   * 
   * @param id - Client ID
   * @returns Promise<ApiResponse<any>>
   */
  getClient: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  /**
   * Create new client
   * 
   * @param clientData - Client data
   * @returns Promise<ApiResponse<any>>
   */
  createClient: async (clientData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/clients', clientData);
    return response.data;
  },

  /**
   * Update client
   * 
   * @param id - Client ID
   * @param clientData - Client data
   * @returns Promise<ApiResponse<any>>
   */
  updateClient: async (id: string, clientData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/clients/${id}`, clientData);
    return response.data;
  },

  /**
   * Delete client
   * 
   * @param id - Client ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteClient: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },
};

/**
 * Documents API Service
 */
export const documentsApi = {
  /**
   * Get all documents
   * 
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any>>
   */
  getDocuments: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/documents', { params });
    return response.data;
  },

  /**
   * Get document by ID
   * 
   * @param id - Document ID
   * @returns Promise<ApiResponse<any>>
   */
  getDocument: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload document
   * 
   * @param formData - Form data with file
   * @returns Promise<ApiResponse<any>>
   */
  uploadDocument: async (formData: FormData): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete document
   * 
   * @param id - Document ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteDocument: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },
};

/**
 * Users API Service
 */
export const usersApi = {
  /**
   * Get all users
   * 
   * @param params - Query parameters
   * @returns Promise<ApiResponse<any>>
   */
  getUsers: async (params?: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns Promise<ApiResponse<any>>
   */
  getUser: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   * 
   * @param userData - User data
   * @returns Promise<ApiResponse<any>>
   */
  createUser: async (userData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  /**
   * Update user
   * 
   * @param id - User ID
   * @param userData - User data
   * @returns Promise<ApiResponse<any>>
   */
  updateUser: async (id: string, userData: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user
   * 
   * @param id - User ID
   * @returns Promise<ApiResponse<void>>
   */
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Get user activity
   * 
   * @param id - User ID
   * @returns Promise<ApiResponse<any>>
   */
  getUserActivity: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/users/${id}/activity`);
    return response.data;
  },

  /**
   * Get assignable roles
   * 
   * @returns Promise<ApiResponse<any>>
   */
  getAssignableRoles: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/users/assignable-roles');
    return response.data;
  },
};

/**
 * Dashboard API Service
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   * 
   * @returns Promise<ApiResponse<any>>
   */
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Get recent activities
   * 
   * @returns Promise<ApiResponse<any>>
   */
  getRecentActivities: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/dashboard/activities');
    return response.data;
  },
};

// Export the main API client for custom requests
export { apiClient };

// Export default API object
export default {
  auth: authApi,
  users: usersApi,
  cases: casesApi,
  clients: clientsApi,
  documents: documentsApi,
  dashboard: dashboardApi,
};