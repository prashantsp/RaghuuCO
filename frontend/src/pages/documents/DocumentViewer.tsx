/**
 * Document Viewer Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Document viewer component for document preview and download
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  FileCopy as FileCopyIcon,
  Share as ShareIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { Document } from '@/types';
import { documentsApi } from '@/services/api';

/**
 * Document Viewer Props Interface
 */
interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
  onEdit?: () => void;
}

/**
 * Document Viewer Component
 * 
 * @param props - DocumentViewerProps
 * @returns JSX.Element
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

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

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get file type icon
   */
  const getFileTypeIcon = (fileType: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'pdf': <DescriptionIcon color="error" />,
      'doc': <DescriptionIcon color="primary" />,
      'docx': <DescriptionIcon color="primary" />,
      'xls': <DescriptionIcon color="success" />,
      'xlsx': <DescriptionIcon color="success" />,
      'txt': <DescriptionIcon color="default" />,
      'jpg': <DescriptionIcon color="secondary" />,
      'jpeg': <DescriptionIcon color="secondary" />,
      'png': <DescriptionIcon color="secondary" />
    };
    return iconMap[fileType.toLowerCase()] || <DescriptionIcon />;
  };

  /**
   * Handle document download
   */
  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await documentsApi.downloadDocument(document.id);
      
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.title || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Failed to download document');
      console.error('Error downloading document:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle document preview
   */
  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await documentsApi.downloadDocument(document.id);
      
      // Create blob URL for preview
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      setError('Failed to load document preview');
      console.error('Error loading document preview:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle print
   */
  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  };

  /**
   * Handle share
   */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            {getFileTypeIcon(document.fileType)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {document.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {document.fileType.toUpperCase()} • {formatFileSize(document.fileSize)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Preview">
            <IconButton
              onClick={handlePreview}
              disabled={loading}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              onClick={handleDownload}
              disabled={loading}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton
              onClick={handlePrint}
              disabled={!previewUrl}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share">
            <IconButton
              onClick={handleShare}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                onClick={onEdit}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Document Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Title"
                    secondary={document.title}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={document.description || 'No description'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="File Type"
                    secondary={document.fileType.toUpperCase()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="File Size"
                    secondary={formatFileSize(document.fileSize)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Version"
                    secondary={`v${document.version}`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Metadata */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Metadata
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Uploaded By"
                    secondary={document.uploadedFirstName && document.uploadedLastName ? 
                      `${document.uploadedFirstName} ${document.uploadedLastName}` : 'Unknown'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Uploaded"
                    secondary={formatDate(document.createdAt)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Last Modified"
                    secondary={formatDate(document.updatedAt)}
                  />
                </ListItem>
                {document.caseTitle && (
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Associated Case"
                      secondary={document.caseTitle}
                    />
                  </ListItem>
                )}
                {document.clientFirstName && document.clientLastName && (
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Associated Client"
                      secondary={`${document.clientFirstName} ${document.clientLastName}`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {document.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Version History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Version History
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <HistoryIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Version ${document.version}`}
                    secondary={`Current version • ${formatDate(document.createdAt)}`}
                  />
                  <Chip label="Current" color="primary" size="small" />
                </ListItem>
                {/* Additional versions would be loaded from API */}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {document.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
              >
                Download
              </Button>
              <IconButton onClick={() => setShowPreview(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : previewUrl ? (
            <Box sx={{ height: '100%', width: '100%' }}>
              {document.fileType.toLowerCase() === 'pdf' ? (
                <iframe
                  src={previewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={document.title}
                />
              ) : document.fileType.toLowerCase().match(/^(jpg|jpeg|png|gif)$/) ? (
                <img
                  src={previewUrl}
                  alt={document.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Preview not available for this file type. Please download to view.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                Failed to load preview
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentViewer;