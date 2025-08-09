const axios = require('axios');
require('dotenv').config();

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 10000;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🧪 ${msg}${colors.reset}`)
};

// HTTP client with timeout
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: TEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test runner
async function runTest(testName, testFunction) {
  testResults.total++;
  log.info(`Running: ${testName}`);
  
  try {
    await testFunction();
    testResults.passed++;
    log.success(`PASSED: ${testName}`);
    testResults.details.push({ name: testName, status: 'PASSED', error: null });
  } catch (error) {
    testResults.failed++;
    log.error(`FAILED: ${testName} - ${error.message}`);
    testResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Test data
const testData = {
  validProduct: {
    product_name: 'Premium Ethiopian Coffee',
    supplier_name: 'Highland Coffee Farms',
    description: 'Single-origin arabica beans from Ethiopian highlands',
    claims: [
      {
        claim_type: 'organic_certified',
        description: 'USDA Organic Certified #ETH-2024-001'
      },
      {
        claim_type: 'fair_trade',
        description: 'Fair Trade Certified by Fair Trade USA'
      }
    ]
  },
  validProductMinimal: {
    product_name: 'Artisan Chocolate Bar',
    supplier_name: 'Swiss Chocolatiers Ltd',
    description: '70% Dark Chocolate'
  },
  invalidProduct: {
    product_name: '',
    supplier_name: 'Test Supplier',
    description: 'Test description'
  },
  validClaim: {
    claim_type: 'quality',
    description: 'Third-party quality assurance verification completed'
  }
};

// Global test variables
let createdProductId = null;
let createdBatchId = null;

// TEST SUITE
async function runAllTests() {
  log.header('VERITAS API COMPREHENSIVE TESTS');
  log.info(`Testing API at: ${API_BASE_URL}`);
  
  try {
    // Health check
    await runTest('Health Check', testHealthCheck);
    
    // Product creation tests
    await runTest('Create Product with Claims', testCreateProductWithClaims);
    await runTest('Create Product without Claims', testCreateProductWithoutClaims);
    
    // Product retrieval tests
    await runTest('Get Product by Batch ID', testGetProductByBatchId);
    await runTest('Get Non-existent Product', testGetNonExistentProduct);
    
    // Product verification tests
    await runTest('Verify Existing Product', testVerifyExistingProduct);
    await runTest('Verify Non-existent Product', testVerifyNonExistentProduct);
    
    // Claims tests
    if (createdProductId) {
      await runTest('Add Claim to Existing Product', testAddClaim);
    }
    
    // Validation tests
    await runTest('Invalid Product Data', testInvalidProductData);
    await runTest('Invalid Batch ID Format', testInvalidBatchIdFormat);
    await runTest('Invalid Claim Data', testInvalidClaimData);
    
    // Error handling tests
    await runTest('Missing Required Fields', testMissingRequiredFields);
    await runTest('Malformed JSON', testMalformedJSON);
    
    // Edge cases
    await runTest('Empty Claims Array', testEmptyClaimsArray);
    await runTest('Large Description Field', testLargeDescriptionField);
    
    // Performance tests
    await runTest('Multiple Concurrent Requests', testConcurrentRequests);
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
  }
  
  // Print results
  printTestResults();
}

// INDIVIDUAL TEST FUNCTIONS

async function testHealthCheck() {
  const response = await client.get('/health');
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (response.data.status !== 'healthy') {
    throw new Error(`Expected status 'healthy', got '${response.data.status}'`);
  }
  
  if (!response.data.service || !response.data.timestamp) {
    throw new Error('Missing required fields in health check response');
  }
}

async function testCreateProductWithClaims() {
  const response = await client.post('/api/products', testData.validProduct);
  
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success field is false');
  }
  
  if (!response.data.product || !response.data.product.id) {
    throw new Error('Missing product data in response');
  }
  
  if (!response.data.product.batch_id) {
    throw new Error('Missing batch_id in product response');
  }
  
  if (!response.data.product.batch_id.startsWith('PREMIUM-')) {
    throw new Error(`Expected batch_id to start with 'PREMIUM-', got '${response.data.product.batch_id}'`);
  }
  
  if (!response.data.claims || response.data.claims.length !== 2) {
    throw new Error(`Expected 2 claims, got ${response.data.claims ? response.data.claims.length : 0}`);
  }
  
  // Store for later tests
  createdProductId = response.data.product.id;
  createdBatchId = response.data.product.batch_id;
}

async function testCreateProductWithoutClaims() {
  const response = await client.post('/api/products', testData.validProductMinimal);
  
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success field is false');
  }
  
  if (response.data.claims && response.data.claims.length > 0) {
    throw new Error(`Expected no claims, got ${response.data.claims.length}`);
  }
}

async function testGetProductByBatchId() {
  if (!createdBatchId) {
    throw new Error('No batch ID available for testing');
  }
  
  const response = await client.get(`/api/products/${createdBatchId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success field is false');
  }
  
  if (!response.data.data.product) {
    throw new Error('Missing product data in response');
  }
  
  if (response.data.data.product.batch_id !== createdBatchId) {
    throw new Error('Batch ID mismatch in response');
  }
}

