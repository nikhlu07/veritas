#!/usr/bin/env node

/**
 * Veritas Demo Products Setup via API
 * 
 * This script creates real demo products using the existing backend API
 * which already has working Hedera HCS integration.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const CONFIG = {
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3002',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3004',
  outputDir: './demo-results'
};

// Demo products data
const DEMO_PRODUCTS = [
  {
    batchId: 'COFFEE-2024-1001',
    productName: 'Colombian Single-Origin Coffee',
    supplier: 'Mountain View Coffee Cooperative',
    location: 'Huila, Colombia',
    contact: 'contact@mountainviewcoffee.co',
    category: 'Food & Beverage',
    description: 'Premium single-origin coffee beans from high-altitude Colombian farms',
    claims: [
      'USDA Organic Certified #2024-COL-089',
      'Fair Trade USA Certified #FT-2024-1001',
      'Direct Trade Partnership Since 2019'
    ]
  },
  {
    batchId: 'SHIRT-ECO-2024-456',
    productName: 'Sustainable Cotton T-Shirt',
    supplier: 'EcoThreads Manufacturing',
    location: 'Gujarat, India',
    contact: 'quality@ecothreads.com',
    category: 'Apparel',
    description: 'Premium organic cotton t-shirt with sustainable manufacturing',
    claims: [
      'GOTS Certified Organic Cotton #GOTS-2024-ECO-456',
      'Living Wage Factory Certification',
      'Carbon Neutral Shipping via Offset Program'
    ]
  },
  {
    batchId: 'PHONE-REF-2024-789',
    productName: 'Refurbished iPhone 13',
    supplier: 'GreenTech Refurbishment',
    location: 'Austin, Texas, USA',
    contact: 'support@greentech-refurb.com',
    category: 'Electronics',
    description: 'Professionally refurbished iPhone 13 with sustainability focus',
    claims: [
      'Conflict-Free Minerals Verified',
      '95% Recycled Components Used',
      'Carbon Footprint Offset 100%'
    ]
  }
];

class DemoProductsAPICreator {
  constructor() {
    this.results = [];
    this.backendHealthy = false;
  }

  async checkBackendHealth() {
    try {
      console.log('🔍 Checking backend health...');
      const response = await axios.get(`${CONFIG.backendUrl}/health`, { timeout: 5000 });
      
      // Even if database is not connected, we can still test API functionality
      if (response.status === 200) {
        console.log('✅ Backend is responding');
        this.backendHealthy = true;
        return true;
      }
    } catch (error) {
      console.log('❌ Backend is not responding on expected URL');
      console.log('💡 Make sure the backend server is running on port 3002');
      throw new Error('Backend not available');
    }
  }

  async submitProduct(product) {
    console.log(`📤 Submitting product: ${product.productName} (${product.batchId})`);
    
    try {
      const response = await axios.post(`${CONFIG.backendUrl}/api/products`, product, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = {
        batchId: product.batchId,
        productName: product.productName,
        submissionResponse: response.data,
        submissionTimestamp: new Date().toISOString(),
        verificationUrl: `${CONFIG.frontendUrl}/verify/${product.batchId}`,
        hashScanUrl: response.data.transactionId ? 
          `https://hashscan.io/testnet/transaction/${response.data.transactionId}` : null,
        status: 'success'
      };

      this.results.push(result);
      console.log(`✅ Product submitted successfully!`);
      
      if (response.data.transactionId) {
        console.log(`   Transaction ID: ${response.data.transactionId}`);
        console.log(`   HashScan URL: ${result.hashScanUrl}`);
      }
      
      return result;

    } catch (error) {
      console.log(`❌ Failed to submit product: ${error.message}`);
      
      const result = {
        batchId: product.batchId,
        productName: product.productName,
        error: error.message,
        submissionTimestamp: new Date().toISOString(),
        status: 'failed'
      };
      
      this.results.push(result);
      return result;
    }
  }

  async generateDemoReport() {
    console.log('📊 Generating demo report...');
    
    const successfulProducts = this.results.filter(r => r.status === 'success');
    const failedProducts = this.results.filter(r => r.status === 'failed');
    
    const report = {
      title: 'Veritas Demo Products Report',
      generatedAt: new Date().toISOString(),
      totalProducts: this.results.length,
      successfulSubmissions: successfulProducts.length,
      failedSubmissions: failedProducts.length,
      products: this.results,
      demoInstructions: {
        overview: 'These products have been created using the Veritas backend API with real Hedera HCS integration',
        verification: 'Each successful product can be verified using its batch ID or QR code',
        hashScan: 'Transactions can be viewed on HashScan using the provided URLs',
        usage: 'Use these batch IDs for live demonstrations'
      },
      quickReference: successfulProducts.map(p => ({
        batchId: p.batchId,
        name: p.productName,
        verifyUrl: p.verificationUrl,
        hashScanUrl: p.hashScanUrl
      })),
      nextSteps: [
        'Use these batch IDs in your verification demo',
        'Show HashScan links to prove blockchain integration',
        'Demonstrate QR code scanning with mobile devices',
        'Create additional live submissions during presentation'
      ]
    };

    // Create output directory
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Save detailed report
    const reportPath = path.join(CONFIG.outputDir, 'demo-products-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Save quick reference for easy access
    const quickRefPath = path.join(CONFIG.outputDir, 'demo-quick-reference.json');
    await fs.writeFile(quickRefPath, JSON.stringify(report.quickReference, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`🔗 Quick reference saved to: ${quickRefPath}`);
    
    return report;
  }

  async printSummary() {
    const successfulProducts = this.results.filter(r => r.status === 'success');
    const failedProducts = this.results.filter(r => r.status === 'failed');
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 DEMO PRODUCTS CREATION COMPLETED!');
    console.log('='.repeat(80));
    console.log(`Total Products: ${this.results.length}`);
    console.log(`✅ Successful: ${successfulProducts.length}`);
    console.log(`❌ Failed: ${failedProducts.length}`);
    
    if (successfulProducts.length > 0) {
      console.log('\n📋 SUCCESSFUL DEMO PRODUCTS:');
      
      successfulProducts.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.productName}`);
        console.log(`   Batch ID: ${result.batchId}`);
        console.log(`   Verify URL: ${result.verificationUrl}`);
        if (result.hashScanUrl) {
          console.log(`   HashScan: ${result.hashScanUrl}`);
        }
      });
    }
    
    if (failedProducts.length > 0) {
      console.log('\n❌ FAILED SUBMISSIONS:');
      failedProducts.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.productName} (${result.batchId})`);
        console.log(`   Error: ${result.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    if (successfulProducts.length > 0) {
      console.log('🎯 DEMO READY! Use the successful products for live demonstrations.');
    } else {
      console.log('⚠️  No products were successfully created. Check backend connectivity.');
    }
    console.log('='.repeat(80));
  }

  async createAllProducts() {
    try {
      await this.checkBackendHealth();
      
      console.log(`\n🚀 Creating ${DEMO_PRODUCTS.length} demo products...`);
      
      for (const product of DEMO_PRODUCTS) {
        await this.submitProduct(product);
        // Small delay between submissions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await this.generateDemoReport();
      await this.printSummary();
      
      console.log('\n✅ Demo products creation process completed!');
      console.log('📁 Check the demo-results folder for detailed reports.');
      
    } catch (error) {
      console.error('❌ Error in demo creation process:', error.message);
      throw error;
    }
  }
}

// Execute the demo setup
async function main() {
  console.log('🎬 Starting Veritas Demo Products Creation via API...\n');
  
  const creator = new DemoProductsAPICreator();
  await creator.createAllProducts();
  
  console.log('\n🎉 Demo setup complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Start your frontend: npm run dev');
  console.log('   2. Use the batch IDs for verification demos');
  console.log('   3. Show HashScan links for blockchain proof');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DemoProductsAPICreator, DEMO_PRODUCTS };