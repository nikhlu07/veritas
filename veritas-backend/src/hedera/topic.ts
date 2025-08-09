import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  TopicMessageQuery,
  Timestamp,
} from '@hashgraph/sdk';
import { hederaClient } from './client';
import fs from 'fs/promises';
import path from 'path';

export class HederaTopic {
  private topicId: TopicId | null = null;

  constructor(topicId?: string) {
    if (topicId) {
      this.topicId = TopicId.fromString(topicId);
    }
  }

  async createTopic(): Promise<string> {
    try {
      console.log('🔄 Creating new HCS topic for Veritas Supply Chain Claims...');
      
      const client = hederaClient.getClient();
      
      // Create new topic
      const topicCreateTx = new TopicCreateTransaction()
        .setTopicMemo('Veritas Supply Chain Claims')
        .setAdminKey(hederaClient.getPrivateKey().publicKey)
        .setSubmitKey(hederaClient.getPrivateKey().publicKey)
        .setMaxTransactionFee(100_000_000); // 1 HBAR

      const topicCreateSubmit = await topicCreateTx.execute(client);
      const topicCreateReceipt = await topicCreateSubmit.getReceipt(client);
      
      if (!topicCreateReceipt.topicId) {
        throw new Error('Failed to get topic ID from receipt');
      }

      this.topicId = topicCreateReceipt.topicId;
      const topicIdString = this.topicId.toString();

      console.log(`✅ Topic created successfully!`);
      console.log(`📋 Topic ID: ${topicIdString}`);
      console.log(`🔗 Transaction ID: ${topicCreateSubmit.transactionId.toString()}`);

      // Save topic ID to environment file
      await this.saveTopicIdToEnv(topicIdString);

      return topicIdString;
    } catch (error) {
      console.error('❌ Error creating topic:', error);
      throw error;
    }
  }

  async submitMessage(message: string): Promise<string> {
    try {
      if (!this.topicId) {
        throw new Error('Topic ID not set. Create topic first.');
      }

      console.log(`🔄 Submitting message to topic ${this.topicId.toString()}...`);
      
      const client = hederaClient.getClient();
      
      const topicMessageTx = new TopicMessageSubmitTransaction()
        .setTopicId(this.topicId)
        .setMessage(message)
        .setMaxTransactionFee(100_000_000); // 1 HBAR

      const topicMessageSubmit = await topicMessageTx.execute(client);
      const topicMessageReceipt = await topicMessageSubmit.getReceipt(client);

      const transactionId = topicMessageSubmit.transactionId.toString();

      console.log(`✅ Message submitted successfully!`);
      console.log(`📋 Transaction ID: ${transactionId}`);
      console.log(`📝 Message: ${message}`);

      return transactionId;
    } catch (error) {
      console.error('❌ Error submitting message:', error);
      throw error;
    }
  }

  async queryMessages(startTime?: Date): Promise<any[]> {
    try {
      if (!this.topicId) {
        throw new Error('Topic ID not set. Create topic first.');
      }

      console.log(`🔄 Querying messages from topic ${this.topicId.toString()}...`);
      
      const client = hederaClient.getClient();
      const messages: any[] = [];

      return new Promise((resolve, reject) => {
        const query = new TopicMessageQuery()
          .setTopicId(this.topicId!);

        const timeout = setTimeout(() => {
          resolve(messages);
        }, 10000); // 10 second timeout

        query.subscribe(
          client,
          (message) => {
            if (message) {
              const messageData = {
                consensusTimestamp: message.consensusTimestamp.toDate(),
                contents: Buffer.from(message.contents).toString(),
                runningHash: message.runningHash.toString(),
                sequenceNumber: message.sequenceNumber.toString(),
              };
              
              messages.push(messageData);
              console.log(`📨 Message received: ${messageData.contents}`);
              
              // If we got at least one message, resolve after short delay
              if (messages.length === 1) {
                setTimeout(() => {
                  clearTimeout(timeout);
                  resolve(messages);
                }, 2000);
              }
            }
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('❌ Error querying messages:', error);
      throw error;
    }
  }

  private async saveTopicIdToEnv(topicId: string): Promise<void> {
    try {
      const envPath = path.join(__dirname, '../../.env');
      const envContent = await fs.readFile(envPath, 'utf8');
      
      // Check if HEDERA_TOPIC_ID already exists
      if (envContent.includes('HEDERA_TOPIC_ID=')) {
        // Replace existing topic ID
        const updatedContent = envContent.replace(
          /HEDERA_TOPIC_ID=.*/,
          `HEDERA_TOPIC_ID=${topicId}`
        );
        await fs.writeFile(envPath, updatedContent);
      } else {
        // Add new topic ID
        const updatedContent = envContent + `\nHEDERA_TOPIC_ID=${topicId}\n`;
        await fs.writeFile(envPath, updatedContent);
      }

      console.log(`✅ Topic ID saved to .env file`);
    } catch (error) {
      console.warn('⚠️  Could not save topic ID to .env file:', error);
    }
  }

  getTopicId(): string | null {
    return this.topicId ? this.topicId.toString() : null;
  }
}

export default HederaTopic;