async function testGetNonExistentProduct() {
  try {
    await client.get('/api/products/NONEXISTENT-2024-9999');
    throw new Error('Expected 404 error for non-existent product');
  } catch (error) {
    if (!error.response || error.response.status !== 404) {
      throw new Error(`Expected 404 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testVerifyExistingProduct() {
  if (!createdBatchId) {
    throw new Error('No batch ID available for testing');
  }
  
  const response = await client.get(`/api/verify/${createdBatchId}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success field is false');
  }
  
  if (!response.data.data.verification) {
    throw new Error('Missing verification data in response');
  }
}

async function testVerifyNonExistentProduct() {
  try {
    await client.get('/api/verify/NONEXISTENT-2024-9999');
    throw new Error('Expected 404 error for non-existent product verification');
  } catch (error) {
    if (!error.response || error.response.status !== 404) {
      throw new Error(`Expected 404 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testAddClaim() {
  if (!createdProductId) {
    throw new Error('No product ID available for testing');
  }
  
  const claimData = {
    product_id: createdProductId,
    ...testData.validClaim
  };
  
  const response = await client.post('/api/claims', claimData);
  
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  
  if (!response.data.success) {
    throw new Error('Response success field is false');
  }
  
  if (!response.data.data.claim) {
    throw new Error('Missing claim data in response');
  }
}

async function testInvalidProductData() {
  try {
    await client.post('/api/products', testData.invalidProduct);
    throw new Error('Expected validation error for invalid product data');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testInvalidBatchIdFormat() {
  try {
    await client.get('/api/products/invalid-batch-id');
    throw new Error('Expected validation error for invalid batch ID format');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testInvalidClaimData() {
  if (!createdProductId) {
    throw new Error('No product ID available for testing');
  }
  
  const invalidClaimData = {
    product_id: createdProductId,
    claim_type: '',
    description: ''
  };
  
  try {
    await client.post('/api/claims', invalidClaimData);
    throw new Error('Expected validation error for invalid claim data');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testMissingRequiredFields() {
  const incompleteProduct = {
    product_name: 'Test Product'
    // Missing supplier_name
  };
  
  try {
    await client.post('/api/products', incompleteProduct);
    throw new Error('Expected validation error for missing required fields');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testMalformedJSON() {
  try {
    await client.post('/api/products', 'invalid-json');
    throw new Error('Expected error for malformed JSON');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testEmptyClaimsArray() {
  const productWithEmptyClaims = {
    ...testData.validProductMinimal,
    product_name: 'Test Empty Claims Product',
    claims: []
  };
  
  const response = await client.post('/api/products', productWithEmptyClaims);
  
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  
  if (response.data.claims && response.data.claims.length > 0) {
    throw new Error(`Expected no claims, got ${response.data.claims.length}`);
  }
}

async function testLargeDescriptionField() {
  const largeDescription = 'A'.repeat(3000); // Exceeds 2000 char limit
  
  const productWithLargeDescription = {
    product_name: 'Test Large Description Product',
    supplier_name: 'Test Supplier',
    description: largeDescription
  };
  
  try {
    await client.post('/api/products', productWithLargeDescription);
    throw new Error('Expected validation error for description too long');
  } catch (error) {
    if (!error.response || error.response.status !== 400) {
      throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
    }
  }
}

async function testConcurrentRequests() {
  const requests = [];
  
  for (let i = 0; i < 5; i++) {
    const productData = {
      product_name: `Concurrent Test Product ${i}`,
      supplier_name: 'Test Supplier',
      description: `Test product for concurrent request ${i}`
    };
    
    requests.push(client.post('/api/products', productData));
  }
  
  const responses = await Promise.all(requests);
  
  if (responses.length !== 5) {
    throw new Error(`Expected 5 responses, got ${responses.length}`);
  }
  
  for (let i = 0; i < responses.length; i++) {
    if (responses[i].status !== 201) {
      throw new Error(`Request ${i} failed with status ${responses[i].status}`);
    }
  }
  
  // Check all batch IDs are unique
  const batchIds = responses.map(r => r.data.product.batch_id);
  const uniqueBatchIds = [...new Set(batchIds)];
  
  if (uniqueBatchIds.length !== batchIds.length) {
    throw new Error('Duplicate batch IDs generated in concurrent requests');
  }
}

// Print test results
function printTestResults() {
  console.log('\n' + '='.repeat(60));
  log.header('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  log.info(`Total Tests: ${testResults.total}`);
  log.success(`Passed: ${testResults.passed}`);
  log.error(`Failed: ${testResults.failed}`);
  
  const successRate = testResults.total > 0 ? 
    Math.round((testResults.passed / testResults.total) * 100) : 0;
  
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}\n`);
  
  // Print detailed results
  if (testResults.failed > 0) {
    log.header('FAILED TESTS DETAILS');
    testResults.details
      .filter(t => t.status === 'FAILED')
      .forEach(test => {
        console.log(`${colors.red}❌ ${test.name}: ${test.error}${colors.reset}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warning('Tests interrupted by user');
  printTestResults();
});

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log.error(`Test suite execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  client,
  API_BASE_URL
};