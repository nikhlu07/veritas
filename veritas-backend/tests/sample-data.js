const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const BATCH_SIZE = 3;
const DELAY_BETWEEN_BATCHES = 1000; // 1 second

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
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}📦 ${msg}${colors.reset}`)
};

// HTTP client
const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Sample test data
const sampleProducts = [
  {
    product_name: 'Colombian Arabica Coffee',
    supplier_name: 'Fair Trade Coffee Co',
    description: 'Single origin beans from Colombian highlands, sustainably sourced',
    claims: [
      {
        claim_type: 'organic_certified',
        description: 'USDA Organic Certified #COL-2024-001'
      },
      {
        claim_type: 'fair_trade',
        description: 'Fair Trade USA Certified - Supports farmer communities'
      },
      {
        claim_type: 'quality',
        description: 'Specialty Coffee Association rated 85+ points'
      }
    ]
  },
  {
    product_name: 'Himalayan Pink Salt',
    supplier_name: 'Pure Mountain Minerals',
    description: 'Hand-mined pink salt from the Khewra Salt Mine in Pakistan',
    claims: [
      {
        claim_type: 'authenticity',
        description: 'Verified origin from Khewra Salt Mine, Pakistan'
      },
      {
        claim_type: 'purity',
        description: '99.9% pure sodium chloride with natural trace minerals'
      }
    ]
  },
  {
    product_name: 'Madagascar Vanilla Extract',
    supplier_name: 'Tropical Spice Trading',
    description: 'Premium vanilla extract from Madagascar vanilla beans',
    claims: [
      {
        claim_type: 'organic_certified',
        description: 'ECOCERT Organic Certified #MAD-VAN-2024-003'
      },
      {
        claim_type: 'quality',
        description: 'Made from Grade A Madagascar Bourbon vanilla beans'
      },
      {
        claim_type: 'authenticity',
        description: 'Single-fold vanilla extract, no artificial flavoring'
      }
    ]
  },
  {
    product_name: 'Swiss Dark Chocolate',
    supplier_name: 'Alpine Chocolatiers SA',
    description: '70% cacao dark chocolate made in Switzerland',
    claims: [
      {
        claim_type: 'fair_trade',
        description: 'Rainforest Alliance Certified cocoa beans'
      },
      {
        claim_type: 'quality',
        description: 'Bean-to-bar process in Swiss facility'
      }
    ]
  },
  {
    product_name: 'New Zealand Manuka Honey',
    supplier_name: 'Golden Bay Apiaries',
    description: 'UMF 15+ Manuka honey from New Zealand',
    claims: [
      {
        claim_type: 'authenticity',
        description: 'UMF License #1234 - Certified authentic Manuka honey'
      },
      {
        claim_type: 'quality',
        description: 'Laboratory tested UMF 15+ rating'
      },
      {
        claim_type: 'organic_certified',
        description: 'BioGro New Zealand Organic Certified #NZ-2024-089'
      }
    ]
  },
  {
    product_name: 'Italian Extra Virgin Olive Oil',
    supplier_name: 'Tuscan Olive Groves Ltd',
    description: 'Cold-pressed extra virgin olive oil from Tuscany',
    claims: [
      {
        claim_type: 'authenticity',
        description: 'Protected Designation of Origin (PDO) Tuscany'
      },
      {
        claim_type: 'quality',
        description: 'First cold press, acidity level below 0.3%'
      }
    ]
  },
  {
    product_name: 'Japanese Matcha Powder',
    supplier_name: 'Kyoto Tea Gardens',
    description: 'Ceremonial grade matcha from Uji, Kyoto',
    claims: [
      {
        claim_type: 'authenticity',
        description: 'Certified authentic Uji matcha from Kyoto prefecture'
      },
      {
        claim_type: 'organic_certified',
        description: 'JAS Organic Certified Japan #JPN-TEA-2024-067'
      },
      {
        claim_type: 'quality',
        description: 'Stone-ground ceremonial grade, first harvest'
      }
    ]
  },
  {
    product_name: 'Argentinian Grass-Fed Beef',
    supplier_name: 'Pampas Cattle Ranch',
    description: 'Premium grass-fed beef from Argentine Pampas',
    claims: [
      {
        claim_type: 'quality',
        description: 'Grass-fed and finished, no grain supplementation'
      },
      {
        claim_type: 'welfare',
        description: 'Animal Welfare Approved by A Greener World'
      }
    ]
  },
  {
    product_name: 'Norwegian Atlantic Salmon',
    supplier_name: 'Arctic Seas Fishery',
    description: 'Wild-caught Atlantic salmon from Norwegian waters',
    claims: [
      {
        claim_type: 'sustainability',
        description: 'MSC (Marine Stewardship Council) Certified sustainable'
      },
      {
        claim_type: 'authenticity',
        description: 'Wild-caught in Norwegian Atlantic waters'
      }
    ]
  },
  {
    product_name: 'French Lavender Essential Oil',
    supplier_name: 'Provence Aromatics',
    description: 'Pure lavender essential oil from Provence, France',
    claims: [
      {
        claim_type: 'organic_certified',
        description: 'ECOCERT Organic Certified #FR-LAV-2024-045'
      },
      {
        claim_type: 'purity',
        description: '100% pure Lavandula angustifolia, no synthetic additives'
      },
      {
        claim_type: 'authenticity',
        description: 'Steam distilled from Provence lavender fields'
      }
    ]
  }
];

// Statistics tracking
const loadStats = {
  products: {
    created: 0,
    failed: 0,
    total: 0
  },
  claims: {
    created: 0,
    failed: 0,
    total: 0
  },
  startTime: null,
  endTime: null
};

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateStats() {
  const duration = loadStats.endTime - loadStats.startTime;
  const durationSeconds = Math.round(duration / 1000);
  
  return {
    duration: durationSeconds,
    productsPerSecond: loadStats.products.created / (durationSeconds || 1),
    claimsPerSecond: loadStats.claims.created / (durationSeconds || 1),
    successRate: {
      products: loadStats.products.total > 0 ? 
        Math.round((loadStats.products.created / loadStats.products.total) * 100) : 0,
      claims: loadStats.claims.total > 0 ? 
        Math.round((loadStats.claims.created / loadStats.claims.total) * 100) : 0
    }
  };
}

// Main data loading function
async function loadTestData() {
  log.header('LOADING TEST DATA');
  log.info(`Target API: ${API_BASE_URL}`);
  log.info(`Products to create: ${sampleProducts.length}`);
  log.info(`Batch size: ${BATCH_SIZE}`);
  
  // Check API health first
  try {
    log.info('Checking API health...');
    const healthResponse = await client.get('/health');
    if (healthResponse.status !== 200) {
      throw new Error(`API health check failed: ${healthResponse.status}`);
    }
    log.success('API is healthy and ready');
  } catch (error) {
    log.error(`API health check failed: ${error.message}`);
    log.error('Make sure the server is running on the correct port');
    process.exit(1);
  }
  
  loadStats.startTime = Date.now();
  
  // Process products in batches
  const batches = [];
  for (let i = 0; i < sampleProducts.length; i += BATCH_SIZE) {
    batches.push(sampleProducts.slice(i, i + BATCH_SIZE));
  }
  
  log.info(`Processing ${batches.length} batches...`);
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    log.info(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} products)`);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (productData, productIndex) => {
      const globalIndex = batchIndex * BATCH_SIZE + productIndex + 1;
      return await createProduct(productData, globalIndex);
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Process batch results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { product, claims } = result.value;
        log.success(`Created: ${product.batch_id} - ${product.product_name}`);
        
        if (claims && claims.length > 0) {
          log.info(`  └── ${claims.length} claims submitted to HCS`);
        }
      } else {
        log.error(`Failed to create product ${batchIndex * BATCH_SIZE + index + 1}: ${result.reason}`);
      }
    });
    
    // Delay between batches to avoid overwhelming the API
    if (batchIndex < batches.length - 1) {
      log.info(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES);
    }
  }
  
  loadStats.endTime = Date.now();
  
  // Print final statistics
  printLoadStatistics();
}

