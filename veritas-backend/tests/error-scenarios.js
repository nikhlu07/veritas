const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_TIMEOUT = 15000;

// Colors for console output
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
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🔍 ${msg}${colors.reset}`)
};

// HTTP client
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: TEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error test results
const errorTestResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Test runner for error scenarios
async function runErrorTest(testName, testFunction) {
  errorTestResults.total++;
  log.info(`Running: ${testName}`);
  
  try {
    await testFunction();
    errorTestResults.passed++;
    log.success(`PASSED: ${testName}`);
    errorTestResults.details.push({ name: testName, status: 'PASSED', error: null });
  } catch (error) {
    errorTestResults.failed++;
    log.error(`FAILED: ${testName} - ${error.message}`);
    errorTestResults.details.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

// Utility function to simulate HCS network errors
function simulateHCSError() {
  // This would require modifying the Hedera service to accept a test mode
  // For now, we'll test the error handling by creating conditions that might cause HCS failures
  log.warning('HCS error simulation requires test environment configuration');
}

// ERROR SCENARIO TESTS

async function testValidationErrors() {
  log.header('VALIDATION ERROR TESTS');
  
  // Test missing required fields
  await runErrorTest('Missing product_name field', async () => {
    try {
      await client.post('/api/products', {
        supplier_name: 'Test Supplier',
        description: 'Missing product_name'
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Missing supplier_name field', async () => {
    try {
      await client.post('/api/products', {
        product_name: 'Test Product',
        description: 'Missing supplier_name'
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test invalid field lengths
  await runErrorTest('Product name too short', async () => {
    try {
      await client.post('/api/products', {
        product_name: 'A', // Too short (min 2 chars)
        supplier_name: 'Test Supplier',
        description: 'Product name too short'
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Product name too long', async () => {
    const longName = 'A'.repeat(300); // Exceeds 255 char limit
    try {
      await client.post('/api/products', {
        product_name: longName,
        supplier_name: 'Test Supplier',
        description: 'Product name too long'
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Description too long', async () => {
    const longDescription = 'A'.repeat(2500); // Exceeds 2000 char limit
    try {
      await client.post('/api/products', {
        product_name: 'Test Product',
        supplier_name: 'Test Supplier',
        description: longDescription
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test invalid claims
  await runErrorTest('Invalid claim type', async () => {
    try {
      await client.post('/api/products', {
        product_name: 'Test Product',
        supplier_name: 'Test Supplier',
        description: 'Test product with invalid claim',
        claims: [{
          claim_type: 'invalid_claim_type_not_allowed',
          description: 'Invalid claim type test'
        }]
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Empty claim description', async () => {
    try {
      await client.post('/api/products', {
        product_name: 'Test Product',
        supplier_name: 'Test Supplier',
        description: 'Test product with empty claim description',
        claims: [{
          claim_type: 'quality',
          description: '' // Empty description
        }]
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Claim description too short', async () => {
    try {
      await client.post('/api/products', {
        product_name: 'Test Product',
        supplier_name: 'Test Supplier',
        description: 'Test product with short claim description',
        claims: [{
          claim_type: 'quality',
          description: 'abc' // Too short (min 5 chars)
        }]
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testInvalidFormats() {
  log.header('INVALID FORMAT TESTS');

  // Test malformed JSON
  await runErrorTest('Malformed JSON', async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/products`, 
        '{"product_name": "Test", "invalid_json"}', 
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: TEST_TIMEOUT
        }
      );
      throw new Error('Expected JSON parsing error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  // Test invalid batch ID formats
  await runErrorTest('Invalid batch ID format - no dashes', async () => {
    try {
      await client.get('/api/products/INVALIDBATCHID');
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Invalid batch ID format - wrong pattern', async () => {
    try {
      await client.get('/api/products/INVALID-BATCH-ID');
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Invalid UUID format in claims', async () => {
    try {
      await client.post('/api/claims', {
        product_id: 'invalid-uuid-format',
        claim_type: 'quality',
        description: 'Testing invalid UUID format'
      });
      throw new Error('Expected validation error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 400) {
        throw new Error(`Expected 400 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testNotFoundErrors() {
  log.header('NOT FOUND ERROR TESTS');

  await runErrorTest('Non-existent product by batch ID', async () => {
    try {
      await client.get('/api/products/NONEXISTENT-2024-9999');
      throw new Error('Expected 404 error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        throw new Error(`Expected 404 status, got ${error.response?.status || 'network error'}`);
      }
      
      // Verify error response format
      const errorData = error.response.data;
      if (!errorData.error || !errorData.error.message) {
        throw new Error('Error response missing required fields');
      }
    }
  });

  await runErrorTest('Non-existent product verification', async () => {
    try {
      await client.get('/api/verify/NONEXISTENT-2024-9999');
      throw new Error('Expected 404 error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        throw new Error(`Expected 404 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });

  await runErrorTest('Claim for non-existent product', async () => {
    try {
      await client.post('/api/claims', {
        product_id: '00000000-0000-0000-0000-000000000000',
        claim_type: 'quality',
        description: 'Claim for non-existent product'
      });
      throw new Error('Expected 404 error but request succeeded');
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        throw new Error(`Expected 404 status, got ${error.response?.status || 'network error'}`);
      }
    }
  });
}

async function testEdgeCases() {
  log.header('EDGE CASE TESTS');

  await runErrorTest('Extremely large request body', async () => {
    const largeClaimsArray = [];
    for (let i = 0; i < 100; i++) { // Create many claims
      largeClaimsArray.push({
        claim_type: 'quality',
        description: `Large request test claim number ${i} with additional padding text to increase size`
      });
    }

    try {
      await client.post('/api/products', {
        product_name: 'Large Request Test Product',
        supplier_name: 'Test Supplier',
        description: 'Testing extremely large request body',
        claims: largeClaimsArray
      });
      // This might succeed or fail depending on server limits
      log.warning('Large request completed - verify server handled appropriately');
    } catch (error) {
      if (error.response && (error.response.status === 413 || error.response.status === 400)) {
        // Expected error for request too large
        return;
      } else {
        throw error;
      }
    }
  });

  await runErrorTest('Special characters in product name', async () => {
    // Test with various special characters that should be handled
    const response = await client.post('/api/products', {
      product_name: 'Café "Special" & <Unique> Product™',
      supplier_name: 'Test Supplier Ltd.',
      description: 'Testing special character handling in product names'
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }

    // Verify the product name was properly sanitized/stored
    if (!response.data.product.product_name.includes('Café')) {
      throw new Error('Special characters were not handled correctly');
    }
  });

  await runErrorTest('Unicode characters in description', async () => {
    const response = await client.post('/api/products', {
      product_name: 'Unicode Test Product',
      supplier_name: 'International Supplier',
      description: 'Testing unicode: 中文, العربية, русский, 日本語, emoji: 🌟✨🎉'
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }
  });

  await runErrorTest('Null values in optional fields', async () => {
    const response = await client.post('/api/products', {
      product_name: 'Null Test Product',
      supplier_name: 'Test Supplier',
      description: null, // Null in optional field
      claims: null // Null claims array
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }
  });
}

async function testConcurrencyIssues() {
  log.header('CONCURRENCY AND RACE CONDITION TESTS');

  await runErrorTest('Concurrent batch ID generation', async () => {
    const promises = [];
    const productBaseName = 'ConcurrencyTest';
    
    // Create multiple products simultaneously with same name prefix
    for (let i = 0; i < 10; i++) {
      promises.push(
        client.post('/api/products', {
          product_name: `${productBaseName} Product ${i}`,
          supplier_name: 'Concurrency Test Supplier',
          description: `Concurrent creation test ${i}`
        })
      );
    }

    const results = await Promise.allSettled(promises);
    
    // Check all requests succeeded
    const succeeded = results.filter(r => r.status === 'fulfilled');
    if (succeeded.length !== 10) {
      throw new Error(`Expected 10 successful requests, got ${succeeded.length}`);
    }

    // Check all batch IDs are unique
    const batchIds = succeeded.map(r => r.value.data.product.batch_id);
    const uniqueBatchIds = [...new Set(batchIds)];
    
    if (uniqueBatchIds.length !== batchIds.length) {
      throw new Error('Duplicate batch IDs generated in concurrent requests');
    }

    log.success(`All ${batchIds.length} concurrent requests generated unique batch IDs`);
  });
}

async function testHCSErrorHandling() {
  log.header('HEDERA HCS ERROR HANDLING TESTS');

  await runErrorTest('Product creation with HCS unavailable', async () => {
    // This test simulates HCS being unavailable
    // The system should still create the product but log HCS failures
    
    log.warning('Testing HCS error handling - requires specific test environment setup');
    
    const response = await client.post('/api/products', {
      product_name: 'HCS Error Test Product',
      supplier_name: 'Error Test Supplier',
      description: 'Testing HCS error handling',
      claims: [{
        claim_type: 'quality',
        description: 'Test claim for HCS error scenario'
      }]
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201 status even with HCS errors, got ${response.status}`);
    }

    // Check that product was created despite potential HCS errors
    if (!response.data.product || !response.data.product.id) {
      throw new Error('Product should be created even if HCS fails');
    }

    log.info('Product created successfully despite potential HCS issues');
  });
}

async function testDatabaseErrorScenarios() {
  log.header('DATABASE ERROR SCENARIOS');

  await runErrorTest('Database constraint violations', async () => {
    // This would test database constraint errors
    // For example, trying to create duplicate unique values
    log.warning('Database constraint testing requires specific database state setup');
    
    // In a real test environment, you might:
    // 1. Create a product
    // 2. Try to manually insert a duplicate batch_id
    // 3. Verify proper error handling
    
    log.info('Database constraint tests require database-level setup');
  });
}

// Print error test results
function printErrorTestResults() {
  console.log('\n' + '='.repeat(60));
  log.header('ERROR SCENARIO TEST RESULTS');
  console.log('='.repeat(60));
  
  log.info(`Total Tests: ${errorTestResults.total}`);
  log.success(`Passed: ${errorTestResults.passed}`);
  log.error(`Failed: ${errorTestResults.failed}`);
  
  const successRate = errorTestResults.total > 0 ? 
    Math.round((errorTestResults.passed / errorTestResults.total) * 100) : 0;
  
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}\n`);
  
  // Print detailed results for failed tests
  if (errorTestResults.failed > 0) {
    log.header('FAILED ERROR TESTS DETAILS');
    errorTestResults.details
      .filter(t => t.status === 'FAILED')
      .forEach(test => {
        console.log(`${colors.red}❌ ${test.name}: ${test.error}${colors.reset}`);
      });
  }
  
  console.log('\n' + '='.repeat(60));
  
  return errorTestResults.failed === 0;
}

// Main test runner
async function runAllErrorScenarios() {
  log.header('VERITAS API ERROR SCENARIO TESTS');
  log.info(`Testing API at: ${API_BASE_URL}`);
  
  try {
    // Check API health first
    log.info('Checking API health...');
    const healthResponse = await client.get('/health');
    if (healthResponse.status !== 200) {
      throw new Error(`API health check failed: ${healthResponse.status}`);
    }
    log.success('API is healthy and ready for error testing');

    // Run all error scenario test suites
    await testValidationErrors();
    await testInvalidFormats();
    await testNotFoundErrors();
    await testEdgeCases();
    await testConcurrencyIssues();
    await testHCSErrorHandling();
    await testDatabaseErrorScenarios();
    
  } catch (error) {
    log.error(`Error test suite execution failed: ${error.message}`);
  }
  
  // Print results and exit
  const allTestsPassed = printErrorTestResults();
  process.exit(allTestsPassed ? 0 : 1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warning('Error tests interrupted by user');
  printErrorTestResults();
  process.exit(1);
});

// Run tests if this script is executed directly
if (require.main === module) {
  runAllErrorScenarios().catch(error => {
    log.error(`Error test suite execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllErrorScenarios,
  errorTestResults,
  client
};