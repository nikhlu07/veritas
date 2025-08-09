#!/usr/bin/env node

/**
 * Veritas Performance Test Suite
 * 
 * Comprehensive performance testing for the entire Veritas application:
 * - API response times under various loads
 * - Frontend loading and rendering performance
 * - Hedera transaction confirmation times
 * - Database query performance
 * - Mobile performance optimization
 * - Concurrent user simulation
 */

const axios = require('axios');
const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');
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
  test: {
    warmupRequests: 5,
    loadTestDuration: 60000, // 1 minute
    maxConcurrentUsers: 20,
    thresholds: {
      apiResponseTime: 2000,     // 2 seconds
      frontendLoadTime: 5000,    // 5 seconds
      hederaTransactionTime: 15000, // 15 seconds
      databaseQueryTime: 1000,   // 1 second
      mobileLoadTime: 8000       // 8 seconds
    }
  }
};

// Test results tracking
const performanceResults = {
  api: {
    healthCheck: [],
    productSubmission: [],
    productRetrieval: [],
    verification: [],
    concurrentLoad: {}
  },
  frontend: {
    initialLoad: [],
    navigation: [],
    formSubmission: [],
    qrGeneration: [],
    mobile: []
  },
  hedera: {
    transactions: [],
    queries: [],
    consensus: []
  },
  database: {
    queries: [],
    insertions: [],
    lookups: []
  },
  summary: {}
};

// Utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}⚡ ${msg}${colors.reset}`),
  perf: (msg, time, threshold) => {
    const color = time <= threshold ? colors.green : colors.red;
    console.log(`${color}📊 ${msg}: ${time}ms (threshold: ${threshold}ms)${colors.reset}`);
  },
  metrics: (label, values) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const p95 = values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)];
    
    console.log(`${colors.magenta}📈 ${label}:${colors.reset}`);
    console.log(`   Avg: ${avg.toFixed(2)}ms | Min: ${min}ms | Max: ${max}ms | P95: ${p95}ms`);
  }
};

// Global test state
let browser;
let backendClient;

/**
 * MAIN PERFORMANCE TEST SUITE
 */
async function runPerformanceTests() {
  log.header('⚡ VERITAS PERFORMANCE TEST SUITE');
  log.info(`Backend: ${CONFIG.backend.baseUrl}`);
  log.info(`Frontend: ${CONFIG.frontend.baseUrl}`);
  log.info(`Load Test Duration: ${CONFIG.test.loadTestDuration / 1000}s`);
  log.info(`Max Concurrent Users: ${CONFIG.test.maxConcurrentUsers}`);
  
  try {
    // Setup
    await setupTestEnvironment();
    
    // 1. API Performance Tests
    log.header('🔧 API Performance Tests');
    await testAPIHealthCheckPerformance();
    await testAPIProductSubmissionPerformance();
    await testAPIProductRetrievalPerformance();
    await testAPIVerificationPerformance();
    await testAPIConcurrentLoadPerformance();
    
    // 2. Frontend Performance Tests
    log.header('🌐 Frontend Performance Tests');
    await testFrontendInitialLoadPerformance();
    await testFrontendNavigationPerformance();
    await testFrontendFormSubmissionPerformance();
    await testFrontendQRGenerationPerformance();
    await testFrontendMobilePerformance();
    
    // 3. Database Performance Tests
    log.header('🗄️  Database Performance Tests');
    await testDatabaseQueryPerformance();
    await testDatabaseInsertionPerformance();
    await testDatabaseLookupPerformance();
    
    // 4. End-to-End Performance Tests
    log.header('🔄 End-to-End Performance Tests');
    await testCompleteFlowPerformance();
    await testConcurrentUserSimulation();
    
    // 5. Mobile-Specific Performance Tests
    log.header('📱 Mobile Performance Tests');
    await testMobileSpecificPerformance();
    
    // 6. Stress Tests
    log.header('💪 Stress Tests');
    await testSystemUnderStress();
    await testMemoryUsageUnderLoad();
    
  } catch (error) {
    log.error(`Performance test suite failed: ${error.message}`);
  } finally {
    await cleanup();
  }
  
  printPerformanceResults();
}

/**
 * SETUP AND TEARDOWN
 */
async function setupTestEnvironment() {
  log.info('Setting up performance test environment...');
  
  // Initialize browser
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images' // Faster loading for perf tests
    ]
  });
  
  // Initialize backend client
  backendClient = axios.create({
    baseURL: CONFIG.backend.baseUrl,
    timeout: CONFIG.backend.timeout,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Warmup requests to stabilize performance
  log.info(`Running ${CONFIG.test.warmupRequests} warmup requests...`);
  for (let i = 0; i < CONFIG.test.warmupRequests; i++) {
    try {
      await backendClient.get('/health');
    } catch (error) {
      log.warning(`Warmup request failed: ${error.message}`);
    }
  }
  
  log.success('Performance test environment setup complete');
}

async function cleanup() {
  log.info('Cleaning up performance test environment...');
  
  if (browser) {
    await browser.close();
  }
  
  log.success('Performance cleanup complete');
}

/**
 * API PERFORMANCE TESTS
 */
async function testAPIHealthCheckPerformance() {
  log.info('Testing API health check performance...');
  
  const iterations = 20;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await backendClient.get('/health');
      
      if (response.status !== 200) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Health check iteration ${i} failed: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  performanceResults.api.healthCheck = times;
  log.metrics('API Health Check', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  if (avgTime > CONFIG.test.thresholds.apiResponseTime / 4) { // Health check should be very fast
    log.warning(`Health check average time exceeds recommended threshold: ${avgTime.toFixed(2)}ms`);
  }
}

async function testAPIProductSubmissionPerformance() {
  log.info('Testing API product submission performance...');
  
  const iterations = 10;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const productData = {
      product_name: `Performance Test Product ${i}`,
      supplier_name: 'Performance Test Supplier',
      description: 'Product created for performance testing',
      claims: [
        {
          claim_type: 'performance_test',
          description: `Performance test claim ${i}`
        }
      ]
    };
    
    const startTime = performance.now();
    
    try {
      const response = await backendClient.post('/api/products', productData);
      
      if (response.status !== 201) {
        throw new Error(`Product submission failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Product submission iteration ${i} failed: ${error.message}`);
    }
    
    // Delay between submissions
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  performanceResults.api.productSubmission = times;
  log.metrics('API Product Submission', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Product Submission Average', avgTime, CONFIG.test.thresholds.apiResponseTime);
}

async function testAPIProductRetrievalPerformance() {
  log.info('Testing API product retrieval performance...');
  
  // First, create a test product
  const testProduct = {
    product_name: 'Retrieval Test Product',
    supplier_name: 'Retrieval Test Supplier',
    description: 'Product for retrieval performance testing'
  };
  
  const createResponse = await backendClient.post('/api/products', testProduct);
  const batchId = createResponse.data.product.batch_id;
  
  const iterations = 15;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await backendClient.get(`/api/products/${batchId}`);
      
      if (response.status !== 200) {
        throw new Error(`Product retrieval failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Product retrieval iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  performanceResults.api.productRetrieval = times;
  log.metrics('API Product Retrieval', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Product Retrieval Average', avgTime, CONFIG.test.thresholds.apiResponseTime);
}

async function testAPIVerificationPerformance() {
  log.info('Testing API verification performance...');
  
  // Create test product for verification
  const testProduct = {
    product_name: 'Verification Test Product',
    supplier_name: 'Verification Test Supplier',
    description: 'Product for verification performance testing'
  };
  
  const createResponse = await backendClient.post('/api/products', testProduct);
  const batchId = createResponse.data.product.batch_id;
  
  // Wait a moment for HCS processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const iterations = 10;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await backendClient.get(`/api/verify/${batchId}`);
      
      if (response.status !== 200) {
        throw new Error(`Verification failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Verification iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  performanceResults.api.verification = times;
  log.metrics('API Verification', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Verification Average', avgTime, CONFIG.test.thresholds.apiResponseTime);
}

async function testAPIConcurrentLoadPerformance() {
  log.info('Testing API concurrent load performance...');
  
  const concurrencyLevels = [5, 10, 15, 20];
  
  for (const concurrency of concurrencyLevels) {
    log.info(`Testing with ${concurrency} concurrent requests...`);
    
    const promises = [];
    const startTime = performance.now();
    
    for (let i = 0; i < concurrency; i++) {
      const promise = (async () => {
        const requestStart = performance.now();
        
        try {
          const response = await backendClient.get('/health');
          const requestEnd = performance.now();
          
          return {
            success: response.status === 200,
            duration: requestEnd - requestStart
          };
        } catch (error) {
          const requestEnd = performance.now();
          return {
            success: false,
            duration: requestEnd - requestStart,
            error: error.message
          };
        }
      })();
      
      promises.push(promise);
    }
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    const successCount = results.filter(r => r.success).length;
    const avgResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    performanceResults.api.concurrentLoad[concurrency] = {
      totalTime,
      successRate: (successCount / results.length) * 100,
      avgResponseTime,
      results
    };
    
    log.info(`Concurrency ${concurrency}: ${successCount}/${concurrency} successful, avg: ${avgResponseTime.toFixed(2)}ms`);
  }
}

/**
 * FRONTEND PERFORMANCE TESTS
 */
async function testFrontendInitialLoadPerformance() {
  log.info('Testing frontend initial load performance...');
  
  const iterations = 5;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const page = await browser.newPage();
    
    const startTime = performance.now();
    
    try {
      await page.goto(CONFIG.frontend.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Frontend load iteration ${i} failed: ${error.message}`);
    }
    
    await page.close();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  performanceResults.frontend.initialLoad = times;
  log.metrics('Frontend Initial Load', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Frontend Load Average', avgTime, CONFIG.test.thresholds.frontendLoadTime);
}

async function testFrontendNavigationPerformance() {
  log.info('Testing frontend navigation performance...');
  
  const page = await browser.newPage();
  await page.goto(CONFIG.frontend.baseUrl, { waitUntil: 'networkidle0' });
  
  const routes = ['/submit', '/verify', '/'];
  const times = [];
  
  for (const route of routes) {
    const startTime = performance.now();
    
    try {
      await page.goto(`${CONFIG.frontend.baseUrl}${route}`, { 
        waitUntil: 'networkidle0',
        timeout: 15000
      });
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Navigation to ${route} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  await page.close();
  
  performanceResults.frontend.navigation = times;
  log.metrics('Frontend Navigation', times);
}

async function testFrontendFormSubmissionPerformance() {
  log.info('Testing frontend form submission performance...');
  
  const page = await browser.newPage();
  const times = [];
  const iterations = 3;
  
  for (let i = 0; i < iterations; i++) {
    try {
      await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { waitUntil: 'networkidle0' });
      
      // Fill form
      await page.type('[name="productName"]', `Form Perf Test ${i}`);
      await page.type('[name="supplierName"]', 'Form Test Supplier');
      await page.type('[name="description"]', 'Form performance test product');
      
      const startTime = performance.now();
      
      // Submit form
      await page.click('[type="submit"]');
      
      // Wait for success page
      await page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 });
      
      const endTime = performance.now();
      times.push(endTime - startTime);
      
    } catch (error) {
      log.warning(`Form submission iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  await page.close();
  
  performanceResults.frontend.formSubmission = times;
  log.metrics('Frontend Form Submission', times);
}

async function testFrontendQRGenerationPerformance() {
  log.info('Testing frontend QR generation performance...');
  
  const page = await browser.newPage();
  
  // First submit a product to get to QR generation
  await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { waitUntil: 'networkidle0' });
  
  await page.type('[name="productName"]', 'QR Performance Test');
  await page.type('[name="supplierName"]', 'QR Test Supplier');
  await page.type('[name="description"]', 'QR generation performance test');
  await page.click('[type="submit"]');
  
  const qrStartTime = performance.now();
  
  try {
    await page.waitForSelector('[data-testid="qr-code"]', { timeout: 10000 });
    const qrEndTime = performance.now();
    
    const qrGenerationTime = qrEndTime - qrStartTime;
    performanceResults.frontend.qrGeneration = [qrGenerationTime];
    
    log.perf('QR Generation Time', qrGenerationTime, 5000);
  } catch (error) {
    log.warning(`QR generation performance test failed: ${error.message}`);
  }
  
  await page.close();
}

async function testFrontendMobilePerformance() {
  log.info('Testing frontend mobile performance...');
  
  const page = await browser.newPage();
  
  // Set mobile viewport and user agent
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
  await page.setViewport({ width: 375, height: 812 });
  
  const iterations = 3;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      await page.goto(CONFIG.frontend.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: 20000
      });
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Mobile load iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  await page.close();
  
  performanceResults.frontend.mobile = times;
  log.metrics('Frontend Mobile Performance', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Mobile Load Average', avgTime, CONFIG.test.thresholds.mobileLoadTime);
}

/**
 * DATABASE PERFORMANCE TESTS
 */
async function testDatabaseQueryPerformance() {
  log.info('Testing database query performance...');
  
  // Test via API endpoints that hit the database
  const iterations = 20;
  const times = [];
  
  // Create test data first
  const testProduct = {
    product_name: 'DB Performance Test Product',
    supplier_name: 'DB Test Supplier',
    description: 'Database performance testing product'
  };
  
  const createResponse = await backendClient.post('/api/products', testProduct);
  const batchId = createResponse.data.product.batch_id;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await backendClient.get(`/api/products/${batchId}`);
      
      if (response.status !== 200) {
        throw new Error(`Database query failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Database query iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  
  performanceResults.database.queries = times;
  log.metrics('Database Query Performance', times);
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  log.perf('Database Query Average', avgTime, CONFIG.test.thresholds.databaseQueryTime);
}

async function testDatabaseInsertionPerformance() {
  log.info('Testing database insertion performance...');
  
  const iterations = 10;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const testProduct = {
      product_name: `DB Insert Performance Test ${i}`,
      supplier_name: 'DB Insert Test Supplier',
      description: `Database insertion performance test ${i}`
    };
    
    const startTime = performance.now();
    
    try {
      const response = await backendClient.post('/api/products', testProduct);
      
      if (response.status !== 201) {
        throw new Error(`Database insertion failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Database insertion iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  performanceResults.database.insertions = times;
  log.metrics('Database Insertion Performance', times);
}

async function testDatabaseLookupPerformance() {
  log.info('Testing database lookup performance...');
  
  // Test verification lookups which typically involve more complex queries
  const testProduct = {
    product_name: 'DB Lookup Performance Test',
    supplier_name: 'DB Lookup Test Supplier',
    description: 'Database lookup performance testing'
  };
  
  const createResponse = await backendClient.post('/api/products', testProduct);
  const batchId = createResponse.data.product.batch_id;
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const iterations = 15;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      const response = await backendClient.get(`/api/verify/${batchId}`);
      
      if (response.status !== 200) {
        throw new Error(`Database lookup failed with status: ${response.status}`);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    } catch (error) {
      log.warning(`Database lookup iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  performanceResults.database.lookups = times;
  log.metrics('Database Lookup Performance', times);
}

/**
 * END-TO-END PERFORMANCE TESTS
 */
async function testCompleteFlowPerformance() {
  log.info('Testing complete flow performance...');
  
  const page = await browser.newPage();
  const iterations = 3;
  const flowTimes = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      // 1. Navigate to submit form
      await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { waitUntil: 'networkidle0' });
      
      // 2. Fill and submit form
      await page.type('[name="productName"]', `Complete Flow Test ${i}`);
      await page.type('[name="supplierName"]', 'Complete Flow Supplier');
      await page.type('[name="description"]', 'Complete flow performance test');
      await page.click('[type="submit"]');
      
      // 3. Wait for QR code generation
      await page.waitForSelector('[data-testid="qr-code"]', { timeout: 15000 });
      
      // 4. Get batch ID and navigate to verification
      const batchId = await page.$eval('[data-testid="batch-id"]', el => el.textContent.trim());
      await page.goto(`${CONFIG.frontend.baseUrl}/verify/${batchId}`, { waitUntil: 'networkidle0' });
      
      // 5. Wait for verification results
      await page.waitForSelector('[data-testid="verification-results"]', { timeout: 15000 });
      
      const endTime = performance.now();
      flowTimes.push(endTime - startTime);
      
    } catch (error) {
      log.warning(`Complete flow iteration ${i} failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await page.close();
  
  log.metrics('Complete Flow Performance', flowTimes);
}

async function testConcurrentUserSimulation() {
  log.info('Testing concurrent user simulation...');
  
  const userCounts = [2, 5, 8, 12];
  
  for (const userCount of userCounts) {
    log.info(`Simulating ${userCount} concurrent users...`);
    
    const users = [];
    const results = [];
    
    // Create user sessions
    for (let i = 0; i < userCount; i++) {
      const page = await browser.newPage();
      users.push(page);
    }
    
    const startTime = performance.now();
    
    // Simulate concurrent user actions
    const userPromises = users.map(async (page, index) => {
      const userStartTime = performance.now();
      
      try {
        // Navigate to submit page
        await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { waitUntil: 'networkidle0' });
        
        // Fill form with unique data
        await page.type('[name="productName"]', `Concurrent User ${index} Product`);
        await page.type('[name="supplierName"]', `User ${index} Supplier`);
        await page.type('[name="description"]', `Product from concurrent user ${index}`);
        
        // Submit form
        await page.click('[type="submit"]');
        
        // Wait for success
        await page.waitForSelector('[data-testid="success-message"]', { timeout: 20000 });
        
        const userEndTime = performance.now();
        
        return {
          userId: index,
          success: true,
          duration: userEndTime - userStartTime
        };
      } catch (error) {
        const userEndTime = performance.now();
        
        return {
          userId: index,
          success: false,
          duration: userEndTime - userStartTime,
          error: error.message
        };
      }
    });
    
    const userResults = await Promise.all(userPromises);
    const totalTime = performance.now() - startTime;
    
    // Clean up pages
    for (const page of users) {
      await page.close();
    }
    
    const successCount = userResults.filter(r => r.success).length;
    const avgUserTime = userResults.reduce((sum, r) => sum + r.duration, 0) / userResults.length;
    
    results.push({
      userCount,
      totalTime,
      successRate: (successCount / userCount) * 100,
      avgUserTime,
      userResults
    });
    
    log.info(`${userCount} users: ${successCount}/${userCount} successful, avg: ${avgUserTime.toFixed(2)}ms, total: ${totalTime.toFixed(2)}ms`);
  }
  
  performanceResults.summary.concurrentUsers = results;
}

/**
 * MOBILE-SPECIFIC PERFORMANCE TESTS
 */
async function testMobileSpecificPerformance() {
  log.info('Testing mobile-specific performance...');
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15');
  await page.setViewport({ width: 375, height: 812 });
  
  // Test mobile QR scanner performance
  const mobileTests = [];
  
  try {
    // Test 1: Mobile form submission
    const formStartTime = performance.now();
    await page.goto(`${CONFIG.frontend.baseUrl}/submit`, { waitUntil: 'networkidle0' });
    
    await page.tap('[name="productName"]');
    await page.type('[name="productName"]', 'Mobile Performance Test');
    await page.tap('[name="supplierName"]');
    await page.type('[name="supplierName"]', 'Mobile Supplier');
    await page.tap('[name="description"]');
    await page.type('[name="description"]', 'Mobile performance test product');
    
    await page.tap('[type="submit"]');
    await page.waitForSelector('[data-testid="success-message"]', { timeout: 15000 });
    
    const formEndTime = performance.now();
    mobileTests.push({
      test: 'Mobile Form Submission',
      duration: formEndTime - formStartTime
    });
    
    // Test 2: Mobile verification page
    const batchId = await page.$eval('[data-testid="batch-id"]', el => el.textContent.trim());
    
    const verifyStartTime = performance.now();
    await page.goto(`${CONFIG.frontend.baseUrl}/verify/${batchId}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('[data-testid="verification-results"]', { timeout: 15000 });
    const verifyEndTime = performance.now();
    
    mobileTests.push({
      test: 'Mobile Verification',
      duration: verifyEndTime - verifyStartTime
    });
    
    // Test 3: Mobile QR scanner interface
    const scannerStartTime = performance.now();
    await page.goto(`${CONFIG.frontend.baseUrl}/verify`, { waitUntil: 'networkidle0' });
    
    const scannerButton = await page.$('[data-testid="qr-scanner-button"]');
    if (scannerButton) {
      await page.tap('[data-testid="qr-scanner-button"]');
      await page.waitForTimeout(1000); // Wait for scanner interface
    }
    
    const scannerEndTime = performance.now();
    mobileTests.push({
      test: 'Mobile QR Scanner Interface',
      duration: scannerEndTime - scannerStartTime
    });
    
  } catch (error) {
    log.warning(`Mobile performance test failed: ${error.message}`);
  }
  
  await page.close();
  
  for (const test of mobileTests) {
    log.perf(test.test, test.duration, CONFIG.test.thresholds.mobileLoadTime);
  }
}

/**
 * STRESS TESTS
 */
async function testSystemUnderStress() {
  log.info('Testing system under stress...');
  
  const stressRequests = 50;
  const concurrency = 10;
  const promises = [];
  
  log.info(`Sending ${stressRequests} requests with concurrency ${concurrency}...`);
  
  for (let i = 0; i < stressRequests; i++) {
    const promise = (async () => {
      const startTime = performance.now();
      
      try {
        const response = await backendClient.get('/health');
        const endTime = performance.now();
        
        return {
          success: response.status === 200,
          duration: endTime - startTime,
          iteration: i
        };
      } catch (error) {
        const endTime = performance.now();
        
        return {
          success: false,
          duration: endTime - startTime,
          error: error.message,
          iteration: i
        };
      }
    })();
    
    promises.push(promise);
    
    // Control concurrency
    if (promises.length >= concurrency || i === stressRequests - 1) {
      const batchResults = await Promise.all(promises);
      
      const successCount = batchResults.filter(r => r.success).length;
      const avgTime = batchResults.reduce((sum, r) => sum + r.duration, 0) / batchResults.length;
      
      log.info(`Batch ${Math.floor(i / concurrency) + 1}: ${successCount}/${batchResults.length} successful, avg: ${avgTime.toFixed(2)}ms`);
      
      promises.length = 0; // Clear array
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

async function testMemoryUsageUnderLoad() {
  log.info('Testing memory usage under load...');
  
  // This would require process monitoring tools in a real scenario
  // For now, we'll simulate by creating many pages and monitoring
  
  const pages = [];
  const maxPages = 10;
  
  try {
    for (let i = 0; i < maxPages; i++) {
      const page = await browser.newPage();
      await page.goto(CONFIG.frontend.baseUrl, { waitUntil: 'networkidle0' });
      pages.push(page);
      
      if (process.memoryUsage) {
        const memUsage = process.memoryUsage();
        log.info(`Memory after page ${i + 1}: RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)}MB, Heap: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Clean up
    for (const page of pages) {
      await page.close();
    }
    
    if (global.gc) {
      global.gc();
      log.info('Forced garbage collection');
    }
    
  } catch (error) {
    log.warning(`Memory usage test failed: ${error.message}`);
  }
}

/**
 * RESULTS REPORTING
 */
function printPerformanceResults() {
  console.log('\n' + '='.repeat(100));
  log.header('⚡ VERITAS PERFORMANCE TEST RESULTS SUMMARY');
  console.log('='.repeat(100));
  
  // API Performance Results
  if (performanceResults.api.healthCheck.length > 0) {
    log.header('🔧 API Performance Results');
    
    if (performanceResults.api.healthCheck.length > 0) {
      log.metrics('Health Check', performanceResults.api.healthCheck);
    }
    
    if (performanceResults.api.productSubmission.length > 0) {
      log.metrics('Product Submission', performanceResults.api.productSubmission);
    }
    
    if (performanceResults.api.productRetrieval.length > 0) {
      log.metrics('Product Retrieval', performanceResults.api.productRetrieval);
    }
    
    if (performanceResults.api.verification.length > 0) {
      log.metrics('Verification', performanceResults.api.verification);
    }
    
    // Concurrent load results
    if (Object.keys(performanceResults.api.concurrentLoad).length > 0) {
      log.info('Concurrent Load Test Results:');
      for (const [concurrency, result] of Object.entries(performanceResults.api.concurrentLoad)) {
        console.log(`   ${concurrency} concurrent: ${result.successRate.toFixed(1)}% success, ${result.avgResponseTime.toFixed(2)}ms avg`);
      }
    }
  }
  
  // Frontend Performance Results
  if (performanceResults.frontend.initialLoad.length > 0) {
    log.header('🌐 Frontend Performance Results');
    
    log.metrics('Initial Load', performanceResults.frontend.initialLoad);
    
    if (performanceResults.frontend.navigation.length > 0) {
      log.metrics('Navigation', performanceResults.frontend.navigation);
    }
    
    if (performanceResults.frontend.formSubmission.length > 0) {
      log.metrics('Form Submission', performanceResults.frontend.formSubmission);
    }
    
    if (performanceResults.frontend.qrGeneration.length > 0) {
      log.metrics('QR Generation', performanceResults.frontend.qrGeneration);
    }
    
    if (performanceResults.frontend.mobile.length > 0) {
      log.metrics('Mobile Performance', performanceResults.frontend.mobile);
    }
  }
  
  // Database Performance Results
  if (performanceResults.database.queries.length > 0) {
    log.header('🗄️  Database Performance Results');
    
    log.metrics('Database Queries', performanceResults.database.queries);
    
    if (performanceResults.database.insertions.length > 0) {
      log.metrics('Database Insertions', performanceResults.database.insertions);
    }
    
    if (performanceResults.database.lookups.length > 0) {
      log.metrics('Database Lookups', performanceResults.database.lookups);
    }
  }
  
  // Concurrent Users Summary
  if (performanceResults.summary.concurrentUsers) {
    log.header('👥 Concurrent Users Performance');
    for (const result of performanceResults.summary.concurrentUsers) {
      console.log(`${colors.cyan}${result.userCount} users: ${result.successRate.toFixed(1)}% success, ${result.avgUserTime.toFixed(2)}ms avg user time${colors.reset}`);
    }
  }
  
  // Performance Thresholds Summary
  log.header('🎯 Performance Thresholds');
  console.log(`${colors.yellow}API Response Time: ${CONFIG.test.thresholds.apiResponseTime}ms${colors.reset}`);
  console.log(`${colors.yellow}Frontend Load Time: ${CONFIG.test.thresholds.frontendLoadTime}ms${colors.reset}`);
  console.log(`${colors.yellow}Mobile Load Time: ${CONFIG.test.thresholds.mobileLoadTime}ms${colors.reset}`);
  console.log(`${colors.yellow}Database Query Time: ${CONFIG.test.thresholds.databaseQueryTime}ms${colors.reset}`);
  
  console.log('\n' + '='.repeat(100));
  
  // Overall assessment
  let totalTests = 0;
  let passedThresholds = 0;
  
  // Simple threshold checking (this could be more sophisticated)
  const allResults = [
    ...performanceResults.api.healthCheck,
    ...performanceResults.api.productSubmission,
    ...performanceResults.frontend.initialLoad,
    ...performanceResults.frontend.mobile
  ];
  
  if (allResults.length > 0) {
    const overallAvg = allResults.reduce((a, b) => a + b, 0) / allResults.length;
    log.info(`Overall Average Response Time: ${overallAvg.toFixed(2)}ms`);
    
    if (overallAvg <= CONFIG.test.thresholds.apiResponseTime) {
      log.success('✅ Overall performance meets thresholds');
    } else {
      log.warning('⚠️  Overall performance may need optimization');
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log.warning('Performance tests interrupted by user');
  await cleanup();
  printPerformanceResults();
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runPerformanceTests().catch(error => {
    log.error(`Performance test suite execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  runPerformanceTests,
  performanceResults,
  CONFIG
};