/**
 * Advanced Data Grid Component
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description This component provides an advanced data grid with filtering,
 * sorting, pagination, bulk operations, and interactive features for
 * displaying and managing data in the legal practice management system.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Tooltip,
  Badge,
  Alert,
  LinearProgress,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Sort as SortIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useAccessibility } from './AccessibilityProvider';
import { logger } from '@/utils/logger';

/**
 * Column definition interface
 */
export interface ColumnDefinition<T = any> {
  id: keyof T;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => string | React.ReactNode;
  render?: (value: any, row: T) => React.ReactNode;
  filterOptions?: { value: string; label: string }[];
  searchable?: boolean;
  exportable?: boolean;
  tooltip?: string;
}

/**
 * Sort configuration interface
 */
export interface SortConfig {
  field: keyof any;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration interface
 */
export interface FilterConfig {
  field: keyof any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
  value2?: any; // For between operator
}

/**
 * Bulk operation interface
 */
export interface BulkOperation {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedRows: any[]) => void;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: (selectedRows: any[]) => boolean;
}

/**
 * Advanced data grid props
 */
export interface AdvancedDataGridProps<T = any> {
  // Data
  data: T[];
  columns: ColumnDefinition<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Sorting
  sorting?: boolean;
  defaultSort?: SortConfig;
  onSortChange?: (sort: SortConfig) => void;
  
  // Filtering
  filtering?: boolean;
  defaultFilters?: FilterConfig[];
  onFilterChange?: (filters: FilterConfig[]) => void;
  
  // Selection
  selection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  
  // Bulk operations
  bulkOperations?: BulkOperation[];
  
  // Actions
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  
  // Export
  exportable?: boolean;
  onExport?: (data: T[], format: 'csv' | 'excel' | 'pdf') => void;
  
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  
  // Refresh
  refreshable?: boolean;
  onRefresh?: () => void;
  
  // Customization
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  noDataMessage?: string;
  height?: number | string;
  maxHeight?: number | string;
  dense?: boolean;
  stickyHeader?: boolean;
  
  // Callbacks
  onRowExpand?: (row: T) => React.ReactNode;
  expandable?: boolean;
  expandedRows?: string[];
  onExpandedRowsChange?: (expandedRows: string[]) => void;
}

/**
 * Advanced data grid component
 */
function AdvancedDataGrid<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  error = null,
  pagination = true,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  sorting = true,
  defaultSort,
  onSortChange,
  filtering = true,
  defaultFilters = [],
  onFilterChange,
  selection = false,
  onSelectionChange,
  bulkOperations = [],
  onRowClick,
  onRowDoubleClick,
  rowActions,
  exportable = false,
  onExport,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  refreshable = true,
  onRefresh,
  title,
  subtitle,
  emptyMessage = 'No data available',
  noDataMessage = 'No results found',
  height,
  maxHeight,
  dense = false,
  stickyHeader = true,
  onRowExpand,
  expandable = false,
  expandedRows = [],
  onExpandedRowsChange
}: AdvancedDataGridProps<T>) {
  const { announceToScreenReader } = useAccessibility();

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null);
  const [filters, setFilters] = useState<FilterConfig[]>(defaultFilters);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuRow, setActionMenuRow] = useState<T | null>(null);
  const [expandedRowsState, setExpandedRowsState] = useState<string[]>(expandedRows);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row => {
        return columns.some(column => {
          if (!column.searchable) return false;
          const value = row[column.id];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply filters
    if (filters.length > 0) {
      result = result.filter(row => {
        return filters.every(filter => {
          const value = row[filter.field];
          const filterValue = filter.value;

          switch (filter.operator) {
            case 'equals':
              return value === filterValue;
            case 'contains':
              return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'startsWith':
              return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
            case 'endsWith':
              return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
            case 'greaterThan':
              return value > filterValue;
            case 'lessThan':
              return value < filterValue;
            case 'between':
              return value >= filterValue && value <= (filter.value2 || filterValue);
            case 'in':
              return Array.isArray(filterValue) ? filterValue.includes(value) : false;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortConfig, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;
    const startIndex = page * rowsPerPage;
    return processedData.slice(startIndex, startIndex + rowsPerPage);
  }, [processedData, page, rowsPerPage, pagination]);

  // Handle sort change
  const handleSortChange = useCallback((field: keyof T) => {
    const newSortConfig: SortConfig = {
      field,
      direction: sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    };

    setSortConfig(newSortConfig);
    onSortChange?.(newSortConfig);
    
    announceToScreenReader(`Sorted by ${String(field)} in ${newSortConfig.direction}ending order`);
  }, [sortConfig, onSortChange, announceToScreenReader]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: FilterConfig[]) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
    setPage(0); // Reset to first page when filtering
    
    announceToScreenReader(`Applied ${newFilters.length} filters`);
  }, [onFilterChange, announceToScreenReader]);

  // Handle selection change
  const handleSelectionChange = useCallback((newSelectedRows: T[]) => {
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(newSelectedRows);
    
    announceToScreenReader(`${newSelectedRows.length} rows selected`);
  }, [onSelectionChange, announceToScreenReader]);

  // Handle row selection
  const handleRowSelection = useCallback((row: T, checked: boolean) => {
    const newSelectedRows = checked
      ? [...selectedRows, row]
      : selectedRows.filter(selectedRow => selectedRow.id !== row.id);
    
    handleSelectionChange(newSelectedRows);
  }, [selectedRows, handleSelectionChange]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelectedRows = checked ? paginatedData : [];
    handleSelectionChange(newSelectedRows);
  }, [paginatedData, handleSelectionChange]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page when searching
    onSearch?.(query);
  }, [onSearch]);

  // Handle export
  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    onExport?.(processedData, format);
    announceToScreenReader(`Exporting data in ${format.toUpperCase()} format`);
  }, [processedData, onExport, announceToScreenReader]);

  // Handle row expansion
  const handleRowExpand = useCallback((rowId: string) => {
    const newExpandedRows = expandedRowsState.includes(rowId)
      ? expandedRowsState.filter(id => id !== rowId)
      : [...expandedRowsState, rowId];
    
    setExpandedRowsState(newExpandedRows);
    onExpandedRowsChange?.(newExpandedRows);
  }, [expandedRowsState, onExpandedRowsChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
    setPage(0);
    onFilterChange?.([]);
    onSearch?.('');
    
    announceToScreenReader('All filters cleared');
  }, [onFilterChange, onSearch, announceToScreenReader]);

  // Get filter count
  const filterCount = filters.length + (searchQuery ? 1 : 0);

  // Render cell value
  const renderCellValue = useCallback((column: ColumnDefinition<T>, row: T) => {
    const value = row[column.id];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.format) {
      return column.format(value, row);
    }

    if (value == null) {
      return '-';
    }

    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'select':
        const option = column.filterOptions?.find(opt => opt.value === value);
        return option?.label || value;
      default:
        return String(value);
    }
  }, []);

  // Log component interactions
  useEffect(() => {
    logger.info('AdvancedDataGrid rendered', {
      dataCount: data.length,
      processedCount: processedData.length,
      selectedCount: selectedRows.length,
      filterCount,
      timestamp: new Date().toISOString()
    });
  }, [data.length, processedData.length, selectedRows.length, filterCount]);

  return (
    <Paper elevation={2} sx={{ height, maxHeight }}>
      {/* Header */}
      {(title || searchable || refreshable || exportable || filterCount > 0) && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            {/* Title */}
            {(title || subtitle) && (
              <Grid item xs={12} sm={6}>
                {title && (
                  <Typography variant="h6" component="h2">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Grid>
            )}

            {/* Search */}
            {searchable && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleSearch('')}
                          aria-label="Clear search"
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12} sm={2}>
              <Box display="flex" gap={1} justifyContent="flex-end">
                {/* Filter indicator */}
                {filtering && filterCount > 0 && (
                  <Badge badgeContent={filterCount} color="primary">
                    <Tooltip title="Active filters">
                      <IconButton
                        size="small"
                        onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                        aria-label={`${filterCount} active filters`}
                      >
                        <FilterIcon />
                      </IconButton>
                    </Tooltip>
                  </Badge>
                )}

                {/* Refresh */}
                {refreshable && (
                  <Tooltip title="Refresh data">
                    <IconButton
                      size="small"
                      onClick={onRefresh}
                      disabled={loading}
                      aria-label="Refresh data"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}

                {/* Export */}
                {exportable && (
                  <Menu
                    anchorEl={actionMenuAnchor}
                    open={Boolean(actionMenuAnchor)}
                    onClose={() => setActionMenuAnchor(null)}
                  >
                    <MenuItem onClick={() => handleExport('csv')}>
                      <DownloadIcon sx={{ mr: 1 }} />
                      Export as CSV
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('excel')}>
                      <DownloadIcon sx={{ mr: 1 }} />
                      Export as Excel
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('pdf')}>
                      <DownloadIcon sx={{ mr: 1 }} />
                      Export as PDF
                    </MenuItem>
                  </Menu>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Filter summary */}
          {filterCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" onClose={clearFilters}>
                {filterCount} filter{filterCount !== 1 ? 's' : ''} applied
                {searchQuery && ` • Search: "${searchQuery}"`}
                {filters.map((filter, index) => (
                  <span key={index}>
                    {index > 0 ? ', ' : ' • '}
                    {String(filter.field)} {filter.operator} {String(filter.value)}
                  </span>
                ))}
              </Alert>
            </Box>
          )}
        </Box>
      )}

      {/* Bulk operations */}
      {selection && selectedRows.length > 0 && bulkOperations.length > 0 && (
        <Box sx={{ p: 1, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              {selectedRows.length} selected
            </Typography>
            <Divider orientation="vertical" flexItem />
            {bulkOperations.map((operation) => (
              <Button
                key={operation.id}
                size="small"
                startIcon={operation.icon}
                onClick={() => operation.action(selectedRows)}
                disabled={operation.disabled?.(selectedRows)}
                color={operation.color}
                variant="outlined"
              >
                {operation.label}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {/* Loading indicator */}
      {loading && <LinearProgress />}

      {/* Error message */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: maxHeight || 'calc(100vh - 300px)' }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {/* Selection column */}
              {selection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedData.length}
                    checked={selectedRows.length > 0 && selectedRows.length === paginatedData.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </TableCell>
              )}

              {/* Expand column */}
              {expandable && (
                <TableCell padding="checkbox" />
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                  }}
                  sortDirection={sortConfig?.field === column.id ? sortConfig.direction : false}
                >
                  {sorting && column.sortable ? (
                    <TableSortLabel
                      active={sortConfig?.field === column.id}
                      direction={sortConfig?.field === column.id ? sortConfig.direction : 'asc'}
                      onClick={() => handleSortChange(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}

              {/* Actions column */}
              {rowActions && (
                <TableCell align="center" style={{ width: 80 }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selection ? 1 : 0) + (expandable ? 1 : 0) + (rowActions ? 1 : 0)}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      {filterCount > 0 ? noDataMessage : emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    hover
                    onClick={() => onRowClick?.(row)}
                    onDoubleClick={() => onRowDoubleClick?.(row)}
                    sx={{ cursor: onRowClick || onRowDoubleClick ? 'pointer' : 'default' }}
                    selected={selectedRows.some(selectedRow => selectedRow.id === row.id)}
                  >
                    {/* Selection checkbox */}
                    {selection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.some(selectedRow => selectedRow.id === row.id)}
                          onChange={(e) => handleRowSelection(row, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select row ${row.id}`}
                        />
                      </TableCell>
                    )}

                    {/* Expand button */}
                    {expandable && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowExpand(String(row.id));
                          }}
                          aria-label={`Expand row ${row.id}`}
                        >
                          {expandedRowsState.includes(String(row.id)) ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <TableCell
                        key={String(column.id)}
                        align={column.align || 'left'}
                        style={{
                          width: column.width,
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth
                        }}
                      >
                        {renderCellValue(column, row)}
                      </TableCell>
                    ))}

                    {/* Row actions */}
                    {rowActions && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuRow(row);
                            setActionMenuAnchor(e.currentTarget);
                          }}
                          aria-label={`Actions for row ${row.id}`}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expanded content */}
                  {expandable && expandedRowsState.includes(String(row.id)) && onRowExpand && (
                    <TableRow>
                      <TableCell colSpan={columns.length + (selection ? 1 : 0) + (expandable ? 1 : 0) + (rowActions ? 1 : 0)}>
                        <Box sx={{ py: 2 }}>
                          {onRowExpand(row)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          component="div"
          count={processedData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={pageSizeOptions}
        />
      )}

      {/* Row actions menu */}
      {rowActions && (
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={() => {
            setActionMenuAnchor(null);
            setActionMenuRow(null);
          }}
        >
          {actionMenuRow && rowActions(actionMenuRow)}
        </Menu>
      )}
    </Paper>
  );
}

export default AdvancedDataGrid;