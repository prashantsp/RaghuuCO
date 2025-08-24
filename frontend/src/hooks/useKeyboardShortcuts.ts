/**
 * Keyboard Shortcuts Hook
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This hook provides comprehensive keyboard shortcuts for improved
 * user experience and accessibility.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logger } from '@/utils/logger';

/**
 * Keyboard shortcut interface
 */
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  global?: boolean; // Whether shortcut works globally
  preventDefault?: boolean;
}

/**
 * Keyboard shortcuts hook
 */
export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);
  const isInputFocusedRef = useRef(false);

  /**
   * Register a keyboard shortcut
   */
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.current.push(shortcut);
    logger.debug(`Keyboard shortcut registered: ${shortcut.key} - ${shortcut.description}`);
  }, []);

  /**
   * Unregister a keyboard shortcut
   */
  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => s.key !== key);
    logger.debug(`Keyboard shortcut unregistered: ${key}`);
  }, []);

  /**
   * Clear all shortcuts
   */
  const clearShortcuts = useCallback(() => {
    shortcutsRef.current = [];
    logger.debug('All keyboard shortcuts cleared');
  }, []);

  /**
   * Get all registered shortcuts
   */
  const getShortcuts = useCallback(() => {
    return shortcutsRef.current;
  }, []);

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    if (isInputFocusedRef.current && !event.ctrlKey && !event.metaKey) {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(s => 
      s.key.toLowerCase() === key &&
      !!s.ctrl === ctrl &&
      !!s.shift === shift &&
      !!s.alt === alt &&
      !!s.meta === meta
    );

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      try {
        shortcut.action();
        logger.debug(`Keyboard shortcut executed: ${shortcut.key} - ${shortcut.description}`);
      } catch (error) {
        logger.error('Error executing keyboard shortcut:', error as Error);
      }
    }
  }, []);

  /**
   * Handle input focus events
   */
  const handleInputFocus = useCallback(() => {
    isInputFocusedRef.current = true;
  }, []);

  const handleInputBlur = useCallback(() => {
    isInputFocusedRef.current = false;
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleInputFocus);
    document.addEventListener('focusout', handleInputBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleInputFocus);
      document.removeEventListener('focusout', handleInputBlur);
    };
  }, [handleKeyDown, handleInputFocus, handleInputBlur]);

  return {
    registerShortcut,
    unregisterShortcut,
    clearShortcuts,
    getShortcuts
  };
};

/**
 * Global keyboard shortcuts hook
 */
