# Wireframes Document
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: August 22, 2025

---

## Table of Contents

1. [Design System & Components](#design-system--components)
2. [Public Pages](#public-pages)
3. [Authentication Pages](#authentication-pages)
4. [Staff Dashboard Pages](#staff-dashboard-pages)
5. [Client Portal Pages](#client-portal-pages)
6. [Mobile Responsive Design](#mobile-responsive-design)

---

## Design System & Components

### **Color Palette**
- **Primary**: #1976D2 (Material Blue)
- **Secondary**: #424242 (Dark Gray)
- **Accent**: #FF6B35 (Orange)
- **Success**: #4CAF50 (Green)
- **Warning**: #FF9800 (Orange)
- **Error**: #F44336 (Red)
- **Background**: #FAFAFA (Light Gray)
- **Surface**: #FFFFFF (White)

### **Typography**
- **Primary Font**: Roboto
- **Headings**: Roboto (Bold)
- **Body**: Roboto (Regular)
- **Code**: Roboto Mono

### **Component Library**
- **Buttons**: Material-UI Button variants
- **Forms**: Material-UI TextField, Select, Checkbox
- **Data Grids**: ag-grid-community with mobile optimization
- **Navigation**: Material-UI AppBar, Drawer, Breadcrumbs
- **Cards**: Material-UI Card with elevation
- **Dialogs**: Material-UI Dialog, Modal
- **Notifications**: Material-UI Snackbar, Alert

---

## Public Pages

### **1. Landing Page (Home)**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                    [About][Services]   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ │  Excellence in Legal Practice Management            │ │
│ │                                                     │ │
│ │  Comprehensive legal solutions for modern law firms │ │
│ │                                                     │ │
│ │  [Get Started] [Learn More]                         │ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ Case Mgmt   │ │ Document    │ │ Billing &   │        │
│ │             │ │ Control     │ │ Analytics   │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Featured Articles                                   │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐                │ │
│ │ │ Article │ │ Article │ │ Article │                │ │
│ │ │ Title 1 │ │ Title 2 │ │ Title 3 │                │ │
│ │ └─────────┘ └─────────┘ └─────────┘                │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **2. About Us Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                    [About][Services]   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ About RAGHUU CO                                     │ │
│ │                                                     │ │
│ │ We are a leading legal practice management solution │ │
│ │ designed to streamline operations and enhance       │ │
│ │ client relationships.                               │ │
│ │                                                     │ │
│ │ Our Features:                                       │ │
│ │ • Case Management                                   │ │
│ │ • Document Control                                  │ │
│ │ • Time Tracking                                     │ │
│ │ • Client Portal                                     │ │
│ │ • Analytics & Reporting                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **3. Services Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                    [About][Services]   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Our Services                                        │ │
│ │                                                     │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │ │
│ │ │ Case        │ │ Document    │ │ Time        │    │ │
│ │ │ Management  │ │ Management  │ │ Tracking    │    │ │
│ │ │             │ │             │ │             │    │ │
│ │ │ Track cases │ │ Secure      │ │ Billable    │    │ │
│ │ │ and clients │ │ document    │ │ hours and   │    │ │
│ │ │ efficiently │ │ storage     │ │ expenses    │    │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘    │ │
│ │                                                     │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │ │
│ │ │ Billing &   │ │ Client      │ │ Analytics   │    │ │
│ │ │ Invoicing   │ │ Portal      │ │ & Reports   │    │ │
│ │ │             │ │             │ │             │    │ │
│ │ │ Generate    │ │ Secure      │ │ Performance │    │ │
│ │ │ invoices    │ │ client      │ │ insights    │    │ │
│ │ │ and track   │ │ access      │ │ and metrics │    │ │
│ │ │ payments    │ │ to cases    │ │             │    │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **4. Blog/Articles Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                    [About][Services]   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Legal Insights & Articles                           │ │
│ │                                                     │ │
│ │ Categories: [All] [Constitutional] [Real Estate]    │ │
│ │            [Banking] [Company]                      │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Featured Article                                 │ │ │
│ │ │ [Image]                                         │ │ │
│ │ │ Title: Understanding Constitutional Law          │ │ │
│ │ │ Excerpt: Comprehensive guide to...               │ │ │
│ │ │ [Read More]                                     │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐                │ │
│ │ │ Article │ │ Article │ │ Article │                │ │
│ │ │ Title 1 │ │ Title 2 │ │ Title 3 │                │ │
│ │ │ Date    │ │ Date    │ │ Date    │                │ │
│ │ │ [Read]  │ │ [Read]  │ │ [Read]  │                │ │
│ │ └─────────┘ └─────────┘ └─────────┘                │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **5. Contact Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                    [About][Services]   │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Contact Us                                          │ │
│ │                                                     │ │
│ │ ┌─────────────────┐ ┌─────────────────────────────┐ │ │
│ │ │ Get in Touch    │ │ Office Information          │ │ │
│ │ │                 │ │                             │ │ │
│ │ │ Name: [_______] │ │ Address: 123 Legal Street   │ │ │
│ │ │ Email: [______] │ │ City, State 12345           │ │ │
│ │ │ Phone: [______] │ │                             │ │ │
│ │ │ Message:        │ │ Phone: +1 (555) 123-4567    │ │ │
│ │ │ [_____________] │ │ Email: info@raghuuco.com    │ │ │
│ │ │                 │ │                             │ │ │
│ │ │ [Send Message]  │ │ Hours: Mon-Fri 9AM-6PM      │ │ │
│ │ └─────────────────┘ └─────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Authentication Pages

### **6. Login Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Sign In to Your Account                             │ │
│ │                                                     │ │
│ │ Email: [________________]                           │ │
│ │ Password: [________________]                        │ │
│ │                                                     │ │
│ │ [☐] Remember me  [Forgot Password?]                 │ │
│ │                                                     │ │
│ │ [Sign In]                                           │ │
│ │                                                     │ │
│ │ ─────────────── OR ───────────────                  │ │
│ │                                                     │ │
│ │ [Sign in with Google]                               │ │
│ │ [Sign in with LinkedIn]                             │ │
│ │ [Sign in with Microsoft]                            │ │
│ │                                                     │ │
│ │ Don't have an account? [Sign Up]                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **7. Registration Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Create Your Account                                 │ │
│ │                                                     │ │
│ │ First Name: [________________]                      │ │
│ │ Last Name: [________________]                       │ │
│ │ Email: [________________]                           │ │
│ │ Phone: [________________]                           │ │
│ │ Password: [________________]                        │ │
│ │ Confirm Password: [________________]                │ │
│ │                                                     │ │
│ │ [☐] I agree to Terms & Conditions                   │ │
│ │ [☐] I agree to Privacy Policy                       │ │
│ │                                                     │ │
│ │ [Create Account]                                    │ │
│ │                                                     │ │
│ │ ─────────────── OR ───────────────                  │ │
│ │                                                     │ │
│ │ [Sign up with Google]                               │ │
│ │ [Sign up with LinkedIn]                             │ │
│ │ [Sign up with Microsoft]                            │ │
│ │                                                     │ │
│ │ Already have an account? [Sign In]                  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **8. MFA Setup Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] RAGHUU CO                                        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Set Up Two-Factor Authentication                   │ │
│ │                                                     │ │
│ │ 1. Download an authenticator app                   │ │
│ │    (Google Authenticator, Authy, etc.)             │ │
│ │                                                     │ │
│ │ 2. Scan this QR code:                              │ │
│ │    ┌─────────────────┐                             │ │
│ │    │ [QR CODE]       │                             │ │
│ │    └─────────────────┘                             │ │
│ │                                                     │ │
│ │ 3. Enter the 6-digit code from your app:           │ │
│ │    [______]                                         │ │
│ │                                                     │ │
│ │ [Verify & Enable] [Skip for Now]                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Staff Dashboard Pages

### **9. Staff Dashboard (Main)**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Dashboard  [Notifications] [Profile] [Logout]    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Welcome back, [User Name]                           │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Active  │ │ Pending │ │ Total   │ │ Revenue │    │ │
│ │ │ Cases   │ │ Cases   │ │ Clients │ │ This    │    │ │
│ │ │ 25      │ │ 8       │ │ 45      │ │ Month   │    │ │
│ │ │         │ │         │ │         │ │ $45,250 │    │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Today's Schedule                                │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ 9:00 AM - Client Meeting (Case #123)        │ │ │ │
│ │ │ │ 2:00 PM - Court Hearing (Case #456)         │ │ │ │
│ │ │ │ 4:00 PM - Team Review                        │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Recent Activity                                 │ │ │
│ │ │ • Document uploaded to Case #123               │ │ │
│ │ │ • Invoice generated for Client ABC             │ │ │
│ │ │ • Case status updated to "Active"              │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **10. Case Management Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Cases  [Notifications] [Profile] [Logout]        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Case Management                                     │ │
│ │                                                     │ │
│ │ [Add New Case] [Filter] [Search Cases]              │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Case List (ag-grid)                             │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Case │Client   │Type     │Status   │Actions  │ │ │ │
│ │ │ │#    │         │         │         │         │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │123  │ABC Corp │Real     │Active   │[View]   │ │ │ │
│ │ │ │     │         │Estate   │         │[Edit]   │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │456  │XYZ Ltd  │Company  │Pending  │[View]   │ │ │ │
│ │ │ │     │         │         │         │[Edit]   │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **11. Case Detail Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Cases > Case #123  [Notifications] [Profile]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Case #123: ABC Corp vs XYZ Ltd                      │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Status  │ │ Type    │ │ Value   │ │ Priority│    │ │
│ │ │ Active  │ │ Real    │ │ $50,000 │ │ High    │    │ │
│ │ │         │ │ Estate  │ │         │ │         │    │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ [Overview] [Documents] [Timeline] [Billing] [Notes] │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Case Overview                                   │ │ │
│ │ │                                                 │ │ │
│ │ │ Client: ABC Corporation                         │ │ │
│ │ │ Opposing Party: XYZ Ltd                         │ │ │
│ │ │ Assigned Partner: John Smith                    │ │ │
│ │ │ Assigned Associates: Jane Doe, Mike Johnson     │ │ │
│ │ │                                                 │ │ │
│ │ │ Description: Property dispute regarding...      │ │ │
│ │ │                                                 │ │ │
│ │ │ [Edit Case] [Add Milestone] [Generate Report]   │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **12. Document Management Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Documents  [Notifications] [Profile] [Logout]    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Document Management                                 │ │
│ │                                                     │ │
│ │ [Upload Document] [Filter] [Search Documents]       │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Document Library (ag-grid)                      │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Name │Case     │Type     │Uploaded │Actions  │ │ │ │
│ │ │ │     │         │         │         │         │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Contract│Case  │Contract │2024-01-15│[View]  │ │ │ │
│ │ │ │.pdf  │#123    │         │         │[Edit]   │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Evidence│Case  │Evidence │2024-01-14│[View]  │ │ │ │
│ │ │ │.pdf  │#123    │         │         │[Edit]   │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **13. Time Tracking Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Time Tracking  [Notifications] [Profile] [Logout]│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Time Tracking                                       │ │
│ │                                                     │ │
│ │ [Start Timer] [Add Time Entry] [Generate Report]    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Current Timer                                    │ │ │
│ │ │                                                 │ │ │
│ │ │ Case: [Case #123 ▼]                             │ │ │
│ │ │ Task: [Document Review]                          │ │ │
│ │ │ Time: 02:15:30 [Stop] [Pause]                   │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Recent Time Entries (ag-grid)                   │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Date │Case     │Task     │Hours    │Billable │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Today│Case #123│Research │2.5      │Yes      │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Today│Case #456│Meeting  │1.0      │Yes      │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **14. Billing & Invoicing Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Billing  [Notifications] [Profile] [Logout]      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Billing & Invoicing                                 │ │
│ │                                                     │ │
│ │ [Generate Invoice] [View Payments] [Reports]        │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Invoice Summary                                 │ │ │
│ │ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │ │
│ │ │ │Pending  │ │Paid     │ │Overdue  │ │Total    │ │ │ │
│ │ │ │$15,250  │ │$30,000  │ │$5,500   │ │$50,750  │ │ │ │
│ │ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Recent Invoices (ag-grid)                       │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Inv# │Client   │Amount   │Status   │Actions  │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │INV-1│ABC Corp │$5,250   │Pending  │[View]   │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │INV-2│XYZ Ltd  │$3,500   │Paid     │[View]   │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **15. Calendar Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Calendar  [Notifications] [Profile] [Logout]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Calendar                                            │ │
│ │                                                     │ │
│ │ [Today] [Previous] [Next] [Add Event]               │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ January 2024                                     │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Sun Mon Tue Wed Thu Fri Sat                 │ │ │ │
│ │ │ │  1   2   3   4   5   6   7                  │ │ │ │
│ │ │ │  8   9  10  11  12  13  14                  │ │ │ │
│ │ │ │ 15  16  17  18  19  20  21                  │ │ │ │
│ │ │ │ 22  23  24  25  26  27  28                  │ │ │ │
│ │ │ │ 29  30  31                                   │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Today's Events                                   │ │ │
│ │ │ • 9:00 AM - Client Meeting (Case #123)          │ │ │
│ │ │ • 2:00 PM - Court Hearing (Case #456)           │ │ │
│ │ │ • 4:00 PM - Team Review                          │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **16. Client Management Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Clients  [Notifications] [Profile] [Logout]      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Client Management                                   │ │
│ │                                                     │ │
│ │ [Add New Client] [Filter] [Search Clients]          │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Client List (ag-grid)                           │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Name │Type     │Email    │Phone    │Actions  │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │ABC  │Company  │abc@...  │555-1234 │[View]   │ │ │ │
│ │ │ │Corp │         │         │         │[Edit]   │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │John │Individual│john@...│555-5678 │[View]   │ │ │ │
│ │ │ │Doe  │         │         │         │[Edit]   │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **17. Content Management Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Content  [Notifications] [Profile] [Logout]      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Content Management                                  │ │
│ │                                                     │ │
│ │ [Create Article] [Create Newsletter] [Analytics]    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Articles (ag-grid)                              │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Title│Category │Status   │Published│Actions  │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Legal│Constitutional│Published│2024-01-15│[Edit]│ │ │ │
│ │ │ │Guide│         │         │         │[View]   │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │Real │Real     │Draft    │-        │[Edit]   │ │ │ │
│ │ │ │Estate│Estate  │         │         │[Preview]│ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **18. Reports & Analytics Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Reports  [Notifications] [Profile] [Logout]      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Reports & Analytics                                 │ │
│ │                                                     │ │
│ │ [Generate Report] [Export Data] [Schedule Reports]  │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Case    │ │ Billing │ │ Time    │ │ Client  │    │ │
│ │ │ Reports │ │ Reports │ │ Reports │ │ Reports │    │ │
│ │ │         │ │         │ │         │ │         │    │ │
│ │ │ • Active│ │ • Revenue│ │ • Hours │ │ • Engagement│ │
│ │ │   Cases │ │   Summary│ │   by    │ │   Metrics   │ │
│ │ │ • Case  │ │ • Invoice│ │   Case  │ │ • Client    │ │
│ │ │   Status│ │   Status │ │ • Time  │ │   Satisfaction│ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Performance Dashboard                            │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ [Chart: Revenue Trend]                      │ │ │ │
│ │ │ │ [Chart: Case Status Distribution]           │ │ │ │
│ │ │ │ [Chart: Time Utilization]                   │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Client Portal Pages

### **19. Client Dashboard**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Client Portal  [Messages] [Profile] [Logout]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Welcome, [Client Name]                              │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Active  │ │ Pending │ │ Total   │ │ Outstanding│  │
│ │ │ Cases   │ │ Cases   │ │ Documents│ │ Balance  │  │
│ │ │ 3       │ │ 1       │ │ 25      │ │ $5,250   │  │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ My Cases                                        │ │ │
│ │ │ ┌─────────────────────────────────────────────┐ │ │ │
│ │ │ │ Case #123: ABC Corp vs XYZ Ltd              │ │ │ │
│ │ │ │ Status: Active | Last Update: 2024-01-15    │ │ │ │
│ │ │ │ [View Details] [View Documents]             │ │ │ │
│ │ │ └─────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Recent Documents                                │ │ │
│ │ │ • Contract.pdf (Uploaded: 2024-01-15)          │ │ │
│ │ │ • Evidence.pdf (Uploaded: 2024-01-14)          │ │ │
│ │ │ [View All Documents]                            │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **20. Client Case Details**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Cases > Case #123  [Messages] [Profile] [Logout] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Case #123: ABC Corp vs XYZ Ltd                      │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Status  │ │ Type    │ │ Value   │ │ Next    │    │ │
│ │ │ Active  │ │ Real    │ │ $50,000 │ │ Hearing │    │ │
│ │ │         │ │ Estate  │ │         │ │ Jan 20  │    │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ [Overview] [Documents] [Timeline] [Billing] [Messages]│
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Case Timeline                                   │ │ │
│ │ │                                                 │ │ │
│ │ │ 2024-01-15: Document submitted                  │ │ │
│ │ │ 2024-01-14: Court filing completed              │ │ │
│ │ │ 2024-01-10: Case opened                         │ │ │
│ │ │                                                 │ │ │
│ │ │ Next: Court hearing on January 20, 2024         │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **21. Client Billing Page**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Billing  [Messages] [Profile] [Logout]           │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ My Billing                                         │ │
│ │                                                     │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │ │
│ │ │ Total   │ │ Paid    │ │ Pending │ │ Overdue │    │ │
│ │ │ Billed  │ │ Amount  │ │ Amount  │ │ Amount  │    │ │
│ │ │ $15,250 │ │ $10,000 │ │ $3,500  │ │ $1,750  │    │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘    │ │
│ │                                                     │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Invoice History (ag-grid)                       │ │ │
│ │ │ ┌─────┬─────────┬─────────┬─────────┬─────────┐ │ │ │
│ │ │ │Inv# │Date     │Amount   │Status   │Actions  │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │INV-1│2024-01-15│$5,250  │Pending  │[Pay]    │ │ │ │
│ │ │ ├─────┼─────────┼─────────┼─────────┼─────────┤ │ │ │
│ │ │ │INV-2│2024-01-10│$3,500  │Paid     │[View]   │ │ │ │
│ │ │ └─────┴─────────┴─────────┴─────────┴─────────┘ │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Mobile Responsive Design

### **22. Mobile Navigation**
```
┌─────────────────────────────────────────┐
│ [Logo] RAGHUU CO        [Menu] [Profile]│
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Mobile Menu                         │ │
│ │                                     │ │
│ │ [Dashboard]                         │ │
│ │ [Cases]                             │ │
│ │ [Documents]                         │ │
│ │ [Time Tracking]                     │ │
│ │ [Billing]                           │ │
│ │ [Calendar]                          │ │
│ │ [Clients]                           │ │
│ │ [Reports]                           │ │
│ │ [Settings]                          │ │
│ │ [Logout]                            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **23. Mobile Case List**
```
┌─────────────────────────────────────────┐
│ Cases                    [Filter] [+]   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Case #123                           │ │
│ │ ABC Corp vs XYZ Ltd                 │ │
│ │ Status: Active | Type: Real Estate  │ │
│ │ [View] [Edit]                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Case #456                           │ │
│ │ John Doe vs ABC Corp                │ │
│ │ Status: Pending | Type: Company     │ │
│ │ [View] [Edit]                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Case #789                           │ │
│ │ XYZ Ltd vs DEF Inc                  │ │
│ │ Status: Active | Type: Banking      │ │
│ │ [View] [Edit]                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **24. Mobile Time Tracking**
```
┌─────────────────────────────────────────┐
│ Time Tracking                           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Current Timer                       │ │
│ │                                     │ │
│ │ Case: [Case #123 ▼]                 │ │
│ │ Task: [Document Review]             │ │
│ │                                     │ │
│ │ 02:15:30                            │ │
│ │                                     │ │
│ │ [Stop] [Pause]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Today's Entries                     │ │
│ │                                     │ │
│ │ Case #123 - Research - 2.5h         │ │
│ │ Case #456 - Meeting - 1.0h          │ │
│ │                                     │ │
│ │ [Add Entry]                         │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Key Design Principles

### **1. Mobile-First Approach**
- All pages designed for mobile first, then enhanced for desktop
- Touch-friendly interface elements
- Responsive grid layouts using ag-grid-community
- Optimized navigation for mobile devices

### **2. Material Design**
- Consistent use of Material-UI components
- Proper elevation and shadows
- Clear visual hierarchy
- Accessible color contrast

### **3. User Experience**
- Intuitive navigation patterns
- Clear call-to-action buttons
- Consistent layout across pages
- Fast loading and responsive interactions

### **4. Security & Compliance**
- Secure authentication flows
- Role-based access control
- Audit trail visibility
- Data protection indicators

### **5. Performance**
- Optimized data grids for large datasets
- Efficient search and filtering
- Progressive loading
- Cached data for better performance

---

This comprehensive wireframes document provides a complete visual guide for implementing all pages of the RAGHUU CO Legal Practice Management System, ensuring consistency across all user roles and devices.