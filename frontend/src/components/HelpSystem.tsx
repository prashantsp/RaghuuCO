/**
 * Help System Component
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description This component provides a comprehensive help system with documentation,
 * tutorials, and user guidance for the legal practice management system.
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Grid,
  Divider,
  Link,
  Paper
} from '@mui/material';
import {
  Help as HelpIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  Keyboard as KeyboardIcon,
  QuestionAnswer as FAQIcon,
  Book as BookIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { logger } from '@/utils/logger';

/**
 * Help system interface
 */
interface HelpItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  articleUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Help system props
 */
interface HelpSystemProps {
  open: boolean;
  onClose: () => void;
  initialSearch?: string;
  initialCategory?: string;
}

/**
 * Help system component
 */
const HelpSystem: React.FC<HelpSystemProps> = ({
  open,
  onClose,
  initialSearch = '',
  initialCategory = 'getting-started'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [filteredItems, setFilteredItems] = useState<HelpItem[]>([]);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

  // Help content data
  const helpContent: HelpItem[] = [
    // Getting Started
    {
      id: 'getting-started',
      title: 'Getting Started with RAGHUU CO',
      content: 'Welcome to RAGHUU CO Legal Practice Management System. This guide will help you get started with the basic features and navigation.',
      category: 'getting-started',
      tags: ['welcome', 'basics', 'navigation'],
      difficulty: 'beginner',
      videoUrl: 'https://example.com/videos/getting-started.mp4',
      articleUrl: '/docs/getting-started'
    },
    {
      id: 'user-interface',
      title: 'Understanding the User Interface',
      content: 'Learn about the main components of the user interface, including the dashboard, navigation menu, and common elements.',
      category: 'getting-started',
      tags: ['ui', 'dashboard', 'navigation'],
      difficulty: 'beginner'
    },
    {
      id: 'user-roles',
      title: 'User Roles and Permissions',
      content: 'Understand the different user roles in the system and their respective permissions and capabilities.',
      category: 'getting-started',
      tags: ['roles', 'permissions', 'access'],
      difficulty: 'beginner'
    },

    // Case Management
    {
      id: 'case-management',
      title: 'Case Management Overview',
      content: 'Learn how to create, manage, and track cases effectively using the case management system.',
      category: 'case-management',
      tags: ['cases', 'management', 'tracking'],
      difficulty: 'beginner',
      videoUrl: 'https://example.com/videos/case-management.mp4'
    },
    {
      id: 'create-case',
      title: 'Creating a New Case',
      content: 'Step-by-step guide to creating a new case, including required fields and best practices.',
      category: 'case-management',
      tags: ['create', 'new case', 'setup'],
      difficulty: 'beginner'
    },
    {
      id: 'case-tracking',
      title: 'Case Tracking and Updates',
      content: 'Learn how to track case progress, add updates, and manage case milestones.',
      category: 'case-management',
      tags: ['tracking', 'updates', 'milestones'],
      difficulty: 'intermediate'
    },

    // Client Management
    {
      id: 'client-management',
      title: 'Client Management',
      content: 'Comprehensive guide to managing client information, communication, and relationships.',
      category: 'client-management',
      tags: ['clients', 'management', 'communication'],
      difficulty: 'beginner'
    },
    {
      id: 'add-client',
      title: 'Adding New Clients',
      content: 'How to add new clients to the system, including individual and corporate clients.',
      category: 'client-management',
      tags: ['add client', 'individual', 'corporate'],
      difficulty: 'beginner'
    },

    // Document Management
    {
      id: 'document-management',
      title: 'Document Management System',
      content: 'Learn how to upload, organize, and manage documents securely in the system.',
      category: 'document-management',
      tags: ['documents', 'upload', 'organization'],
      difficulty: 'beginner',
      videoUrl: 'https://example.com/videos/document-management.mp4'
    },
    {
      id: 'document-security',
      title: 'Document Security and Encryption',
      content: 'Understanding document security features, encryption, and access controls.',
      category: 'document-management',
      tags: ['security', 'encryption', 'access control'],
      difficulty: 'intermediate'
    },

    // Time Tracking
    {
      id: 'time-tracking',
      title: 'Time Tracking and Billing',
      content: 'Learn how to track time, manage billable hours, and generate invoices.',
      category: 'time-tracking',
      tags: ['time', 'billing', 'invoices'],
      difficulty: 'intermediate',
      videoUrl: 'https://example.com/videos/time-tracking.mp4'
    },
    {
      id: 'timer-usage',
      title: 'Using the Timer Feature',
      content: 'How to start, pause, and stop timers for accurate time tracking.',
      category: 'time-tracking',
      tags: ['timer', 'start', 'pause', 'stop'],
      difficulty: 'beginner'
    },

    // Billing
    {
      id: 'billing-system',
      title: 'Billing and Invoicing',
      content: 'Complete guide to creating invoices, managing payments, and tracking revenue.',
      category: 'billing',
      tags: ['billing', 'invoices', 'payments'],
      difficulty: 'intermediate'
    },
    {
      id: 'create-invoice',
      title: 'Creating and Sending Invoices',
      content: 'Step-by-step process for creating professional invoices and sending them to clients.',
      category: 'billing',
      tags: ['create invoice', 'send', 'professional'],
      difficulty: 'intermediate'
    },

    // Advanced Features
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      content: 'Master the keyboard shortcuts to improve your productivity and workflow efficiency.',
      category: 'advanced-features',
      tags: ['shortcuts', 'productivity', 'efficiency'],
      difficulty: 'intermediate',
      articleUrl: '/docs/keyboard-shortcuts'
    },
    {
      id: 'search-features',
      title: 'Advanced Search Features',
      content: 'Learn how to use the powerful search functionality to find cases, clients, and documents quickly.',
      category: 'advanced-features',
      tags: ['search', 'advanced', 'find'],
      difficulty: 'intermediate'
    },
    {
      id: 'reports-analytics',
      title: 'Reports and Analytics',
      content: 'Understanding the reporting system and how to generate insights from your data.',
      category: 'advanced-features',
      tags: ['reports', 'analytics', 'insights'],
      difficulty: 'advanced'
    },

    // Security
    {
      id: 'security-features',
      title: 'Security Features',
      content: 'Learn about the security features including two-factor authentication and data protection.',
      category: 'security',
      tags: ['security', '2fa', 'protection'],
      difficulty: 'intermediate'
    },
    {
      id: 'two-factor-auth',
      title: 'Setting Up Two-Factor Authentication',
      content: 'Step-by-step guide to setting up and using two-factor authentication for enhanced security.',
      category: 'security',
      tags: ['2fa', 'setup', 'authentication'],
      difficulty: 'intermediate',
      videoUrl: 'https://example.com/videos/2fa-setup.mp4'
    }
  ];

  // Categories
  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: <HelpIcon /> },
    { id: 'case-management', name: 'Case Management', icon: <ArticleIcon /> },
    { id: 'client-management', name: 'Client Management', icon: <ArticleIcon /> },
    { id: 'document-management', name: 'Document Management', icon: <ArticleIcon /> },
    { id: 'time-tracking', name: 'Time Tracking', icon: <ArticleIcon /> },
    { id: 'billing', name: 'Billing', icon: <ArticleIcon /> },
    { id: 'advanced-features', name: 'Advanced Features', icon: <KeyboardIcon /> },
    { id: 'security', name: 'Security', icon: <ArticleIcon /> }
  ];

  // Tab labels
  const tabLabels = ['Search', 'Categories', 'Videos', 'FAQ', 'Keyboard Shortcuts'];

  useEffect(() => {
    filterHelpItems();
  }, [searchQuery, selectedCategory]);

  /**
   * Filter help items based on search query and category
   */
  const filterHelpItems = () => {
    let filtered = helpContent;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredItems(filtered);
  };

  /**
   * Handle tab change
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  /**
   * Handle accordion expansion
   */
  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

  /**
   * Get difficulty color
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * Log help item interaction
   */
  const logHelpInteraction = (itemId: string, action: string) => {
    logger.info('Help system interaction', {
      itemId,
      action,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <HelpIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Help & Documentation</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            {tabLabels.map((label, index) => (
              <Tab key={index} label={label} />
            ))}
          </Tabs>
        </Box>

        {/* Search Tab */}
        {activeTab === 0 && (
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2}>
              {filteredItems.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" component="h3">
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.difficulty}
                          color={getDifficultyColor(item.difficulty) as any}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {item.content}
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        {item.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Box display="flex" gap={1}>
                        {item.videoUrl && (
                          <Button
                            size="small"
                            startIcon={<PlayIcon />}
                            onClick={() => logHelpInteraction(item.id, 'video')}
                          >
                            Watch Video
                          </Button>
                        )}
                        {item.articleUrl && (
                          <Button
                            size="small"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => logHelpInteraction(item.id, 'article')}
                          >
                            Read Article
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Categories Tab */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedCategory === category.id ? 2 : 1,
                      borderColor: selectedCategory === category.id ? 'primary.main' : 'divider'
                    }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        {category.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {category.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {helpContent.filter(item => item.category === category.id).length} articles
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" mb={2}>
              {categories.find(c => c.id === selectedCategory)?.name} Articles
            </Typography>

            {filteredItems.map((item) => (
              <Accordion
                key={item.id}
                expanded={expandedAccordion === item.id}
                onChange={handleAccordionChange(item.id)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Typography variant="subtitle1">{item.title}</Typography>
                    <Chip
                      label={item.difficulty}
                      color={getDifficultyColor(item.difficulty) as any}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" mb={2}>
                    {item.content}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                    {item.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                  <Box display="flex" gap={1}>
                    {item.videoUrl && (
                      <Button
                        size="small"
                        startIcon={<PlayIcon />}
                        onClick={() => logHelpInteraction(item.id, 'video')}
                      >
                        Watch Video
                      </Button>
                    )}
                    {item.articleUrl && (
                      <Button
                        size="small"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => logHelpInteraction(item.id, 'article')}
                      >
                        Read Article
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Videos Tab */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Video Tutorials
            </Typography>
            <Grid container spacing={2}>
              {helpContent.filter(item => item.videoUrl).map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <VideoIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">{item.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {item.content}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PlayIcon />}
                        onClick={() => logHelpInteraction(item.id, 'video')}
                      >
                        Watch Video
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* FAQ Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Frequently Asked Questions
            </Typography>
            <List>
              {[
                {
                  question: 'How do I create a new case?',
                  answer: 'Navigate to Cases > New Case, fill in the required information, and click Create Case.'
                },
                {
                  question: 'How do I track time for a case?',
                  answer: 'Go to the case details page, click on the timer icon, and start tracking your time.'
                },
                {
                  question: 'How do I upload documents?',
                  answer: 'In the Documents section, click Upload Document, select your file, and add relevant metadata.'
                },
                {
                  question: 'How do I generate an invoice?',
                  answer: 'Go to Billing > New Invoice, select the case and time entries, and generate the invoice.'
                },
                {
                  question: 'How do I set up two-factor authentication?',
                  answer: 'Go to Profile > Security Settings > Two-Factor Authentication and follow the setup instructions.'
                }
              ].map((faq, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">{faq.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </List>
          </Box>
        )}

        {/* Keyboard Shortcuts Tab */}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Keyboard Shortcuts
            </Typography>
            <Grid container spacing={2}>
              {[
                { key: 'Ctrl + H', description: 'Go to Home/Dashboard' },
                { key: 'Ctrl + C', description: 'Go to Cases' },
                { key: 'Ctrl + L', description: 'Go to Clients' },
                { key: 'Ctrl + D', description: 'Go to Documents' },
                { key: 'Ctrl + T', description: 'Go to Time Tracking' },
                { key: 'Ctrl + B', description: 'Go to Billing' },
                { key: 'Ctrl + N', description: 'Create New Item' },
                { key: 'Ctrl + F', description: 'Search' },
                { key: 'Ctrl + S', description: 'Save' },
                { key: 'Escape', description: 'Close Modal/Dialog' },
                { key: '?', description: 'Show Keyboard Shortcuts' },
                { key: 'Ctrl + R', description: 'Refresh Page' }
              ].map((shortcut, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{shortcut.description}</Typography>
                      <Chip label={shortcut.key} size="small" variant="outlined" />
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<OpenInNewIcon />}
          onClick={() => window.open('/docs', '_blank')}
        >
          Full Documentation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HelpSystem;