import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

export class HederaClient {
  private client: Client;
  private accountId: AccountId;
  private privateKey: PrivateKey;

  constructor() {
    try {
      // Validate required environment variables
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error('Missing required Hedera environment variables');
      }

      this.accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      this.privateKey = PrivateKey.fromStringED25519(process.env.HEDERA_PRIVATE_KEY);

      // Create client for testnet
      if (process.env.HEDERA_NETWORK === 'testnet') {
        this.client = Client.forTestnet();
      } else if (process.env.HEDERA_NETWORK === 'mainnet') {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet(); // Default to testnet
      }

      // Set the account ID and private key
      this.client.setOperator(this.accountId, this.privateKey);

      console.log(`✅ Hedera client initialized for ${process.env.HEDERA_NETWORK || 'testnet'}`);
      console.log(`📋 Account ID: ${this.accountId.toString()}`);
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error);
      throw error;
    }
  }

  getClient(): Client {
    return this.client;
  }

  getAccountId(): AccountId {
    return this.accountId;
  }

  getPrivateKey(): PrivateKey {
    return this.privateKey;
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
      console.log('✅ Hedera client closed successfully');
    } catch (error) {
      console.error('❌ Error closing Hedera client:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const hederaClient = new HederaClient();