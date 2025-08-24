/**
 * Help Guide Component
 * RAGHUU CO Legal Practice Management System
 *
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 *
 * @description This component provides comprehensive help documentation,
 * role-based guides, and context-specific help for different user roles.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Chip,
  Search,
  InputAdornment,
  TextField,
  Breadcrumbs,
  Link,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  styled
} from '@mui/material';
import {
  Help,
  Search as SearchIcon,
  Book,
  School,
  Work,
  Person,
  AdminPanelSettings,
  Support,
  VideoLibrary,
  Article,
  Quiz,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  Share,
  Print,
  Download,
  ExpandMore,
  NavigateNext,
  Home,
  Settings,
  Security,
  Analytics,
  Assessment,
  Timeline,
  Description,
  People,
  AttachMoney,
  Schedule,
  Notifications,
  CloudUpload,
  CloudDownload,
  Sync,
  Lock,
  Visibility,
  Edit,
  Delete,
  Add,
  CheckCircle,
  Error,
  Warning,
  Info,
  PlayArrow,
  Pause,
  Stop,
  Fullscreen,
  VolumeUp,
  VolumeOff,
  Speed,
  Subtitles,
  Settings as SettingsIcon,
  Close,
  Menu,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  KeyboardArrowUp,
  KeyboardArrowDown,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext as NavigateNextIcon,
  ZoomIn,
  ZoomOut,
  RotateLeft,
  RotateRight,
  PictureAsPdf,
  GetApp,
  ContentCopy,
  Feedback,
  RateReview,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
  Flag,
  Report,
  ContactSupport,
  Email,
  Phone,
  Chat,
  Forum,
  Groups,
  PersonAdd,
  GroupAdd,
  SupervisorAccount,
  VerifiedUser,
  Gavel,
  Balance,
  Business,
  AccountBalance,
  LibraryBooks,
  LocalLibrary,
  School as SchoolIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Support as SupportIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
  Quiz as QuizIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon2,
  Home as HomeIcon,
  Settings as SettingsIcon2,
  Security as SecurityIcon2,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Sync as SyncIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Fullscreen as FullscreenIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Speed as SpeedIcon,
  Subtitles as SubtitlesIcon,
  Settings as SettingsIcon3,
  Close as CloseIcon,
  Menu as MenuIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon3,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  PictureAsPdf as PictureAsPdfIcon,
  GetApp as GetAppIcon,
  ContentCopy as ContentCopyIcon,
  Feedback as FeedbackIcon,
  RateReview as RateReviewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Flag as FlagIcon,
  Report as ReportIcon,
  ContactSupport as ContactSupportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Groups as GroupsIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  SupervisorAccount as SupervisorAccountIcon,
  VerifiedUser as VerifiedUserIcon,
  Gavel as GavelIcon,
  Balance as BalanceIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  LibraryBooks as LibraryBooksIcon,
  LocalLibrary as LocalLibraryIcon,
  School as SchoolIcon2,
  Work as WorkIcon2,
  Person as PersonIcon2,
  AdminPanelSettings as AdminIcon2,
  Support as SupportIcon2,
  VideoLibrary as VideoIcon2,
  Article as ArticleIcon2,
  Quiz as QuizIcon2,
  Star as StarIcon2,
  StarBorder as StarBorderIcon2,
  Bookmark as BookmarkIcon2,
  BookmarkBorder as BookmarkBorderIcon2,
  Share as ShareIcon2,
  Print as PrintIcon2,
  Download as DownloadIcon2,
  ExpandMore as ExpandMoreIcon2,
  NavigateNext as NavigateNextIcon4,
  Home as HomeIcon2,
  Settings as SettingsIcon4,
  Security as SecurityIcon3,
  Analytics as AnalyticsIcon2,
  Assessment as AssessmentIcon2,
  Timeline as TimelineIcon2,
  Description as DescriptionIcon2,
  People as PeopleIcon2,
  AttachMoney as AttachMoneyIcon2,
  Schedule as ScheduleIcon2,
  Notifications as NotificationsIcon2,
  CloudUpload as CloudUploadIcon2,
  CloudDownload as CloudDownloadIcon2,
  Sync as SyncIcon2,
  Lock as LockIcon2,
  Visibility as VisibilityIcon2,
  Edit as EditIcon2,
  Delete as DeleteIcon2,
  Add as AddIcon2,
  CheckCircle as CheckCircleIcon2,
  Error as ErrorIcon2,
  Warning as WarningIcon2,
  Info as InfoIcon2,
  PlayArrow as PlayArrowIcon2,
  Pause as PauseIcon2,
  Stop as StopIcon2,
  Fullscreen as FullscreenIcon2,
  VolumeUp as VolumeUpIcon2,
  VolumeOff as VolumeOffIcon2,
  Speed as SpeedIcon2,
  Subtitles as SubtitlesIcon2,
  Settings as SettingsIcon5,
  Close as CloseIcon2,
  Menu as MenuIcon2,
  KeyboardArrowRight as KeyboardArrowRightIcon2,
  KeyboardArrowLeft as KeyboardArrowLeftIcon2,
  KeyboardArrowUp as KeyboardArrowUpIcon2,
  KeyboardArrowDown as KeyboardArrowDownIcon2,
  FirstPage as FirstPageIcon2,
  LastPage as LastPageIcon2,
  NavigateBefore as NavigateBeforeIcon2,
  NavigateNext as NavigateNextIcon5,
  ZoomIn as ZoomInIcon2,
  ZoomOut as ZoomOutIcon2,
  RotateLeft as RotateLeftIcon2,
  RotateRight as RotateRightIcon2,
  PictureAsPdf as PictureAsPdfIcon2,
  GetApp as GetAppIcon2,
  ContentCopy as ContentCopyIcon2,
  Feedback as FeedbackIcon2,
  RateReview as RateReviewIcon2,
  ThumbUp as ThumbUpIcon2,
  ThumbDown as ThumbDownIcon2,
  Favorite as FavoriteIcon2,
  FavoriteBorder as FavoriteBorderIcon2,
  Flag as FlagIcon2,
  Report as ReportIcon2,
  ContactSupport as ContactSupportIcon2,
  Email as EmailIcon2,
  Phone as PhoneIcon2,
  Chat as ChatIcon2,
  Forum as ForumIcon2,
  Groups as GroupsIcon2,
  PersonAdd as PersonAddIcon2,
  GroupAdd as GroupAddIcon2,
  SupervisorAccount as SupervisorAccountIcon2,
  VerifiedUser as VerifiedUserIcon2,
  Gavel as GavelIcon2,
  Balance as BalanceIcon2,
  Business as BusinessIcon2,
  AccountBalance as AccountBalanceIcon2,
  LibraryBooks as LibraryBooksIcon2,
  LocalLibrary as LocalLibraryIcon2
} from '@mui/icons-material';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

/**
 * User role types
 */
