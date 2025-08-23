/**
 * Documents Management Page
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Main documents management page with data table, filtering, and CRUD operations
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Grid,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { useAuth } from '@/hooks/useAuth';
import { documentsApi } from '@/services/api';
import { Document } from '@/types';
import { toast } from 'react-hot-toast';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';

/**
 * Documents Management Page Component
 * 
 * @returns JSX.Element
 */
const DocumentsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    fileType: '',
    caseId: '',
    clientId: '',
    uploadedBy: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  /**
   * Load documents data
   */
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await documentsApi.getDocuments(params.toString());
      setDocuments(response.data.documents);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle document creation
   */
  const handleCreateDocument = async (documentData: Partial<Document>) => {
    try {
      await documentsApi.uploadDocument(documentData);
      toast.success('Document uploaded successfully');
      setOpenForm(false);
      loadDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    }
  };

  /**
   * Handle document update
   */
  const handleUpdateDocument = async (documentData: Partial<Document>) => {
    if (!editingDocument) return;
    
    try {
      await documentsApi.updateDocument(editingDocument.id, documentData);
      toast.success('Document updated successfully');
      setOpenForm(false);
      setEditingDocument(null);
      loadDocuments();
    } catch (error) {
      toast.error('Failed to update document');
      console.error('Error updating document:', error);
    }
  };

  /**
   * Handle document deletion
   */
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentsApi.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      loadDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  /**
   * Handle document download
   */
  const handleDownloadDocument = async (documentId: string) => {
    try {
      const response = await documentsApi.downloadDocument(documentId);
      // Handle file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download document');
      console.error('Error downloading document:', error);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    loadDocuments();
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilters({ search: '', fileType: '', caseId: '', clientId: '', uploadedBy: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, [pagination.page, pagination.limit]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = [
    {
      headerName: 'Title',
      field: 'title',
      flex: 1,
      minWidth: 200
    },
    {
      headerName: 'Type',
      field: 'fileType',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      headerName: 'Size',
      field: 'fileSize',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => formatFileSize(params.value)
    },
    {
      headerName: 'Case',
      field: 'caseTitle',
      valueGetter: (params) => params.data.caseTitle || 'No Case',
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Client',
      field: 'clientName',
      valueGetter: (params) => params.data.clientFirstName && params.data.clientLastName ? 
        `${params.data.clientFirstName} ${params.data.clientLastName}` : 'No Client',
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Uploaded By',
      field: 'uploadedByName',
      valueGetter: (params) => params.data.uploadedFirstName && params.data.uploadedLastName ? 
        `${params.data.uploadedFirstName} ${params.data.uploadedLastName}` : 'Unknown',
      flex: 1,
      minWidth: 150
    },
    {
      headerName: 'Uploaded',
      field: 'createdAt',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : ''
    },
    {
      headerName: 'Version',
      field: 'version',
      flex: 1,
      minWidth: 80,
      cellRenderer: (params: any) => (
        <Chip 
          label={`v${params.value}`} 
          size="small" 
          color="primary"
        />
      )
    },
    {
      headerName: 'Actions',
      field: 'actions',
      flex: 1,
      minWidth: 200,
      cellRenderer: (params: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              onClick={() => {
                setSelectedDocument(params.data);
                setOpenDetails(true);
              }}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton 
              size="small" 
              onClick={() => handleDownloadDocument(params.data.id)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Document">
            <IconButton 
              size="small" 
              onClick={() => {
                setEditingDocument(params.data);
                setOpenForm(true);
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Document">
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteDocument(params.data.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Document Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setOpenForm(true)}
            >
              Upload Document
            </Button>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>File Type</InputLabel>
                    <Select
                      value={filters.fileType}
                      label="File Type"
                      onChange={(e) => handleFilterChange('fileType', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="pdf">PDF</MenuItem>
                      <MenuItem value="doc">DOC</MenuItem>
                      <MenuItem value="docx">DOCX</MenuItem>
                      <MenuItem value="xls">XLS</MenuItem>
                      <MenuItem value="xlsx">XLSX</MenuItem>
                      <MenuItem value="txt">TXT</MenuItem>
                      <MenuItem value="jpg">JPG</MenuItem>
                      <MenuItem value="png">PNG</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Case</InputLabel>
                    <Select
                      value={filters.caseId}
                      label="Case"
                      onChange={(e) => handleFilterChange('caseId', e.target.value)}
                    >
                      <MenuItem value="">All Cases</MenuItem>
                      <MenuItem value="no_case">No Case</MenuItem>
                      {/* Would be populated with actual cases */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={filters.clientId}
                      label="Client"
                      onChange={(e) => handleFilterChange('clientId', e.target.value)}
                    >
                      <MenuItem value="">All Clients</MenuItem>
                      <MenuItem value="no_client">No Client</MenuItem>
                      {/* Would be populated with actual clients */}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon />}
                      onClick={applyFilters}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Box sx={{ height: 600, width: '100%' }}>
            <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
              <AgGridReact
                columnDefs={columnDefs}
                rowData={documents}
                pagination={true}
                paginationPageSize={pagination.limit}
                onGridReady={(params: GridReadyEvent) => setGridApi(params.api)}
                rowSelection="single"
                suppressRowClickSelection={true}
                loadingOverlayComponent={() => <CircularProgress />}
                loadingOverlayComponentParams={{ loadingMessage: 'Loading documents...' }}
                overlayLoadingTemplate={
                  '<span class="ag-overlay-loading-center">Loading documents...</span>'
                }
                overlayNoRowsTemplate={
                  '<span class="ag-overlay-no-rows-center">No documents found</span>'
                }
              />
            </div>
          </Box>

          {/* Pagination Info */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} documents
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadDocuments}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Document Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={() => {
          setOpenForm(false);
          setEditingDocument(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDocument ? 'Edit Document' : 'Upload New Document'}
        </DialogTitle>
        <DialogContent>
          <DocumentUpload
            document={editingDocument}
            onSubmit={editingDocument ? handleUpdateDocument : handleCreateDocument}
            onCancel={() => {
              setOpenForm(false);
              setEditingDocument(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Document Details Dialog */}
      <Dialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Document Details</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <DocumentViewer
              document={selectedDocument}
              onClose={() => setOpenDetails(false)}
              onEdit={() => {
                setEditingDocument(selectedDocument);
                setOpenDetails(false);
                setOpenForm(true);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;