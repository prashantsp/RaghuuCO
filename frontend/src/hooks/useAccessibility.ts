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
  announceToScreenReader: (message: string) => void;
  setFocus: (elementId: string) => void;
  getFocusableElements: () => HTMLElement[];
  handleKeyboardNavigation: (event: KeyboardEvent) => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleDyslexiaFriendly: () => void;
  toggleReducedMotion: () => void;
  setColorBlindness: (type: AccessibilityPreferences['colorBlindness']) => void;
  setFontSize: (size: AccessibilityPreferences['fontSize']) => void;
  setLineSpacing: (spacing: AccessibilityPreferences['lineSpacing']) => void;
  setLetterSpacing: (spacing: AccessibilityPreferences['letterSpacing']) => void;
}

/**
 * Accessibility Hook
 */
export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
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
  });

  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    loadPreferences();
    detectSystemPreferences();
    setupKeyboardNavigation();
    setupFocusManagement();
  }, []);

  // Apply preferences to document
  useEffect(() => {
    applyPreferences();
  }, [preferences]);

  /**
   * Load accessibility preferences from localStorage
   */
  const loadPreferences = useCallback(() => {
    try {
      const stored = localStorage.getItem('accessibility-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(prev => ({ ...prev, ...parsed }));
        logger.info('Accessibility preferences loaded from localStorage');
      }
    } catch (error) {
      logger.error('Error loading accessibility preferences:', error as Error);
    }
  }, []);

  /**
   * Save accessibility preferences to localStorage
   */
  const savePreferences = useCallback((newPreferences: Partial<AccessibilityPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);
      localStorage.setItem('accessibility-preferences', JSON.stringify(updated));
      logger.info('Accessibility preferences saved to localStorage');
    } catch (error) {
      logger.error('Error saving accessibility preferences:', error as Error);
    }
  }, [preferences]);

  /**
   * Detect system accessibility preferences
   */
  const detectSystemPreferences = useCallback(() => {
    try {
      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detect high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Detect large text preference
      const prefersLargeText = window.matchMedia('(min-resolution: 2dppx)').matches;
      
      if (prefersReducedMotion || prefersHighContrast || prefersLargeText) {
        setPreferences(prev => ({
          ...prev,
          reducedMotion: prefersReducedMotion,
          highContrast: prefersHighContrast,
          largeText: prefersLargeText
        }));
        logger.info('System accessibility preferences detected and applied');
      }
    } catch (error) {
      logger.error('Error detecting system accessibility preferences:', error as Error);
    }
  }, []);

  /**
   * Apply accessibility preferences to document
   */
  const applyPreferences = useCallback(() => {
    try {
      const root = document.documentElement;
      
      // Apply high contrast
      if (preferences.highContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      // Apply large text
      if (preferences.largeText) {
        root.classList.add('large-text');
      } else {
        root.classList.remove('large-text');
      }
      
      // Apply dyslexia-friendly fonts
      if (preferences.dyslexiaFriendly) {
        root.classList.add('dyslexia-friendly');
      } else {
        root.classList.remove('dyslexia-friendly');
      }
      
      // Apply reduced motion
      if (preferences.reducedMotion) {
        root.classList.add('reduced-motion');
      } else {
        root.classList.remove('reduced-motion');
      }
      
      // Apply color blindness filters
      root.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
      if (preferences.colorBlindness !== 'none') {
        root.classList.add(`color-blind-${preferences.colorBlindness}`);
      }
      
      // Apply font size
      root.classList.remove('font-size-small', 'font-size-medium', 'font-size-large', 'font-size-extra-large');
      root.classList.add(`font-size-${preferences.fontSize}`);
      
      // Apply line spacing
      root.classList.remove('line-spacing-tight', 'line-spacing-normal', 'line-spacing-loose');
      root.classList.add(`line-spacing-${preferences.lineSpacing}`);
      
      // Apply letter spacing
      root.classList.remove('letter-spacing-tight', 'letter-spacing-normal', 'letter-spacing-loose');
      root.classList.add(`letter-spacing-${preferences.letterSpacing}`);
      
      // Apply focus indicators
      if (preferences.focusIndicators) {
        root.classList.add('focus-indicators');
      } else {
        root.classList.remove('focus-indicators');
      }
      
      logger.info('Accessibility preferences applied to document');
    } catch (error) {
      logger.error('Error applying accessibility preferences:', error as Error);
    }
  }, [preferences]);

  /**
   * Setup keyboard navigation
   */
  const setupKeyboardNavigation = useCallback(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (preferences.keyboardNavigation) {
        handleKeyboardNavigation(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [preferences.keyboardNavigation]);

  /**
   * Setup focus management
   */
  const setupFocusManagement = useCallback(() => {
    const updateFocusableElements = () => {
      const elements = Array.from(document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )) as HTMLElement[];
      setFocusableElements(elements);
    };

    // Update focusable elements on DOM changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial update
    updateFocusableElements();
    
    return () => {
      observer.disconnect();
    };
  }, []);

  /**
   * Announce message to screen reader
   */
  const announceToScreenReader = useCallback((message: string) => {
    try {
      if (preferences.screenReader) {
        // Create a live region for screen reader announcements
        let liveRegion = document.getElementById('screen-reader-announcements');
        if (!liveRegion) {
          liveRegion = document.createElement('div');
          liveRegion.id = 'screen-reader-announcements';
          liveRegion.setAttribute('aria-live', 'polite');
          liveRegion.setAttribute('aria-atomic', 'true');
          liveRegion.style.position = 'absolute';
          liveRegion.style.left = '-10000px';
          liveRegion.style.width = '1px';
          liveRegion.style.height = '1px';
          liveRegion.style.overflow = 'hidden';
          document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear the message after a short delay
        setTimeout(() => {
          if (liveRegion) {
            liveRegion.textContent = '';
          }
        }, 1000);
        
        logger.info('Message announced to screen reader', { message });
      }
    } catch (error) {
      logger.error('Error announcing to screen reader:', error as Error);
    }
  }, [preferences.screenReader]);

  /**
   * Set focus to specific element
   */
  const setFocus = useCallback((elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
        logger.info('Focus set to element', { elementId });
      } else {
        logger.warn('Element not found for focus', { elementId });
      }
    } catch (error) {
      logger.error('Error setting focus:', error as Error);
    }
  }, []);

  /**
   * Get all focusable elements
   */
  const getFocusableElements = useCallback(() => {
    return focusableElements;
  }, [focusableElements]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    try {
      const { key, shiftKey } = event;
      
      switch (key) {
        case 'Tab':
          setIsKeyboardNavigating(true);
          break;
          
        case 'Escape':
          // Close modals, dropdowns, etc.
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.blur) {
            activeElement.blur();
          }
          break;
          
        case 'Enter':
        case ' ':
          // Handle enter and space key actions
          const focusedElement = document.activeElement as HTMLElement;
          if (focusedElement && focusedElement.click) {
            focusedElement.click();
            event.preventDefault();
          }
          break;
          
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          // Handle arrow key navigation
          handleArrowKeyNavigation(event);
          break;
      }
    } catch (error) {
      logger.error('Error handling keyboard navigation:', error as Error);
    }
  }, []);

  /**
   * Handle arrow key navigation
   */
  const handleArrowKeyNavigation = useCallback((event: KeyboardEvent) => {
    try {
      const { key } = event;
      const currentElement = document.activeElement as HTMLElement;
      
      if (!currentElement) return;
      
      const currentIndex = focusableElements.findIndex(el => el === currentElement);
      if (currentIndex === -1) return;
      
      let nextIndex = currentIndex;
      
      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % focusableElements.length;
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
          break;
      }
      
      if (nextIndex !== currentIndex) {
        focusableElements[nextIndex].focus();
        setCurrentFocusIndex(nextIndex);
        event.preventDefault();
      }
    } catch (error) {
      logger.error('Error handling arrow key navigation:', error as Error);
    }
  }, [focusableElements]);

  /**
   * Toggle high contrast mode
   */
  const toggleHighContrast = useCallback(() => {
    const newValue = !preferences.highContrast;
    savePreferences({ highContrast: newValue });
    announceToScreenReader(`High contrast ${newValue ? 'enabled' : 'disabled'}`);
  }, [preferences.highContrast, savePreferences, announceToScreenReader]);

  /**
   * Toggle large text mode
   */
  const toggleLargeText = useCallback(() => {
    const newValue = !preferences.largeText;
    savePreferences({ largeText: newValue });
    announceToScreenReader(`Large text ${newValue ? 'enabled' : 'disabled'}`);
  }, [preferences.largeText, savePreferences, announceToScreenReader]);

  /**
   * Toggle dyslexia-friendly fonts
   */
  const toggleDyslexiaFriendly = useCallback(() => {
    const newValue = !preferences.dyslexiaFriendly;
    savePreferences({ dyslexiaFriendly: newValue });
    announceToScreenReader(`Dyslexia-friendly fonts ${newValue ? 'enabled' : 'disabled'}`);
  }, [preferences.dyslexiaFriendly, savePreferences, announceToScreenReader]);

  /**
   * Toggle reduced motion
   */
  const toggleReducedMotion = useCallback(() => {
    const newValue = !preferences.reducedMotion;
    savePreferences({ reducedMotion: newValue });
    announceToScreenReader(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`);
  }, [preferences.reducedMotion, savePreferences, announceToScreenReader]);

  /**
   * Set color blindness type
   */
  const setColorBlindness = useCallback((type: AccessibilityPreferences['colorBlindness']) => {
    savePreferences({ colorBlindness: type });
    const message = type === 'none' ? 'Color blindness filter disabled' : `${type} color blindness filter enabled`;
    announceToScreenReader(message);
  }, [savePreferences, announceToScreenReader]);

  /**
   * Set font size
   */
  const setFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    savePreferences({ fontSize: size });
    announceToScreenReader(`Font size set to ${size}`);
  }, [savePreferences, announceToScreenReader]);

  /**
   * Set line spacing
   */
  const setLineSpacing = useCallback((spacing: AccessibilityPreferences['lineSpacing']) => {
    savePreferences({ lineSpacing: spacing });
    announceToScreenReader(`Line spacing set to ${spacing}`);
  }, [savePreferences, announceToScreenReader]);

  /**
   * Set letter spacing
   */
  const setLetterSpacing = useCallback((spacing: AccessibilityPreferences['letterSpacing']) => {
    savePreferences({ letterSpacing: spacing });
    announceToScreenReader(`Letter spacing set to ${spacing}`);
  }, [savePreferences, announceToScreenReader]);

  /**
   * Reset accessibility preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    const defaults: AccessibilityPreferences = {
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
    
    setPreferences(defaults);
    localStorage.removeItem('accessibility-preferences');
    announceToScreenReader('Accessibility preferences reset to defaults');
    logger.info('Accessibility preferences reset to defaults');
  }, [announceToScreenReader]);

  /**
   * Memoized computed values
   */
  const computedValues = useMemo(() => {
    return {
      isAccessibilityEnabled: Object.values(preferences).some(Boolean),
      hasHighContrast: preferences.highContrast,
      hasLargeText: preferences.largeText,
      hasDyslexiaFriendly: preferences.dyslexiaFriendly,
      hasReducedMotion: preferences.reducedMotion,
      hasScreenReader: preferences.screenReader,
      hasKeyboardNavigation: preferences.keyboardNavigation,
      hasFocusIndicators: preferences.focusIndicators,
      currentColorBlindness: preferences.colorBlindness,
      currentFontSize: preferences.fontSize,
      currentLineSpacing: preferences.lineSpacing,
      currentLetterSpacing: preferences.letterSpacing
    };
  }, [preferences]);

  return {
    // State
    preferences,
    isKeyboardNavigating,
    currentFocusIndex,
    focusableElements,
    
    // Actions
    announceToScreenReader,
    setFocus,
    getFocusableElements,
    handleKeyboardNavigation,
    toggleHighContrast,
    toggleLargeText,
    toggleDyslexiaFriendly,
    toggleReducedMotion,
    setColorBlindness,
    setFontSize,
    setLineSpacing,
    setLetterSpacing,
    resetPreferences,
    savePreferences,
    
    // Computed values
    ...computedValues
  };
};