export enum UserRole {
  ATTORNEY = 'attorney',
  PARALEGAL = 'paralegal',
  ADMINISTRATOR = 'administrator',
  CLIENT = 'client',
  SUPPORT = 'support'
}

/**
 * Help section interface
 */
export interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  videoUrl?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  author: string;
  rating: number;
  views: number;
  bookmarked: boolean;
  relatedSections: string[];
}

/**
 * Help guide interface
 */
export interface HelpGuide {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  sections: HelpSection[];
  quickStart: string[];
  commonTasks: string[];
  troubleshooting: string[];
  faq: Array<{ question: string; answer: string }>;
}

/**
 * Context help interface
 */
export interface ContextHelp {
  component: string;
  context: string;
  helpContent: string;
  videoUrl?: string;
  relatedSections: string[];
}

/**
 * Styled components
 */
const HelpContainer = styled(Box)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const SearchContainer = styled(Box)`
  margin-bottom: 24px;
`;

const RoleCard = styled(Card)<{ selected?: boolean }>`
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ selected, theme }) => 
    selected ? theme.palette.primary.main : 'transparent'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[8]};
  }
`;

const SectionCard = styled(Card)`
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }
`;

const VideoPlayer = styled(Box)`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
`;

/**
 * Help Guide Component
 */
