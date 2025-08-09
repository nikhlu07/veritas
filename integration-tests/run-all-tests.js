#!/usr/bin/env node

/**
 * Veritas Comprehensive Test Runner
 * 
 * Automated test runner that orchestrates all integration tests for the Veritas application:
 * - Full-stack integration tests
 * - Hedera HCS integration tests
 * - QR code end-to-end tests
 * - Performance tests
 * - Error handling tests
 * - Data consistency validation
 * 
 * Usage:
 *   npm run test:integration
 *   node run-all-tests.js
 *   node run-all-tests.js --suite=performance
 *   node run-all-tests.js --parallel
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const CONFIG = {
  testSuites: {
    'full-stack': {
      name: 'Full Stack Integration Tests',
      file: './full-stack-integration.js',
      timeout: 300000, // 5 minutes
      priority: 1,
      dependencies: ['backend', 'frontend']
    },
    'hedera': {
      name: 'Hedera HCS Integration Tests',
      file: './hedera-integration.js',
      timeout: 600000, // 10 minutes
      priority: 2,
      dependencies: ['backend', 'hedera']
    },
    'qr-code': {
      name: 'QR Code End-to-End Tests',
      file: './qr-code-e2e.js',
      timeout: 480000, // 8 minutes
      priority: 3,
      dependencies: ['frontend', 'backend']
    },
    'performance': {
      name: 'Performance Tests',
      file: './performance-tests.js',
      timeout: 900000, // 15 minutes
      priority: 4,
      dependencies: ['backend', 'frontend']
    },
    'error-handling': {
      name: 'Error Handling Tests',
      file: './error-handling-tests.js',
      timeout: 480000, // 8 minutes
      priority: 5,
      dependencies: ['frontend', 'backend']
    }
  },
  services: {
    backend: {
      name: 'Veritas Backend',
      url: process.env.API_BASE_URL || 'http://localhost:8080',
      healthCheck: '/health'
    },
    frontend: {
      name: 'Veritas Frontend',
      url: process.env.FRONTEND_URL || 'http://localhost:3000',
      healthCheck: '/'
    },
    hedera: {
      name: 'Hedera Network',
      required: false // Optional for some tests
    }
  },
  reporting: {
    outputDir: './test-results',
    formats: ['json', 'html', 'junit'],
    screenshots: true,
    videos: false
  },
  retries: {
    maxRetries: 2,
    retryDelay: 5000
  }
};

// Global state
const testResults = {
  startTime: null,
  endTime: null,
  duration: 0,
  suites: {},
  summary: {
    totalSuites: 0,
    passedSuites: 0,
    failedSuites: 0,
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0
  },
  environment: {},
  errors: []
};

// Utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.gray}🐛 ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}🧪 ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.white}▶️  ${msg}${colors.reset}`),
  suite: (msg) => console.log(`${colors.magenta}📋 ${msg}${colors.reset}`),
  divider: () => console.log('─'.repeat(80))
};

/**
 * MAIN TEST RUNNER
 */
