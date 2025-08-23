// Page Navigation Function
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update URL hash for bookmarking
    window.location.hash = pageId;
    
    // Update active navigation state
    updateNavigationState(pageId);
}

// Update navigation active state
function updateNavigationState(pageId) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-menu a, .nav-links a');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to current page nav item
    const activeNavItem = document.querySelector(`[onclick="showPage('${pageId}')"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check for hash in URL to restore page state
    const hash = window.location.hash.substring(1);
    if (hash) {
        showPage(hash);
    } else {
        showPage('landing-page');
    }
    
    // Add interactive handlers
    addInteractiveHandlers();
    
    // Initialize demo data
    initializeDemoData();
});

// Add interactive handlers
function addInteractiveHandlers() {
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(form);
        });
    });
    
    // Table row clicks
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.tagName === 'BUTTON') return;
            
            // Highlight selected row
            tableRows.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Handle tab content switching
            handleTabSwitch(this.textContent.trim());
        });
    });
    
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-box input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            handleSearch(this.value, this.closest('.table-container'));
        });
    });
    
    // Button click handlers
    addButtonHandlers();
}

// Handle form submissions
function handleFormSubmission(form) {
    const formData = new FormData(form);
    const formType = form.closest('.auth-card') ? 'auth' : 'general';
    
    if (formType === 'auth') {
        // Simulate authentication
        showNotification('Processing login...', 'info');
        setTimeout(() => {
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                showPage('staff-dashboard');
            }, 1000);
        }, 1500);
    } else {
        showNotification('Form submitted successfully!', 'success');
    }
}

// Handle tab switching
function handleTabSwitch(tabName) {
    const caseContent = document.querySelector('.case-content');
    if (!caseContent) return;
    
    // Update content based on tab
    switch(tabName.toLowerCase()) {
        case 'overview':
            caseContent.innerHTML = getOverviewContent();
            break;
        case 'documents':
            caseContent.innerHTML = getDocumentsContent();
            break;
        case 'timeline':
            caseContent.innerHTML = getTimelineContent();
            break;
        case 'billing':
            caseContent.innerHTML = getBillingContent();
            break;
        case 'notes':
            caseContent.innerHTML = getNotesContent();
            break;
    }
}

// Handle search functionality
function handleSearch(query, container) {
    if (!container) return;
    
    const table = container.querySelector('.data-table tbody');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Add button handlers
function addButtonHandlers() {
    // Add New Case button
    const addCaseBtn = document.querySelector('[onclick="showPage(\'case-detail\')"]');
    if (addCaseBtn) {
        addCaseBtn.addEventListener('click', function() {
            showNotification('Creating new case...', 'info');
            setTimeout(() => {
                showPage('case-detail');
            }, 500);
        });
    }
    
    // Upload Document button
    const uploadBtn = document.querySelector('button:contains("Upload Document")');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            showNotification('Document upload feature coming soon!', 'info');
        });
    }
    
    // Generate Invoice button
    const invoiceBtn = document.querySelector('button:contains("Generate Invoice")');
    if (invoiceBtn) {
        invoiceBtn.addEventListener('click', function() {
            showNotification('Invoice generation feature coming soon!', 'info');
        });
    }
}

// Mock data for demonstration
const mockData = {
    cases: [
        {
            id: '123',
            client: 'ABC Corp',
            type: 'Real Estate',
            status: 'Active',
            value: '$50,000',
            description: 'Property dispute regarding commercial real estate lease agreement.'
        },
        {
            id: '456',
            client: 'XYZ Ltd',
            type: 'Company',
            status: 'Pending',
            value: '$25,000',
            description: 'Corporate restructuring and compliance matters.'
        },
        {
            id: '789',
            client: 'DEF Inc',
            type: 'Banking',
            status: 'Active',
            value: '$75,000',
            description: 'Banking regulations and compliance issues.'
        }
    ],
    documents: [
        {
            name: 'Contract.pdf',
            case: 'Case #123',
            type: 'Contract',
            uploaded: '2024-01-15',
            size: '2.5 MB'
        },
        {
            name: 'Evidence.pdf',
            case: 'Case #123',
            type: 'Evidence',
            uploaded: '2024-01-14',
            size: '1.8 MB'
        },
        {
            name: 'Court_Order.pdf',
            case: 'Case #456',
            type: 'Court Order',
            uploaded: '2024-01-13',
            size: '0.5 MB'
        }
    ],
    timeEntries: [
        {
            date: '2024-01-15',
            case: 'Case #123',
            task: 'Document Review',
            hours: 2.5,
            billable: true
        },
        {
            date: '2024-01-15',
            case: 'Case #456',
            task: 'Client Meeting',
            hours: 1.0,
            billable: true
        },
        {
            date: '2024-01-14',
            case: 'Case #123',
            task: 'Research',
            hours: 3.0,
            billable: true
        }
    ]
};

// Initialize demo data
function initializeDemoData() {
    // Populate case management table
    populateCaseTable();
    
    // Populate document management table
    populateDocumentTable();
    
    // Populate time tracking
    populateTimeTracking();
}

// Populate case table
function populateCaseTable() {
    const caseTable = document.querySelector('#case-management .data-table tbody');
    if (!caseTable) return;
    
    caseTable.innerHTML = mockData.cases.map(case_ => `
        <tr>
            <td>${case_.id}</td>
            <td>${case_.client}</td>
            <td>${case_.type}</td>
            <td><span class="status ${case_.status.toLowerCase()}">${case_.status}</span></td>
            <td>
                <button class="btn-small btn-primary" onclick="viewCase('${case_.id}')">View</button>
                <button class="btn-small btn-secondary" onclick="editCase('${case_.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

// Populate document table
function populateDocumentTable() {
    const docTable = document.querySelector('#document-management .data-table tbody');
    if (!docTable) return;
    
    docTable.innerHTML = mockData.documents.map(doc => `
        <tr>
            <td>${doc.name}</td>
            <td>${doc.case}</td>
            <td>${doc.type}</td>
            <td>${doc.uploaded}</td>
            <td>
                <button class="btn-small btn-primary" onclick="viewDocument('${doc.name}')">View</button>
                <button class="btn-small btn-secondary" onclick="editDocument('${doc.name}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

// Populate time tracking
function populateTimeTracking() {
    const timeContainer = document.querySelector('#time-tracking .section-card');
    if (!timeContainer) return;
    
    timeContainer.innerHTML = `
        <h3>Today's Time Entries</h3>
        <div class="time-entries">
            ${mockData.timeEntries.filter(entry => entry.date === '2024-01-15').map(entry => `
                <div class="time-entry">
                    <span class="time-case">${entry.case}</span>
                    <span class="time-task">${entry.task}</span>
                    <span class="time-hours">${entry.hours}h</span>
                    <span class="time-billable">${entry.billable ? 'Billable' : 'Non-billable'}</span>
                </div>
            `).join('')}
        </div>
        <button class="btn-primary" style="margin-top: 1rem;">Add Time Entry</button>
    `;
}

// Case management functions
function viewCase(caseId) {
    showNotification(`Viewing case ${caseId}...`, 'info');
    setTimeout(() => {
        showPage('case-detail');
    }, 500);
}

function editCase(caseId) {
    showNotification(`Editing case ${caseId}...`, 'info');
}

// Document management functions
function viewDocument(docName) {
    showNotification(`Opening ${docName}...`, 'info');
}

function editDocument(docName) {
    showNotification(`Editing ${docName}...`, 'info');
}

// Content generators for tabs
function getOverviewContent() {
    return `
        <div class="case-overview">
            <h3>Case Overview</h3>
            <div class="overview-grid">
                <div class="overview-item">
                    <label>Client:</label>
                    <span>ABC Corporation</span>
                </div>
                <div class="overview-item">
                    <label>Opposing Party:</label>
                    <span>XYZ Ltd</span>
                </div>
                <div class="overview-item">
                    <label>Assigned Partner:</label>
                    <span>John Smith</span>
                </div>
                <div class="overview-item">
                    <label>Assigned Associates:</label>
                    <span>Jane Doe, Mike Johnson</span>
                </div>
            </div>
            
            <div class="case-description">
                <h4>Description</h4>
                <p>Property dispute regarding commercial real estate lease agreement. Client alleges breach of contract and seeks damages for lost revenue.</p>
            </div>
            
            <div class="case-actions">
                <button class="btn-primary">Edit Case</button>
                <button class="btn-secondary">Add Milestone</button>
                <button class="btn-secondary">Generate Report</button>
            </div>
        </div>
    `;
}

function getDocumentsContent() {
    return `
        <div class="documents-section">
            <h3>Case Documents</h3>
            <div class="document-list">
                ${mockData.documents.filter(doc => doc.case === 'Case #123').map(doc => `
                    <div class="document-item">
                        <i class="fas fa-file-pdf"></i>
                        <div class="document-info">
                            <span class="document-name">${doc.name}</span>
                            <span class="document-meta">${doc.type} • ${doc.uploaded}</span>
                        </div>
                        <div class="document-actions">
                            <button class="btn-small btn-primary">View</button>
                            <button class="btn-small btn-secondary">Download</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-primary" style="margin-top: 1rem;">Upload Document</button>
        </div>
    `;
}

function getTimelineContent() {
    return `
        <div class="timeline-section">
            <h3>Case Timeline</h3>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-date">2024-01-15</div>
                    <div class="timeline-content">
                        <h4>Document submitted</h4>
                        <p>Contract review completed and submitted to court</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">2024-01-14</div>
                    <div class="timeline-content">
                        <h4>Court filing completed</h4>
                        <p>Initial court filing submitted successfully</p>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">2024-01-10</div>
                    <div class="timeline-content">
                        <h4>Case opened</h4>
                        <p>New case created and assigned to legal team</p>
                    </div>
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 1rem;">Add Milestone</button>
        </div>
    `;
}

function getBillingContent() {
    return `
        <div class="billing-section">
            <h3>Case Billing</h3>
            <div class="billing-summary">
                <div class="billing-stat">
                    <label>Total Hours:</label>
                    <span>6.5 hours</span>
                </div>
                <div class="billing-stat">
                    <label>Total Billed:</label>
                    <span>$3,250</span>
                </div>
                <div class="billing-stat">
                    <label>Outstanding:</label>
                    <span>$1,750</span>
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 1rem;">Generate Invoice</button>
        </div>
    `;
}

function getNotesContent() {
    return `
        <div class="notes-section">
            <h3>Case Notes</h3>
            <div class="notes-list">
                <div class="note-item">
                    <div class="note-header">
                        <span class="note-author">John Smith</span>
                        <span class="note-date">2024-01-15</span>
                    </div>
                    <div class="note-content">
                        <p>Client meeting completed. Discussed settlement options with opposing party.</p>
                    </div>
                </div>
                <div class="note-item">
                    <div class="note-header">
                        <span class="note-author">Jane Doe</span>
                        <span class="note-date">2024-01-14</span>
                    </div>
                    <div class="note-content">
                        <p>Document review completed. All contracts are in order.</p>
                    </div>
                </div>
            </div>
            <button class="btn-primary" style="margin-top: 1rem;">Add Note</button>
        </div>
    `;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

// Export functions for global access
window.showPage = showPage;
window.viewCase = viewCase;
window.editCase = editCase;
window.viewDocument = viewDocument;
window.editDocument = editDocument;
window.showNotification = showNotification;