export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerShortcut } = useKeyboardShortcuts();

  // Register global shortcuts
  useEffect(() => {
    // Navigation shortcuts
    registerShortcut({
      key: 'h',
      ctrl: true,
      description: 'Go to Home',
      action: () => navigate('/dashboard'),
      global: true
    });

    registerShortcut({
      key: 'c',
      ctrl: true,
      description: 'Go to Cases',
      action: () => navigate('/cases'),
      global: true
    });

    registerShortcut({
      key: 'l',
      ctrl: true,
      description: 'Go to Clients',
      action: () => navigate('/clients'),
      global: true
    });

    registerShortcut({
      key: 'd',
      ctrl: true,
      description: 'Go to Documents',
      action: () => navigate('/documents'),
      global: true
    });

    registerShortcut({
      key: 't',
      ctrl: true,
      description: 'Go to Time Tracking',
      action: () => navigate('/time-tracking'),
      global: true
    });

    registerShortcut({
      key: 'b',
      ctrl: true,
      description: 'Go to Billing',
      action: () => navigate('/billing'),
      global: true
    });

    registerShortcut({
      key: 'r',
      ctrl: true,
      description: 'Go to Reports',
      action: () => navigate('/reports'),
      global: true
    });

    registerShortcut({
      key: 's',
      ctrl: true,
      description: 'Go to Settings',
      action: () => navigate('/settings'),
      global: true
    });

    // Action shortcuts
    registerShortcut({
      key: 'n',
      ctrl: true,
      description: 'New Item',
      action: () => {
        // Dispatch action to open new item modal based on current route
        const path = window.location.pathname;
        if (path.includes('/cases')) {
          // Open new case modal
          dispatch({ type: 'cases/openNewCaseModal' });
        } else if (path.includes('/clients')) {
          // Open new client modal
          dispatch({ type: 'clients/openNewClientModal' });
        } else if (path.includes('/documents')) {
          // Open new document modal
          dispatch({ type: 'documents/openNewDocumentModal' });
        }
      },
      global: true
    });

    registerShortcut({
      key: 'f',
      ctrl: true,
      description: 'Search',
      action: () => {
        // Focus search input or open search modal
        const searchInput = document.querySelector('[data-testid="search-input"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          dispatch({ type: 'ui/openSearchModal' });
        }
      },
      global: true
    });

    registerShortcut({
      key: 'Escape',
      description: 'Close Modal/Dialog',
      action: () => {
        // Close any open modal or dialog
        dispatch({ type: 'ui/closeAllModals' });
      },
      global: true
    });

    registerShortcut({
      key: '?',
      description: 'Show Keyboard Shortcuts',
      action: () => {
        dispatch({ type: 'ui/openKeyboardShortcutsModal' });
      },
      global: true
    });

    // Accessibility shortcuts
    registerShortcut({
      key: 'Tab',
      description: 'Navigate through elements',
      action: () => {
        // Default browser behavior
      },
      global: true,
      preventDefault: false
    });

    registerShortcut({
      key: 'Enter',
      description: 'Activate element',
      action: () => {
        // Default browser behavior
      },
      global: true,
      preventDefault: false
    });

    registerShortcut({
      key: 'Space',
      description: 'Activate element',
      action: () => {
        // Default browser behavior
      },
      global: true,
      preventDefault: false
    });

    // System shortcuts
    registerShortcut({
      key: 'r',
      ctrl: true,
      shift: true,
      description: 'Refresh Page',
      action: () => window.location.reload(),
      global: true
    });

    registerShortcut({
      key: 'w',
      ctrl: true,
      description: 'Close Tab (browser default)',
      action: () => {
        // Let browser handle this
      },
      global: true,
      preventDefault: false
    });

  }, [registerShortcut, navigate, dispatch]);

  return { registerShortcut };
};

/**
 * Context-specific keyboard shortcuts hook
 */
