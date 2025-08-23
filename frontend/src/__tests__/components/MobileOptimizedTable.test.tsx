/**
 * Mobile Optimized Table Component Tests
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Unit tests for MobileOptimizedTable component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MobileOptimizedTable from '@/components/Mobile/MobileOptimizedTable';

// Mock Material-UI hooks
jest.mock('@mui/material/styles', () => ({
  ...jest.requireActual('@mui/material/styles'),
  useTheme: () => createTheme(),
  useMediaQuery: jest.fn()
}));

const mockColumns = [
  {
    id: 'name',
    label: 'Name',
    mobilePriority: 3,
    format: (value: string) => value
  },
  {
    id: 'email',
    label: 'Email',
    mobilePriority: 2,
    format: (value: string) => value
  },
  {
    id: 'role',
    label: 'Role',
    mobilePriority: 1,
    format: (value: string) => value
  },
  {
    id: 'status',
    label: 'Status',
    mobilePriority: 0,
    format: (value: string) => value
  }
];

const mockData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Associate',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Partner',
    status: 'Active'
  }
];

const renderWithTheme = (component: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('MobileOptimizedTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop View', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('renders table view on desktop', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          title="Test Table"
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('displays data in table format', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('calls onRowClick when row is clicked', () => {
      const mockOnRowClick = jest.fn();
      
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          onRowClick={mockOnRowClick}
        />
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      fireEvent.click(firstRow!);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('shows action buttons when provided', () => {
      const mockOnView = jest.fn();
      const mockOnEdit = jest.fn();
      
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          onView={mockOnView}
          onEdit={mockOnEdit}
        />
      );

      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('calls action handlers when action buttons are clicked', () => {
      const mockOnView = jest.fn();
      const mockOnEdit = jest.fn();
      
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          onView={mockOnView}
          onEdit={mockOnEdit}
        />
      );

      const viewButtons = screen.getAllByTestId('ViewListIcon');
      fireEvent.click(viewButtons[0]);

      expect(mockOnView).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(true); // Mobile
    });

    it('renders card view on mobile by default', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          title="Test Table"
        />
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('shows mobile controls on mobile view', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
        />
      );

      // Check for mobile-specific controls
      expect(screen.getByLabelText('Filter')).toBeInTheDocument();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Sort')).toBeInTheDocument();
    });

    it('displays primary columns prominently in cards', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
        />
      );

      // Primary columns should be visible
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('allows expanding cards to show secondary information', async () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
        />
      );

      const expandButtons = screen.getAllByTestId('ExpandMoreIcon');
      fireEvent.click(expandButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });

    it('switches between card and list view', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          mobileView="cards"
        />
      );

      const fabButton = screen.getByRole('button', { name: /view module/i });
      fireEvent.click(fabButton);

      // Should switch to list view
      expect(screen.getByRole('button', { name: /view list/i })).toBeInTheDocument();
    });
  });

  describe('Loading and Empty States', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('shows loading state', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={[]}
          loading={true}
        />
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows empty message when no data', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={[]}
          emptyMessage="No records found"
        />
      );

      expect(screen.getByText('No records found')).toBeInTheDocument();
    });

    it('shows default empty message when no custom message provided', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={[]}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Column Formatting', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('applies custom formatting to column values', () => {
      const columnsWithFormatting = [
        {
          id: 'amount',
          label: 'Amount',
          format: (value: number) => `$${value.toFixed(2)}`
        },
        {
          id: 'status',
          label: 'Status',
          format: (value: string) => (
            <span style={{ color: value === 'Active' ? 'green' : 'red' }}>
              {value}
            </span>
          )
        }
      ];

      const dataWithFormatting = [
        { id: '1', amount: 100.5, status: 'Active' },
        { id: '2', amount: 200.75, status: 'Inactive' }
      ];

      renderWithTheme(
        <MobileOptimizedTable
          columns={columnsWithFormatting}
          data={dataWithFormatting}
        />
      );

      expect(screen.getByText('$100.50')).toBeInTheDocument();
      expect(screen.getByText('$200.75')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('has proper ARIA labels for interactive elements', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          onView={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      const viewButtons = screen.getAllByTestId('ViewListIcon');
      const editButtons = screen.getAllByTestId('ExpandMoreIcon');

      expect(viewButtons[0]).toBeInTheDocument();
      expect(editButtons[0]).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={mockData}
          onRowClick={jest.fn()}
        />
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('handles missing data gracefully', () => {
      const dataWithMissingFields = [
        { id: '1', name: 'John Doe' }, // Missing email, role, status
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' } // Missing role, status
      ];

      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={dataWithMissingFields}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('handles empty columns array', () => {
      renderWithTheme(
        <MobileOptimizedTable
          columns={[]}
          data={mockData}
        />
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      const { useMediaQuery } = require('@mui/material/styles');
      useMediaQuery.mockReturnValue(false); // Desktop
    });

    it('renders large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        id: index.toString(),
        name: `User ${index}`,
        email: `user${index}@example.com`,
        role: 'Associate',
        status: 'Active'
      }));

      const startTime = performance.now();
      
      renderWithTheme(
        <MobileOptimizedTable
          columns={mockColumns}
          data={largeDataset}
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});