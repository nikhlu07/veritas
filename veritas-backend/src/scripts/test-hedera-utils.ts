#!/usr/bin/env node

import {
  submitClaimToHCS,
  getClaimFromHCS,
  getAllClaimsForTopic,
  verifyClaimExists,
  validateClaimData,
  generateClaimHash,
  type ClaimData
} from '../utils/hedera-utils';
import { hederaClient } from '../hedera/client';

// Sample claim data for testing
const sampleClaims: ClaimData[] = [
  {
    batch_id: "COFFEE-001",
    product_name: "Colombian Coffee",
    supplier: "Fair Trade Co",
    claims: ["100% Organic", "Fair Trade Certified"],
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    batch_id: "TEA-002",
    product_name: "Earl Grey Tea",
    supplier: "Organic Tea Ltd",
    claims: ["Organic Certified", "Rainforest Alliance"],
    timestamp: "2024-01-15T11:00:00Z"
  },
  {
    batch_id: "CHOCOLATE-003",
    product_name: "Dark Chocolate Bar",
    supplier: "Ethical Cocoa Corp",
    claims: ["70% Cacao", "Ethically Sourced", "Vegan"],
    timestamp: "2024-01-15T11:30:00Z"
  }
];

async function testHederaUtils() {
  console.log('🧪 Testing Hedera Utility Functions\n');
  console.log('=' .repeat(60));

  let testResults = {
    passed: 0,
    failed: 0,
    submittedClaims: [] as string[]
  };

  try {
    // Test 1: Validate claim data
    console.log('\n🔍 Test 1: Validating Claim Data');
    console.log('-'.repeat(40));
    
    for (const claim of sampleClaims) {
      const validation = validateClaimData(claim);
      if (validation.isValid) {
        console.log(`✅ ${claim.batch_id}: Valid claim data`);
        testResults.passed++;
      } else {
        console.log(`❌ ${claim.batch_id}: Invalid - ${validation.errors.join(', ')}`);
        testResults.failed++;
      }
    }

    // Test invalid claim data
    const invalidClaim = { batch_id: "", product_name: 123, claims: "not an array" };
    const invalidValidation = validateClaimData(invalidClaim);
    if (!invalidValidation.isValid) {
      console.log(`✅ Invalid claim properly rejected: ${invalidValidation.errors.length} errors found`);
      testResults.passed++;
    } else {
      console.log(`❌ Invalid claim was not properly rejected`);
      testResults.failed++;
    }

    // Test 2: Generate claim hashes
    console.log('\n🔐 Test 2: Generating Claim Hashes');
    console.log('-'.repeat(40));
    
    for (const claim of sampleClaims) {
      const hash = generateClaimHash(claim);
      if (hash && hash.length === 64) { // SHA256 produces 64-character hex string
        console.log(`✅ ${claim.batch_id}: Hash generated (${hash.substring(0, 16)}...)`);
        testResults.passed++;
      } else {
        console.log(`❌ ${claim.batch_id}: Hash generation failed`);
        testResults.failed++;
      }
    }

    // Test 3: Submit claims to HCS
    console.log('\n📝 Test 3: Submitting Claims to HCS');
    console.log('-'.repeat(40));
    
    for (const claim of sampleClaims) {
      try {
        const result = await submitClaimToHCS(claim);
        if (result.success) {
          console.log(`✅ ${claim.batch_id}: Submitted successfully`);
          console.log(`   Transaction ID: ${result.transactionId}`);
          console.log(`   Claim Hash: ${result.claimHash.substring(0, 16)}...`);
          testResults.passed++;
          testResults.submittedClaims.push(result.transactionId);
        } else {
          console.log(`❌ ${claim.batch_id}: Submission failed - ${result.error}`);
          testResults.failed++;
        }
        
        // Wait between submissions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.log(`❌ ${claim.batch_id}: Exception during submission - ${error}`);
        testResults.failed++;
      }
    }

    // Wait for consensus before testing retrieval
    console.log('\n⏳ Waiting 10 seconds for consensus...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Test 4: Get all claims from topic
    console.log('\n📋 Test 4: Retrieving All Claims');
    console.log('-'.repeat(40));
    
    try {
      const allClaims = await getAllClaimsForTopic(20);
      if (allClaims.length > 0) {
        console.log(`✅ Retrieved ${allClaims.length} claims from topic`);
        
        // Show recent claims
        const recentClaims = allClaims.slice(-3);
        for (const msg of recentClaims) {
          try {
            const claimData = JSON.parse(msg.contents);
            console.log(`   📦 ${claimData.batch_id}: ${claimData.product_name}`);
          } catch (e) {
            console.log(`   📨 Message: ${msg.contents.substring(0, 50)}...`);
          }
        }
        testResults.passed++;
      } else {
        console.log(`❌ No claims retrieved from topic`);
        testResults.failed++;
      }
    } catch (error) {
      console.log(`❌ Error retrieving all claims: ${error}`);
      testResults.failed++;
    }

    // Test 5: Verify claim existence by batch ID
    console.log('\n🔍 Test 5: Verifying Claim Existence');
    console.log('-'.repeat(40));
    
    for (const claim of sampleClaims) {
      try {
        const verification = await verifyClaimExists(claim.batch_id);
        if (verification.exists && verification.claim) {
          console.log(`✅ ${claim.batch_id}: Found and verified`);
          console.log(`   Product: ${verification.claim.product_name}`);
          console.log(`   Supplier: ${verification.claim.supplier}`);
          console.log(`   Claims: ${verification.claim.claims.join(', ')}`);
          testResults.passed++;
        } else {
          console.log(`❌ ${claim.batch_id}: Not found - ${verification.error}`);
          testResults.failed++;
        }
        
        // Small delay between checks
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.log(`❌ ${claim.batch_id}: Exception during verification - ${error}`);
        testResults.failed++;
      }
    }

    // Test 6: Verify non-existent claim
    console.log('\n🔍 Test 6: Verifying Non-existent Claim');
    console.log('-'.repeat(40));
    
    try {
      const verification = await verifyClaimExists("NON-EXISTENT-999");
      if (!verification.exists) {
        console.log(`✅ NON-EXISTENT-999: Correctly reported as not found`);
        testResults.passed++;
      } else {
        console.log(`❌ NON-EXISTENT-999: Incorrectly reported as found`);
        testResults.failed++;
      }
    } catch (error) {
      console.log(`❌ NON-EXISTENT-999: Exception during verification - ${error}`);
      testResults.failed++;
    }

    // Test 7: Retrieve claim by transaction ID (if we have any)
    if (testResults.submittedClaims.length > 0) {
      console.log('\n🔍 Test 7: Retrieving Claim by Transaction ID');
      console.log('-'.repeat(40));
      
      const txId = testResults.submittedClaims[0];
      try {
        const claimResult = await getClaimFromHCS(txId);
        if (claimResult.exists && claimResult.claim) {
          console.log(`✅ ${txId}: Claim retrieved successfully`);
          console.log(`   Batch ID: ${claimResult.claim.batch_id}`);
          console.log(`   Product: ${claimResult.claim.product_name}`);
          testResults.passed++;
        } else {
          console.log(`❌ ${txId}: Claim not found - ${claimResult.error}`);
          testResults.failed++;
        }
      } catch (error) {
        console.log(`❌ ${txId}: Exception during retrieval - ${error}`);
        testResults.failed++;
      }
    }

  } catch (error) {
    console.error('\n❌ Test suite encountered fatal error:', error);
    testResults.failed++;
  }

  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.submittedClaims.length > 0) {
    console.log(`\n📋 Submitted Transaction IDs:`);
    testResults.submittedClaims.forEach((txId, index) => {
      console.log(`   ${index + 1}. ${txId}`);
    });
  }

  console.log('\n🎉 Hedera Utils Testing Complete!');
  
  return testResults.failed === 0;
}

// Error handling wrapper
async function runTests() {
  try {
    const success = await testHederaUtils();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error);
    process.exit(1);
  } finally {
    try {
      await hederaClient.close();
    } catch (error) {
      console.warn('Warning: Could not close Hedera client properly');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export default testHederaUtils;