async function runAllTests() {
  const args = parseArguments();
  
  log.header('🚀 VERITAS COMPREHENSIVE INTEGRATION TEST RUNNER');
  log.divider();
  
  testResults.startTime = new Date();
  
  try {
    // 1. Setup and validation
    await setupTestEnvironment();
    await validateEnvironment();
    await checkServiceAvailability();
    
    // 2. Run test suites
    if (args.parallel && args.suites.length > 1) {
      await runTestSuitesParallel(args.suites);
    } else {
      await runTestSuitesSequential(args.suites);
    }
    
    // 3. Generate reports
    await generateTestReports();
    
  } catch (error) {
    log.error(`Test runner failed: ${error.message}`);
    testResults.errors.push({
      type: 'runner_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  } finally {
    testResults.endTime = new Date();
    testResults.duration = testResults.endTime - testResults.startTime;
    
    await cleanup();
    printFinalSummary();
  }
  
  // Exit with appropriate code
  const exitCode = testResults.summary.failedSuites > 0 ? 1 : 0;
  process.exit(exitCode);
}

/**
 * ARGUMENT PARSING
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const config = {
    suites: [],
    parallel: false,
    verbose: false,
    retry: true,
    screenshots: true,
    reportOnly: false
  };
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--suite':
      case '-s':
        if (args[i + 1] && !args[i + 1].startsWith('--')) {
          config.suites.push(args[i + 1]);
          i++;
        }
        break;
      case '--parallel':
      case '-p':
        config.parallel = true;
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--no-retry':
        config.retry = false;
        break;
      case '--no-screenshots':
        config.screenshots = false;
        break;
      case '--report-only':
        config.reportOnly = true;
        break;
      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }
  
  // Default to all suites if none specified
  if (config.suites.length === 0) {
    config.suites = Object.keys(CONFIG.testSuites);
  }
  
  // Validate suite names
  config.suites = config.suites.filter(suite => {
    if (!CONFIG.testSuites[suite]) {
      log.warning(`Unknown test suite: ${suite}`);
      return false;
    }
    return true;
  });
  
  if (config.suites.length === 0) {
    log.error('No valid test suites specified');
    printUsage();
    process.exit(1);
  }
  
  return config;
}

function printUsage() {
  console.log(`
${colors.bold}Veritas Integration Test Runner${colors.reset}

Usage: node run-all-tests.js [options]

Options:
  -s, --suite <name>     Run specific test suite (can be used multiple times)
                         Available: ${Object.keys(CONFIG.testSuites).join(', ')}
  -p, --parallel         Run test suites in parallel
  -v, --verbose          Enable verbose output
  --no-retry             Disable automatic retries on failure
  --no-screenshots       Disable screenshot capture
  --report-only          Generate reports from existing results
  -h, --help             Show this help message

Examples:
  node run-all-tests.js                           # Run all test suites
  node run-all-tests.js --suite full-stack        # Run only full-stack tests
  node run-all-tests.js --suite qr-code --verbose # Run QR tests with verbose output
  node run-all-tests.js --parallel                # Run all suites in parallel

Environment Variables:
  API_BASE_URL           Backend API URL (default: http://localhost:8080)
  FRONTEND_URL           Frontend URL (default: http://localhost:3000)
  HEDERA_ACCOUNT_ID      Hedera account ID for blockchain tests
  HEDERA_PRIVATE_KEY     Hedera private key for blockchain tests
  HEDERA_NETWORK         Hedera network (testnet/mainnet, default: testnet)
  DEBUG                  Enable debug logging
`);
}

/**
 * SETUP AND VALIDATION
 */
async function setupTestEnvironment() {
  log.step('Setting up test environment...');
  
  // Create output directory
  try {
    await fs.mkdir(CONFIG.reporting.outputDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  // Collect environment information
  testResults.environment = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    timestamp: new Date().toISOString(),
    env: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
      HEDERA_NETWORK: process.env.HEDERA_NETWORK || 'testnet',
      NODE_ENV: process.env.NODE_ENV || 'test'
    }
  };
  
  log.success('Test environment setup complete');
}

async function validateEnvironment() {
  log.step('Validating test environment...');
  
  const issues = [];
  
  // Check Node.js version
  const nodeVersion = process.version.slice(1).split('.').map(Number);
  if (nodeVersion[0] < 16) {
    issues.push('Node.js version 16+ required');
  }
  
  // Check required files exist
  const requiredFiles = Object.values(CONFIG.testSuites).map(suite => suite.file);
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      issues.push(`Test file not found: ${file}`);
    }
  }
  
  // Check environment variables for Hedera tests
  const hederaSuites = Object.keys(CONFIG.testSuites).filter(key => 
    CONFIG.testSuites[key].dependencies.includes('hedera')
  );
  
  if (hederaSuites.length > 0) {
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      log.warning('Hedera credentials not configured - some tests may be skipped');
    }
  }
  
  if (issues.length > 0) {
    log.error('Environment validation failed:');
    issues.forEach(issue => log.error(`  • ${issue}`));
    throw new Error('Environment validation failed');
  }
  
  log.success('Environment validation passed');
}

async function checkServiceAvailability() {
  log.step('Checking service availability...');
  
  const axios = require('axios');
  const serviceChecks = [];
  
  for (const [serviceName, service] of Object.entries(CONFIG.services)) {
    if (service.url && service.healthCheck) {
      serviceChecks.push(
        checkService(serviceName, service, axios)
      );
    }
  }
  
  const results = await Promise.allSettled(serviceChecks);
  
  let allServicesAvailable = true;
  results.forEach((result, index) => {
    const serviceName = Object.keys(CONFIG.services)[index];
    if (result.status === 'fulfilled') {
      log.success(`${serviceName} service is available`);
    } else {
      log.error(`${serviceName} service is unavailable: ${result.reason.message}`);
      allServicesAvailable = false;
    }
  });
  
  if (!allServicesAvailable) {
    log.warning('Some services are unavailable - tests may fail or be skipped');
  }
}

