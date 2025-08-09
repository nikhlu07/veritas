#!/usr/bin/env node

/**
 * Veritas Demo Products Setup Script
 * 
 * This script creates real demo products on Hedera HCS for demonstration purposes.
 * Each product will have real transaction IDs, timestamps, and QR codes.
 */

const {
  Client,
  PrivateKey,
  AccountId,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  Hbar
} = require('@hashgraph/sdk');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// Demo configuration
const DEMO_CONFIG = {
  network: process.env.HEDERA_NETWORK || 'testnet',
  accountId: process.env.HEDERA_ACCOUNT_ID,
  privateKey: process.env.HEDERA_PRIVATE_KEY,
  outputDir: './demo-results'
};

// Demo products data
const DEMO_PRODUCTS = [
  {
    batchId: 'COFFEE-2024-1001',
    productName: 'Colombian Single-Origin Coffee',
    supplier: {
      name: 'Mountain View Coffee Cooperative',
      location: 'Huila, Colombia',
      contact: 'contact@mountainviewcoffee.co',
      certifications: ['USDA Organic', 'Fair Trade USA']
    },
    product: {
      category: 'Food & Beverage',
      description: 'Premium single-origin coffee beans from high-altitude Colombian farms',
      weight: '12 oz (340g)',
      harvestDate: '2024-03-15',
      processingMethod: 'Washed Process',
      roastLevel: 'Medium',
      origin: {
        farm: 'Finca El Paraíso',
        altitude: '1,800m above sea level',
        coordinates: '2.1234, -75.5678'
      }
    },
    claims: [
      {
        type: 'organic',
        title: 'USDA Organic Certified',
        certificationNumber: '2024-COL-089',
        issuedBy: 'USDA National Organic Program',
        issuedDate: '2024-01-15',
        expiryDate: '2025-01-15',
        verificationUrl: 'https://organic.ams.usda.gov/integrity/CertificationSearch',
        evidence: 'Annual third-party inspection completed by CCOF'
      },
      {
        type: 'fair-trade',
        title: 'Fair Trade USA Certified',
        certificationNumber: 'FT-2024-1001',
        issuedBy: 'Fair Trade USA',
        issuedDate: '2024-02-01',
        expiryDate: '2025-02-01',
        verificationUrl: 'https://www.fairtradecertified.org',
        evidence: 'Premium paid to farmers: $0.20/lb above market price'
      },
      {
        type: 'partnership',
        title: 'Direct Trade Partnership Since 2019',
        certificationNumber: 'DT-MVCC-2019',
        issuedBy: 'Mountain View Coffee Cooperative',
        issuedDate: '2019-08-01',
        verificationUrl: 'https://mountainviewcoffee.co/partnerships',
        evidence: '5-year direct trade agreement ensuring stable pricing and quality'
      }
    ],
    sustainability: {
      carbonFootprint: '2.1 kg CO2e per kg coffee',
      packaging: '100% compostable packaging',
      waterUsage: 'Water-efficient processing methods',
      socialImpact: 'Supports 45 farming families in Huila region'
    }
  },
  {
    batchId: 'SHIRT-ECO-2024-456',
    productName: 'Sustainable Cotton T-Shirt',
    supplier: {
      name: 'EcoThreads Manufacturing',
      location: 'Gujarat, India',
      contact: 'quality@ecothreads.com',
      certifications: ['GOTS', 'OEKO-TEX', 'SA8000']
    },
    product: {
      category: 'Apparel',
      description: 'Premium organic cotton t-shirt with sustainable manufacturing',
      size: 'Medium',
      color: 'Natural White',
      material: '100% Organic Cotton',
      weight: '180 GSM',
      style: 'Classic Fit Crew Neck'
    },
    claims: [
      {
        type: 'organic',
        title: 'GOTS Certified Organic Cotton',
        certificationNumber: 'GOTS-2024-ECO-456',
        issuedBy: 'Global Organic Textile Standard',
        issuedDate: '2024-01-20',
        expiryDate: '2025-01-20',
        verificationUrl: 'https://global-standard.org/certification/public-database',
        evidence: 'Cotton sourced from GOTS certified organic farms in Rajasthan'
      },
      {
        type: 'labor',
        title: 'Living Wage Factory Certification',
        certificationNumber: 'LW-ECO-2024-789',
        issuedBy: 'Fair Wear Foundation',
        issuedDate: '2024-02-15',
        expiryDate: '2025-02-15',
        verificationUrl: 'https://www.fairwear.org',
        evidence: 'All workers receive living wage above regional standards'
      },
      {
        type: 'environmental',
        title: 'Carbon Neutral Shipping via Offset Program',
        certificationNumber: 'CN-SHIP-2024-456',
        issuedBy: 'Gold Standard Carbon Credits',
        issuedDate: '2024-03-01',
        verificationUrl: 'https://registry.goldstandard.org',
        evidence: 'Shipping emissions offset through verified reforestation projects'
      }
    ],
    sustainability: {
      carbonFootprint: '4.3 kg CO2e per shirt (including shipping)',
      waterUsage: '70% less water than conventional cotton',
      dyeProcess: 'OEKO-TEX certified non-toxic dyes only',
      packaging: 'Plastic-free, recyclable packaging'
    }
  },
  {
    batchId: 'PHONE-REF-2024-789',
    productName: 'Refurbished iPhone 13',
    supplier: {
      name: 'GreenTech Refurbishment',
      location: 'Austin, Texas, USA',
      contact: 'support@greentech-refurb.com',
      certifications: ['R2 Certified', 'e-Stewards', 'ISO 14001']
    },
    product: {
      category: 'Electronics',
      description: 'Professionally refurbished iPhone 13 with sustainability focus',
      model: 'iPhone 13',
      storage: '128GB',
      color: 'Starlight',
      condition: 'Like New',
      warranty: '12 months',
      batteryHealth: '95%'
    },
    claims: [
      {
        type: 'ethical-sourcing',
        title: 'Conflict-Free Minerals Verified',
        certificationNumber: 'CFM-PHONE-2024-789',
        issuedBy: 'Responsible Minerals Initiative',
        issuedDate: '2024-01-10',
        verificationUrl: 'https://www.responsiblemineralsinitiative.org',
        evidence: 'All minerals traced through certified conflict-free supply chains'
      },
      {
        type: 'recycling',
        title: '95% Recycled Components Used',
        certificationNumber: 'RC-GT-2024-789',
        issuedBy: 'GreenTech Refurbishment Quality Assurance',
        issuedDate: '2024-02-20',
        evidence: 'Original Apple components reused, only battery and screen protector new'
      },
      {
        type: 'environmental',
        title: 'Carbon Footprint Offset 100%',
        certificationNumber: 'CFO-PHONE-2024-789',
        issuedBy: 'Verified Carbon Standard',
        issuedDate: '2024-03-10',
        verificationUrl: 'https://registry.verra.org',
        evidence: 'Manufacturing and shipping emissions offset through renewable energy credits'
      }
    ],
    sustainability: {
      carbonFootprint: '22 kg CO2e (85% reduction vs new phone)',
      eWasteReduction: 'Prevents 1 phone from entering landfill',
      materialRecovery: '95% of original materials retained',
      energyEfficiency: 'Refurbishment uses 90% less energy than new manufacturing'
    }
  }
];

class DemoProductsCreator {
  constructor() {
    this.client = null;
    this.topicId = null;
    this.results = [];
  }

  async initialize() {
    console.log('🚀 Initializing Hedera client...');
    
    if (!DEMO_CONFIG.accountId || !DEMO_CONFIG.privateKey) {
      throw new Error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY environment variables');
    }

    // Initialize Hedera client
    if (DEMO_CONFIG.network === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(
      AccountId.fromString(DEMO_CONFIG.accountId),
      PrivateKey.fromString(DEMO_CONFIG.privateKey)
    );

    // Create output directory
    await fs.mkdir(DEMO_CONFIG.outputDir, { recursive: true });
    
    console.log(`✅ Hedera client initialized for ${DEMO_CONFIG.network}`);
  }

  async createTopic() {
    console.log('📝 Using existing HCS topic for demo products...');
    
    // Use the existing topic from .env
    const existingTopicId = process.env.HEDERA_TOPIC_ID || '0.0.6526078';
    this.topicId = existingTopicId;
    console.log(`✅ Using topic: ${this.topicId}`);
    
    return this.topicId;
  }

  async submitProduct(product) {
    console.log(`📤 Submitting product: ${product.productName} (${product.batchId})`);
    
    const productData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      batchId: product.batchId,
      productName: product.productName,
      supplier: product.supplier,
      product: product.product,
      claims: product.claims,
      sustainability: product.sustainability,
      verification: {
        submittedBy: DEMO_CONFIG.accountId,
        network: DEMO_CONFIG.network,
        method: 'HCS_DEMO_SUBMISSION'
      }
    };

    const message = JSON.stringify(productData);
    
    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(this.topicId)
      .setMessage(message)
      .setMaxTransactionFee(new Hbar(1));

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);
    
    const result = {
      batchId: product.batchId,
      productName: product.productName,
      topicId: this.topicId.toString(),
      transactionId: response.transactionId.toString(),
      consensusTimestamp: receipt.consensusTimestamp,
      sequenceNumber: receipt.topicSequenceNumber,
      hashScanUrl: `https://hashscan.io/${DEMO_CONFIG.network}/transaction/${response.transactionId.toString()}`,
      verificationUrl: `http://localhost:3004/verify/${product.batchId}`,
      qrCodeData: {
        batchId: product.batchId,
        verifyUrl: `http://localhost:3004/verify/${product.batchId}`,
        topicId: this.topicId.toString(),
        transactionId: response.transactionId.toString()
      },
      submissionTimestamp: new Date().toISOString()
    };

    this.results.push(result);
    console.log(`✅ Product submitted successfully!`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    console.log(`   HashScan URL: ${result.hashScanUrl}`);
    
    return result;
  }

  async generateDemoReport() {
    console.log('📊 Generating demo report...');
    
    const report = {
      title: 'Veritas Demo Products Report',
      generatedAt: new Date().toISOString(),
      network: DEMO_CONFIG.network,
      topicId: this.topicId?.toString(),
      totalProducts: this.results.length,
      products: this.results,
      demoInstructions: {
        overview: 'These products have been pre-created on Hedera HCS for demonstration purposes',
        verification: 'Each product can be verified using its batch ID or QR code',
        hashScan: 'All transactions can be viewed on HashScan using the provided URLs',
        qrCodes: 'QR codes contain real verification data linking to actual Hedera transactions'
      },
      nextSteps: [
        'Use these batch IDs in your verification demo',
        'Show HashScan links to prove blockchain integration',
        'Demonstrate QR code scanning with mobile devices',
        'Create live submission during presentation'
      ]
    };

    // Save detailed report
    const reportPath = path.join(DEMO_CONFIG.outputDir, 'demo-products-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Save quick reference
    const quickRef = {
      topicId: this.topicId?.toString(),
      products: this.results.map(r => ({
        batchId: r.batchId,
        name: r.productName,
        verifyUrl: r.verificationUrl,
        hashScanUrl: r.hashScanUrl
      }))
    };
    
    const quickRefPath = path.join(DEMO_CONFIG.outputDir, 'demo-quick-reference.json');
    await fs.writeFile(quickRefPath, JSON.stringify(quickRef, null, 2));
    
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`🔗 Quick reference saved to: ${quickRefPath}`);
    
    return report;
  }

  async printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🎉 DEMO PRODUCTS SUCCESSFULLY CREATED ON HEDERA HCS!');
    console.log('='.repeat(80));
    console.log(`Network: ${DEMO_CONFIG.network.toUpperCase()}`);
    console.log(`Topic ID: ${this.topicId}`);
    console.log(`Total Products: ${this.results.length}`);
    console.log('\nDEMO PRODUCTS:');
    
    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.productName}`);
      console.log(`   Batch ID: ${result.batchId}`);
      console.log(`   Transaction: ${result.transactionId}`);
      console.log(`   Verify URL: ${result.verificationUrl}`);
      console.log(`   HashScan: ${result.hashScanUrl}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 DEMO READY! Use these products for live demonstrations.');
    console.log('='.repeat(80));
  }

  async createAllProducts() {
    try {
      await this.initialize();
      await this.createTopic();
      
      for (const product of DEMO_PRODUCTS) {
        await this.submitProduct(product);
        // Small delay between submissions
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      await this.generateDemoReport();
      await this.printSummary();
      
      console.log('\n✅ All demo products created successfully!');
      console.log('📁 Check the demo-results folder for detailed reports and QR codes.');
      
    } catch (error) {
      console.error('❌ Error creating demo products:', error);
      throw error;
    } finally {
      if (this.client) {
        this.client.close();
      }
    }
  }
}

// Execute the demo setup
async function main() {
  console.log('🎬 Starting Veritas Demo Products Creation...\n');
  
  const creator = new DemoProductsCreator();
  await creator.createAllProducts();
  
  console.log('\n🎉 Demo setup complete! Your Veritas application now has real Hedera-verified demo products.');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DemoProductsCreator, DEMO_PRODUCTS };