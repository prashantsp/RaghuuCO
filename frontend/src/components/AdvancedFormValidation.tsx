/**
 * Advanced Form Validation Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 *
 * @description This component provides advanced form validation capabilities
 * including real-time validation, custom validation rules, error handling,
 * and accessibility features for enhanced user experience.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Chip,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  CircularProgress,
  Tooltip,
  IconButton,
  useTheme,
  styled
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Visibility,
  VisibilityOff,
  Refresh,
  Save,
  Send,
  Clear,
  Help,
  Validation,
  Security,
  Speed,
  Accuracy,
  Accessibility,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Send as SendIcon,
  Clear as ClearIcon,
  Help as HelpIcon,
  Validation as ValidationIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Accuracy as AccuracyIcon,
  Accessibility as AccessibilityIcon
} from '@mui/icons-material';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * Validation rule interface
 */
interface ValidationRule {
  name: string;
  test: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  async?: boolean;
}

/**
 * Field validation interface
 */
interface FieldValidation {
  value: any;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  isDirty: boolean;
  isTouched: boolean;
  isFocused: boolean;
  isAsyncValidating: boolean;
  lastValidated: Date | null;
}

/**
 * Form validation interface
 */
interface FormValidation {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
  info: Record<string, string[]>;
  validationCount: number;
  lastValidated: Date | null;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

/**
 * Styled components
 */
const ValidationIndicator = styled(Box)<{ status: 'valid' | 'invalid' | 'warning' | 'info' | 'none' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'valid': return theme.palette.success.light;
      case 'invalid': return theme.palette.error.light;
      case 'warning': return theme.palette.warning.light;
      case 'info': return theme.palette.info.light;
      default: return 'transparent';
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'valid': return theme.palette.success.contrastText;
      case 'invalid': return theme.palette.error.contrastText;
      case 'warning': return theme.palette.warning.contrastText;
      case 'info': return theme.palette.info.contrastText;
      default: return theme.palette.text.secondary;
    }
  }};
`;

const ValidationProgress = styled(LinearProgress)<{ validationCount: number }>`
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.palette.grey[200]};
  
  .MuiLinearProgress-bar {
    background-color: ${({ validationCount, theme }) => {
      if (validationCount === 0) return theme.palette.grey[400];
      if (validationCount < 3) return theme.palette.warning.main;
      if (validationCount < 5) return theme.palette.info.main;
      return theme.palette.success.main;
    }};
  }