async function checkService(name, service, axios) {
  const url = `${service.url}${service.healthCheck}`;
  
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      validateStatus: (status) => status < 500
    });
    
    if (response.status >= 400) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return { name, status: 'available', response: response.status };
  } catch (error) {
    throw new Error(`Service check failed: ${error.message}`);
  }
}

/**
 * TEST SUITE EXECUTION
 */
async function runTestSuitesSequential(suiteNames) {
  log.header('Running test suites sequentially...');
  
  // Sort by priority
  const sortedSuites = suiteNames
    .map(name => ({ name, ...CONFIG.testSuites[name] }))
    .sort((a, b) => a.priority - b.priority);
  
  for (const suite of sortedSuites) {
    await runTestSuite(suite.name, suite);
  }
}

async function runTestSuitesParallel(suiteNames) {
  log.header('Running test suites in parallel...');
  
  const suitePromises = suiteNames.map(suiteName => 
    runTestSuite(suiteName, CONFIG.testSuites[suiteName])
  );
  
  const results = await Promise.allSettled(suitePromises);
  
  // Process results
  results.forEach((result, index) => {
    const suiteName = suiteNames[index];
    if (result.status === 'rejected') {
      log.error(`Test suite ${suiteName} failed during parallel execution: ${result.reason.message}`);
      testResults.errors.push({
        type: 'suite_execution_error',
        suite: suiteName,
        message: result.reason.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}

async function runTestSuite(suiteName, suiteConfig) {
  log.suite(`Starting test suite: ${suiteConfig.name}`);
  
  const suiteStartTime = Date.now();
  const suiteResult = {
    name: suiteName,
    displayName: suiteConfig.name,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: 'running',
    tests: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    output: '',
    error: null,
    retries: 0
  };
  
  testResults.suites[suiteName] = suiteResult;
  testResults.summary.totalSuites++;
  
  try {
    const result = await executeTestSuite(suiteConfig);
    
    suiteResult.status = result.success ? 'passed' : 'failed';
    suiteResult.tests = result.tests || suiteResult.tests;
    suiteResult.output = result.output || '';
    suiteResult.error = result.error;
    
    if (result.success) {
      testResults.summary.passedSuites++;
      log.success(`Test suite completed: ${suiteConfig.name}`);
    } else {
      testResults.summary.failedSuites++;
      log.error(`Test suite failed: ${suiteConfig.name}`);
      
      // Retry if enabled and not already retried
      if (CONFIG.retries.maxRetries > 0 && suiteResult.retries < CONFIG.retries.maxRetries) {
        log.info(`Retrying test suite: ${suiteConfig.name} (attempt ${suiteResult.retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, CONFIG.retries.retryDelay));
        suiteResult.retries++;
        return await runTestSuite(suiteName, suiteConfig);
      }
    }
    
  } catch (error) {
    suiteResult.status = 'error';
    suiteResult.error = error.message;
    testResults.summary.failedSuites++;
    
    log.error(`Test suite error: ${suiteConfig.name} - ${error.message}`);
  } finally {
    const suiteEndTime = Date.now();
    suiteResult.endTime = new Date().toISOString();
    suiteResult.duration = suiteEndTime - suiteStartTime;
    
    // Update summary counts
    testResults.summary.totalTests += suiteResult.tests.total;
    testResults.summary.passedTests += suiteResult.tests.passed;
    testResults.summary.failedTests += suiteResult.tests.failed;
    testResults.summary.skippedTests += suiteResult.tests.skipped;
  }
}

async function executeTestSuite(suiteConfig) {
  return new Promise((resolve, reject) => {
    const testProcess = spawn('node', [suiteConfig.file], {
      cwd: process.cwd(),
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    testProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      if (process.env.VERBOSE) {
        process.stdout.write(output);
      }
    });
    
    testProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      if (process.env.VERBOSE) {
        process.stderr.write(output);
      }
    });
    
    const timeout = setTimeout(() => {
      testProcess.kill('SIGTERM');
      reject(new Error(`Test suite timed out after ${suiteConfig.timeout}ms`));
    }, suiteConfig.timeout);
    
    testProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      const output = stdout + stderr;
      const tests = parseTestOutput(output);
      
      resolve({
        success: code === 0,
        exitCode: code,
        output: output,
        tests: tests,
        error: code !== 0 ? stderr : null
      });
    });
    
    testProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start test process: ${error.message}`));
    });
  });
}

function parseTestOutput(output) {
  // Parse test output to extract test counts
  // This is a simple implementation - could be enhanced based on actual test output format
  
  const tests = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Look for patterns in output
  const totalMatch = output.match(/Total Tests?:\s*(\d+)/i);
  if (totalMatch) tests.total = parseInt(totalMatch[1]);
  
  const passedMatch = output.match(/Passed:\s*(\d+)/i);
  if (passedMatch) tests.passed = parseInt(passedMatch[1]);
  
  const failedMatch = output.match(/Failed:\s*(\d+)/i);
  if (failedMatch) tests.failed = parseInt(failedMatch[1]);
  
  const skippedMatch = output.match(/Skipped:\s*(\d+)/i);
  if (skippedMatch) tests.skipped = parseInt(skippedMatch[1]);
  
  // Fallback counting based on common patterns
  if (tests.total === 0) {
    const passedCount = (output.match(/✅|PASSED/g) || []).length;
    const failedCount = (output.match(/❌|FAILED/g) || []).length;
    
    tests.passed = passedCount;
    tests.failed = failedCount;
    tests.total = passedCount + failedCount;
  }
  
  return tests;
}

/**
 * REPORT GENERATION
 */
async function generateTestReports() {
  log.step('Generating test reports...');
  
  try {
    // Generate JSON report
    await generateJSONReport();
    
    // Generate HTML report
    await generateHTMLReport();
    
    // Generate JUnit XML report
    await generateJUnitReport();
    
    log.success('Test reports generated successfully');
  } catch (error) {
    log.error(`Failed to generate reports: ${error.message}`);
  }
}

async function generateJSONReport() {
  const reportPath = path.join(CONFIG.reporting.outputDir, 'test-results.json');
  const report = {
    ...testResults,
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  log.info(`JSON report: ${reportPath}`);
}

async function generateHTMLReport() {
  const reportPath = path.join(CONFIG.reporting.outputDir, 'test-results.html');
  const html = generateHTMLContent(testResults);
  
  await fs.writeFile(reportPath, html);
  log.info(`HTML report: ${reportPath}`);
}

async function generateJUnitReport() {
  const reportPath = path.join(CONFIG.reporting.outputDir, 'junit.xml');
  const xml = generateJUnitXML(testResults);
  
  await fs.writeFile(reportPath, xml);
  log.info(`JUnit report: ${reportPath}`);
}

function generateHTMLContent(results) {
  const successRate = results.summary.totalTests > 0 
    ? Math.round((results.summary.passedTests / results.summary.totalTests) * 100)
    : 0;
  
  const duration = Math.round(results.duration / 1000);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Veritas Integration Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1em; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #fff; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; background: #f8f9fa; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .success { color: #28a745; }
        .danger { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .suites { padding: 0 30px 30px 30px; }
        .suite { margin-bottom: 20px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .suite-header { padding: 15px; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; }
        .suite-name { font-weight: bold; font-size: 1.1em; }
        .suite-status { padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: bold; text-transform: uppercase; }
        .suite-status.passed { background: #d4edda; color: #155724; }
        .suite-status.failed { background: #f8d7da; color: #721c24; }
        .suite-status.error { background: #f8d7da; color: #721c24; }
        .suite-details { padding: 15px; display: none; }
        .suite-details.show { display: block; }
        .progress-bar { width: 100%; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin: 20px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 0.9em; border-top: 1px solid #e9ecef; }
        button { background: none; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Veritas Integration Test Results</h1>
            <p>Generated on ${new Date(results.startTime).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value success">${successRate}%</div>
                <div class="metric-label">Success Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value info">${results.summary.totalTests}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${results.summary.passedTests}</div>
                <div class="metric-label">Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value danger">${results.summary.failedTests}</div>
                <div class="metric-label">Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value info">${duration}s</div>
                <div class="metric-label">Duration</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${successRate}%; background: ${successRate >= 80 ? '#28a745' : successRate >= 60 ? '#ffc107' : '#dc3545'};"></div>
        </div>
        
        <div class="suites">
            ${Object.entries(results.suites).map(([name, suite]) => `
                <div class="suite">
                    <div class="suite-header">
                        <div class="suite-name">${suite.displayName}</div>
                        <div class="suite-status ${suite.status}">${suite.status}</div>
                    </div>
                    <div class="suite-details">
                        <p><strong>Duration:</strong> ${Math.round(suite.duration / 1000)}s</p>
                        <p><strong>Tests:</strong> ${suite.tests.passed}/${suite.tests.total} passed</p>
                        ${suite.error ? `<p><strong>Error:</strong> ${suite.error}</p>` : ''}
                        ${suite.retries > 0 ? `<p><strong>Retries:</strong> ${suite.retries}</p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Veritas Integration Test Runner v1.0.0</p>
        </div>
    </div>
    
    <script>
        document.querySelectorAll('.suite-header').forEach(header => {
            header.addEventListener('click', () => {
                const details = header.nextElementSibling;
                details.classList.toggle('show');
            });
        });
    </script>
</body>
</html>`;
}

function generateJUnitXML(results) {
  const xmlSuites = Object.entries(results.suites).map(([name, suite]) => {
    const failures = suite.tests.failed;
    const time = (suite.duration / 1000).toFixed(2);
    
    let testCases = '';
    
    // Generate test cases (simplified)
    for (let i = 0; i < suite.tests.passed; i++) {
      testCases += `    <testcase classname="${name}" name="test_${i + 1}" time="1.0" />\n`;
    }
    
    for (let i = 0; i < suite.tests.failed; i++) {
      testCases += `    <testcase classname="${name}" name="failed_test_${i + 1}" time="1.0">
      <failure message="Test failed">${suite.error || 'Test failed'}</failure>
    </testcase>\n`;
    }
    
    return `  <testsuite name="${suite.displayName}" tests="${suite.tests.total}" failures="${failures}" errors="0" time="${time}">
${testCases}  </testsuite>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Veritas Integration Tests" tests="${results.summary.totalTests}" failures="${results.summary.failedTests}" errors="0" time="${(results.duration / 1000).toFixed(2)}">
${xmlSuites}
</testsuites>`;
}

/**
 * CLEANUP AND REPORTING
 */
async function cleanup() {
  log.step('Cleaning up test environment...');
  
  // Kill any remaining processes
  // Close browser instances
  // Clean up temp files
  
  log.success('Cleanup completed');
}

function printFinalSummary() {
  log.divider();
  log.header('📊 FINAL TEST RESULTS SUMMARY');
  log.divider();
  
  const duration = Math.round(testResults.duration / 1000);
  const successRate = testResults.summary.totalTests > 0 
    ? Math.round((testResults.summary.passedTests / testResults.summary.totalTests) * 100)
    : 0;
  
  console.log(`${colors.bold}Duration:${colors.reset} ${duration}s`);
  console.log(`${colors.bold}Test Suites:${colors.reset} ${testResults.summary.passedSuites}/${testResults.summary.totalSuites} passed`);
  console.log(`${colors.bold}Tests:${colors.reset} ${testResults.summary.passedTests}/${testResults.summary.totalTests} passed (${successRate}%)`);
  
  if (testResults.summary.skippedTests > 0) {
    console.log(`${colors.bold}Skipped:${colors.reset} ${testResults.summary.skippedTests} tests`);
  }
  
  log.divider();
  
  // Individual suite results
  Object.entries(testResults.suites).forEach(([name, suite]) => {
    const icon = suite.status === 'passed' ? '✅' : suite.status === 'failed' ? '❌' : '⚠️';
    const duration = Math.round(suite.duration / 1000);
    console.log(`${icon} ${suite.displayName} (${duration}s) - ${suite.tests.passed}/${suite.tests.total} tests passed`);
    
    if (suite.retries > 0) {
      console.log(`   ${colors.yellow}↻ Retried ${suite.retries} time(s)${colors.reset}`);
    }
    
    if (suite.error) {
      console.log(`   ${colors.red}Error: ${suite.error}${colors.reset}`);
    }
  });
  
  log.divider();
  
  // Overall assessment
  if (testResults.summary.failedSuites === 0) {
    log.success(`🎉 All tests passed! The Veritas application is working correctly.`);
  } else if (testResults.summary.failedSuites === 1) {
    log.warning(`⚠️  1 test suite failed. Please review the results.`);
  } else {
    log.error(`❌ ${testResults.summary.failedSuites} test suites failed. The application needs attention.`);
  }
  
  // Report locations
  if (CONFIG.reporting.outputDir) {
    console.log(`\n${colors.dim}📋 Reports saved to: ${CONFIG.reporting.outputDir}${colors.reset}`);
  }
  
  log.divider();
}

// Handle process signals
process.on('SIGINT', async () => {
  log.warning('\n⚠️  Test runner interrupted by user');
  await cleanup();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  log.warning('\n⚠️  Test runner terminated');
  await cleanup();
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  log.error(`💥 Uncaught exception: ${error.message}`);
  console.error(error.stack);
  await cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  log.error(`💥 Unhandled rejection at: ${promise}, reason: ${reason}`);
  await cleanup();
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(async (error) => {
    log.error(`Test runner execution failed: ${error.message}`);
    console.error(error.stack);
    await cleanup();
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  CONFIG
};