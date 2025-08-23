/**
 * Accessibility Provider Component
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This component provides comprehensive accessibility features
 * including WCAG 2.1 AA compliance, screen reader optimization, keyboard
 * navigation, and color contrast management.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { logger } from '@/utils/logger';

/**
 * Accessibility context interface
 */
interface AccessibilityContextType {
  // High contrast mode
  highContrast: boolean;
  toggleHighContrast: () => void;
  
  // Font size
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  setFontSize: (size: 'small' | 'medium' | 'large' | 'x-large') => void;
  
  // Reduced motion
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  
  // Focus indicators
  showFocusIndicators: boolean;
  toggleFocusIndicators: () => void;
  
  // Screen reader announcements
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  
  // Keyboard navigation
  enableKeyboardNavigation: boolean;
  toggleKeyboardNavigation: () => void;
  
  // Color blind friendly mode
  colorBlindFriendly: boolean;
  toggleColorBlindFriendly: () => void;
  
  // Dyslexia friendly font
  dyslexiaFriendly: boolean;
  toggleDyslexiaFriendly: () => void;
  
  // Accessibility preferences
  preferences: AccessibilityPreferences;
  updatePreferences: (preferences: Partial<AccessibilityPreferences>) => void;
}

/**
 * Accessibility preferences interface
 */
interface AccessibilityPreferences {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  reducedMotion: boolean;
  showFocusIndicators: boolean;
  enableKeyboardNavigation: boolean;
  colorBlindFriendly: boolean;
  dyslexiaFriendly: boolean;
  screenReaderOptimized: boolean;
  keyboardShortcuts: boolean;
  autoAnnouncements: boolean;
}

/**
 * Accessibility provider props
 */
interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * Create accessibility context
 */
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

/**
 * Accessibility provider component
 */
