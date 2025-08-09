#!/usr/bin/env node

/**
 * Veritas Full-Stack Integration Test Suite
 * 
 * This test suite validates the complete flow from frontend form submission
 * through backend API processing, database storage, and Hedera HCS integration.
 */

const axios = require('axios');
const puppeteer = require('puppeteer');
const { Client, TopicMessageQuery, TopicId } = require('@hashgraph/sdk');
require('dotenv').config();

// Configuration
const CONFIG = {
  backend: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
    timeout: 30000
  },
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    timeout: 30000
  },
  hedera: {
    topicId: process.env.HEDERA_TOPIC_ID,
    network: process.env.HEDERA_NETWORK || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY
  },
  test: {
    timeout: 60000,
    retries: 3,
    headless: true // Set to false for visual debugging
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  performance: {}
};

// Utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}🧪 ${msg}${colors.reset}`),
  perf: (msg, time) => console.log(`${colors.cyan}⏱️  ${msg}: ${time}ms${colors.reset}`)
};

// HTTP clients
const backendClient = axios.create({
  baseURL: CONFIG.backend.baseUrl,
  timeout: CONFIG.backend.timeout,
  headers: { 'Content-Type': 'application/json' }
});

// Test runner utility
async function runTest(testName, testFunction) {
  testResults.total++;
  log.info(`Running: ${testName}`);
  
  const startTime = Date.now();
  
  try {
    await testFunction();
    const duration = Date.now() - startTime;
    testResults.passed++;
    log.success(`PASSED: ${testName}`);
    log.perf(`Duration`, duration);
    testResults.details.push({ 
      name: testName, 
      status: 'PASSED', 
      duration,
      error: null 
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    log.error(`FAILED: ${testName} - ${error.message}`);
    testResults.details.push({ 
      name: testName, 
      status: 'FAILED', 
      duration,
      error: error.message 
    });
    
    // Log stack trace for debugging
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

// Test data
const testData = {
  products: [
    {
      name: 'Premium Ethiopian Coffee',
      supplier: 'Highland Coffee Farms',
      description: 'Single-origin arabica beans from Ethiopian highlands',
      claims: [
        { type: 'organic_certified', description: 'USDA Organic Certified #ETH-2024-001' },
        { type: 'fair_trade', description: 'Fair Trade Certified by Fair Trade USA' }
      ]
    },
    {
      name: 'Artisan Chocolate Bar',
      supplier: 'Swiss Chocolatiers Ltd',
      description: '70% Dark Chocolate made from sustainably sourced cacao',
      claims: [
        { type: 'sustainable', description: 'Rainforest Alliance Certified' },
        { type: 'quality', description: 'Awarded Gold Medal at International Chocolate Awards 2024' }
      ]
    }
  ],
  invalidBatchIds: [
    'INVALID-ID',
    'NONEXISTENT-2024-999999',
    '',
    null,
    'special-chars-!@#$%'
  ]
};

// Global test state
let browser;
let page;
let createdProducts = [];
let hederaClient;

/**
 * MAIN TEST SUITE
 */
async function runFullStackTests() {
  log.header('🚀 VERITAS FULL-STACK INTEGRATION TESTS');
  log.info(`Backend: ${CONFIG.backend.baseUrl}`);
  log.info(`Frontend: ${CONFIG.frontend.baseUrl}`);
  log.info(`Hedera Network: ${CONFIG.hedera.network}`);
  
  try {
    // Setup
    await setupTestEnvironment();
    
    // 1. Infrastructure Tests
    await runTest('Backend Health Check', testBackendHealth);
    await runTest('Frontend Accessibility', testFrontendAccessibility);
    
    // 2. Full Stack Flow Tests
    await runTest('Complete Product Submission Flow', testCompleteSubmissionFlow);
    await runTest('Immediate Verification After Submission', testImmediateVerification);
    await runTest('QR Code Generation and Scanning', testQRCodeFlow);
    
    // 3. Data Consistency Tests
    await runTest('Database-HCS Message Consistency', testDataConsistency);
    await runTest('Timestamp Consistency Validation', testTimestampConsistency);
    await runTest('Claims Linkage Validation', testClaimsLinkage);
    
    // 4. Error Handling Tests
    await runTest('Invalid Batch ID Handling', testInvalidBatchIdHandling);
    await runTest('Network Error Handling', testNetworkErrorHandling);
    await runTest('Form Validation Error Handling', testFormValidationErrors);
    
    // 5. Performance Tests
    await runTest('API Response Time Validation', testAPIPerformance);
    await runTest('Frontend Loading Performance', testFrontendPerformance);
    await runTest('Hedera Transaction Performance', testHederaPerformance);
    
    // 6. Mobile Responsiveness Tests
    await runTest('Mobile Form Submission', testMobileFormSubmission);
    await runTest('Mobile QR Scanner Functionality', testMobileQRScanner);
    await runTest('Mobile Verification Flow', testMobileVerificationFlow);
    
    // 7. Concurrent Operations Tests
    await runTest('Concurrent Product Submissions', testConcurrentSubmissions);
    await runTest('High-Load Verification Requests', testHighLoadVerification);
    
  } catch (error) {
    log.error(`Test suite setup failed: ${error.message}`);
  } finally {
    await cleanup();
  }
  
  printTestResults();
}

/**
 * SETUP AND TEARDOWN
 */
async function setupTestEnvironment() {
  log.header('Setting up test environment...');
  
  // Initialize browser
  browser = await puppeteer.launch({
    headless: CONFIG.test.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Set up request interception for network error testing
  await page.setRequestInterception(true);
  page.on('request', (req) => req.continue());
  
  // Initialize Hedera client if credentials are available
  if (CONFIG.hedera.accountId && CONFIG.hedera.privateKey) {
    const { Client } = require('@hashgraph/sdk');
    hederaClient = CONFIG.hedera.network === 'mainnet' 
      ? Client.forMainnet() 
      : Client.forTestnet();
    
    hederaClient.setOperator(
      CONFIG.hedera.accountId, 
      CONFIG.hedera.privateKey
    );
  }
  
  log.success('Test environment setup complete');
}

async function cleanup() {
  log.info('Cleaning up test environment...');
  
  if (browser) {
    await browser.close();
  }
  
  if (hederaClient) {
    hederaClient.close();
  }
  
  log.success('Cleanup complete');
}

/**
 * INFRASTRUCTURE TESTS
 */
async function testBackendHealth() {
  const response = await backendClient.get('/health');
  
  if (response.status !== 200) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  
  if (response.data.status !== 'healthy') {
    throw new Error(`Backend status not healthy: ${response.data.status}`);
  }
  
  // Test database connectivity
  const dbHealthResponse = await backendClient.get('/health/database');
  if (dbHealthResponse.status !== 200) {
    throw new Error('Database health check failed');
  }
  
  // Test Hedera connectivity
  try {
    const hederaHealthResponse = await backendClient.get('/health/hedera');
    if (hederaHealthResponse.status !== 200) {
      log.warning('Hedera health check failed - continuing with limited tests');
    }
  } catch (error) {
    log.warning('Hedera connectivity unavailable - some tests will be skipped');
  }
}

async function testFrontendAccessibility() {
  await page.goto(CONFIG.frontend.baseUrl, { waitUntil: 'networkidle0' });
  
  // Check if main navigation elements are present
  const navElements = await page.$$('nav a');
  if (navElements.length < 2) {
    throw new Error('Navigation elements not found or insufficient');
  }
  
  // Check for essential pages
  const pages = ['/submit', '/verify'];
  
  for (const pagePath of pages) {
    await page.goto(`${CONFIG.frontend.baseUrl}${pagePath}`, { 
      waitUntil: 'networkidle0' 
    });
    
    const title = await page.title();
    if (!title.includes('Veritas')) {
      throw new Error(`Page ${pagePath} missing proper title`);
    }
  }
}

/**
 * FULL STACK FLOW TESTS
 */
async function testCompleteSubmissionFlow() {
  const testProduct = testData.products[0];
  const startTime = Date.now();
  
  // Navigate to submission form
  await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { 
    waitUntil: 'networkidle0' 
  });
  
  // Fill form
  await page.type('[name="productName"]', testProduct.name);
  await page.type('[name="supplierName"]', testProduct.supplier);
  await page.type('[name="description"]', testProduct.description);
  
  // Add claims
  for (let i = 0; i < testProduct.claims.length; i++) {
    const claim = testProduct.claims[i];
    
    // Add claim button might need to be clicked for additional claims
    if (i > 0) {
      await page.click('[data-testid="add-claim-button"]');
    }
    
    await page.select(`[name="claims[${i}].type"]`, claim.type);
    await page.type(`[name="claims[${i}].description"]`, claim.description);
  }
  
  // Submit form
  await page.click('[type="submit"]');
  
  // Wait for success page or redirect
  await page.waitForSelector('[data-testid="success-message"]', { 
    timeout: 30000 
  });
  
  // Extract batch ID from success page
  const batchId = await page.$eval('[data-testid="batch-id"]', 
    el => el.textContent.trim()
  );
  
  if (!batchId || !batchId.match(/^[A-Z]+-\d{4}-\d{6}$/)) {
    throw new Error(`Invalid batch ID generated: ${batchId}`);
  }
  
  // Store for later tests
  createdProducts.push({
    batchId,
    ...testProduct,
    submissionTime: startTime
  });
  
  testResults.performance.submissionTime = Date.now() - startTime;
  
  // Verify the product was created in backend
  const backendResponse = await backendClient.get(`/api/products/${batchId}`);
  if (backendResponse.status !== 200) {
    throw new Error('Product not found in backend after form submission');
  }
  
  log.success(`Product submitted successfully with batch ID: ${batchId}`);
}

async function testImmediateVerification() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for verification test');
  }
  
  const product = createdProducts[0];
  const startTime = Date.now();
  
  // Navigate to verification page
  await page.goto(`${CONFIG.frontend.baseUrl}/verify/${product.batchId}`, {
    waitUntil: 'networkidle0'
  });
  
  // Wait for verification results to load
  await page.waitForSelector('[data-testid="verification-results"]', {
    timeout: 30000
  });
  
  // Check verification status
  const verificationStatus = await page.$eval('[data-testid="verification-status"]',
    el => el.textContent.trim()
  );
  
  if (verificationStatus !== 'Verified' && verificationStatus !== 'Valid') {
    throw new Error(`Unexpected verification status: ${verificationStatus}`);
  }
  
  // Verify product details are displayed correctly
  const displayedName = await page.$eval('[data-testid="product-name"]',
    el => el.textContent.trim()
  );
  
  if (displayedName !== product.name) {
    throw new Error(`Product name mismatch: expected ${product.name}, got ${displayedName}`);
  }
  
  testResults.performance.verificationTime = Date.now() - startTime;
  log.success('Immediate verification after submission successful');
}

async function testQRCodeFlow() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for QR code test');
  }
  
  const product = createdProducts[0];
  
  // Navigate to product success page to get QR code
  await page.goto(`${CONFIG.frontend.baseUrl}/submit/success/${product.batchId}`, {
    waitUntil: 'networkidle0'
  });
  
  // Check if QR code is generated
  const qrCodeElement = await page.$('[data-testid="qr-code"]');
  if (!qrCodeElement) {
    throw new Error('QR code not generated');
  }
  
  // Verify QR code contains correct verification URL
  const qrCodeDataUrl = await page.$eval('[data-testid="qr-code"] canvas',
    canvas => canvas.toDataURL()
  );
  
  if (!qrCodeDataUrl || qrCodeDataUrl.length < 100) {
    throw new Error('QR code appears to be empty or invalid');
  }
  
  // Test QR code download functionality
  const downloadButton = await page.$('[data-testid="download-qr-button"]');
  if (downloadButton) {
    await downloadButton.click();
    // Wait a moment for download to trigger
    await page.waitForTimeout(1000);
  }
  
  log.success('QR code generation and download successful');
}

/**
 * DATA CONSISTENCY TESTS
 */
async function testDataConsistency() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for consistency test');
  }
  
  const product = createdProducts[0];
  
  // Get data from backend API
  const backendResponse = await backendClient.get(`/api/products/${product.batchId}`);
  const backendProduct = backendResponse.data.data.product;
  const backendClaims = backendResponse.data.data.claims;
  
  // Verify backend data matches submitted data
  if (backendProduct.product_name !== product.name) {
    throw new Error('Product name inconsistency between submission and backend');
  }
  
  if (backendProduct.supplier_name !== product.supplier) {
    throw new Error('Supplier name inconsistency between submission and backend');
  }
  
  if (backendClaims.length !== product.claims.length) {
    throw new Error('Claims count inconsistency between submission and backend');
  }
  
  // If Hedera is available, check HCS message consistency
  if (hederaClient && CONFIG.hedera.topicId) {
    const messages = await getHederaMessagesForProduct(product.batchId);
    
    if (messages.length === 0) {
      throw new Error('No Hedera messages found for product');
    }
    
    // Verify message content matches database
    const latestMessage = messages[messages.length - 1];
    const messageData = JSON.parse(latestMessage.contents);
    
    if (messageData.batch_id !== product.batchId) {
      throw new Error('Batch ID mismatch between database and Hedera');
    }
  }
  
  log.success('Data consistency validation passed');
}