export const HelpGuide: React.FC = () => {
  const theme = useTheme();
  const { announceToScreenReader } = useAccessibility();
  const { user } = useAuth();
  
  // State
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ATTORNEY);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [bookmarkedSections, setBookmarkedSections] = useState<string[]>([]);
  const [showContextHelp, setShowContextHelp] = useState(false);
  const [contextHelp, setContextHelp] = useState<ContextHelp | null>(null);

  // Help guides for different roles
  const helpGuides: Record<UserRole, HelpGuide> = {
    [UserRole.ATTORNEY]: {
      role: UserRole.ATTORNEY,
      title: 'Attorney Guide',
      description: 'Complete guide for attorneys using the legal practice management system',
      icon: <Gavel />,
      sections: [
        {
          id: 'case-management',
          title: 'Case Management',
          description: 'Learn how to create, manage, and track cases effectively',
          icon: <Description />,
          content: `
            <h3>Creating a New Case</h3>
            <p>To create a new case:</p>
            <ol>
              <li>Navigate to the Cases section</li>
              <li>Click the "New Case" button</li>
              <li>Fill in the required information</li>
              <li>Add client details and case description</li>
              <li>Set case priority and deadlines</li>
              <li>Save the case</li>
            </ol>
            
            <h3>Managing Case Documents</h3>
            <p>Upload and organize case documents:</p>
            <ul>
              <li>Use drag-and-drop to upload files</li>
              <li>Organize documents by category</li>
              <li>Add tags for easy searching</li>
              <li>Set document permissions</li>
            </ul>
            
            <h3>Case Timeline</h3>
            <p>Track case progress with the timeline feature:</p>
            <ul>
              <li>View all case events chronologically</li>
              <li>Add notes and updates</li>
              <li>Set reminders for important dates</li>
              <li>Track time spent on case activities</li>
            </ul>
          `,
          videoUrl: 'https://example.com/videos/case-management.mp4',
          tags: ['cases', 'documents', 'timeline', 'management'],
          difficulty: 'beginner',
          lastUpdated: new Date('2025-01-15'),
          author: 'Legal Team',
          rating: 4.8,
          views: 1250,
          bookmarked: false,
          relatedSections: ['client-management', 'document-management']
        },
        {
          id: 'client-management',
          title: 'Client Management',
          description: 'Manage client relationships and communications',
          icon: <People />,
          content: `
            <h3>Adding New Clients</h3>
            <p>To add a new client:</p>
            <ol>
              <li>Go to the Clients section</li>
              <li>Click "Add New Client"</li>
              <li>Enter client information</li>
              <li>Set up communication preferences</li>
              <li>Assign to cases if applicable</li>
            </ol>
            
            <h3>Client Communication</h3>
            <p>Effective client communication tools:</p>
            <ul>
              <li>Send secure messages</li>
              <li>Schedule appointments</li>
              <li>Share documents securely</li>
              <li>Track communication history</li>
            </ul>
          `,
          tags: ['clients', 'communication', 'relationships'],
          difficulty: 'beginner',
          lastUpdated: new Date('2025-01-15'),
          author: 'Legal Team',
          rating: 4.6,
          views: 980,
          bookmarked: false,
          relatedSections: ['case-management', 'communication']
        },
        {
          id: 'billing-invoicing',
          title: 'Billing & Invoicing',
          description: 'Manage billing, time tracking, and invoicing',
          icon: <AttachMoney />,
          content: `
            <h3>Time Tracking</h3>
            <p>Track time spent on cases:</p>
            <ol>
              <li>Start timer when working on a case</li>
              <li>Add detailed descriptions</li>
              <li>Pause and resume as needed</li>
              <li>Review and edit time entries</li>
            </ol>
            
            <h3>Creating Invoices</h3>
            <p>Generate professional invoices:</p>
            <ul>
              <li>Select time entries and expenses</li>
              <li>Choose invoice template</li>
              <li>Add custom line items</li>
              <li>Send to clients electronically</li>
            </ul>
          `,
          tags: ['billing', 'invoicing', 'time-tracking'],
          difficulty: 'intermediate',
          lastUpdated: new Date('2025-01-15'),
          author: 'Legal Team',
          rating: 4.7,
          views: 1100,
          bookmarked: false,
          relatedSections: ['case-management', 'reports']
        }
      ],
      quickStart: [
        'Create your first case',
        'Add client information',
        'Upload case documents',
        'Set up billing preferences',
        'Configure notifications'
      ],
      commonTasks: [
        'Managing case deadlines',
        'Client communication',
        'Document organization',
        'Time tracking',
        'Invoice generation'
      ],
      troubleshooting: [
        'Case not saving properly',
        'Document upload issues',
        'Billing calculation problems',
        'Client access issues'
      ],
      faq: [
        {
          question: 'How do I create a new case?',
          answer: 'Navigate to Cases > New Case, fill in the required information, and save.'
        },
        {
          question: 'Can I track time automatically?',
          answer: 'Yes, use the timer feature to automatically track time spent on cases.'
        },
        {
          question: 'How do I share documents with clients?',
          answer: 'Use the secure document sharing feature in the client portal.'
        }
      ]
    },
    [UserRole.PARALEGAL]: {
      role: UserRole.PARALEGAL,
      title: 'Paralegal Guide',
      description: 'Essential guide for paralegals supporting legal practice',
      icon: <Work />,
      sections: [
        {
          id: 'document-preparation',
          title: 'Document Preparation',
          description: 'Prepare and organize legal documents efficiently',
          icon: <Description />,
          content: `
            <h3>Document Templates</h3>
            <p>Use pre-built templates for common documents:</p>
            <ol>
              <li>Select document type</li>
              <li>Choose appropriate template</li>
              <li>Fill in case-specific information</li>
              <li>Review and finalize</li>
            </ol>
            
            <h3>Document Organization</h3>
            <p>Keep documents organized:</p>
            <ul>
              <li>Use consistent naming conventions</li>
              <li>Create logical folder structures</li>
              <li>Add metadata and tags</li>
              <li>Set up version control</li>
            </ul>
          `,
          tags: ['documents', 'templates', 'organization'],
          difficulty: 'beginner',
          lastUpdated: new Date('2025-01-15'),
          author: 'Legal Team',
          rating: 4.5,
          views: 850,
          bookmarked: false,
          relatedSections: ['case-management', 'research']
        }
      ],
      quickStart: [
        'Set up document templates',
        'Organize case files',
        'Prepare legal documents',
        'Assist with research',
        'Support case management'
      ],
      commonTasks: [
        'Document preparation',
        'Case file organization',
        'Legal research',
        'Client communication support',
        'Court filing assistance'
      ],
      troubleshooting: [
        'Template formatting issues',
        'Document organization problems',
        'Research tool access',
        'File upload errors'
      ],
      faq: [
        {
          question: 'How do I create document templates?',
          answer: 'Use the template editor to create reusable document templates.'
        },
        {
          question: 'Can I organize documents by case?',
          answer: 'Yes, use the case-based folder structure for organization.'
        }
      ]
    },
    [UserRole.ADMINISTRATOR]: {
      role: UserRole.ADMINISTRATOR,
      title: 'Administrator Guide',
      description: 'System administration and user management guide',
      icon: <AdminPanelSettings />,
      sections: [
        {
          id: 'user-management',
          title: 'User Management',
          description: 'Manage users, roles, and permissions',
          icon: <People />,
          content: `
            <h3>Adding New Users</h3>
            <p>To add a new user:</p>
            <ol>
              <li>Go to Administration > Users</li>
              <li>Click "Add New User"</li>
              <li>Enter user information</li>
              <li>Assign appropriate role</li>
              <li>Set permissions</li>
              <li>Send invitation email</li>
            </ol>
            
            <h3>Role Management</h3>
            <p>Manage user roles and permissions:</p>
            <ul>
              <li>Create custom roles</li>
              <li>Assign specific permissions</li>
              <li>Manage role hierarchies</li>
              <li>Audit user access</li>
            </ul>
          `,
          tags: ['users', 'roles', 'permissions', 'administration'],
          difficulty: 'intermediate',
          lastUpdated: new Date('2025-01-15'),
          author: 'System Admin',
          rating: 4.9,
          views: 650,
          bookmarked: false,
          relatedSections: ['security', 'system-settings']
        }
      ],
      quickStart: [
        'Set up user accounts',
        'Configure system settings',
        'Manage security policies',
        'Set up backup procedures',
        'Configure integrations'
      ],
      commonTasks: [
        'User account management',
        'System configuration',
        'Security administration',
        'Backup and recovery',
        'System monitoring'
      ],
      troubleshooting: [
        'User access issues',
        'System configuration problems',
        'Security policy conflicts',
        'Integration failures'
      ],
      faq: [
        {
          question: 'How do I reset a user password?',
          answer: 'Use the password reset feature in user management.'
        },
        {
          question: 'Can I customize user roles?',
          answer: 'Yes, create custom roles with specific permissions.'
        }
      ]
    },
    [UserRole.CLIENT]: {
      role: UserRole.CLIENT,
      title: 'Client Guide',
      description: 'Client portal usage and communication guide',
      icon: <Person />,
      sections: [
        {
          id: 'client-portal',
          title: 'Client Portal',
          description: 'Access your case information and communicate with your legal team',
          icon: <Home />,
          content: `
            <h3>Accessing Your Portal</h3>
            <p>To access your client portal:</p>
            <ol>
              <li>Use the link provided by your attorney</li>
              <li>Enter your email and password</li>
              <li>Complete two-factor authentication if enabled</li>
              <li>Access your dashboard</li>
            </ol>
            
            <h3>Viewing Case Information</h3>
            <p>Access your case details:</p>
            <ul>
              <li>View case status and updates</li>
              <li>Access shared documents</li>
              <li>Review billing information</li>
              <li>Track important dates</li>
            </ul>
          `,
          tags: ['portal', 'access', 'communication'],
          difficulty: 'beginner',
          lastUpdated: new Date('2025-01-15'),
          author: 'Client Support',
          rating: 4.4,
          views: 1200,
          bookmarked: false,
          relatedSections: ['communication', 'documents']
        }
      ],
      quickStart: [
        'Access your portal',
        'View case information',
        'Communicate with your attorney',
        'Access shared documents',
        'Review billing information'
      ],
      commonTasks: [
        'Portal access',
        'Case information review',
        'Document access',
        'Communication with legal team',
        'Billing review'
      ],
      troubleshooting: [
        'Portal access issues',
        'Document viewing problems',
        'Communication difficulties',
        'Billing questions'
      ],
      faq: [
        {
          question: 'How do I reset my password?',
          answer: 'Use the "Forgot Password" link on the login page.'
        },
        {
          question: 'Can I upload documents?',
          answer: 'Yes, use the document upload feature in your portal.'
        }
      ]
    },
    [UserRole.SUPPORT]: {
      role: UserRole.SUPPORT,
      title: 'Support Guide',
      description: 'Technical support and troubleshooting guide',
      icon: <Support />,
      sections: [
        {
          id: 'troubleshooting',
          title: 'Troubleshooting',
          description: 'Common issues and their solutions',
          icon: <Error />,
          content: `
            <h3>Common Issues</h3>
            <p>Frequently encountered problems:</p>
            <ul>
              <li>Login issues</li>
              <li>Document upload problems</li>
              <li>Performance issues</li>
              <li>Integration failures</li>
            </ul>
            
            <h3>Resolution Steps</h3>
            <p>Systematic troubleshooting approach:</p>
            <ol>
              <li>Identify the problem</li>
              <li>Check system status</li>
              <li>Verify user permissions</li>
              <li>Test in different browsers</li>
              <li>Contact support if needed</li>
            </ol>
          `,
          tags: ['troubleshooting', 'support', 'issues'],
          difficulty: 'intermediate',
          lastUpdated: new Date('2025-01-15'),
          author: 'Support Team',
          rating: 4.6,
          views: 750,
          bookmarked: false,
          relatedSections: ['system-status', 'contact-support']
        }
      ],
      quickStart: [
        'Understand common issues',
        'Use troubleshooting tools',
        'Access system logs',
        'Contact technical support',
        'Escalate complex issues'
      ],
      commonTasks: [
        'Issue diagnosis',
        'User support',
        'System monitoring',
        'Documentation updates',
        'Training coordination'
      ],
      troubleshooting: [
        'System performance issues',
        'User access problems',
        'Integration failures',
        'Data synchronization issues'
      ],
      faq: [
        {
          question: 'How do I escalate an issue?',
          answer: 'Use the escalation process in the support portal.'
        },
        {
          question: 'Where can I find system logs?',
          answer: 'Access logs through the administration panel.'
        }
      ]
    }
  };

  // Get current user's role
  const userRole = useMemo(() => {
    return user?.role || UserRole.ATTORNEY;
  }, [user]);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    const guide = helpGuides[selectedRole];
    if (!searchQuery) return guide.sections;
    
    return guide.sections.filter(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [selectedRole, searchQuery, helpGuides]);

  // Handle role selection
  const handleRoleSelect = useCallback((role: UserRole) => {
    setSelectedRole(role);
    setActiveTab(0);
    setSearchQuery('');
    announceToScreenReader(`Switched to ${helpGuides[role].title}`);
  }, [announceToScreenReader, helpGuides]);

  // Handle section expansion
  const handleSectionExpand = useCallback((sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  }, [expandedSection]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((sectionId: string) => {
    setBookmarkedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    announceToScreenReader('Section bookmarked');
  }, [announceToScreenReader]);

  // Show context help
  const showContextHelpFor = useCallback((component: string, context: string) => {
    const contextHelpData: ContextHelp = {
      component,
      context,
      helpContent: `Help content for ${component} in ${context} context.`,
      relatedSections: ['case-management', 'document-management']
    };
    setContextHelp(contextHelpData);
    setShowContextHelp(true);
  }, []);

  // Close context help
  const closeContextHelp = useCallback(() => {
    setShowContextHelp(false);
    setContextHelp(null);
  }, []);

  // Get current guide
  const currentGuide = helpGuides[selectedRole];

  const tabs = [
    { label: 'Overview', icon: <Home /> },
    { label: 'Sections', icon: <Book /> },
    { label: 'Quick Start', icon: <School /> },
    { label: 'FAQ', icon: <Quiz /> }
  ];

  return (
    <HelpContainer>
      <Typography variant="h4" gutterBottom>
        Help & Documentation
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive guides and documentation for different user roles in the RAGHUU CO Legal Practice Management System.
      </Typography>

      {/* Role Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Your Role
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {Object.values(UserRole).map((role) => (
            <RoleCard
              key={role}
              selected={selectedRole === role}
              onClick={() => handleRoleSelect(role)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {helpGuides[role].icon}
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    {helpGuides[role].title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {helpGuides[role].description}
                </Typography>
              </CardContent>
            </RoleCard>
          ))}
        </Box>
      </Box>

      {/* Search */}
      <SearchContainer>
        <TextField
          fullWidth
          placeholder="Search help content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </SearchContainer>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} icon={tab.icon} />
        ))}
      </Tabs>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            {currentGuide.title} - Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {currentGuide.description}
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Start
                </Typography>
                <List dense>
                  {currentGuide.quickStart.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Common Tasks
                </Typography>
                <List dense>
                  {currentGuide.commonTasks.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Work color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Help Sections
          </Typography>
          
          {filteredSections.map((section) => (
            <SectionCard key={section.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {section.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {section.title}
                    </Typography>
                    <Chip 
                      label={section.difficulty} 
                      size="small" 
                      color={section.difficulty === 'beginner' ? 'success' : section.difficulty === 'intermediate' ? 'warning' : 'error'}
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleBookmarkToggle(section.id)}>
                      {bookmarkedSections.includes(section.id) ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {section.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    Rating: {section.rating}/5
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    Views: {section.views}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {section.lastUpdated.toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  {section.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
                
                <Button
                  variant="outlined"
                  onClick={() => handleSectionExpand(section.id)}
                  endIcon={expandedSection === section.id ? <ExpandMore /> : <KeyboardArrowRight />}
                >
                  {expandedSection === section.id ? 'Hide Details' : 'View Details'}
                </Button>
                
                {expandedSection === section.id && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                    
                    {section.videoUrl && (
                      <VideoPlayer>
                        <video
                          controls
                          width="100%"
                          style={{ display: 'block' }}
                        >
                          <source src={section.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </VideoPlayer>
                    )}
                  </Box>
                )}
              </CardContent>
            </SectionCard>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Quick Start Guide
          </Typography>
          
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Getting Started</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {currentGuide.quickStart.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Typography variant="h6" color="primary">
                        {index + 1}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Frequently Asked Questions
          </Typography>
          
          {currentGuide.faq.map((faq, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Context Help Dialog */}
      {showContextHelp && contextHelp && (
        <Alert 
          severity="info" 
          onClose={closeContextHelp}
          action={
            <Button color="inherit" size="small" onClick={closeContextHelp}>
              Close
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            Context Help: {contextHelp.component}
          </Typography>
          <Typography variant="body2">
            {contextHelp.helpContent}
          </Typography>
        </Alert>
      )}
    </HelpContainer>
  );
};