// Create individual product
async function createProduct(productData, index) {
  try {
    loadStats.products.total++;
    loadStats.claims.total += (productData.claims || []).length;
    
    log.info(`Creating product ${index}: ${productData.product_name}`);
    
    const response = await client.post('/api/products', productData);
    
    if (response.status !== 201) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error(`API returned success: false`);
    }
    
    loadStats.products.created++;
    loadStats.claims.created += (response.data.claims || []).length;
    
    return {
      product: response.data.product,
      claims: response.data.claims,
      qr_code: response.data.qr_code,
      hcs_results: response.data.hcs_results
    };
    
  } catch (error) {
    loadStats.products.failed++;
    if (productData.claims) {
      loadStats.claims.failed += productData.claims.length;
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

// Print loading statistics
function printLoadStatistics() {
  const stats = calculateStats();
  
  console.log('\n' + '='.repeat(60));
  log.header('LOAD TEST STATISTICS');
  console.log('='.repeat(60));
  
  log.info(`Duration: ${stats.duration} seconds`);
  log.info(`Products: ${loadStats.products.created}/${loadStats.products.total} (${stats.successRate.products}%)`);
  log.info(`Claims: ${loadStats.claims.created}/${loadStats.claims.total} (${stats.successRate.claims}%)`);
  log.info(`Performance: ${stats.productsPerSecond.toFixed(2)} products/sec`);
  
  if (loadStats.products.failed > 0) {
    log.warning(`Failed Products: ${loadStats.products.failed}`);
  }
  
  if (loadStats.claims.failed > 0) {
    log.warning(`Failed Claims: ${loadStats.claims.failed}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (loadStats.products.created > 0) {
    log.success('Test data loading completed successfully!');
    log.info('You can now run API tests or use the Postman collection');
  } else {
    log.error('No products were created successfully');
    process.exit(1);
  }
}

// Add additional claims to existing products
async function addAdditionalClaims() {
  log.header('ADDING ADDITIONAL CLAIMS TO EXISTING PRODUCTS');
  
  try {
    // Get some existing products first
    log.info('Finding existing products to add claims to...');
    
    // This is a simple approach - in a real scenario you might want to 
    // query the database or keep track of created product IDs
    const additionalClaims = [
      {
        productName: 'Colombian Arabica Coffee',
        claim: {
          claim_type: 'sustainability',
          description: 'Carbon neutral shipping and packaging'
        }
      },
      {
        productName: 'Swiss Dark Chocolate',
        claim: {
          claim_type: 'quality',
          description: 'Winner of International Chocolate Awards 2024'
        }
      }
    ];
    
    log.info(`Will attempt to add ${additionalClaims.length} additional claims`);
    log.warning('Note: This requires product IDs from previously created products');
    
  } catch (error) {
    log.error(`Failed to add additional claims: ${error.message}`);
  }
}

// Clear test data (optional cleanup function)
async function clearTestData() {
  log.header('CLEARING TEST DATA');
  log.warning('This would require a DELETE endpoint or database access');
  log.info('Consider implementing a test cleanup endpoint for future use');
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'load':
        await loadTestData();
        break;
      case 'claims':
        await addAdditionalClaims();
        break;
      case 'clear':
        await clearTestData();
        break;
      default:
        log.info('Usage: node load-test-data.js [command]');
        log.info('Commands:');
        log.info('  load   - Load all sample products with claims');
        log.info('  claims - Add additional claims to existing products');
        log.info('  clear  - Clear test data (if endpoint available)');
        log.info('');
        log.info('Default: load');
        await loadTestData();
    }
  } catch (error) {
    log.error(`Command failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log.warning('Load test interrupted by user');
  if (loadStats.startTime) {
    loadStats.endTime = Date.now();
    printLoadStatistics();
  }
  process.exit(1);
});

// Run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    log.error(`Load test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  loadTestData,
  sampleProducts,
  loadStats,
  client
};