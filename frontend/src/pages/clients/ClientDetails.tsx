/**
 * Client Details Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Client details component to display comprehensive client information
 * including profile, cases, and documents
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
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Client } from '@/types';

/**
 * Client Details Props Interface
 */
interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
  onEdit?: () => void;
}

/**
 * Tab Panel Component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`client-tabpanel-${index}`}
      aria-labelledby={`client-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Client Details Component
 * 
 * @param props - ClientDetailsProps
 * @returns JSX.Element
 */
const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onEdit }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [clientData, setClientData] = useState<any>(null);

  /**
   * Load client data
   */
  const loadClientData = async () => {
    try {
      setLoading(true);
      // This would typically call the API to get full client data
      // For now, we'll use the passed client data
      setClientData({
        client,
        cases: [], // Would be populated from API
        documents: [] // Would be populated from API
      });
    } catch (error) {
      setError('Failed to load client data');
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  // Load client data on component mount
  useEffect(() => {
    loadClientData();
  }, [client.id]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            {client.firstName.charAt(0)}{client.lastName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {client.firstName} {client.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {client.email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {onEdit && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="client details tabs">
          <Tab label="Profile" />
          <Tab label="Cases" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={`${client.firstName} ${client.lastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={client.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={client.phone || 'Not provided'}
                    />
                  </ListItem>
                  {client.company && (
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Company"
                        secondary={client.company}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Client Since"
                      secondary={formatDate(client.createdAt)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={client.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(client.isActive)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Cases"
                      secondary={client.caseCount || 0}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {client.address && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <LocationIcon sx={{ mt: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {client.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Card>

      {/* Cases Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : clientData?.cases?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Case Number</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientData.cases.map((caseItem: any) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>{caseItem.caseNumber}</TableCell>
                    <TableCell>{caseItem.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={caseItem.status}
                        size="small"
                        color={caseItem.status === 'open' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={caseItem.priority}
                        size="small"
                        color={caseItem.priority === 'high' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center">
            No cases found for this client
          </Typography>
        )}
      </Card>

      {/* Documents Tab */}
      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : clientData?.documents?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientData.documents.map((document: any) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.title}</TableCell>
                    <TableCell>{document.fileType}</TableCell>
                    <TableCell>{document.fileSize}</TableCell>
                    <TableCell>{formatDate(document.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center">
            No documents found for this client
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default ClientDetails;