/**
 * Mobile Optimized Table Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Mobile-optimized table component with touch-friendly interactions and responsive design
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Fab,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon
} from '@mui/icons-material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string | React.ReactNode;
  mobilePriority?: number; // Higher number = higher priority for mobile
}

interface MobileOptimizedTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  showActions?: boolean;
  mobileView?: 'cards' | 'list' | 'auto';
}

const MobileOptimizedTable: React.FC<MobileOptimizedTableProps> = ({
  columns,
  data,
  title,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'No data available',
  showActions = true,
  mobileView = 'auto'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'list'>('table');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Auto-detect view mode based on screen size
  React.useEffect(() => {
    if (mobileView === 'auto') {
      setViewMode(isMobile ? 'cards' : 'table');
    } else {
      setViewMode(mobileView === 'cards' ? 'cards' : mobileView === 'list' ? 'list' : 'table');
    }
  }, [isMobile, mobileView]);

  // Sort columns by mobile priority
  const sortedColumns = [...columns].sort((a, b) => 
    (b.mobilePriority || 0) - (a.mobilePriority || 0)
  );

  // Get primary columns for mobile (top 3 priority)
  const primaryColumns = sortedColumns.slice(0, 3);
  const secondaryColumns = sortedColumns.slice(3);

  const handleRowToggle = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const handleRowClick = (row: any) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  const renderMobileCard = (row: any, index: number) => {
    const isExpanded = expandedRows.has(row.id || index.toString());

    return (
      <Card 
        key={row.id || index} 
        sx={{ 
          mb: 2, 
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': onRowClick ? { 
            boxShadow: theme.shadows[8],
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          } : {}
        }}
        onClick={() => handleRowClick(row)}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Primary Information */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              {primaryColumns.map((column) => (
                <Box key={column.id} sx={{ mb: 1 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {column.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: column.id === 'title' || column.id === 'name' ? 'bold' : 'normal' }}>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Actions */}
            {showActions && (
              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                {onView && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(row);
                    }}
                  >
                    <ViewListIcon fontSize="small" />
                  </IconButton>
                )}
                {onEdit && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                )}
                {secondaryColumns.length > 0 && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowToggle(row.id || index.toString());
                    }}
                  >
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          {/* Secondary Information (Collapsible) */}
          {secondaryColumns.length > 0 && (
            <Collapse in={isExpanded}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                {secondaryColumns.map((column) => (
                  <Box key={column.id}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {column.label}
                    </Typography>
                    <Typography variant="body2">
                      {column.format ? column.format(row[column.id]) : row[column.id]}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderMobileList = (row: any, index: number) => {
    return (
      <ListItem 
        key={row.id || index}
        sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          mb: 1,
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': onRowClick ? { 
            backgroundColor: theme.palette.action.hover 
          } : {}
        }}
        onClick={() => handleRowClick(row)}
      >
        <ListItemText
          primary={
            <Box>
              {primaryColumns.map((column) => (
                <Typography key={column.id} variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{column.label}:</strong> {column.format ? column.format(row[column.id]) : row[column.id]}
                </Typography>
              ))}
            </Box>
          }
          secondary={
            secondaryColumns.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {secondaryColumns.slice(0, 2).map((column) => (
                  <Typography key={column.id} variant="caption" display="block" color="textSecondary">
                    {column.label}: {column.format ? column.format(row[column.id]) : row[column.id]}
                  </Typography>
                ))}
              </Box>
            )
          }
        />
        {showActions && (
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onView && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(row);
                  }}
                >
                  <ViewListIcon fontSize="small" />
                </IconButton>
              )}
              {onEdit && (
                <IconButton 
                  size="small" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                >
                  <ExpandMoreIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  };

  const renderDesktopTable = () => (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{ fontWeight: 'bold' }}
              >
                {column.label}
              </TableCell>
            ))}
            {showActions && (
              <TableCell align="center" sx={{ minWidth: 120 }}>
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row.id || index}
              hover
              onClick={() => handleRowClick(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </TableCell>
              ))}
              {showActions && (
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {onView && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(row);
                        }}
                      >
                        <ViewListIcon fontSize="small" />
                      </IconButton>
                    )}
                    {onEdit && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography color="textSecondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header with Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {title && (
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        )}
        
        {/* Mobile Controls */}
        {isMobile && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Filter">
              <IconButton size="small" onClick={() => setFilterDrawerOpen(true)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Search">
              <IconButton size="small">
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Sort">
              <IconButton size="small">
                <SortIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Content */}
      {viewMode === 'table' ? (
        renderDesktopTable()
      ) : viewMode === 'cards' ? (
        <Box>
          {data.map((row, index) => renderMobileCard(row, index))}
        </Box>
      ) : (
        <List>
          {data.map((row, index) => renderMobileList(row, index))}
        </List>
      )}

      {/* Floating Action Button for View Mode Toggle */}
      {isMobile && (
        <Fab
          color="primary"
          size="small"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
        >
          {viewMode === 'cards' ? <ViewModuleIcon /> : <ViewListIcon />}
        </Fab>
      )}

      {/* Filter Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onOpen={() => setFilterDrawerOpen(true)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          {/* Filter content would go here */}
        </Box>
      </SwipeableDrawer>
    </Box>
  );
};

export default MobileOptimizedTable;