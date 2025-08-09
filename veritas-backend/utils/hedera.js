const { 
  Client, 
  TopicMessageSubmitTransaction, 
  TopicInfoQuery,
  TopicId,
  AccountId,
  PrivateKey
} = require('@hashgraph/sdk');

class HederaService {
  constructor() {
    this.client = null;
    this.topicId = null;
    this.initialized = false;
  }

  // Initialize Hedera client
  async initialize() {
    try {
      // Validate required environment variables
      const accountId = process.env.HEDERA_ACCOUNT_ID;
      const privateKey = process.env.HEDERA_PRIVATE_KEY;
      const network = process.env.HEDERA_NETWORK || 'testnet';
      const topicId = process.env.HEDERA_TOPIC_ID;

      if (!accountId || !privateKey) {
        throw new Error('Missing required Hedera environment variables: HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY');
      }

      // Create client based on network
      if (network === 'mainnet') {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      // Set operator
      this.client.setOperator(
        AccountId.fromString(accountId),
        PrivateKey.fromString(privateKey)
      );

      // Set topic ID if provided
      if (topicId) {
        this.topicId = TopicId.fromString(topicId);
      }

      this.initialized = true;
      console.log(`✅ Hedera client initialized for ${network}`);
      console.log(`🏷️  Using topic ID: ${this.topicId ? this.topicId.toString() : 'Not set'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Hedera client:', error.message);
      this.initialized = false;
      throw error;
    }
  }

  // Check if service is ready
  isReady() {
    return this.initialized && this.client && this.topicId;
  }

  // Submit a product to HCS
  async submitProduct(product) {
    if (!this.isReady()) {
      throw new Error('Hedera service not initialized or topic not set');
    }

    try {
      const message = {
        type: 'PRODUCT_REGISTRATION',
        timestamp: new Date().toISOString(),
        data: {
          batch_id: product.batch_id,
          product_name: product.product_name,
          supplier_name: product.supplier_name,
          description: product.description,
          created_at: product.created_at
        }
      };

      const transaction = new TopicMessageSubmitTransaction({
        topicId: this.topicId,
        message: JSON.stringify(message)
      });

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      console.log(`✅ Product submitted to HCS: ${receipt.transactionId.toString()}`);
      
      return {
        transactionId: receipt.transactionId.toString(),
        timestamp: new Date().toISOString(),
        topicId: this.topicId.toString(),
        sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
        message: message
      };
    } catch (error) {
      console.error('❌ Failed to submit product to HCS:', error.message);
      throw error;
    }
  }

  // Submit a claim to HCS
  async submitClaim(claim, product) {
    if (!this.isReady()) {
      throw new Error('Hedera service not initialized or topic not set');
    }

    try {
      const message = {
        type: 'CLAIM_SUBMISSION',
        timestamp: new Date().toISOString(),
        data: {
          claim_id: claim.id,
          product_batch_id: product.batch_id,
          claim_type: claim.claim_type,
          claim_description: claim.claim_description,
          created_at: claim.created_at
        }
      };

      const transaction = new TopicMessageSubmitTransaction({
        topicId: this.topicId,
        message: JSON.stringify(message)
      });

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      console.log(`✅ Claim submitted to HCS: ${receipt.transactionId.toString()}`);
      
      return {
        transactionId: receipt.transactionId.toString(),
        timestamp: new Date().toISOString(),
        topicId: this.topicId.toString(),
        sequenceNumber: receipt.topicSequenceNumber?.toNumber(),
        message: message
      };
    } catch (error) {
      console.error('❌ Failed to submit claim to HCS:', error.message);
      throw error;
    }
  }

  // Submit multiple claims at once
  async submitClaims(claims, product) {
    const results = [];
    const errors = [];

    for (const claim of claims) {
      try {
        const result = await this.submitClaim(claim, product);
        results.push(result);
      } catch (error) {
        errors.push({
          claim: claim,
          error: error.message
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      totalSubmitted: results.length,
      totalFailed: errors.length
    };
  }

  // Get topic information
  async getTopicInfo() {
    if (!this.isReady()) {
      throw new Error('Hedera service not initialized or topic not set');
    }

    try {
      const query = new TopicInfoQuery()
        .setTopicId(this.topicId);

      const info = await query.execute(this.client);
      
      return {
        topicId: info.topicId.toString(),
        topicMemo: info.topicMemo,
        sequenceNumber: info.sequenceNumber.toNumber(),
        expirationTime: info.expirationTime,
        adminKey: info.adminKey?.toString(),
        submitKey: info.submitKey?.toString(),
        autoRenewPeriod: info.autoRenewPeriod?.seconds
      };
    } catch (error) {
      console.error('❌ Failed to get topic info:', error.message);
      throw error;
    }
  }

  // Generate HCS proof links for verification
  generateProofLinks(transactionId, topicId) {
    const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
    const mirrorNodeUrl = network === 'mainnet' 
      ? 'https://mainnet-public.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';

    return {
      transactionDetails: `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`,
      topicMessages: `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages`,
      hashscanTransaction: `https://hashscan.io/${network}/transaction/${transactionId}`,
      hashscanTopic: `https://hashscan.io/${network}/topic/${topicId}`
    };
  }

  // Verify transaction exists on HCS
  async verifyTransaction(transactionId) {
    try {
      const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
      const mirrorNodeUrl = network === 'mainnet' 
        ? 'https://mainnet-public.mirrornode.hedera.com'
        : 'https://testnet.mirrornode.hedera.com';

      const response = await fetch(`${mirrorNodeUrl}/api/v1/transactions/${transactionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        exists: true,
        transaction: data,
        verified: true,
        timestamp: data.consensus_timestamp,
        result: data.result
      };
    } catch (error) {
      console.error(`❌ Failed to verify transaction ${transactionId}:`, error.message);
      return {
        exists: false,
        verified: false,
        error: error.message
      };
    }
  }

  // Get topic messages for a specific topic
  async getTopicMessages(limit = 10) {
    if (!this.topicId) {
      throw new Error('Topic ID not set');
    }

    try {
      const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
      const mirrorNodeUrl = network === 'mainnet' 
        ? 'https://mainnet-public.mirrornode.hedera.com'
        : 'https://testnet.mirrornode.hedera.com';

      const response = await fetch(`${mirrorNodeUrl}/api/v1/topics/${this.topicId}/messages?limit=${limit}&order=desc`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Decode messages from base64
      const messages = data.messages.map(msg => ({
        ...msg,
        message: msg.message ? Buffer.from(msg.message, 'base64').toString('utf8') : null,
        parsedMessage: msg.message ? this.parseMessage(Buffer.from(msg.message, 'base64').toString('utf8')) : null
      }));

      return {
        messages,
        total: messages.length,
        topicId: this.topicId.toString()
      };
    } catch (error) {
      console.error('❌ Failed to get topic messages:', error.message);
      throw error;
    }
  }

  // Parse JSON message safely
  parseMessage(messageStr) {
    try {
      return JSON.parse(messageStr);
    } catch (error) {
      return { raw: messageStr, parseError: error.message };
    }
  }

  // Close the client
  close() {
    if (this.client) {
      this.client.close();
      console.log('🔌 Hedera client closed');
    }
  }
}

// Create singleton instance
const hederaService = new HederaService();

// Initialize on startup if environment variables are present
if (process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY) {
  hederaService.initialize().catch(error => {
    console.warn('⚠️  Hedera service initialization failed, will operate without HCS integration:', error.message);
  });
}

module.exports = hederaService;