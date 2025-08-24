#!/usr/bin/env node

/**
 * JSDoc Compliance Checker
 * RAGHUU CO Legal Practice Management System
 * 
 * @author RAGHUU CO Development Team
 * @version 1.0.0
 * @since 2025-08-24
 * 
 * @description Script to check JSDoc compliance across the codebase
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * JSDoc compliance checker class
 */
class JSDocChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      totalFiles: 0,
      filesWithIssues: 0,
      totalIssues: 0,
      missingJSDoc: 0,
      missingParams: 0,
      missingReturns: 0,
      missingDescription: 0
    };
  }

  /**
   * Check JSDoc compliance for a file
   * 
   * @param {string} filePath - Path to the file to check
   */
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    
    this.stats.totalFiles++;
    let fileHasIssues = false;

    // Check for functions and methods
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for function declarations, method definitions, and exports
      if (this.isFunctionDefinition(line)) {
        const functionName = this.extractFunctionName(line);
        const hasJSDoc = this.hasJSDocComment(lines, i);
        
        if (!hasJSDoc) {
          this.addIssue(fileName, i + 1, 'Missing JSDoc comment', functionName);
          this.stats.missingJSDoc++;
          fileHasIssues = true;
        } else {
          // Check JSDoc quality
          const jsdocLines = this.getJSDocLines(lines, i);
          this.checkJSDocQuality(fileName, i + 1, jsdocLines, functionName);
        }
      }
    }

    if (fileHasIssues) {
      this.stats.filesWithIssues++;
    }
  }

  /**
   * Check if a line contains a function definition
   * 
   * @param {string} line - Line to check
   * @returns {boolean} True if line contains function definition
   */
  isFunctionDefinition(line) {
    const patterns = [
      /^export\s+(const|function|async\s+function)\s+(\w+)/,
      /^const\s+(\w+)\s*=\s*(async\s*)?\(/,
      /^function\s+(\w+)/,
      /^async\s+function\s+(\w+)/,
      /^\s*(\w+)\s*\(/,
      /^\s*async\s+(\w+)\s*\(/,
      /^\s*(\w+):\s*(async\s*)?\(/,
      /^\s*(\w+)\s*=\s*(async\s*)?\(/
    ];

    return patterns.some(pattern => pattern.test(line.trim()));
  }

  /**
   * Extract function name from line
   * 
   * @param {string} line - Line containing function definition
   * @returns {string} Function name
   */
  extractFunctionName(line) {
    const patterns = [
      /^export\s+(const|function|async\s+function)\s+(\w+)/,
      /^const\s+(\w+)\s*=/,
      /^function\s+(\w+)/,
      /^async\s+function\s+(\w+)/,
      /^\s*(\w+)\s*\(/,
      /^\s*async\s+(\w+)\s*\(/,
      /^\s*(\w+):\s*(async\s*)?\(/,
      /^\s*(\w+)\s*=\s*(async\s*)?\(/
    ];

    for (const pattern of patterns) {
      const match = line.trim().match(pattern);
      if (match) {
        return match[1] || match[2];
      }
    }

    return 'unknown';
  }

  /**
   * Check if function has JSDoc comment
   * 
   * @param {string[]} lines - All lines in the file
   * @param {number} functionLineIndex - Index of function line
   * @returns {boolean} True if function has JSDoc comment
   */
  hasJSDocComment(lines, functionLineIndex) {
    // Check previous lines for JSDoc comment
    for (let i = functionLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line === '') continue;
      if (line.startsWith('//')) continue;
      if (line.startsWith('/*')) {
        return line.includes('*/') || this.hasClosingComment(lines, i);
      }
      if (line.startsWith('/**')) {
        return line.includes('*/') || this.hasClosingComment(lines, i);
      }
      
      // If we hit code, no JSDoc found
      if (!line.startsWith('*') && !line.startsWith('/')) {
        break;
      }
    }
    
    return false;
  }

  /**
   * Check if JSDoc comment has closing tag
   * 
   * @param {string[]} lines - All lines in the file
   * @param {number} startIndex - Starting index of comment
   * @returns {boolean} True if comment has closing tag
   */
  hasClosingComment(lines, startIndex) {
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes('*/')) {
        return true;
      }
      if (line === '' || line.startsWith('*')) {
        continue;
      }
      break;
    }
    return false;
  }

  /**
   * Get JSDoc lines for a function
   * 
   * @param {string[]} lines - All lines in the file
   * @param {number} functionLineIndex - Index of function line
   * @returns {string[]} Array of JSDoc lines
   */
  getJSDocLines(lines, functionLineIndex) {
    const jsdocLines = [];
    
    for (let i = functionLineIndex - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line === '') continue;
      if (line.startsWith('//')) continue;
      if (line.startsWith('/**')) {
        jsdocLines.unshift(line);
        break;
      }
      if (line.startsWith('/*')) {
        jsdocLines.unshift(line);
        break;
      }
      if (line.startsWith('*')) {
        jsdocLines.unshift(line);
        continue;
      }
      
      break;
    }
    
    return jsdocLines;
  }

  /**
   * Check JSDoc quality
   * 
   * @param {string} fileName - Name of the file
   * @param {number} lineNumber - Line number
   * @param {string[]} jsdocLines - JSDoc lines
   * @param {string} functionName - Function name
   */
  checkJSDocQuality(fileName, lineNumber, jsdocLines, functionName) {
    const jsdocText = jsdocLines.join('\n');
    
    // Check for @description or description in first line
    if (!jsdocText.includes('@description') && !jsdocText.includes('@param') && !jsdocText.includes('@returns')) {
      const firstLine = jsdocLines[0];
      if (!firstLine.includes('* @') && !firstLine.includes('* Description')) {
        this.addIssue(fileName, lineNumber, 'Missing description', functionName);
        this.stats.missingDescription++;
      }
    }

    // Check for @param tags (for functions with parameters)
    if (this.hasParameters(jsdocLines) && !jsdocText.includes('@param')) {
      this.addIssue(fileName, lineNumber, 'Missing @param documentation', functionName);
      this.stats.missingParams++;
    }

    // Check for @returns tag (for functions that return values)
    if (this.hasReturnValue(jsdocLines) && !jsdocText.includes('@returns')) {
      this.addIssue(fileName, lineNumber, 'Missing @returns documentation', functionName);
      this.stats.missingReturns++;
    }
  }

  /**
   * Check if function has parameters
   * 
   * @param {string[]} jsdocLines - JSDoc lines
   * @returns {boolean} True if function has parameters
   */
  hasParameters(jsdocLines) {
    // This is a simplified check - in a real implementation, you'd parse the function signature
    return true; // Assume all functions have parameters for now
  }

  /**
   * Check if function has return value
   * 
   * @param {string[]} jsdocLines - JSDoc lines
   * @returns {boolean} True if function has return value
   */
  hasReturnValue(jsdocLines) {
    // This is a simplified check - in a real implementation, you'd parse the function signature
    return true; // Assume all functions return values for now
  }

  /**
   * Add an issue to the list
   * 
   * @param {string} fileName - Name of the file
   * @param {number} lineNumber - Line number
   * @param {string} issue - Issue description
   * @param {string} functionName - Function name
   */
  addIssue(fileName, lineNumber, issue, functionName) {
    this.issues.push({
      fileName,
      lineNumber,
      issue,
      functionName
    });
    this.stats.totalIssues++;
  }

  /**
   * Generate report
   * 
   * @returns {string} Formatted report
   */
  generateReport() {
    let report = '\n📋 JSDoc Compliance Report\n';
    report += '========================\n\n';

    // Summary
    report += `📊 Summary:\n`;
    report += `  Total files checked: ${this.stats.totalFiles}\n`;
    report += `  Files with issues: ${this.stats.filesWithIssues}\n`;
    report += `  Total issues: ${this.stats.totalIssues}\n\n`;

    // Issue breakdown
    report += `🔍 Issue Breakdown:\n`;
    report += `  Missing JSDoc comments: ${this.stats.missingJSDoc}\n`;
    report += `  Missing descriptions: ${this.stats.missingDescription}\n`;
    report += `  Missing @param tags: ${this.stats.missingParams}\n`;
    report += `  Missing @returns tags: ${this.stats.missingReturns}\n\n`;

    // Detailed issues
    if (this.issues.length > 0) {
      report += `❌ Detailed Issues:\n`;
      report += `  ${'='.repeat(80)}\n\n`;

      const groupedIssues = this.groupIssuesByFile();
      
      for (const [fileName, fileIssues] of Object.entries(groupedIssues)) {
        report += `📁 ${fileName}:\n`;
        
        for (const issue of fileIssues) {
          report += `  Line ${issue.lineNumber}: ${issue.issue} (${issue.functionName})\n`;
        }
        
        report += '\n';
      }
    } else {
      report += `✅ No issues found! All functions have proper JSDoc documentation.\n\n`;
    }

    // Recommendations
    report += `💡 Recommendations:\n`;
    report += `  - Add JSDoc comments to all exported functions and methods\n`;
    report += `  - Include @param tags for all function parameters\n`;
    report += `  - Include @returns tags for functions that return values\n`;
    report += `  - Add @throws tags for functions that can throw errors\n`;
    report += `  - Include @example tags for complex functions\n\n`;

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
    console.log('🔍 Checking JSDoc compliance...\n');

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
      '**/*.d.ts'
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
  const checker = new JSDocChecker();
  checker.run();
}

module.exports = JSDocChecker;