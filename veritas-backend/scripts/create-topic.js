#!/usr/bin/env node

const { createTopic } = require('../utils/hedera');
const fs = require('fs');
const path = require('path');

async function createVeritasTopic() {
  console.log('🚀 Creating Veritas HCS Topic\n');
  console.log('=' .repeat(50));

  try {
    // Create the topic
    const topicId = await createTopic('Veritas Supply Chain Claims');
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Topic Creation Successful!');
    console.log('='.repeat(50));
    console.log(`📋 Topic ID: ${topicId}`);
    console.log(`📝 Memo: "Veritas Supply Chain Claims"`);
    console.log(`🌐 Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
    
    // Save topic ID to .env file
    await saveTopicIdToEnv(topicId);
    
    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Topic is ready for message submission');
    console.log('   2. Run test-hedera.js to test the integration');
    console.log('   3. Start building your application API');

  } catch (error) {
    console.error('\n❌ Topic creation failed:', error.message);
    console.error('\nPlease check:');
    console.error('   - Environment variables are set correctly');
    console.error('   - Hedera account has sufficient HBAR balance');
    console.error('   - Network connectivity is working');
    process.exit(1);
  }
}

async function saveTopicIdToEnv(topicId) {
  try {
    const envPath = path.join(__dirname, '../.env');
    
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Check if HEDERA_TOPIC_ID already exists
    if (envContent.includes('HEDERA_TOPIC_ID=')) {
      // Replace existing topic ID
      envContent = envContent.replace(/HEDERA_TOPIC_ID=.*/, `HEDERA_TOPIC_ID=${topicId}`);
    } else {
      // Add new topic ID
      envContent += `\nHEDERA_TOPIC_ID=${topicId}\n`;
    }
    
    // Write updated content
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Topic ID saved to .env file');
    
  } catch (error) {
    console.warn('⚠️  Could not save topic ID to .env file:', error.message);
    console.log(`\n📋 Manual Step Required:`);
    console.log(`Add this line to your .env file:`);
    console.log(`HEDERA_TOPIC_ID=${topicId}`);
  }
}

// Show usage information
function showUsage() {
  console.log('Usage: node create-topic.js');
  console.log('');
  console.log('Environment Variables Required:');
  console.log('  HEDERA_ACCOUNT_ID    - Your Hedera account ID (e.g., 0.0.123456)');
  console.log('  HEDERA_PRIVATE_KEY   - Your Hedera private key');
  console.log('  HEDERA_NETWORK       - testnet or mainnet (optional, defaults to testnet)');
  console.log('');
  console.log('Example .env file:');
  console.log('  HEDERA_ACCOUNT_ID=0.0.123456');
  console.log('  HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...');
  console.log('  HEDERA_NETWORK=testnet');
}

// Validate environment variables
function validateEnvironment() {
  const required = ['HEDERA_ACCOUNT_ID', 'HEDERA_PRIVATE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('');
    showUsage();
    return false;
  }
  
  return true;
}

// Main execution
async function main() {
  // Check for help flag
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
    return;
  }
  
  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Create the topic
  await createVeritasTopic();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { createVeritasTopic, saveTopicIdToEnv };