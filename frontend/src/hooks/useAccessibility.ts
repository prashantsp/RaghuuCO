/**
 * Accessibility Hook
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This hook provides comprehensive accessibility features
 * including screen reader support, keyboard navigation, high contrast,
 * and dyslexia-friendly fonts for WCAG 2.1 AA compliance.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { logger } from '@/utils/logger';

/**
 * Accessibility preferences interface
 */
export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  dyslexiaFriendly: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineSpacing: 'tight' | 'normal' | 'loose';
  letterSpacing: 'tight' | 'normal' | 'loose';
}

/**
 * Accessibility features interface
 */
export interface AccessibilityFeatures {
  preferences: AccessibilityPreferences;
  isHighContrast: boolean;
  isLargeText: boolean;
  isDyslexiaFriendly: boolean;
  isReducedMotion: boolean;
  isScreenReaderActive: boolean;
  isKeyboardNavigation: boolean;
  hasFocusIndicators: boolean;
  colorBlindnessType: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  currentFontSize: 'small' | 'medium' | 'large' | 'extra-large';
  currentLineSpacing: 'tight' | 'normal' | 'loose';
  currentLetterSpacing: 'tight' | 'normal' | 'loose';
}

/**
 * Screen reader announcement interface
 */
export interface ScreenReaderAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  timeout?: number;
}

/**
 * Keyboard navigation interface
 */
export interface KeyboardNavigation {
  isEnabled: boolean;
  currentFocus: string | null;
  focusableElements: string[];
  navigationMode: 'tab' | 'arrow' | 'voice';
}

/**
 * Accessibility Hook
 */