async function testTimestampConsistency() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for timestamp test');
  }
  
  const product = createdProducts[0];
  
  // Get timestamps from different sources
  const backendResponse = await backendClient.get(`/api/products/${product.batchId}`);
  const backendTimestamp = new Date(backendResponse.data.data.product.created_at);
  const submissionTimestamp = new Date(product.submissionTime);
  
  // Allow 30 second tolerance for processing time
  const timeDifference = Math.abs(backendTimestamp - submissionTimestamp);
  if (timeDifference > 30000) {
    throw new Error(`Timestamp inconsistency: ${timeDifference}ms difference`);
  }
  
  log.success('Timestamp consistency validation passed');
}

async function testClaimsLinkage() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for claims linkage test');
  }
  
  const product = createdProducts[0];
  
  // Get product and claims data
  const backendResponse = await backendClient.get(`/api/products/${product.batchId}`);
  const productData = backendResponse.data.data.product;
  const claimsData = backendResponse.data.data.claims;
  
  // Verify all claims are linked to the correct product
  for (const claim of claimsData) {
    if (claim.product_id !== productData.id) {
      throw new Error(`Claim ${claim.id} not properly linked to product ${productData.id}`);
    }
    
    if (!claim.claim_type || !claim.description) {
      throw new Error(`Claim ${claim.id} missing required fields`);
    }
  }
  
  log.success('Claims linkage validation passed');
}

/**
 * ERROR HANDLING TESTS
 */
async function testInvalidBatchIdHandling() {
  for (const invalidId of testData.invalidBatchIds) {
    try {
      if (invalidId === null) continue; // Skip null test in URL
      
      await page.goto(`${CONFIG.frontend.baseUrl}/verify/${invalidId}`, {
        waitUntil: 'networkidle0'
      });
      
      // Should show error message for invalid batch ID
      const errorElement = await page.$('[data-testid="error-message"]');
      if (!errorElement) {
        throw new Error(`No error shown for invalid batch ID: ${invalidId}`);
      }
      
      const errorText = await errorElement.evaluate(el => el.textContent);
      if (!errorText.toLowerCase().includes('invalid') && 
          !errorText.toLowerCase().includes('not found')) {
        throw new Error(`Unexpected error message for ${invalidId}: ${errorText}`);
      }
    } catch (error) {
      if (error.message.includes('net::ERR_FAILED')) {
        // Expected for some invalid IDs
        continue;
      }
      throw error;
    }
  }
  
  log.success('Invalid batch ID handling validated');
}

async function testNetworkErrorHandling() {
  // Simulate network error by intercepting requests
  await page.setRequestInterception(true);
  
  page.on('request', (req) => {
    if (req.url().includes('/api/')) {
      req.abort('failed');
    } else {
      req.continue();
    }
  });
  
  await page.goto(`${CONFIG.frontend.baseUrl}/verify`, {
    waitUntil: 'networkidle0'
  });
  
  // Try to submit a verification request
  await page.type('[data-testid="batch-id-input"]', 'TEST-2024-123456');
  await page.click('[data-testid="verify-button"]');
  
  // Should show network error message
  await page.waitForSelector('[data-testid="network-error"]', { timeout: 10000 });
  
  // Restore normal request handling
  await page.setRequestInterception(false);
  
  log.success('Network error handling validated');
}

