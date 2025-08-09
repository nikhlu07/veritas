require('dotenv').config();
const { Client, AccountId, PrivateKey, AccountBalanceQuery } = require('@hashgraph/sdk');

async function validateCredentials(accountId, privateKey, network = 'testnet') {
  console.log('🔐 Validating Hedera Credentials');
  console.log('================================');
  console.log('Account ID:', accountId);
  console.log('Private Key:', privateKey ? `${privateKey.substring(0, 10)}...` : '[NOT PROVIDED]');
  console.log('Network:', network);
  console.log();

  try {
    // Create client
    const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    
    // Set operator
    client.setOperator(
      AccountId.fromString(accountId),
      PrivateKey.fromString(privateKey)
    );

    console.log('✅ Client created successfully');
    
    // Test with a simple query - get account balance
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId));
    
    const balance = await balanceQuery.execute(client);
    console.log('✅ Account balance retrieved:', balance.hbars.toString());
    
    client.close();
    console.log('✅ Credentials are valid!');
    return true;
    
  } catch (error) {
    console.error('❌ Credential validation failed:', error.message);
    
    if (error.message.includes('INVALID_SIGNATURE')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - The private key does not match the account ID');
      console.log('   - Make sure you\'re using the correct private key for this account');
      console.log('   - Check if the account ID format is correct (e.g., 0.0.123456)');
    } else if (error.message.includes('ACCOUNT_NOT_FOUND')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - The account ID does not exist on this network');
      console.log('   - Make sure you\'re using the correct network (testnet/mainnet)');
    }
    
    return false;
  }
}

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const network = process.env.HEDERA_NETWORK || 'testnet';
  
  if (!accountId || !privateKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   HEDERA_ACCOUNT_ID:', accountId ? '✅' : '❌');
    console.error('   HEDERA_PRIVATE_KEY:', privateKey ? '✅' : '❌');
    console.log('\n💡 Make sure your .env file contains both variables');
    return;
  }
  
  const isValid = await validateCredentials(accountId, privateKey, network);
  
  if (isValid) {
    console.log('\n🎉 Your Hedera credentials are working correctly!');
    console.log('   You can now use the Veritas API with HCS integration.');
  } else {
    console.log('\n❌ Please update your credentials in the .env file and try again.');
  }
}

// Allow running with custom credentials for testing
if (require.main === module) {
  // Check if credentials provided as command line arguments
  const args = process.argv.slice(2);
  if (args.length >= 2) {
    const [accountId, privateKey, network = 'testnet'] = args;
    validateCredentials(accountId, privateKey, network);
  } else {
    main();
  }
}

module.exports = { validateCredentials };