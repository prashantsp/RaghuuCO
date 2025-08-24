#!/usr/bin/env node

/**
 * SQL Centralization Checker
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Script to check for standalone SQL queries that should be using centralized db_SQLQueries
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * SQL centralization checker class
 */
class SQLCentralizationChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      standaloneQueries: 0,
      missingImports: 0,
      potentialIssues: 0
    };
  }

  /**
   * Check SQL centralization for a file
   * 
   * @param {string} filePath - Path to the file to check
   */
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    
    this.stats.totalFiles++;
    let fileHasIssues = false;

    // Skip the centralized SQL queries file itself
    if (fileName === 'db_SQLQueries.ts') {
      return;
    }

    // Check for standalone SQL queries
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for db.query calls with inline SQL
      if (this.isStandaloneSQLQuery(line)) {
        const issue = this.analyzeStandaloneQuery(lines, i, fileName);
        if (issue) {
          this.addIssue(fileName, i + 1, issue.type, issue.description, issue.severity);
          fileHasIssues = true;
          
          if (issue.severity === 'high') {
            this.stats.standaloneQueries++;
          } else if (issue.severity === 'medium') {
            this.stats.potentialIssues++;
          }
        }
      }

      // Check for missing SQLQueries import
      if (this.isMissingImport(line, content)) {
        this.addIssue(fileName, i + 1, 'Missing Import', 'Missing SQLQueries import', 'high');
        this.stats.missingImports++;
        fileHasIssues = true;
      }
    }

    if (fileHasIssues) {
      this.stats.filesWithIssues++;
    }
  }

  /**
   * Check if a line contains a standalone SQL query
   * 
   * @param {string} line - Line to check
   * @returns {boolean} True if line contains standalone SQL
   */
  isStandaloneSQLQuery(line) {
    const patterns = [
      /db\.query\(['"`].*SELECT.*FROM/i,
      /db\.query\(['"`].*INSERT INTO/i,
      /db\.query\(['"`].*UPDATE.*SET/i,
      /db\.query\(['"`].*DELETE FROM/i,
      /db\.query\(['"`].*CREATE TABLE/i,
      /db\.query\(['"`].*ALTER TABLE/i,
      /db\.query\(['"`].*DROP TABLE/i
    ];

    return patterns.some(pattern => pattern.test(line));
  }

  /**
   * Analyze a standalone SQL query
   * 
   * @param {string[]} lines - All lines in the file
   * @param {number} lineIndex - Index of the line with SQL
   * @param {string} fileName - Name of the file
   * @returns {Object|null} Issue details or null if not an issue
   */
  analyzeStandaloneQuery(lines, lineIndex, fileName) {
    const line = lines[lineIndex];
    
    // Skip if it's already using SQLQueries
    if (line.includes('SQLQueries.')) {
      return null;
    }

    // Skip migration files
    if (fileName.includes('migrate') || fileName.includes('Migration')) {
      return null;
    }

    // Skip test files
    if (fileName.includes('.test.') || fileName.includes('.spec.')) {
      return null;
    }

    // Determine severity based on query type
    let severity = 'medium';
    let type = 'Standalone SQL Query';

    if (line.includes('SELECT COUNT(*)') || line.includes('SELECT * FROM')) {
      severity = 'high';
      type = 'Simple Query - Should be centralized';
    } else if (line.includes('UPDATE') || line.includes('INSERT') || line.includes('DELETE')) {
      severity = 'high';
      type = 'Data Modification Query - Should be centralized';
    } else if (line.includes('JOIN') || line.includes('GROUP BY') || line.includes('ORDER BY')) {
      severity = 'medium';
      type = 'Complex Query - Consider centralizing';
    }

    return {
      type,
      description: `Standalone SQL query found: ${line.trim().substring(0, 100)}...`,
      severity
    };
  }

  /**
   * Check if file is missing SQLQueries import
   * 
   * @param {string} line - Current line
   * @param {string} content - Full file content
   * @returns {boolean} True if missing import
   */
  isMissingImport(line, content) {
    // Only check if the file uses db.query
    if (!content.includes('db.query(')) {
      return false;
    }

    // Check if SQLQueries is imported
    const importPatterns = [
      /import.*SQLQueries.*from/i,
      /import.*db_SQLQueries/i,
      /require.*SQLQueries/i
    ];

    return !importPatterns.some(pattern => pattern.test(content));
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
    let report = '\n🔍 SQL Centralization Audit Report\n';
    report += '==================================\n\n';

    // Summary
    report += `📊 Summary:\n`;
    report += `  Total files checked: ${this.stats.totalFiles}\n`;
    report += `  Files with issues: ${this.stats.filesWithIssues}\n`;
    report += `  Total issues: ${this.stats.totalIssues}\n\n`;

    // Issue breakdown
    report += `🔍 Issue Breakdown:\n`;
    report += `  High severity (standalone queries): ${this.stats.standaloneQueries}\n`;
    report += `  Medium severity (potential issues): ${this.stats.potentialIssues}\n`;
    report += `  Missing imports: ${this.stats.missingImports}\n\n`;

    // Detailed issues
    if (this.issues.length > 0) {
      report += `❌ Detailed Issues:\n`;
      report += `  ${'='.repeat(80)}\n\n`;

      const groupedIssues = this.groupIssuesByFile();
      
      for (const [fileName, fileIssues] of Object.entries(groupedIssues)) {
        report += `📁 ${fileName}:\n`;
        
        for (const issue of fileIssues) {
          const severityIcon = issue.severity === 'high' ? '🔴' : '🟡';
          report += `  ${severityIcon} Line ${issue.lineNumber}: ${issue.type}\n`;
          report += `     ${issue.description}\n`;
        }
        
        report += '\n';
      }
    } else {
      report += `✅ No issues found! All SQL queries are properly centralized.\n\n`;
    }

    // Recommendations
    report += `💡 Recommendations:\n`;
    report += `  - Move all standalone SQL queries to db_SQLQueries.ts\n`;
    report += `  - Import SQLQueries in files that use database operations\n`;
    report += `  - Use descriptive names for centralized queries\n`;
    report += `  - Group related queries by entity type\n`;
    report += `  - Add JSDoc comments to all centralized queries\n\n`;

    // Action items
    if (this.stats.standaloneQueries > 0) {
      report += `🚨 Immediate Actions Required:\n`;
      report += `  - ${this.stats.standaloneQueries} standalone queries need to be moved to db_SQLQueries.ts\n`;
      report += `  - ${this.stats.missingImports} files need SQLQueries import\n`;
      report += `  - Update controllers to use centralized queries\n\n`;
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
   * Run the checker on all TypeScript/JavaScript files
   * 
   * @param {string} rootDir - Root directory to check
   */
  run(rootDir = '.') {
    console.log('🔍 Checking SQL centralization...\n');

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
      '**/db_SQLQueries.ts'
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

// Run the checker if this script is executed directly
if (require.main === module) {
  const checker = new SQLCentralizationChecker();
  checker.run();
}

module.exports = SQLCentralizationChecker;