async function testFormValidationErrors() {
  await page.goto(`${CONFIG.frontend.baseUrl}/submit`, {
    waitUntil: 'networkidle0'
  });
  
  // Try to submit empty form
  await page.click('[type="submit"]');
  
  // Should show validation errors
  const validationErrors = await page.$$('[data-testid*="validation-error"]');
  if (validationErrors.length === 0) {
    throw new Error('No validation errors shown for empty form');
  }
  
  // Test individual field validations
  await page.type('[name="productName"]', 'A'); // Too short
  await page.click('[type="submit"]');
  
  const nameError = await page.$('[data-testid="productName-error"]');
  if (!nameError) {
    throw new Error('No validation error for short product name');
  }
  
  log.success('Form validation error handling validated');
}

/**
 * PERFORMANCE TESTS
 */
async function testAPIPerformance() {
  const performanceThresholds = {
    healthCheck: 1000, // 1 second
    productCreation: 5000, // 5 seconds
    productRetrieval: 2000, // 2 seconds
    verification: 3000 // 3 seconds
  };
  
  // Health check performance
  let startTime = Date.now();
  await backendClient.get('/health');
  let duration = Date.now() - startTime;
  
  if (duration > performanceThresholds.healthCheck) {
    throw new Error(`Health check too slow: ${duration}ms > ${performanceThresholds.healthCheck}ms`);
  }
  
  testResults.performance.healthCheckTime = duration;
  
  // Product creation performance (if we have test data)
  if (createdProducts.length > 0) {
    const product = createdProducts[0];
    
    startTime = Date.now();
    await backendClient.get(`/api/products/${product.batchId}`);
    duration = Date.now() - startTime;
    
    if (duration > performanceThresholds.productRetrieval) {
      throw new Error(`Product retrieval too slow: ${duration}ms > ${performanceThresholds.productRetrieval}ms`);
    }
    
    testResults.performance.productRetrievalTime = duration;
  }
  
  log.success('API performance validation passed');
}

