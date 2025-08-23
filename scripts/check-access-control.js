#!/usr/bin/env node

/**
 * Access Control Audit Script
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-01-15
 * 
 * @description Script to audit access control implementation and identify unauthorized access patterns
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * Access control auditor class
 */
class AccessControlAuditor {
  constructor() {
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      missingAuth: 0,
      missingPermissions: 0,
      inconsistentPermissions: 0,
      unauthorizedAccess: 0
    };
  }

  /**
   * Check access control for a file
   * 
   * @param {string} filePath - Path to the file to check
   */
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    
    this.stats.totalFiles++;
    let fileHasIssues = false;

    // Skip non-route files
    if (!fileName.includes('Routes') && !fileName.includes('routes')) {
      return;
    }

    // Check for missing authentication
    if (this.hasRouteDefinitions(content) && !this.hasAuthentication(content)) {
      this.addIssue(fileName, 0, 'Missing Authentication', 'Route file has no authentication middleware', 'high');
      this.stats.missingAuth++;
      fileHasIssues = true;
    }

    // Check for missing permission checks
    if (this.hasRouteDefinitions(content) && !this.hasPermissionChecks(content)) {
      this.addIssue(fileName, 0, 'Missing Permission Checks', 'Route file has no permission authorization', 'high');
      this.stats.missingPermissions++;
      fileHasIssues = true;
    }

    // Check for inconsistent permission usage
    const permissionIssues = this.checkPermissionConsistency(lines, fileName);
    if (permissionIssues.length > 0) {
      permissionIssues.forEach(issue => {
        this.addIssue(fileName, issue.line, issue.type, issue.description, issue.severity);
        if (issue.severity === 'high') {
          this.stats.unauthorizedAccess++;
        } else {
          this.stats.inconsistentPermissions++;
        }
      });
      fileHasIssues = true;
    }

    if (fileHasIssues) {
      this.stats.filesWithIssues++;
    }
  }

  /**
   * Check if file has route definitions
   * 
   * @param {string} content - File content
   * @returns {boolean} True if file has routes
   */
  hasRouteDefinitions(content) {
    return content.includes('router.get(') || 
           content.includes('router.post(') || 
           content.includes('router.put(') || 
           content.includes('router.delete(') ||
           content.includes('router.patch(');
  }

  /**
   * Check if file has authentication middleware
   * 
   * @param {string} content - File content
   * @returns {boolean} True if file has authentication
   */
  hasAuthentication(content) {
    return content.includes('authenticateToken') || 
           content.includes('authenticateClientUser') ||
           content.includes('optionalClientAuth');
  }

  /**
   * Check if file has permission checks
   * 
   * @param {string} content - File content
   * @returns {boolean} True if file has permission checks
   */
  hasPermissionChecks(content) {
    return content.includes('authorizePermission') || 
           content.includes('authorizeRole') ||
           content.includes('validateCaseAccess') ||
           content.includes('validateDocumentAccess');
  }

  /**
   * Check for permission consistency issues
   * 
   * @param {string[]} lines - File lines
   * @param {string} fileName - File name
   * @returns {Array} Array of permission issues
   */
  checkPermissionConsistency(lines, fileName) {
    const issues = [];
    const placeholderPermissions = [
      'VIEW_TIME_ENTRIES', // Used for tasks
      'VIEW_CALENDAR', // Used for communication
      'VIEW_EVENTS', // Used for communication
      'CREATE_EVENTS', // Used for communication
      'UPDATE_EVENTS', // Used for communication
      'DELETE_EVENTS', // Used for communication
      'VIEW_CASES', // Used for search
      'VIEW_REPORTS' // Used for search statistics
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for placeholder permissions
      for (const placeholder of placeholderPermissions) {
        if (line.includes(`Permission.${placeholder}`) && line.includes('// Using')) {
          issues.push({
            line: i + 1,
            type: 'Placeholder Permission',
            description: `Using placeholder permission: ${placeholder}`,
            severity: 'medium'
          });
        }
      }

      // Check for missing permission imports
      if (line.includes('authorizePermission') && !line.includes('Permission.')) {
        issues.push({
          line: i + 1,
          type: 'Missing Permission Import',
          description: 'authorizePermission used without Permission enum',
          severity: 'high'
        });
      }

      // Check for hardcoded permissions
      if (line.includes('authorizePermission') && line.includes("'") && !line.includes('Permission.')) {
        issues.push({
          line: i + 1,
          type: 'Hardcoded Permission',
          description: 'Permission string is hardcoded instead of using Permission enum',
          severity: 'high'
        });
      }
    }

    return issues;
  }

  /**
   * Add an issue to the list
   * 
   * @param {string} fileName - Name of the file
   * @param {number} lineNumber - Line number
   * @param {string} type - Issue type
   * @param {string} description - Issue description
   * @param {string} severity - Issue severity
   */
  addIssue(fileName, lineNumber, type, description, severity) {
    this.issues.push({
      fileName,
      lineNumber,
      type,
      description,
      severity
    });
    this.stats.totalIssues++;
  }

  /**
   * Generate report
   * 
   * @returns {string} Formatted report
   */
  generateReport() {
    let report = '\n🔒 Access Control Audit Report\n';
    report += '==============================\n\n';

    // Summary
    report += `📊 Summary:\n`;
    report += `  Total files checked: ${this.stats.totalFiles}\n`;
    report += `  Files with issues: ${this.stats.filesWithIssues}\n`;
    report += `  Total issues: ${this.stats.totalIssues}\n\n`;

    // Issue breakdown
    report += `🔍 Issue Breakdown:\n`;
    report += `  High severity (unauthorized access): ${this.stats.unauthorizedAccess}\n`;
    report += `  High severity (missing auth): ${this.stats.missingAuth}\n`;
    report += `  High severity (missing permissions): ${this.stats.missingPermissions}\n`;
    report += `  Medium severity (inconsistent permissions): ${this.stats.inconsistentPermissions}\n\n`;

    // Detailed issues
    if (this.issues.length > 0) {
      report += `❌ Detailed Issues:\n`;
      report += `  ${'='.repeat(80)}\n\n`;

      const groupedIssues = this.groupIssuesByFile();
      
      for (const [fileName, fileIssues] of Object.entries(groupedIssues)) {
        report += `📁 ${fileName}:\n`;
        
        for (const issue of fileIssues) {
          const severityIcon = issue.severity === 'high' ? '🔴' : '🟡';
          const lineInfo = issue.lineNumber > 0 ? `Line ${issue.lineNumber}: ` : '';
          report += `  ${severityIcon} ${lineInfo}${issue.type}\n`;
          report += `     ${issue.description}\n`;
        }
        
        report += '\n';
      }
    } else {
      report += `✅ No access control issues found! All routes are properly secured.\n\n`;
    }

    // Security recommendations
    report += `💡 Security Recommendations:\n`;
    report += `  - All routes must use authenticateToken middleware\n`;
    report += `  - All routes must use authorizePermission with proper Permission enum\n`;
    report += `  - Replace placeholder permissions with specific ones\n`;
    report += `  - Use role-based access control for sensitive operations\n`;
    report += `  - Implement proper validation for client portal access\n`;
    report += `  - Add rate limiting for authentication endpoints\n`;
    report += `  - Log all access control failures for security monitoring\n\n`;

    // Action items
    if (this.stats.unauthorizedAccess > 0 || this.stats.missingAuth > 0 || this.stats.missingPermissions > 0) {
      report += `🚨 Critical Security Actions Required:\n`;
      report += `  - ${this.stats.missingAuth} files need authentication middleware\n`;
      report += `  - ${this.stats.missingPermissions} files need permission checks\n`;
      report += `  - ${this.stats.unauthorizedAccess} unauthorized access patterns detected\n`;
      report += `  - ${this.stats.inconsistentPermissions} inconsistent permission usages\n\n`;
    }

    return report;
  }

  /**
   * Group issues by file
   * 
   * @returns {Object} Issues grouped by file name
   */
  groupIssuesByFile() {
    const grouped = {};
    
    for (const issue of this.issues) {
      if (!grouped[issue.fileName]) {
        grouped[issue.fileName] = [];
      }
      grouped[issue.fileName].push(issue);
    }
    
    return grouped;
  }

  /**
   * Run the auditor on all TypeScript/JavaScript files
   * 
   * @param {string} rootDir - Root directory to check
   */
  run(rootDir = '.') {
    console.log('🔒 Checking access control implementation...\n');

    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx'
    ];

    const excludePatterns = [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.git/**',
      '**/*.d.ts',
      '**/roleAccess.ts'
    ];

    for (const pattern of patterns) {
      const files = glob.sync(pattern, {
        cwd: rootDir,
        ignore: excludePatterns,
        absolute: true
      });

      for (const file of files) {
        this.checkFile(file);
      }
    }

    console.log(this.generateReport());
  }
}

// Run the auditor if this script is executed directly
if (require.main === module) {
  const auditor = new AccessControlAuditor();
  auditor.run();
}

module.exports = AccessControlAuditor;