const AccessibilityProvider: ReactNode<AccessibilityProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('accessibility-preferences');
    return saved ? JSON.parse(saved) : {
      highContrast: false,
      fontSize: 'medium',
      reducedMotion: false,
      showFocusIndicators: true,
      enableKeyboardNavigation: true,
      colorBlindFriendly: false,
      dyslexiaFriendly: false,
      screenReaderOptimized: true,
      keyboardShortcuts: true,
      autoAnnouncements: true
    };
  });

  // Screen reader announcement element
  const [announcementElement, setAnnouncementElement] = useState<HTMLDivElement | null>(null);

  /**
   * Save preferences to localStorage
   */
  const savePreferences = (newPreferences: AccessibilityPreferences) => {
    localStorage.setItem('accessibility-preferences', JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  /**
   * Update preferences
   */
  const updatePreferences = (updates: Partial<AccessibilityPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    savePreferences(newPreferences);
    
    // Log accessibility preference changes
    logger.info('Accessibility preferences updated', {
      changes: updates,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Toggle high contrast mode
   */
  const toggleHighContrast = () => {
    updatePreferences({ highContrast: !preferences.highContrast });
  };

  /**
   * Set font size
   */
  const setFontSize = (size: 'small' | 'medium' | 'large' | 'x-large') => {
    updatePreferences({ fontSize: size });
  };

  /**
   * Toggle reduced motion
   */
  const toggleReducedMotion = () => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion });
  };

  /**
   * Toggle focus indicators
   */
  const toggleFocusIndicators = () => {
    updatePreferences({ showFocusIndicators: !preferences.showFocusIndicators });
  };

  /**
   * Toggle keyboard navigation
   */
  const toggleKeyboardNavigation = () => {
    updatePreferences({ enableKeyboardNavigation: !preferences.enableKeyboardNavigation });
  };

  /**
   * Toggle color blind friendly mode
   */
  const toggleColorBlindFriendly = () => {
    updatePreferences({ colorBlindFriendly: !preferences.colorBlindFriendly });
  };

  /**
   * Toggle dyslexia friendly font
   */
  const toggleDyslexiaFriendly = () => {
    updatePreferences({ dyslexiaFriendly: !preferences.dyslexiaFriendly });
  };

  /**
   * Announce to screen reader
   */
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcementElement) {
      announcementElement.setAttribute('aria-live', priority);
      announcementElement.textContent = message;
      
      // Clear the message after a short delay
      setTimeout(() => {
        if (announcementElement) {
          announcementElement.textContent = '';
        }
      }, 1000);
    }

    // Log screen reader announcements
    logger.info('Screen reader announcement', {
      message,
      priority,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Create theme based on accessibility preferences
   */
  const createAccessibleTheme = () => {
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem',
      'x-large': '1.25rem'
    };

    const baseTheme = createTheme({
      typography: {
        fontSize: parseInt(fontSizeMap[preferences.fontSize]),
        fontFamily: preferences.dyslexiaFriendly 
          ? '"OpenDyslexic", "Comic Sans MS", "Arial", sans-serif'
          : '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: preferences.dyslexiaFriendly ? '2.5rem' : '2.125rem' },
        h2: { fontSize: preferences.dyslexiaFriendly ? '2rem' : '1.5rem' },
        h3: { fontSize: preferences.dyslexiaFriendly ? '1.75rem' : '1.25rem' },
        h4: { fontSize: preferences.dyslexiaFriendly ? '1.5rem' : '1.125rem' },
        h5: { fontSize: preferences.dyslexiaFriendly ? '1.25rem' : '1rem' },
        h6: { fontSize: preferences.dyslexiaFriendly ? '1.125rem' : '0.875rem' }
      },
      palette: {
        mode: preferences.highContrast ? 'dark' : 'light',
        primary: {
          main: preferences.colorBlindFriendly ? '#0066CC' : '#1976d2',
          contrastText: preferences.highContrast ? '#FFFFFF' : '#FFFFFF'
        },
        secondary: {
          main: preferences.colorBlindFriendly ? '#CC6600' : '#dc004e',
          contrastText: preferences.highContrast ? '#FFFFFF' : '#FFFFFF'
        },
        background: {
          default: preferences.highContrast ? '#000000' : '#fafafa',
          paper: preferences.highContrast ? '#FFFFFF' : '#ffffff'
        },
        text: {
          primary: preferences.highContrast ? '#FFFFFF' : 'rgba(0, 0, 0, 0.87)',
          secondary: preferences.highContrast ? '#CCCCCC' : 'rgba(0, 0, 0, 0.6)'
        }
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontSize: fontSizeMap[preferences.fontSize],
              minHeight: preferences.fontSize === 'x-large' ? '48px' : '36px',
              padding: preferences.fontSize === 'x-large' ? '12px 24px' : '8px 16px',
              borderWidth: preferences.highContrast ? '2px' : '1px',
              '&:focus': {
                outline: preferences.showFocusIndicators ? '3px solid #0066CC' : 'none',
                outlineOffset: '2px'
              }
            }
          }
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              fontSize: fontSizeMap[preferences.fontSize],
              '& .MuiInputBase-input': {
                fontSize: fontSizeMap[preferences.fontSize],
                padding: preferences.fontSize === 'x-large' ? '16px 14px' : '12px 14px'
              },
              '& .MuiInputLabel-root': {
                fontSize: fontSizeMap[preferences.fontSize]
              }
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              border: preferences.highContrast ? '2px solid #000000' : '1px solid rgba(0, 0, 0, 0.12)',
              '&:focus-within': {
                outline: preferences.showFocusIndicators ? '3px solid #0066CC' : 'none',
                outlineOffset: '2px'
              }
            }
          }
        },
        MuiTable: {
          styleOverrides: {
            root: {
              fontSize: fontSizeMap[preferences.fontSize],
              '& th, & td': {
                fontSize: fontSizeMap[preferences.fontSize],
                padding: preferences.fontSize === 'x-large' ? '16px' : '12px'
              }
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontSize: fontSizeMap[preferences.fontSize],
              height: preferences.fontSize === 'x-large' ? '32px' : '24px',
              '&:focus': {
                outline: preferences.showFocusIndicators ? '3px solid #0066CC' : 'none',
                outlineOffset: '2px'
              }
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              fontSize: fontSizeMap[preferences.fontSize]
            }
          }
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              fontSize: fontSizeMap[preferences.fontSize]
            }
          }
        }
      }
    });

    return baseTheme;
  };

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!preferences.keyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + 1: Toggle high contrast
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        toggleHighContrast();
        announceToScreenReader('High contrast mode toggled');
      }

      // Alt + 2: Increase font size
      if (event.altKey && event.key === '2') {
        event.preventDefault();
        const sizes: ('small' | 'medium' | 'large' | 'x-large')[] = ['small', 'medium', 'large', 'x-large'];
        const currentIndex = sizes.indexOf(preferences.fontSize);
        const nextSize = sizes[Math.min(currentIndex + 1, sizes.length - 1)];
        setFontSize(nextSize);
        announceToScreenReader(`Font size changed to ${nextSize}`);
      }

      // Alt + 3: Decrease font size
      if (event.altKey && event.key === '3') {
        event.preventDefault();
        const sizes: ('small' | 'medium' | 'large' | 'x-large')[] = ['small', 'medium', 'large', 'x-large'];
        const currentIndex = sizes.indexOf(preferences.fontSize);
        const nextSize = sizes[Math.max(currentIndex - 1, 0)];
        setFontSize(nextSize);
        announceToScreenReader(`Font size changed to ${nextSize}`);
      }

      // Alt + 4: Toggle reduced motion
      if (event.altKey && event.key === '4') {
        event.preventDefault();
        toggleReducedMotion();
        announceToScreenReader('Reduced motion toggled');
      }

      // Alt + 5: Toggle focus indicators
      if (event.altKey && event.key === '5') {
        event.preventDefault();
        toggleFocusIndicators();
        announceToScreenReader('Focus indicators toggled');
      }

      // Alt + 6: Toggle color blind friendly mode
      if (event.altKey && event.key === '6') {
        event.preventDefault();
        toggleColorBlindFriendly();
        announceToScreenReader('Color blind friendly mode toggled');
      }

      // Alt + 7: Toggle dyslexia friendly font
      if (event.altKey && event.key === '7') {
        event.preventDefault();
        toggleDyslexiaFriendly();
        announceToScreenReader('Dyslexia friendly font toggled');
      }

      // Alt + H: Show help
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        announceToScreenReader('Accessibility help: Alt+1 High contrast, Alt+2/3 Font size, Alt+4 Reduced motion, Alt+5 Focus indicators, Alt+6 Color blind friendly, Alt+7 Dyslexia friendly');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [preferences]);

  /**
   * Apply reduced motion styles
   */
  useEffect(() => {
    if (preferences.reducedMotion) {
      document.documentElement.style.setProperty('--reduced-motion', 'reduce');
      document.documentElement.style.setProperty('scroll-behavior', 'auto');
    } else {
      document.documentElement.style.setProperty('--reduced-motion', 'no-preference');
      document.documentElement.style.setProperty('scroll-behavior', 'smooth');
    }
  }, [preferences.reducedMotion]);

  /**
   * Apply focus indicator styles
   */
  useEffect(() => {
    if (preferences.showFocusIndicators) {
      document.documentElement.style.setProperty('--focus-visible', 'auto');
    } else {
      document.documentElement.style.setProperty('--focus-visible', 'none');
    }
  }, [preferences.showFocusIndicators]);

  /**
   * Initialize screen reader announcement element
   */
  useEffect(() => {
    const element = document.createElement('div');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    element.style.position = 'absolute';
    element.style.left = '-10000px';
    element.style.width = '1px';
    element.style.height = '1px';
    element.style.overflow = 'hidden';
    document.body.appendChild(element);
    setAnnouncementElement(element);

    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  /**
   * Auto-announce page changes
   */
  useEffect(() => {
    if (preferences.autoAnnouncements) {
      const pageTitle = document.title;
      announceToScreenReader(`Page loaded: ${pageTitle}`);
    }
  }, [preferences.autoAnnouncements]);

  const contextValue: AccessibilityContextType = {
    highContrast: preferences.highContrast,
    toggleHighContrast,
    fontSize: preferences.fontSize,
    setFontSize,
    reducedMotion: preferences.reducedMotion,
    toggleReducedMotion,
    showFocusIndicators: preferences.showFocusIndicators,
    toggleFocusIndicators,
    announceToScreenReader,
    enableKeyboardNavigation: preferences.enableKeyboardNavigation,
    toggleKeyboardNavigation,
    colorBlindFriendly: preferences.colorBlindFriendly,
    toggleColorBlindFriendly,
    dyslexiaFriendly: preferences.dyslexiaFriendly,
    toggleDyslexiaFriendly,
    preferences,
    updatePreferences
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <ThemeProvider theme={createAccessibleTheme()}>
        <CssBaseline />
        <Box
          sx={{
            // Apply global accessibility styles
            '& *': {
              scrollBehavior: preferences.reducedMotion ? 'auto' : 'smooth'
            },
            '& *:focus': {
              outline: preferences.showFocusIndicators ? '3px solid #0066CC' : 'none',
              outlineOffset: '2px'
            },
            '& *:focus:not(:focus-visible)': {
              outline: 'none'
            },
            '& *:focus-visible': {
              outline: preferences.showFocusIndicators ? '3px solid #0066CC' : 'none',
              outlineOffset: '2px'
            },
            // High contrast mode styles
            ...(preferences.highContrast && {
              '& *': {
                borderColor: '#000000 !important'
              },
              '& button, & a, & [role="button"]': {
                border: '2px solid #000000 !important'
              }
            }),
            // Color blind friendly styles
            ...(preferences.colorBlindFriendly && {
              '& .MuiChip-root': {
                border: '2px solid #000000'
              },
              '& .MuiAlert-root': {
                border: '2px solid #000000'
              }
            })
          }}
        >
          {children}
        </Box>
      </ThemeProvider>
    </AccessibilityContext.Provider>
  );
};

/**
 * Custom hook to use accessibility context
 */
export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

/**
 * Accessibility toolbar component
 */
export const AccessibilityToolbar: React.FC = () => {
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    reducedMotion,
    toggleReducedMotion,
    showFocusIndicators,
    toggleFocusIndicators,
    colorBlindFriendly,
    toggleColorBlindFriendly,
    dyslexiaFriendly,
    toggleDyslexiaFriendly
  } = useAccessibility();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '0 0 0 8px',
        padding: 1,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        maxWidth: '300px'
      }}
      role="toolbar"
      aria-label="Accessibility toolbar"
    >
      <button
        onClick={toggleHighContrast}
        aria-pressed={highContrast}
        aria-label="Toggle high contrast"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          backgroundColor: highContrast ? '#0066CC' : 'transparent',
          color: highContrast ? '#FFFFFF' : 'inherit',
          cursor: 'pointer'
        }}
      >
        HC
      </button>

      <select
        value={fontSize}
        onChange={(e) => setFontSize(e.target.value as any)}
        aria-label="Font size"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
        <option value="x-large">X-Large</option>
      </select>

      <button
        onClick={toggleReducedMotion}
        aria-pressed={reducedMotion}
        aria-label="Toggle reduced motion"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          backgroundColor: reducedMotion ? '#0066CC' : 'transparent',
          color: reducedMotion ? '#FFFFFF' : 'inherit',
          cursor: 'pointer'
        }}
      >
        RM
      </button>

      <button
        onClick={toggleFocusIndicators}
        aria-pressed={showFocusIndicators}
        aria-label="Toggle focus indicators"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          backgroundColor: showFocusIndicators ? '#0066CC' : 'transparent',
          color: showFocusIndicators ? '#FFFFFF' : 'inherit',
          cursor: 'pointer'
        }}
      >
        FI
      </button>

      <button
        onClick={toggleColorBlindFriendly}
        aria-pressed={colorBlindFriendly}
        aria-label="Toggle color blind friendly mode"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          backgroundColor: colorBlindFriendly ? '#0066CC' : 'transparent',
          color: colorBlindFriendly ? '#FFFFFF' : 'inherit',
          cursor: 'pointer'
        }}
      >
        CBF
      </button>

      <button
        onClick={toggleDyslexiaFriendly}
        aria-pressed={dyslexiaFriendly}
        aria-label="Toggle dyslexia friendly font"
        style={{
          padding: '4px 8px',
          border: '1px solid',
          borderRadius: '4px',
          backgroundColor: dyslexiaFriendly ? '#0066CC' : 'transparent',
          color: dyslexiaFriendly ? '#FFFFFF' : 'inherit',
          cursor: 'pointer'
        }}
      >
        DF
      </button>
    </Box>
  );
};

export default AccessibilityProvider;