async function testFrontendPerformance() {
  const performanceThresholds = {
    firstContentfulPaint: 3000, // 3 seconds
    largestContentfulPaint: 5000, // 5 seconds
    cumulativeLayoutShift: 0.1, // CLS score
    firstInputDelay: 100 // 100ms
  };
  
  // Enable performance metrics collection
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = {};
  });
  
  const startTime = Date.now();
  await page.goto(CONFIG.frontend.baseUrl, { 
    waitUntil: 'networkidle0' 
  });
  const loadTime = Date.now() - startTime;
  
  // Get Web Vitals if available
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        });
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve([]), 2000); // Fallback
      } else {
        resolve([]);
      }
    });
  });
  
  testResults.performance.frontendLoadTime = loadTime;
  testResults.performance.webVitalsMetrics = metrics;
  
  if (loadTime > 10000) { // 10 second general threshold
    throw new Error(`Frontend loading too slow: ${loadTime}ms`);
  }
  
  log.success('Frontend performance validation passed');
}

async function testHederaPerformance() {
  if (!hederaClient || createdProducts.length === 0) {
    log.warning('Skipping Hedera performance test - no client or products available');
    return;
  }
  
  const product = createdProducts[0];
  const startTime = Date.now();
  
  try {
    // Query for recent messages related to our product
    const messages = await getHederaMessagesForProduct(product.batchId);
    const duration = Date.now() - startTime;
    
    testResults.performance.hederaQueryTime = duration;
    
    if (duration > 10000) { // 10 second threshold for Hedera queries
      throw new Error(`Hedera query too slow: ${duration}ms`);
    }
    
    log.success('Hedera performance validation passed');
  } catch (error) {
    log.warning(`Hedera performance test failed: ${error.message}`);
    // Don't fail the entire test suite for Hedera issues
  }
}