`;

/**
 * Advanced Form Validation Component
 */
export const AdvancedFormValidation: React.FC = () => {
  const theme = useTheme();
  const { announceToScreenReader } = useAccessibility();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    role: '',
    department: '',
    agreeToTerms: false,
    newsletter: false,
    notifications: 'email',
    priority: 'medium'
  });

  // Field validation states
  const [fieldValidation, setFieldValidation] = useState<Record<string, FieldValidation>>({
    firstName: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    },
    lastName: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    },
    email: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    },
    password: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    },
    confirmPassword: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    },
    phone: {
      value: '',
      isValid: false,
      errors: [],
      warnings: [],
      info: [],
      isDirty: false,
      isTouched: false,
      isFocused: false,
      isAsyncValidating: false,
      lastValidated: null
    }
  });

  // Form validation state
  const [formValidation, setFormValidation] = useState<FormValidation>({
    isValid: false,
    isDirty: false,
    isSubmitting: false,
    errors: {},
    warnings: {},
    info: {},
    validationCount: 0,
    lastValidated: null
  });

  // Validation rules
  const validationRules: Record<string, ValidationRule[]> = {
    firstName: [
      {
        name: 'required',
        test: (value) => value.trim().length > 0,
        message: 'First name is required',
        severity: 'error'
      },
      {
        name: 'minLength',
        test: (value) => value.trim().length >= 2,
        message: 'First name must be at least 2 characters',
        severity: 'error'
      },
      {
        name: 'maxLength',
        test: (value) => value.trim().length <= 50,
        message: 'First name must be less than 50 characters',
        severity: 'warning'
      },
      {
        name: 'alphaOnly',
        test: (value) => /^[a-zA-Z\s]+$/.test(value),
        message: 'First name should contain only letters',
        severity: 'warning'
      }
    ],
    lastName: [
      {
        name: 'required',
        test: (value) => value.trim().length > 0,
        message: 'Last name is required',
        severity: 'error'
      },
      {
        name: 'minLength',
        test: (value) => value.trim().length >= 2,
        message: 'Last name must be at least 2 characters',
        severity: 'error'
      },
      {
        name: 'maxLength',
        test: (value) => value.trim().length <= 50,
        message: 'Last name must be less than 50 characters',
        severity: 'warning'
      }
    ],
    email: [
      {
        name: 'required',
        test: (value) => value.trim().length > 0,
        message: 'Email is required',
        severity: 'error'
      },
      {
        name: 'emailFormat',
        test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address',
        severity: 'error'
      },
      {
        name: 'domainCheck',
        test: (value) => !value.includes('temp') && !value.includes('test'),
        message: 'Please use a valid email domain',
        severity: 'warning'
      },
      {
        name: 'asyncEmailCheck',
        test: async (value) => {
          // Simulate async email validation
          await new Promise(resolve => setTimeout(resolve, 1000));
          return !value.includes('blocked');
        },
        message: 'This email domain is not allowed',
        severity: 'error',
        async: true
      }
    ],
    password: [
      {
        name: 'required',
        test: (value) => value.length > 0,
        message: 'Password is required',
        severity: 'error'
      },
      {
        name: 'minLength',
        test: (value) => value.length >= 8,
        message: 'Password must be at least 8 characters',
        severity: 'error'
      },
      {
        name: 'hasUpperCase',
        test: (value) => /[A-Z]/.test(value),
        message: 'Password must contain at least one uppercase letter',
        severity: 'error'
      },
      {
        name: 'hasLowerCase',
        test: (value) => /[a-z]/.test(value),
        message: 'Password must contain at least one lowercase letter',
        severity: 'error'
      },
      {
        name: 'hasNumber',
        test: (value) => /\d/.test(value),
        message: 'Password must contain at least one number',
        severity: 'error'
      },
      {
        name: 'hasSpecialChar',
        test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
        message: 'Password must contain at least one special character',
        severity: 'warning'
      },
      {
        name: 'strength',
        test: (value) => {
          const hasUpper = /[A-Z]/.test(value);
          const hasLower = /[a-z]/.test(value);
          const hasNumber = /\d/.test(value);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          const length = value.length >= 8;
          return [hasUpper, hasLower, hasNumber, hasSpecial, length].filter(Boolean).length >= 4;
        },
        message: 'Password strength: Strong',
        severity: 'info'
      }
    ],
    confirmPassword: [
      {
        name: 'required',
        test: (value) => value.length > 0,
        message: 'Please confirm your password',
        severity: 'error'
      },
      {
        name: 'matchPassword',
        test: (value) => value === formData.password,
        message: 'Passwords do not match',
        severity: 'error'
      }
    ],
    phone: [
      {
        name: 'phoneFormat',
        test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
        message: 'Please enter a valid phone number',
        severity: 'error'
      }
    ]
  };

  // Validate field
  const validateField = useCallback(async (fieldName: string, value: any): Promise<ValidationResult> => {
    const rules = validationRules[fieldName] || [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const info: string[] = [];

    for (const rule of rules) {
      try {
        const isValid = await rule.test(value);
        if (!isValid) {
          switch (rule.severity) {
            case 'error':
              errors.push(rule.message);
              break;
            case 'warning':
              warnings.push(rule.message);
              break;
            case 'info':
              info.push(rule.message);
              break;
          }
        }
      } catch (error) {
        logger.error(`Error validating field ${fieldName}:`, error as Error);
        errors.push('Validation error occurred');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }, [validationRules, formData.password]);

  // Handle field change
  const handleFieldChange = useCallback(async (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        isDirty: true,
        isAsyncValidating: true
      }
    }));

    // Debounced validation
    const timeoutId = setTimeout(async () => {
      const validation = await validateField(fieldName, value);
      
      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          ...validation,
          isAsyncValidating: false,
          lastValidated: new Date()
        }
      }));

      // Update form validation
      updateFormValidation();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [validateField]);

  // Handle field focus
  const handleFieldFocus = useCallback((fieldName: string) => {
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isFocused: true
      }
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback(async (fieldName: string) => {
    const field = fieldValidation[fieldName];
    if (field && field.isDirty) {
      const validation = await validateField(fieldName, field.value);
      
      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          ...validation,
          isTouched: true,
          isFocused: false,
          lastValidated: new Date()
        }
      }));

      updateFormValidation();
    }
  }, [fieldValidation, validateField]);

  // Update form validation
  const updateFormValidation = useCallback(() => {
    const errors: Record<string, string[]> = {};
    const warnings: Record<string, string[]> = {};
    const info: Record<string, string[]> = {};
    let isValid = true;
    let isDirty = false;
    let validationCount = 0;

    Object.entries(fieldValidation).forEach(([fieldName, field]) => {
      if (field.errors.length > 0) {
        errors[fieldName] = field.errors;
        isValid = false;
      }
      if (field.warnings.length > 0) {
        warnings[fieldName] = field.warnings;
      }
      if (field.info.length > 0) {
        info[fieldName] = field.info;
      }
      if (field.isDirty) {
        isDirty = true;
      }
      if (field.lastValidated) {
        validationCount++;
      }
    });

    setFormValidation(prev => ({
      ...prev,
      isValid,
      isDirty,
      errors,
      warnings,
      info,
      validationCount,
      lastValidated: new Date()
    }));
  }, [fieldValidation]);

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    setFormValidation(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validate all fields
      const validations = await Promise.all(
        Object.keys(formData).map(async (fieldName) => {
          const validation = await validateField(fieldName, formData[fieldName as keyof typeof formData]);
          return { fieldName, validation };
        })
      );

      // Check if all validations pass
      const allValid = validations.every(({ validation }) => validation.isValid);
      
      if (allValid) {
        announceToScreenReader('Form submitted successfully');
        showSnackbar('Form submitted successfully!', 'success');
        logger.info('Form submitted successfully', { formData });
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          company: '',
          role: '',
          department: '',
          agreeToTerms: false,
          newsletter: false,
          notifications: 'email',
          priority: 'medium'
        });
        
        setFieldValidation({});
        setCurrentStep(0);
      } else {
        announceToScreenReader('Form has validation errors');
        showSnackbar('Please fix validation errors before submitting', 'error');
        logger.warn('Form submission failed due to validation errors');
      }
    } catch (error) {
      logger.error('Error submitting form:', error as Error);
      showSnackbar('Error submitting form', 'error');
    } finally {
      setFormValidation(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formData, validateField, announceToScreenReader]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      company: '',
      role: '',
      department: '',
      agreeToTerms: false,
      newsletter: false,
      notifications: 'email',
      priority: 'medium'
    });
    
    setFieldValidation({});
    setCurrentStep(0);
    announceToScreenReader('Form reset');
    showSnackbar('Form reset successfully', 'info');
  }, [announceToScreenReader]);

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Close snackbar
  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Get field status
  const getFieldStatus = useCallback((fieldName: string) => {
    const field = fieldValidation[fieldName];
    if (!field) return 'none';
    
    if (field.errors.length > 0) return 'invalid';
    if (field.warnings.length > 0) return 'warning';
    if (field.info.length > 0) return 'info';
    if (field.isValid) return 'valid';
    return 'none';
  }, [fieldValidation]);

  // Get validation progress
  const getValidationProgress = useCallback(() => {
    const totalFields = Object.keys(validationRules).length;
    const validatedFields = Object.values(fieldValidation).filter(field => field.lastValidated).length;
    return (validatedFields / totalFields) * 100;
  }, [fieldValidation, validationRules]);

  const steps = [
    'Personal Information',
    'Account Details',
    'Preferences',
    'Review & Submit'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advanced Form Validation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Experience real-time validation with custom rules, accessibility features,
        and comprehensive error handling for enhanced user experience.
      </Typography>

      {/* Validation Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Validation Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(getValidationProgress())}% Complete
            </Typography>
          </Box>
          
          <ValidationProgress 
            variant="determinate" 
            value={getValidationProgress()}
            validationCount={formValidation.validationCount}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Fields Validated: {formValidation.validationCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Form Status: {formValidation.isValid ? 'Valid' : 'Invalid'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stepper activeStep={currentStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                  <StepContent>
                    {index === 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="First Name"
                          value={formData.firstName}
                          onChange={(e) => handleFieldChange('firstName', e.target.value)}
                          onFocus={() => handleFieldFocus('firstName')}
                          onBlur={() => handleFieldBlur('firstName')}
                          error={getFieldStatus('firstName') === 'invalid'}
                          helperText={fieldValidation.firstName?.errors[0] || fieldValidation.firstName?.warnings[0] || fieldValidation.firstName?.info[0]}
                          fullWidth
                        />
                        
                        <TextField
                          label="Last Name"
                          value={formData.lastName}
                          onChange={(e) => handleFieldChange('lastName', e.target.value)}
                          onFocus={() => handleFieldFocus('lastName')}
                          onBlur={() => handleFieldBlur('lastName')}
                          error={getFieldStatus('lastName') === 'invalid'}
                          helperText={fieldValidation.lastName?.errors[0] || fieldValidation.lastName?.warnings[0]}
                          fullWidth
                        />
                        
                        <TextField
                          label="Phone Number"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          onFocus={() => handleFieldFocus('phone')}
                          onBlur={() => handleFieldBlur('phone')}
                          error={getFieldStatus('phone') === 'invalid'}
                          helperText={fieldValidation.phone?.errors[0]}
                          fullWidth
                        />
                      </Box>
                    )}
                    
                    {index === 1 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFieldChange('email', e.target.value)}
                          onFocus={() => handleFieldFocus('email')}
                          onBlur={() => handleFieldBlur('email')}
                          error={getFieldStatus('email') === 'invalid'}
                          helperText={fieldValidation.email?.errors[0] || fieldValidation.email?.warnings[0]}
                          fullWidth
                        />
                        
                        <TextField
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => handleFieldChange('password', e.target.value)}
                          onFocus={() => handleFieldFocus('password')}
                          onBlur={() => handleFieldBlur('password')}
                          error={getFieldStatus('password') === 'invalid'}
                          helperText={fieldValidation.password?.errors[0] || fieldValidation.password?.warnings[0] || fieldValidation.password?.info[0]}
                          InputProps={{
                            endAdornment: (
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            )
                          }}
                          fullWidth
                        />
                        
                        <TextField
                          label="Confirm Password"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                          onFocus={() => handleFieldFocus('confirmPassword')}
                          onBlur={() => handleFieldBlur('confirmPassword')}
                          error={getFieldStatus('confirmPassword') === 'invalid'}
                          helperText={fieldValidation.confirmPassword?.errors[0]}
                          fullWidth
                        />
                      </Box>
                    )}
                    
                    {index === 2 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                          <InputLabel>Notifications</InputLabel>
                          <Select
                            value={formData.notifications}
                            onChange={(e) => setFormData(prev => ({ ...prev, notifications: e.target.value }))}
                            label="Notifications"
                          >
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="sms">SMS</MenuItem>
                            <MenuItem value="push">Push</MenuItem>
                            <MenuItem value="none">None</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <FormControl fullWidth>
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={formData.priority}
                            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                            label="Priority"
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                        
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.newsletter}
                              onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                            />
                          }
                          label="Subscribe to newsletter"
                        />
                      </Box>
                    )}
                    
                    {index === 3 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Review Your Information
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                          <Box>
                            <Typography variant="subtitle2">Personal Information</Typography>
                            <Typography variant="body2">Name: {formData.firstName} {formData.lastName}</Typography>
                            <Typography variant="body2">Phone: {formData.phone}</Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2">Account Details</Typography>
                            <Typography variant="body2">Email: {formData.email}</Typography>
                            <Typography variant="body2">Password: {'*'.repeat(formData.password.length)}</Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2">Preferences</Typography>
                            <Typography variant="body2">Notifications: {formData.notifications}</Typography>
                            <Typography variant="body2">Priority: {formData.priority}</Typography>
                            <Typography variant="body2">Newsletter: {formData.newsletter ? 'Yes' : 'No'}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        disabled={currentStep === steps.length - 1}
                        sx={{ mr: 1 }}
                      >
                        {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentStep((prev) => prev - 1)}
                        disabled={currentStep === 0}
                      >
                        Back
                      </Button>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={!formValidation.isValid || formValidation.isSubmitting}
              >
                {formValidation.isSubmitting ? 'Submitting...' : 'Submit Form'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={resetForm}
              >
                Reset Form
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={() => setCurrentStep(0)}
              >
                Start Over
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {Object.keys(formValidation.errors).length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Validation Errors
            </Typography>
            
            {Object.entries(formValidation.errors).map(([fieldName, errors]) => (
              <Alert key={fieldName} severity="error" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">{fieldName}:</Typography>
                {errors.map((error, index) => (
                  <Typography key={index} variant="body2">• {error}</Typography>
                ))}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};