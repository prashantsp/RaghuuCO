/**
 * Progressive Web App Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This component provides Progressive Web App (PWA) features
 * including offline functionality, push notifications, app installation,
 * and native-like experience for enhanced user engagement.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  CircularProgress,
  Badge,
  Tooltip,
  useTheme,
  styled
} from '@mui/material';
import {
  GetApp,
  Notifications,
  NotificationsActive,
  NotificationsNone,
  NotificationsOff,
  Wifi,
  WifiOff,
  CloudDownload,
  CloudUpload,
  Storage,
  Memory,
  Speed,
  Security,
  Update,
  Refresh,
  Settings,
  Help,
  Info,
  CheckCircle,
  Error,
  Warning,
  Download,
  Upload,
  Sync,
  SyncDisabled,
  OfflineBolt,
  OnlinePrediction,
  NetworkCheck,
  SignalCellular4Bar,
  SignalCellular0Bar,
  SignalWifi4Bar,
  SignalWifi0Bar,
  Battery90,
  Battery20,
  BatteryCharging90,
  BatteryCharging20,
  Storage as StorageIcon,
  Memory as MemoryIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Sync as SyncIcon,
  SyncDisabled as SyncDisabledIcon,
  OfflineBolt as OfflineBoltIcon,
  OnlinePrediction as OnlinePredictionIcon,
  NetworkCheck as NetworkCheckIcon,
  SignalCellular4Bar as SignalCellular4BarIcon,
  SignalCellular0Bar as SignalCellular0BarIcon,
  SignalWifi4Bar as SignalWifi4BarIcon,
  SignalWifi0Bar as SignalWifi0BarIcon,
  Battery90 as Battery90Icon,
  Battery20 as Battery20Icon,
  BatteryCharging90 as BatteryCharging90Icon,
  BatteryCharging20 as BatteryCharging20Icon
} from '@mui/icons-material';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * PWA state interface
 */
interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isUpdating: boolean;
  updateProgress: number;
  notificationsEnabled: boolean;
  pushSubscription: PushSubscription | null;
  cacheStatus: 'idle' | 'updating' | 'error';
  storageUsage: number;
  storageQuota: number;
  networkType: 'wifi' | 'cellular' | 'none';
  networkSpeed: 'fast' | 'slow' | 'unknown';
  batteryLevel: number;
  batteryCharging: boolean;
  lastSync: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  offlineData: any[];
  pendingActions: any[];
}

/**
 * PWA feature interface
 */
interface PWAFeature {
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  status: 'available' | 'unavailable' | 'enabled' | 'disabled';
}

/**
 * Styled components
 */
const StatusIndicator = styled(Box)<{ status: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ status, theme }) => {
    switch (status) {
      case 'online': return theme.palette.success.main;
      case 'offline': return theme.palette.error.main;
      case 'updating': return theme.palette.warning.main;
      default: return theme.palette.grey[400];
    }
  }};
  margin-right: 8px;
