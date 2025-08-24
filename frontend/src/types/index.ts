/**
 * TypeScript Type Definitions
 * RAGHUU CO Legal Practice Management System - Frontend
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Centralized TypeScript type definitions for the frontend application
 */

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PARTNER = 'partner',
  SENIOR_ASSOCIATE = 'senior_associate',
  JUNIOR_ASSOCIATE = 'junior_associate',
  PARALEGAL = 'paralegal',
  CLIENT = 'client',
  GUEST = 'guest'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
}

export interface SocialAuthProvider {
  provider: 'google' | 'linkedin' | 'microsoft';
  accessToken: string;
  refreshToken: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Case Management Types
export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;
  clientId: string;
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  category: string;
  estimatedHours?: number;
  actualHours?: number;
  billingRate?: number;
}

export enum CaseStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CLOSED = 'closed'
}

export enum CasePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Client Management Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Document Management Types
export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  caseId?: string;
  clientId?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  category: DocumentCategory;
}

export enum DocumentCategory {
  CONTRACT = 'contract',
  LEGAL_BRIEF = 'legal_brief',
  COURT_FILING = 'court_filing',
  EVIDENCE = 'evidence',
  CORRESPONDENCE = 'correspondence',
  INVOICE = 'invoice',
  OTHER = 'other'
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  caseId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  billable: boolean;
  rate?: number;
  createdAt: string;
  updatedAt: string;
}

// Billing Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  caseId?: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  type: 'time' | 'expense' | 'service';
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  attendees: string[];
  caseId?: string;
  clientId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reminder?: number; // minutes before event
  color?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  required?: boolean;
  validation?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

// Table and Grid Types
export interface TableColumn {
  field: string;
  headerName: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (params: any) => React.ReactNode;
}

export interface TableFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId: string;
  actionUrl?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  totalClients: number;
  totalRevenue: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalHours: number;
  billableHours: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search Types
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

// Route Types
export interface AppRoute {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  roles?: UserRole[];
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface PageProps {
  title?: string;
  children: React.ReactNode;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};