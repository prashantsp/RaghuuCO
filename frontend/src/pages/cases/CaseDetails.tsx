/**
 * Case Details Component
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Case details component to display comprehensive case information
 * including profile, documents, time entries, and audit logs
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
  Paper,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as PriorityIcon,
  Category as CategoryIcon,
  Description as DocumentIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  History as HistoryIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { Case } from '@/types';

/**
 * Case Details Props Interface
 */
interface CaseDetailsProps {
  caseData: Case;
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
      id={`case-tabpanel-${index}`}
      aria-labelledby={`case-tab-${index}`}
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
 * Case Details Component
 * 
 * @param props - CaseDetailsProps
 * @returns JSX.Element
 */
const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData, onClose, onEdit }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [caseDetails, setCaseDetails] = useState<any>(null);

  /**
   * Load case details
   */
  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      // This would typically call the API to get full case data
      // For now, we'll use the passed case data
      setCaseDetails({
        case: caseData,
        documents: [], // Would be populated from API
        timeEntries: [], // Would be populated from API
        auditLogs: [] // Would be populated from API
      });
    } catch (error) {
      setError('Failed to load case details');
      console.error('Error loading case details:', error);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      open: 'success',
      in_progress: 'warning',
      closed: 'default',
      on_hold: 'info'
    };
    return colors[status] || 'default';
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      urgent: 'error'
    };
    return colors[priority] || 'default';
  };

  // Load case details on component mount
  useEffect(() => {
    loadCaseDetails();
  }, [caseData.id]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
          >
            <AssignmentIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h2">
              {caseData.caseNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {caseData.title}
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
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="case details tabs">
          <Tab label="Overview" />
          <Tab label="Documents" />
          <Tab label="Time Entries" />
          <Tab label="History" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Case Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Case Number"
                      secondary={caseData.caseNumber}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Title"
                      secondary={caseData.title}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Description"
                      secondary={caseData.description}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Category"
                      secondary={caseData.category}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status & Priority
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={caseData.status}
                          color={getStatusColor(caseData.status)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PriorityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Priority"
                      secondary={
                        <Chip
                          label={caseData.priority}
                          color={getPriorityColor(caseData.priority)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Due Date"
                      secondary={caseData.dueDate ? formatDate(caseData.dueDate) : 'No due date'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={formatDate(caseData.createdAt)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Client Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Client"
                      secondary={`${caseData.clientFirstName} ${caseData.clientLastName}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <BusinessIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company"
                      secondary={caseData.clientCompany || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignment & Billing
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Assigned To"
                      secondary={caseData.assignedFirstName && caseData.assignedLastName ? 
                        `${caseData.assignedFirstName} ${caseData.assignedLastName}` : 'Unassigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Estimated Hours"
                      secondary={caseData.estimatedHours || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Billing Rate"
                      secondary={`$${caseData.billingRate || 0}/hour`}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {caseData.tags && caseData.tags.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {caseData.tags.map((tag, index) => (
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
        </Grid>
      </Card>

      {/* Documents Tab */}
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : caseDetails?.documents?.length > 0 ? (
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
                {caseDetails.documents.map((document: any) => (
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
            No documents found for this case
          </Typography>
        )}
      </Card>

      {/* Time Entries Tab */}
      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : caseDetails?.timeEntries?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Billable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caseDetails.timeEntries.map((entry: any) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.dateWorked)}</TableCell>
                    <TableCell>{entry.taskDescription}</TableCell>
                    <TableCell>{entry.hoursWorked}</TableCell>
                    <TableCell>${entry.billingRate}</TableCell>
                    <TableCell>${entry.hoursWorked * entry.billingRate}</TableCell>
                    <TableCell>
                      <Chip
                        label={entry.isBillable ? 'Yes' : 'No'}
                        color={entry.isBillable ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center">
            No time entries found for this case
          </Typography>
        )}
      </Card>

      {/* History Tab */}
      <TabPanel value={tabValue} index={3}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : caseDetails?.auditLogs?.length > 0 ? (
          <Timeline>
            {caseDetails.auditLogs.map((log: any, index: number) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  {index < caseDetails.auditLogs.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(log.created_at)}
                  </Typography>
                  {log.old_values && log.new_values && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Changes: {Object.keys(log.new_values).join(', ')}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Typography color="text.secondary" align="center">
            No history found for this case
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default CaseDetails;