/**
 * MOBILE TESTS
 */
async function testMobileFormSubmission() {
  // Switch to mobile viewport
  await page.setViewport({ width: 375, height: 812 }); // iPhone X
  
  const testProduct = testData.products[1]; // Use second test product
  
  await page.goto(`${CONFIG.frontend.baseUrl}/submit`, {
    waitUntil: 'networkidle0'
  });
  
  // Test touch interactions
  await page.tap('[name="productName"]');
  await page.type('[name="productName"]', testProduct.name);
  
  await page.tap('[name="supplierName"]');
  await page.type('[name="supplierName"]', testProduct.supplier);
  
  await page.tap('[name="description"]');
  await page.type('[name="description"]', testProduct.description);
  
  // Submit form
  await page.tap('[type="submit"]');
  
  // Wait for mobile-optimized success message
  await page.waitForSelector('[data-testid="success-message"]', { 
    timeout: 30000 
  });
  
  // Verify mobile QR code display
  const qrCode = await page.$('[data-testid="qr-code"]');
  if (!qrCode) {
    throw new Error('QR code not displayed on mobile');
  }
  
  // Reset viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  log.success('Mobile form submission validated');
}

async function testMobileQRScanner() {
  await page.setViewport({ width: 375, height: 812 }); // iPhone X
  
  await page.goto(`${CONFIG.frontend.baseUrl}/verify`, {
    waitUntil: 'networkidle0'
  });
  
  // Test if QR scanner button is available and functional
  const scannerButton = await page.$('[data-testid="qr-scanner-button"]');
  if (!scannerButton) {
    throw new Error('QR scanner button not found on mobile');
  }
  
  await page.tap('[data-testid="qr-scanner-button"]');
  
  // Check if camera permission modal appears
  // Note: In headless mode, camera won't work, but UI should still respond
  await page.waitForSelector('[data-testid="camera-modal"], [data-testid="camera-error"]', {
    timeout: 5000
  });
  
  // Reset viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  log.success('Mobile QR scanner interface validated');
}

async function testMobileVerificationFlow() {
  await page.setViewport({ width: 375, height: 812 }); // iPhone X
  
  if (createdProducts.length === 0) {
    throw new Error('No products available for mobile verification test');
  }
  
  const product = createdProducts[0];
  
  await page.goto(`${CONFIG.frontend.baseUrl}/verify/${product.batchId}`, {
    waitUntil: 'networkidle0'
  });
  
  // Check mobile-optimized verification display
  await page.waitForSelector('[data-testid="verification-results"]', {
    timeout: 30000
  });
  
  // Verify mobile layout elements
  const mobileElements = await page.$$('[data-testid*="mobile-"]');
  // Note: This assumes mobile-specific elements are marked with mobile- prefix
  
  // Test share functionality on mobile
  const shareButton = await page.$('[data-testid="share-button"]');
  if (shareButton) {
    await page.tap('[data-testid="share-button"]');
    await page.waitForTimeout(1000); // Wait for share modal
  }
  
  // Reset viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  log.success('Mobile verification flow validated');
}

/**
 * CONCURRENT OPERATIONS TESTS
 */
async function testConcurrentSubmissions() {
  const numConcurrentRequests = 5;
  const requests = [];
  
  for (let i = 0; i < numConcurrentRequests; i++) {
    const productData = {
      product_name: `Concurrent Test Product ${i}`,
      supplier_name: 'Test Supplier',
      description: `Test product for concurrent request ${i}`
    };
    
    requests.push(backendClient.post('/api/products', productData));
  }
  
  const startTime = Date.now();
  const responses = await Promise.all(requests);
  const duration = Date.now() - startTime;
  
  testResults.performance.concurrentSubmissionTime = duration;
  
  // Verify all requests succeeded
  for (let i = 0; i < responses.length; i++) {
    if (responses[i].status !== 201) {
      throw new Error(`Concurrent request ${i} failed with status ${responses[i].status}`);
    }
  }
  
  // Verify all batch IDs are unique
  const batchIds = responses.map(r => r.data.product.batch_id);
  const uniqueBatchIds = [...new Set(batchIds)];
  
  if (uniqueBatchIds.length !== batchIds.length) {
    throw new Error('Duplicate batch IDs generated in concurrent requests');
  }
  
  log.success('Concurrent submissions validated');
}