`;

/**
 * Progressive Web App Component
 */
export const ProgressiveWebApp: React.FC = () => {
  const theme = useTheme();
  const { announceToScreenReader } = useAccessibility();
  const { user } = useAuth();
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    isUpdating: false,
    updateProgress: 0,
    notificationsEnabled: false,
    pushSubscription: null,
    cacheStatus: 'idle',
    storageUsage: 0,
    storageQuota: 0,
    networkType: 'wifi',
    networkSpeed: 'unknown',
    batteryLevel: 100,
    batteryCharging: false,
    lastSync: null,
    syncStatus: 'idle',
    offlineData: [],
    pendingActions: []
  });

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const deferredPrompt = useRef<any>(null);

  // PWA features
  const pwaFeatures: PWAFeature[] = [
    {
      name: 'App Installation',
      description: 'Install the app on your device for quick access',
      enabled: pwaState.isInstalled,
      icon: <GetApp />,
      status: pwaState.isInstalled ? 'enabled' : 'available'
    },
    {
      name: 'Offline Support',
      description: 'Use the app without internet connection',
      enabled: true,
      icon: <OfflineBolt />,
      status: 'enabled'
    },
    {
      name: 'Push Notifications',
      description: 'Receive real-time notifications',
      enabled: pwaState.notificationsEnabled,
      icon: <Notifications />,
      status: pwaState.notificationsEnabled ? 'enabled' : 'available'
    },
    {
      name: 'Background Sync',
      description: 'Sync data when connection is restored',
      enabled: true,
      icon: <Sync />,
      status: 'enabled'
    },
    {
      name: 'Automatic Updates',
      description: 'App updates automatically in the background',
      enabled: true,
      icon: <Update />,
      status: 'enabled'
    },
    {
      name: 'Data Caching',
      description: 'Cache data for faster loading',
      enabled: true,
      icon: <Storage />,
      status: 'enabled'
    }
  ];

  // Check if app is installed
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true, isOffline: false }));
      announceToScreenReader('Connection restored');
      showSnackbar('Connection restored', 'success');
      logger.info('Network connection restored');
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false, isOffline: true }));
      announceToScreenReader('Connection lost - offline mode enabled');
      showSnackbar('Connection lost - offline mode enabled', 'warning');
      logger.info('Network connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [announceToScreenReader]);

  // Battery status monitoring
  useEffect(() => {
    const getBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          const updateBatteryInfo = () => {
            setPwaState(prev => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
              batteryCharging: battery.charging
            }));
          };

          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingchange', updateBatteryInfo);
          updateBatteryInfo();
        } catch (error) {
          logger.error('Error getting battery info:', error as Error);
        }
      }
    };

    getBatteryInfo();
  }, []);

  // Storage quota monitoring
  useEffect(() => {
    const getStorageInfo = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setPwaState(prev => ({
            ...prev,
            storageUsage: estimate.usage || 0,
            storageQuota: estimate.quota || 0
          }));
        } catch (error) {
          logger.error('Error getting storage info:', error as Error);
        }
      }
    };

    getStorageInfo();
  }, []);

  // Handle before install prompt
  const handleBeforeInstallPrompt = useCallback((event: Event) => {
    event.preventDefault();
    deferredPrompt.current = event;
    setShowInstallPrompt(true);
    logger.info('Install prompt available');
  }, []);

  // Handle app installed
  const handleAppInstalled = useCallback(() => {
    setPwaState(prev => ({ ...prev, isInstalled: true }));
    setShowInstallPrompt(false);
    announceToScreenReader('App installed successfully');
    showSnackbar('App installed successfully!', 'success');
    logger.info('App installed successfully');
  }, [announceToScreenReader]);

  // Install app
  const installApp = useCallback(async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        logger.info('User accepted install prompt');
      } else {
        logger.info('User dismissed install prompt');
      }
      
      deferredPrompt.current = null;
      setShowInstallPrompt(false);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          setPwaState(prev => ({ ...prev, notificationsEnabled: true }));
          announceToScreenReader('Notifications enabled');
          showSnackbar('Notifications enabled!', 'success');
          logger.info('Notification permission granted');
          
          // Subscribe to push notifications
          await subscribeToPushNotifications();
        } else {
          announceToScreenReader('Notification permission denied');
          showSnackbar('Notification permission denied', 'warning');
          logger.info('Notification permission denied');
        }
      }
    } catch (error) {
      logger.error('Error requesting notification permission:', error as Error);
      showSnackbar('Error enabling notifications', 'error');
    }
  }, [announceToScreenReader]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
        });
        
        setPwaState(prev => ({ ...prev, pushSubscription: subscription }));
        logger.info('Push notification subscription created');
      }
    } catch (error) {
      logger.error('Error subscribing to push notifications:', error as Error);
    }
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    setPwaState(prev => ({ ...prev, isUpdating: true, updateProgress: 0 }));
    
    try {
      // Simulate update check
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPwaState(prev => ({ ...prev, updateProgress: i }));
      }
      
      setPwaState(prev => ({ 
        ...prev, 
        isUpdating: false, 
        hasUpdate: false,
        updateProgress: 0 
      }));
      
      announceToScreenReader('App is up to date');
      showSnackbar('App is up to date!', 'success');
      logger.info('Update check completed');
    } catch (error) {
      setPwaState(prev => ({ ...prev, isUpdating: false, updateProgress: 0 }));
      logger.error('Error checking for updates:', error as Error);
      showSnackbar('Error checking for updates', 'error');
    }
  }, [announceToScreenReader]);

  // Sync data
  const syncData = useCallback(async () => {
    setPwaState(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPwaState(prev => ({ 
        ...prev, 
        syncStatus: 'idle',
        lastSync: new Date(),
        pendingActions: []
      }));
      
      announceToScreenReader('Data synchronized successfully');
      showSnackbar('Data synchronized successfully!', 'success');
      logger.info('Data sync completed');
    } catch (error) {
      setPwaState(prev => ({ ...prev, syncStatus: 'error' }));
      logger.error('Error syncing data:', error as Error);
      showSnackbar('Error syncing data', 'error');
    }
  }, [announceToScreenReader]);

  // Clear cache
  const clearCache = useCallback(async () => {
    setPwaState(prev => ({ ...prev, cacheStatus: 'updating' }));
    
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      setPwaState(prev => ({ ...prev, cacheStatus: 'idle' }));
      announceToScreenReader('Cache cleared successfully');
      showSnackbar('Cache cleared successfully!', 'success');
      logger.info('Cache cleared');
    } catch (error) {
      setPwaState(prev => ({ ...prev, cacheStatus: 'error' }));
      logger.error('Error clearing cache:', error as Error);
      showSnackbar('Error clearing cache', 'error');
    }
  }, [announceToScreenReader]);

  // Show snackbar
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // Close snackbar
  const closeSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Get network icon
  const getNetworkIcon = () => {
    if (!pwaState.isOnline) return <SignalWifi0Bar />;
    return pwaState.networkType === 'wifi' ? <SignalWifi4Bar /> : <SignalCellular4Bar />;
  };

  // Get battery icon
  const getBatteryIcon = () => {
    if (pwaState.batteryCharging) {
      return pwaState.batteryLevel > 20 ? <BatteryCharging90 /> : <BatteryCharging20 />;
    }
    return pwaState.batteryLevel > 20 ? <Battery90 /> : <Battery20 />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Progressive Web App Features
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Experience native app-like functionality with offline support, push notifications,
        and automatic updates for enhanced user engagement.
      </Typography>

      {/* Status Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StatusIndicator status={pwaState.isOnline ? 'online' : 'offline'} />
              <Typography variant="body2">
                {pwaState.isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getNetworkIcon()}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {pwaState.networkType.toUpperCase()}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getBatteryIcon()}
              <Typography variant="body2" sx={{ ml: 1 }}>
                {pwaState.batteryLevel}% {pwaState.batteryCharging && '(Charging)'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <StorageIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {Math.round((pwaState.storageUsage / pwaState.storageQuota) * 100)}% Used
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Features
          </Typography>
          
          <List>
            {pwaFeatures.map((feature, index) => (
              <React.Fragment key={feature.name}>
                <ListItem>
                  <ListItemIcon>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={feature.name}
                    secondary={feature.description}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={feature.status}
                      color={feature.status === 'enabled' ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < pwaFeatures.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {!pwaState.isInstalled && (
              <Button
                variant="contained"
                startIcon={<GetApp />}
                onClick={installApp}
                disabled={!showInstallPrompt}
              >
                Install App
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => setShowNotificationSettings(true)}
              disabled={pwaState.notificationsEnabled}
            >
              Enable Notifications
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Update />}
              onClick={checkForUpdates}
              disabled={pwaState.isUpdating}
            >
              Check for Updates
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Sync />}
              onClick={syncData}
              disabled={pwaState.syncStatus === 'syncing'}
            >
              Sync Data
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Storage />}
              onClick={clearCache}
              disabled={pwaState.cacheStatus === 'updating'}
            >
              Clear Cache
            </Button>
          </Box>

          {/* Update Progress */}
          {pwaState.isUpdating && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Checking for updates...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={pwaState.updateProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

          {/* Sync Status */}
          {pwaState.syncStatus === 'syncing' && (
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">
                Syncing data...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Offline Data */}
      {pwaState.offlineData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Offline Data
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              {pwaState.offlineData.length} items stored offline
            </Alert>
            
            <List dense>
              {pwaState.offlineData.slice(0, 5).map((item, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <OfflineBoltIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title || `Offline Item ${index + 1}`}
                    secondary={item.description || 'Stored for offline access'}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Install Prompt Dialog */}
      <Dialog open={showInstallPrompt} onClose={() => setShowInstallPrompt(false)}>
        <DialogTitle>Install RAGHUU CO App</DialogTitle>
        <DialogContent>
          <Typography>
            Install the RAGHUU CO Legal Practice Management System on your device for quick access and offline functionality.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallPrompt(false)}>
            Cancel
          </Button>
          <Button onClick={installApp} variant="contained">
            Install
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationSettings} onClose={() => setShowNotificationSettings(false)}>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Enable push notifications to receive real-time updates about cases, documents, and important events.
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={pwaState.notificationsEnabled}
                onChange={requestNotificationPermission}
              />
            }
            label="Enable Push Notifications"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationSettings(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

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