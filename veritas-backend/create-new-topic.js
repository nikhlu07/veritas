#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

const { 
  Client, 
  TopicCreateTransaction,
  AccountId,
  PrivateKey
} = require('@hashgraph/sdk');
const fs = require('fs');
const path = require('path');

async function createNewTopic() {
  console.log('🚀 Creating New Veritas HCS Topic\n');
  console.log('=' .repeat(50));

  try {
    // Get environment variables
    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    if (!accountId || !privateKey) {
      throw new Error('Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env file');
    }

    console.log(`📋 Account: ${accountId}`);
    console.log(`🌐 Network: ${network}`);

    // Create client
    const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(
      AccountId.fromString(accountId),
      PrivateKey.fromString(privateKey)
    );

    // Create topic
    const topicCreateTx = new TopicCreateTransaction()
      .setTopicMemo('Veritas Supply Chain Claims - New Topic')
      .setMaxTransactionFee(100_000_000); // 1 HBAR

    console.log('🔄 Creating topic...');
    const topicCreateSubmit = await topicCreateTx.execute(client);
    const topicCreateReceipt = await topicCreateSubmit.getReceipt(client);
    
    if (!topicCreateReceipt.topicId) {
      throw new Error('Failed to get topic ID from receipt');
    }

    const newTopicId = topicCreateReceipt.topicId.toString();
    const transactionId = topicCreateSubmit.transactionId.toString();

    console.log('\n' + '='.repeat(50));
    console.log('✅ NEW Topic Created Successfully!');
    console.log('='.repeat(50));
    console.log(`📋 New Topic ID: ${newTopicId}`);
    console.log(`🔗 Transaction ID: ${transactionId}`);
    console.log(`🌐 Network: ${network}`);

    // Update .env file
    await updateEnvFile(newTopicId);

    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Update frontend .env.local with the new topic ID');
    console.log('   2. Restart your backend and frontend');
    console.log('   3. Test the new topic with your application');

    client.close();

  } catch (error) {
    console.error('\n❌ Topic creation failed:', error.message);
    console.error('\nPlease check:');
    console.error('   - Environment variables are set correctly');
    console.error('   - Hedera account has sufficient HBAR balance');
    console.error('   - Network connectivity is working');
    process.exit(1);
  }
}

async function updateEnvFile(topicId) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace existing topic ID
    if (envContent.includes('HEDERA_TOPIC_ID=')) {
      envContent = envContent.replace(/HEDERA_TOPIC_ID=.*/, `HEDERA_TOPIC_ID=${topicId}`);
    } else {
      envContent += `\nHEDERA_TOPIC_ID=${topicId}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Backend .env updated with new topic ID');
    
  } catch (error) {
    console.warn('⚠️  Could not update .env file:', error.message);
    console.log(`\n📋 Manual Step Required:`);
    console.log(`Update your .env file with:`);
    console.log(`HEDERA_TOPIC_ID=${topicId}`);
  }
}

// Run the script
createNewTopic().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});