export const useAccessibility = () => {
  // Default preferences
  const defaultPreferences: AccessibilityPreferences = {
    highContrast: false,
    largeText: false,
    dyslexiaFriendly: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindness: 'none',
    fontSize: 'medium',
    lineSpacing: 'normal',
    letterSpacing: 'normal'
  };

  // State
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState<KeyboardNavigation>({
    isEnabled: true,
    currentFocus: null,
    focusableElements: [],
    navigationMode: 'tab'
  });
  const [announcements, setAnnouncements] = useState<ScreenReaderAnnouncement[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('accessibility-preferences');
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed });
        logger.info('Accessibility preferences loaded from localStorage');
      }
    } catch (error) {
      logger.error('Error loading accessibility preferences:', error as Error);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
      logger.info('Accessibility preferences saved to localStorage');
    } catch (error) {
      logger.error('Error saving accessibility preferences:', error as Error);
    }
  }, [preferences]);

  // Apply accessibility styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (preferences.highContrast) {
      root.style.setProperty('--high-contrast', 'true');
      root.classList.add('high-contrast');
    } else {
      root.style.removeProperty('--high-contrast');
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (preferences.largeText) {
      root.style.setProperty('--large-text', 'true');
      root.classList.add('large-text');
    } else {
      root.style.removeProperty('--large-text');
      root.classList.remove('large-text');
    }

    // Apply dyslexia-friendly fonts
    if (preferences.dyslexiaFriendly) {
      root.style.setProperty('--dyslexia-friendly', 'true');
      root.classList.add('dyslexia-friendly');
    } else {
      root.style.removeProperty('--dyslexia-friendly');
      root.classList.remove('dyslexia-friendly');
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'true');
      root.classList.add('reduced-motion');
    } else {
      root.style.removeProperty('--reduced-motion');
      root.classList.remove('reduced-motion');
    }

    // Apply color blindness filters
    if (preferences.colorBlindness !== 'none') {
      root.style.setProperty('--color-blindness', preferences.colorBlindness);
      root.classList.add(`color-blindness-${preferences.colorBlindness}`);
    } else {
      root.style.removeProperty('--color-blindness');
      root.classList.remove('color-blindness-protanopia', 'color-blindness-deuteranopia', 'color-blindness-tritanopia');
    }

    // Apply font size
    root.style.setProperty('--font-size', preferences.fontSize);

    // Apply line spacing
    root.style.setProperty('--line-spacing', preferences.lineSpacing);

    // Apply letter spacing
    root.style.setProperty('--letter-spacing', preferences.letterSpacing);

    // Apply focus indicators
    if (preferences.focusIndicators) {
      root.style.setProperty('--focus-indicators', 'true');
      root.classList.add('focus-indicators');
    } else {
      root.style.removeProperty('--focus-indicators');
      root.classList.remove('focus-indicators');
    }

    logger.info('Accessibility styles applied to document');
  }, [preferences]);

  // Detect screen reader
  useEffect(() => {
    const detectScreenReader = () => {
      // Check for screen reader specific properties
      const hasScreenReader = 
        'speechSynthesis' in window ||
        'webkitSpeechSynthesis' in window ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        navigator.userAgent.includes('TalkBack');

      setIsScreenReaderActive(hasScreenReader);
      logger.info('Screen reader detection completed', { hasScreenReader });
    };

    detectScreenReader();
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    logger.info('Accessibility preferences updated', { newPreferences });
  }, []);

  // Reset preferences to default
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    logger.info('Accessibility preferences reset to default');
  }, []);

  // Announce to screen reader
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (isScreenReaderActive || preferences.screenReader) {
      // Create live region for announcements
      let liveRegion = document.getElementById('screen-reader-announcements');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'screen-reader-announcements';
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
      }

      // Announce message
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (liveRegion) {
          liveRegion.textContent = '';
        }
      }, 1000);

      logger.info('Screen reader announcement made', { message, priority });
    }
  }, [isScreenReaderActive, preferences.screenReader]);

  // Add announcement to queue
  const addAnnouncement = useCallback((announcement: ScreenReaderAnnouncement) => {
    setAnnouncements(prev => [...prev, announcement]);
    
    // Auto-remove after timeout
    if (announcement.timeout) {
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(a => a !== announcement));
      }, announcement.timeout);
    }

    logger.info('Accessibility announcement added to queue', { announcement });
  }, []);

  // Clear announcements
  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
    logger.info('Accessibility announcements cleared');
  }, []);

  // Handle keyboard navigation
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!keyboardNavigation.isEnabled) return;

    const { key, target } = event;
    const focusableElements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ) as HTMLElement[];

    setKeyboardNavigation(prev => ({
      ...prev,
      focusableElements: focusableElements.map(el => el.id || el.className)
    }));

    switch (key) {
      case 'Tab':
        setKeyboardNavigation(prev => ({ ...prev, navigationMode: 'tab' }));
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        setKeyboardNavigation(prev => ({ ...prev, navigationMode: 'arrow' }));
        
        // Handle arrow key navigation
        const currentIndex = focusableElements.findIndex(el => el === target);
        let nextIndex = currentIndex;

        if (key === 'ArrowDown' || key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % focusableElements.length;
        } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        }

        focusableElements[nextIndex]?.focus();
        break;
      case 'Enter':
      case ' ':
        if (target instanceof HTMLElement) {
          target.click();
        }
        break;
    }
  }, [keyboardNavigation.isEnabled]);

  // Enable keyboard navigation
  const enableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(prev => ({ ...prev, isEnabled: true }));
    document.addEventListener('keydown', handleKeyboardNavigation);
    logger.info('Keyboard navigation enabled');
  }, [handleKeyboardNavigation]);

  // Disable keyboard navigation
  const disableKeyboardNavigation = useCallback(() => {
    setKeyboardNavigation(prev => ({ ...prev, isEnabled: false }));
    document.removeEventListener('keydown', handleKeyboardNavigation);
    logger.info('Keyboard navigation disabled');
  }, [handleKeyboardNavigation]);

  // Set keyboard navigation mode
  const setKeyboardNavigationMode = useCallback((mode: 'tab' | 'arrow' | 'voice') => {
    setKeyboardNavigation(prev => ({ ...prev, navigationMode: mode }));
    logger.info('Keyboard navigation mode changed', { mode });
  }, []);

  // Focus management
  const focusElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      setKeyboardNavigation(prev => ({ ...prev, currentFocus: elementId }));
      logger.info('Element focused', { elementId });
    }
  }, []);

  // Skip to main content
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.focus();
      announceToScreenReader('Skipped to main content');
      logger.info('Skipped to main content');
    }
  }, [announceToScreenReader]);

  // Skip to navigation
  const skipToNavigation = useCallback(() => {
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (navigation) {
      navigation.focus();
      announceToScreenReader('Skipped to navigation');
      logger.info('Skipped to navigation');
    }
  }, [announceToScreenReader]);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    updatePreferences({ highContrast: !preferences.highContrast });
    announceToScreenReader(`High contrast ${preferences.highContrast ? 'disabled' : 'enabled'}`);
  }, [preferences.highContrast, updatePreferences, announceToScreenReader]);

  // Toggle large text
  const toggleLargeText = useCallback(() => {
    updatePreferences({ largeText: !preferences.largeText });
    announceToScreenReader(`Large text ${preferences.largeText ? 'disabled' : 'enabled'}`);
  }, [preferences.largeText, updatePreferences, announceToScreenReader]);

  // Toggle dyslexia-friendly fonts
  const toggleDyslexiaFriendly = useCallback(() => {
    updatePreferences({ dyslexiaFriendly: !preferences.dyslexiaFriendly });
    announceToScreenReader(`Dyslexia-friendly fonts ${preferences.dyslexiaFriendly ? 'disabled' : 'enabled'}`);
  }, [preferences.dyslexiaFriendly, updatePreferences, announceToScreenReader]);

  // Toggle reduced motion
  const toggleReducedMotion = useCallback(() => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion });
    announceToScreenReader(`Reduced motion ${preferences.reducedMotion ? 'disabled' : 'enabled'}`);
  }, [preferences.reducedMotion, updatePreferences, announceToScreenReader]);

  // Set font size
  const setFontSize = useCallback((size: 'small' | 'medium' | 'large' | 'extra-large') => {
    updatePreferences({ fontSize: size });
    announceToScreenReader(`Font size set to ${size}`);
  }, [updatePreferences, announceToScreenReader]);

  // Set line spacing
  const setLineSpacing = useCallback((spacing: 'tight' | 'normal' | 'loose') => {
    updatePreferences({ lineSpacing: spacing });
    announceToScreenReader(`Line spacing set to ${spacing}`);
  }, [updatePreferences, announceToScreenReader]);

  // Set letter spacing
  const setLetterSpacing = useCallback((spacing: 'tight' | 'normal' | 'loose') => {
    updatePreferences({ letterSpacing: spacing });
    announceToScreenReader(`Letter spacing set to ${spacing}`);
  }, [updatePreferences, announceToScreenReader]);

  // Set color blindness type
  const setColorBlindnessType = useCallback((type: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') => {
    updatePreferences({ colorBlindness: type });
    announceToScreenReader(`Color blindness filter set to ${type}`);
  }, [updatePreferences, announceToScreenReader]);

  // Get accessibility features
  const getAccessibilityFeatures = useMemo((): AccessibilityFeatures => ({
    preferences,
    isHighContrast: preferences.highContrast,
    isLargeText: preferences.largeText,
    isDyslexiaFriendly: preferences.dyslexiaFriendly,
    isReducedMotion: preferences.reducedMotion,
    isScreenReaderActive,
    isKeyboardNavigation: keyboardNavigation.isEnabled,
    hasFocusIndicators: preferences.focusIndicators,
    colorBlindnessType: preferences.colorBlindness,
    currentFontSize: preferences.fontSize,
    currentLineSpacing: preferences.lineSpacing,
    currentLetterSpacing: preferences.letterSpacing
  }), [preferences, isScreenReaderActive, keyboardNavigation.isEnabled]);

  // Initialize keyboard navigation
  useEffect(() => {
    if (preferences.keyboardNavigation) {
      enableKeyboardNavigation();
    }

    return () => {
      disableKeyboardNavigation();
    };
  }, [preferences.keyboardNavigation, enableKeyboardNavigation, disableKeyboardNavigation]);

  return {
    // State
    preferences,
    isScreenReaderActive,
    keyboardNavigation,
    announcements,
    accessibilityFeatures: getAccessibilityFeatures,

    // Actions
    updatePreferences,
    resetPreferences,
    announceToScreenReader,
    addAnnouncement,
    clearAnnouncements,
    enableKeyboardNavigation,
    disableKeyboardNavigation,
    setKeyboardNavigationMode,
    focusElement,
    skipToMainContent,
    skipToNavigation,

    // Toggle functions
    toggleHighContrast,
    toggleLargeText,
    toggleDyslexiaFriendly,
    toggleReducedMotion,

    // Setter functions
    setFontSize,
    setLineSpacing,
    setLetterSpacing,
    setColorBlindnessType
  };
};