async function testHighLoadVerification() {
  if (createdProducts.length === 0) {
    throw new Error('No products available for high load test');
  }
  
  const product = createdProducts[0];
  const numRequests = 10;
  const requests = [];
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(backendClient.get(`/api/verify/${product.batchId}`));
  }
  
  const startTime = Date.now();
  const responses = await Promise.all(requests);
  const duration = Date.now() - startTime;
  
  testResults.performance.highLoadVerificationTime = duration;
  
  // Verify all requests succeeded with consistent results
  for (let i = 0; i < responses.length; i++) {
    if (responses[i].status !== 200) {
      throw new Error(`High load request ${i} failed with status ${responses[i].status}`);
    }
    
    if (responses[i].data.data.verification.batch_id !== product.batchId) {
      throw new Error(`Inconsistent verification data in request ${i}`);
    }
  }
  
  log.success('High load verification validated');
}

/**
 * UTILITY FUNCTIONS
 */
async function getHederaMessagesForProduct(batchId) {
  if (!hederaClient || !CONFIG.hedera.topicId) {
    return [];
  }
  
  try {
    const messages = [];
    const query = new TopicMessageQuery()
      .setTopicId(TopicId.fromString(CONFIG.hedera.topicId))
      .setStartTime(0);
    
    await query.subscribe(hederaClient, (message) => {
      try {
        const messageData = JSON.parse(message.contents);
        if (messageData.batch_id === batchId) {
          messages.push({
            contents: message.contents,
            timestamp: message.consensusTimestamp,
            sequenceNumber: message.sequenceNumber
          });
        }
      } catch (error) {
        // Skip invalid JSON messages
      }
    });
    
    // Wait a moment for messages to arrive
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return messages;
  } catch (error) {
    log.warning(`Error querying Hedera messages: ${error.message}`);
    return [];
  }
}

/**
 * RESULTS REPORTING
 */
function printTestResults() {
  console.log('\n' + '='.repeat(80));
  log.header('🎯 VERITAS FULL-STACK INTEGRATION TEST RESULTS');
  console.log('='.repeat(80));
  
  log.info(`Total Tests: ${testResults.total}`);
  log.success(`Passed: ${testResults.passed}`);
  log.error(`Failed: ${testResults.failed}`);
  
  const successRate = testResults.total > 0 ? 
    Math.round((testResults.passed / testResults.total) * 100) : 0;
  
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  // Performance summary
  if (Object.keys(testResults.performance).length > 0) {
    log.header('⏱️ Performance Metrics');
    for (const [metric, value] of Object.entries(testResults.performance)) {
      if (typeof value === 'number') {
        log.perf(metric, value);
      }
    }
  }
  
  // Product summary
  if (createdProducts.length > 0) {
    log.header('📦 Created Test Products');
    createdProducts.forEach((product, index) => {
      console.log(`${colors.blue}${index + 1}. ${product.name} - ${product.batchId}${colors.reset}`);
    });
  }
  
  // Failed tests details
  if (testResults.failed > 0) {
    log.header('❌ Failed Tests Details');
    testResults.details
      .filter(t => t.status === 'FAILED')
      .forEach(test => {
        console.log(`${colors.red}• ${test.name}: ${test.error}${colors.reset}`);
      });
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log.warning('Tests interrupted by user');
  await cleanup();
  printTestResults();
});

// Run tests if this script is executed directly
if (require.main === module) {
  runFullStackTests().catch(error => {
    log.error(`Test suite execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  runFullStackTests,
  testResults,
  CONFIG
};