export const useContextKeyboardShortcuts = (context: string) => {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const dispatch = useDispatch();

  // Register context-specific shortcuts
  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [];

    switch (context) {
      case 'cases':
        shortcuts.push(
          {
            key: 'a',
            ctrl: true,
            description: 'Assign Case',
            action: () => dispatch({ type: 'cases/openAssignModal' })
          },
          {
            key: 'e',
            ctrl: true,
            description: 'Edit Case',
            action: () => dispatch({ type: 'cases/openEditModal' })
          },
          {
            key: 'Delete',
            description: 'Delete Case',
            action: () => dispatch({ type: 'cases/deleteSelected' })
          }
        );
        break;

      case 'clients':
        shortcuts.push(
          {
            key: 'e',
            ctrl: true,
            description: 'Edit Client',
            action: () => dispatch({ type: 'clients/openEditModal' })
          },
          {
            key: 'v',
            ctrl: true,
            description: 'View Client Details',
            action: () => dispatch({ type: 'clients/openDetailsModal' })
          },
          {
            key: 'Delete',
            description: 'Delete Client',
            action: () => dispatch({ type: 'clients/deleteSelected' })
          }
        );
        break;

      case 'documents':
        shortcuts.push(
          {
            key: 'u',
            ctrl: true,
            description: 'Upload Document',
            action: () => dispatch({ type: 'documents/openUploadModal' })
          },
          {
            key: 'd',
            ctrl: true,
            description: 'Download Document',
            action: () => dispatch({ type: 'documents/downloadSelected' })
          },
          {
            key: 'v',
            ctrl: true,
            description: 'View Document',
            action: () => dispatch({ type: 'documents/openViewerModal' })
          },
          {
            key: 'Delete',
            description: 'Delete Document',
            action: () => dispatch({ type: 'documents/deleteSelected' })
          }
        );
        break;

      case 'time-tracking':
        shortcuts.push(
          {
            key: 's',
            ctrl: true,
            description: 'Start Timer',
            action: () => dispatch({ type: 'timeTracking/startTimer' })
          },
          {
            key: 'p',
            ctrl: true,
            description: 'Pause Timer',
            action: () => dispatch({ type: 'timeTracking/pauseTimer' })
          },
          {
            key: 'x',
            ctrl: true,
            description: 'Stop Timer',
            action: () => dispatch({ type: 'timeTracking/stopTimer' })
          }
        );
        break;

      case 'billing':
        shortcuts.push(
          {
            key: 'i',
            ctrl: true,
            description: 'Create Invoice',
            action: () => dispatch({ type: 'billing/openNewInvoiceModal' })
          },
          {
            key: 'e',
            ctrl: true,
            description: 'Edit Invoice',
            action: () => dispatch({ type: 'billing/openEditModal' })
          },
          {
            key: 's',
            ctrl: true,
            description: 'Send Invoice',
            action: () => dispatch({ type: 'billing/sendSelected' })
          }
        );
        break;
    }

    // Register all shortcuts for this context
    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    // Cleanup function
    return () => {
      shortcuts.forEach(shortcut => unregisterShortcut(shortcut.key));
    };
  }, [context, registerShortcut, unregisterShortcut, dispatch]);

  return { registerShortcut, unregisterShortcut };
};

/**
 * Data grid keyboard shortcuts hook
 */
export const useDataGridKeyboardShortcuts = (gridRef: any) => {
  const { registerShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    if (!gridRef) return;

    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'ArrowUp',
        description: 'Select Previous Row',
        action: () => {
          // Navigate to previous row
          const currentRow = gridRef.current?.getFocusedCell();
          if (currentRow) {
            gridRef.current?.setFocusedCell(currentRow.rowIndex - 1, currentRow.column.colId);
          }
        }
      },
      {
        key: 'ArrowDown',
        description: 'Select Next Row',
        action: () => {
          // Navigate to next row
          const currentRow = gridRef.current?.getFocusedCell();
          if (currentRow) {
            gridRef.current?.setFocusedCell(currentRow.rowIndex + 1, currentRow.column.colId);
          }
        }
      },
      {
        key: 'Enter',
        description: 'Edit Cell',
        action: () => {
          // Start editing current cell
          const currentCell = gridRef.current?.getFocusedCell();
          if (currentCell) {
            gridRef.current?.startEditingCell({
              rowIndex: currentCell.rowIndex,
              colKey: currentCell.column.colId
            });
          }
        }
      },
      {
        key: 'Delete',
        description: 'Delete Selected Rows',
        action: () => {
          // Delete selected rows
          const selectedRows = gridRef.current?.getSelectedRows();
          if (selectedRows && selectedRows.length > 0) {
            // Dispatch delete action
            console.log('Delete selected rows:', selectedRows);
          }
        }
      },
      {
        key: 'a',
        ctrl: true,
        description: 'Select All Rows',
        action: () => {
          gridRef.current?.selectAll();
        }
      },
      {
        key: 'c',
        ctrl: true,
        description: 'Copy Selected Rows',
        action: () => {
          const selectedRows = gridRef.current?.getSelectedRows();
          if (selectedRows && selectedRows.length > 0) {
            const csv = selectedRows.map(row => Object.values(row.data).join(',')).join('\n');
            navigator.clipboard.writeText(csv);
          }
        }
      }
    ];

    shortcuts.forEach(shortcut => registerShortcut(shortcut));

    return () => {
      shortcuts.forEach(shortcut => registerShortcut(shortcut));
    };
  }, [gridRef, registerShortcut]);
};

export default useKeyboardShortcuts;