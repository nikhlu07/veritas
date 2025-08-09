require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { validateCredentials } = require('./validate-hedera-credentials');

class HederaConfigManager {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env');
  }

  async readEnvFile() {
    try {
      const content = await fs.readFile(this.envPath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error reading .env file:', error.message);
      return null;
    }
  }

  async updateEnvFile(updates) {
    try {
      let content = await this.readEnvFile();
      if (!content) return false;

      // Update each variable
      for (const [key, value] of Object.entries(updates)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${key}=${value}`);
          console.log(`✅ Updated ${key}`);
        } else {
          // Add new variable if it doesn't exist
          content += `\n${key}=${value}`;
          console.log(`✅ Added ${key}`);
        }
      }

      await fs.writeFile(this.envPath, content, 'utf8');
      console.log('✅ Environment file updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating .env file:', error.message);
      return false;
    }
  }

  async getCurrentConfig() {
    const content = await this.readEnvFile();
    if (!content) return null;

    const config = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          config[key] = valueParts.join('=');
        }
      }
    }

    return {
      HEDERA_ACCOUNT_ID: config.HEDERA_ACCOUNT_ID || 'NOT SET',
      HEDERA_PRIVATE_KEY: config.HEDERA_PRIVATE_KEY ? '[SET]' : 'NOT SET',
      HEDERA_TOPIC_ID: config.HEDERA_TOPIC_ID || 'NOT SET',
      HEDERA_NETWORK: config.HEDERA_NETWORK || 'testnet'
    };
  }

  async interactive() {
    console.log('🔧 Hedera Configuration Manager');
    console.log('===============================');
    
    const currentConfig = await this.getCurrentConfig();
    if (!currentConfig) {
      console.error('❌ Could not read current configuration');
      return;
    }

    console.log('\n📋 Current Configuration:');
    for (const [key, value] of Object.entries(currentConfig)) {
      console.log(`   ${key}: ${value}`);
    }

    console.log('\n💡 To update your Hedera configuration:');
    console.log('   1. Get your new account credentials from Hedera Portal');
    console.log('   2. Create or find your topic ID');
    console.log('   3. Run this script with new values:');
    console.log('      node scripts/update-hedera-config.js --account YOUR_ACCOUNT_ID --key YOUR_PRIVATE_KEY --topic YOUR_TOPIC_ID');
    console.log('\n📖 Example:');
    console.log('   node scripts/update-hedera-config.js --account 0.0.1234567 --key 302e020...your_key --topic 0.0.7654321');
    
    // Test current configuration
    if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
      console.log('\n🧪 Testing current configuration...');
      const isValid = await validateCredentials(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY,
        process.env.HEDERA_NETWORK || 'testnet'
      );
      
      if (!isValid) {
        console.log('\n⚠️  Current configuration has issues. Please update with correct credentials.');
      }
    }
  }

  async updateFromArgs(args) {
    const updates = {};
    
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--account':
          if (args[i + 1]) updates.HEDERA_ACCOUNT_ID = args[i + 1];
          break;
        case '--key':
          if (args[i + 1]) updates.HEDERA_PRIVATE_KEY = args[i + 1];
          break;
        case '--topic':
          if (args[i + 1]) updates.HEDERA_TOPIC_ID = args[i + 1];
          break;
        case '--network':
          if (args[i + 1]) updates.HEDERA_NETWORK = args[i + 1];
          break;
      }
    }

    if (Object.keys(updates).length === 0) {
      await this.interactive();
      return;
    }

    console.log('🔄 Updating configuration...');
    const success = await this.updateEnvFile(updates);
    
    if (success && updates.HEDERA_ACCOUNT_ID && updates.HEDERA_PRIVATE_KEY) {
      console.log('\n🧪 Testing updated configuration...');
      const isValid = await validateCredentials(
        updates.HEDERA_ACCOUNT_ID,
        updates.HEDERA_PRIVATE_KEY,
        updates.HEDERA_NETWORK || 'testnet'
      );
      
      if (isValid) {
        console.log('\n🎉 Configuration updated and validated successfully!');
        console.log('   You can now restart your server to use the new credentials.');
      }
    }
  }
}

async function main() {
  const manager = new HederaConfigManager();
  const args = process.argv.slice(2);
  await manager.updateFromArgs(args);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });
}

module.exports = HederaConfigManager;