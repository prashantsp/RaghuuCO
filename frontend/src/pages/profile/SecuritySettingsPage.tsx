/**
 * Security Settings Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Security settings page for managing 2FA, password, and security preferences
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  QRCode,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { api } from '@/services/api';
import QRCode from 'qrcode';
import logger from '@/utils/logger';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  backupCodes: string[];
  sessionTimeout: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string;
  passwordExpiryDays: number;
}

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

const SecuritySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [twoFactorDialog, setTwoFactorDialog] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch security settings
  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/security/2fa/status');
      setSettings(response.data.data);
    } catch (error) {
      logger.error('Error fetching security settings', error, 'SecuritySettingsPage');
      setError('Failed to fetch security settings');
      toast.error('Failed to fetch security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  // Handle 2FA setup
  const handle2FASetup = async () => {
    try {
      setSaving(true);
      const response = await api.post('/security/2fa/setup');
      setTwoFactorSetup(response.data.data);
      setTwoFactorDialog(true);
      setActiveStep(0);
    } catch (error) {
      logger.error('Error setting up 2FA', error, 'SecuritySettingsPage');
      toast.error('Failed to setup 2FA');
    } finally {
      setSaving(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async () => {
    try {
      setSaving(true);
      await api.post('/security/2fa/verify', {
        totpToken: verificationCode
      });
      
      toast.success('Two-factor authentication enabled successfully');
      setTwoFactorDialog(false);
      setVerificationCode('');
      fetchSecuritySettings();
    } catch (error) {
      logger.error('Error verifying 2FA', error, 'SecuritySettingsPage');
      toast.error('Invalid verification code');
    } finally {
      setSaving(false);
    }
  };

  // Handle 2FA disable
  const handle2FADisable = async () => {
    try {
      setSaving(true);
      await api.post('/security/2fa/disable', {
        totpToken: verificationCode
      });
      
      toast.success('Two-factor authentication disabled successfully');
      setVerificationCode('');
      fetchSecuritySettings();
    } catch (error) {
      logger.error('Error disabling 2FA', error, 'SecuritySettingsPage');
      toast.error('Failed to disable 2FA');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      setSaving(true);
      await api.put('/users/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      logger.error('Error changing password', error, 'SecuritySettingsPage');
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle settings update
  const handleSettingsUpdate = async (updates: Partial<SecuritySettings>) => {
    try {
      setSaving(true);
      await api.put('/security/settings', updates);
      
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Security settings updated successfully');
    } catch (error) {
      logger.error('Error updating security settings', error, 'SecuritySettingsPage');
      toast.error('Failed to update security settings');
    } finally {
      setSaving(false);
    }
  };

  // Generate new backup codes
  const generateBackupCodes = async () => {
    try {
      setSaving(true);
      const response = await api.post('/security/2fa/backup-codes');
      setSettings(prev => prev ? { ...prev, backupCodes: response.data.data.backupCodes } : null);
      toast.success('New backup codes generated');
    } catch (error) {
      logger.error('Error generating backup codes', error, 'SecuritySettingsPage');
      toast.error('Failed to generate backup codes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
        <Typography variant="h4" component="h1">
          Security Settings
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Two-Factor Authentication */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <KeyIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Two-Factor Authentication
                </Typography>
                <Chip
                  label={settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  color={settings?.twoFactorEnabled ? 'success' : 'default'}
                  size="small"
                  sx={{ ml: 'auto' }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add an extra layer of security to your account by enabling two-factor authentication.
              </Typography>

              {settings?.twoFactorEnabled ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Two-factor authentication is enabled for your account.
                  </Alert>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setTwoFactorDialog(true)}
                    disabled={saving}
                  >
                    Disable 2FA
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  onClick={handle2FASetup}
                  disabled={saving}
                >
                  Enable 2FA
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Password Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Password Management
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Last changed: {settings?.lastPasswordChange ? new Date(settings.lastPasswordChange).toLocaleDateString() : 'Never'}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Session Management
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.sessionTimeout === 30}
                    onChange={(e) => handleSettingsUpdate({ sessionTimeout: e.target.checked ? 30 : 60 })}
                    disabled={saving}
                  />
                }
                label="Auto-logout after 30 minutes of inactivity"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">
                  Notification Preferences
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.emailNotifications}
                    onChange={(e) => handleSettingsUpdate({ emailNotifications: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Email notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.smsNotifications}
                    onChange={(e) => handleSettingsUpdate({ smsNotifications: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="SMS notifications"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.loginAlerts}
                    onChange={(e) => handleSettingsUpdate({ loginAlerts: e.target.checked })}
                    disabled={saving}
                  />
                }
                label="Login alerts"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Backup Codes */}
        {settings?.twoFactorEnabled && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QrCodeIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">
                    Backup Codes
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={generateBackupCodes}
                    disabled={saving}
                    sx={{ ml: 'auto' }}
                  >
                    Generate New Codes
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Keep these backup codes in a safe place. You can use them to access your account if you lose your 2FA device.
                </Typography>

                {settings.backupCodes && settings.backupCodes.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {settings.backupCodes.map((code, index) => (
                      <Chip
                        key={index}
                        label={code}
                        variant="outlined"
                        size="small"
                        fontFamily="monospace"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 2FA Setup Dialog */}
      <Dialog open={twoFactorDialog} onClose={() => setTwoFactorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {settings?.twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Setup Two-Factor Authentication'}
        </DialogTitle>
        <DialogContent>
          {!settings?.twoFactorEnabled && twoFactorSetup && (
            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
              <Step>
                <StepLabel>Scan QR Code</StepLabel>
              </Step>
              <Step>
                <StepLabel>Verify Code</StepLabel>
              </Step>
              <Step>
                <StepLabel>Complete</StepLabel>
              </Step>
            </Stepper>
          )}

          {!settings?.twoFactorEnabled && twoFactorSetup && activeStep === 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
              </Typography>
                             <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                 <img 
                   src={twoFactorSetup.qrCode} 
                   alt="QR Code" 
                   style={{ width: 200, height: 200 }}
                 />
               </Box>
              <Typography variant="body2" color="text.secondary">
                Secret key: {twoFactorSetup.secret}
              </Typography>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
                sx={{ mt: 2 }}
              >
                Next
              </Button>
            </Box>
          )}

          {!settings?.twoFactorEnabled && activeStep === 1 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter the 6-digit code from your authenticator app:
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handle2FAVerification}
                disabled={verificationCode.length !== 6 || saving}
              >
                Verify & Enable
              </Button>
            </Box>
          )}

          {settings?.twoFactorEnabled && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Enter your current 2FA code to disable two-factor authentication:
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                inputProps={{ maxLength: 6 }}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="error"
                onClick={handle2FADisable}
                disabled={verificationCode.length !== 6 || saving}
              >
                Disable 2FA
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTwoFactorDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordForm.currentPassword !== ''} onClose={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type={showCurrentPassword ? 'text' : 'password'}
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                  {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              )
            }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettingsPage;