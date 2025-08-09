#!/usr/bin/env node

import HederaTopic from '../hedera/topic';
import { hederaClient } from '../hedera/client';

async function setupHedera() {
  console.log('🚀 Setting up Veritas Hedera Integration...\n');

  try {
    // Step 1: Create new HCS topic
    console.log('Step 1: Creating HCS Topic for Veritas Claims');
    const topic = new HederaTopic();
    const topicId = await topic.createTopic();
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Topic Created Successfully!`);
    console.log(`📋 Topic ID: ${topicId}`);
    console.log(`📝 Topic Memo: "Veritas Supply Chain Claims"`);
    console.log('='.repeat(50) + '\n');

    // Step 2: Test submitting a sample message
    console.log('Step 2: Testing Message Submission');
    const sampleClaim = JSON.stringify({
      batchId: 'COFFEE-TEST-001',
      product: 'Colombian Arabica Coffee Beans',
      claims: [
        '100% Organic Certified',
        'Fair Trade Certified',
        'Direct from Farmer'
      ],
      supplier: 'Veritas Coffee Co.',
      timestamp: new Date().toISOString(),
      verificationHash: 'sha256:abcd1234...'
    });

    const transactionId = await topic.submitMessage(sampleClaim);
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Sample Message Submitted!`);
    console.log(`📋 Transaction ID: ${transactionId}`);
    console.log(`📝 Message Content: ${sampleClaim.substring(0, 100)}...`);
    console.log('='.repeat(50) + '\n');

    // Step 3: Test retrieving messages
    console.log('Step 3: Testing Message Retrieval');
    console.log('⏳ Waiting for consensus and querying messages...');
    
    // Wait a bit for the message to be processed
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const messages = await topic.queryMessages();
    
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Messages Retrieved!`);
    console.log(`📊 Total Messages: ${messages.length}`);
    
    if (messages.length > 0) {
      console.log('\n📋 Latest Message:');
      const latestMessage = messages[messages.length - 1];
      console.log(`   Timestamp: ${latestMessage.consensusTimestamp}`);
      console.log(`   Sequence: ${latestMessage.sequenceNumber}`);
      console.log(`   Content: ${latestMessage.contents.substring(0, 100)}...`);
    }
    console.log('='.repeat(50) + '\n');

    console.log('🎉 Hedera Setup Complete!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Hedera Client: Connected to ${process.env.HEDERA_NETWORK || 'testnet'}`);
    console.log(`   ✅ HCS Topic: Created (${topicId})`);
    console.log(`   ✅ Message Submission: Working`);
    console.log(`   ✅ Message Retrieval: Working`);
    console.log('\n🚀 Ready to build the Veritas application!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    try {
      await hederaClient.close();
    } catch (error) {
      console.warn('Warning: Could not close Hedera client properly');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupHedera();
}

export default setupHedera;