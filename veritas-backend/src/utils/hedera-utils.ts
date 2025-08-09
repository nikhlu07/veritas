import {
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  Timestamp,
  TransactionReceipt,
  TransactionResponse
} from '@hashgraph/sdk';
import { hederaClient } from '../hedera/client';
import crypto from 'crypto';

// Types
export interface ClaimData {
  batch_id: string;
  product_name: string;
  supplier: string;
  claims: string[];
  timestamp: string;
  verification_hash?: string;
}

export interface HCSMessage {
  consensusTimestamp: Date;
  contents: string;
  runningHash: string;
  sequenceNumber: string;
  transactionId?: string;
}

export interface ClaimSubmissionResult {
  success: boolean;
  transactionId: string;
  topicId: string;
  consensusTimestamp?: Date;
  claimHash: string;
  error?: string;
}

export interface ClaimVerificationResult {
  exists: boolean;
  claim?: ClaimData;
  transactionId?: string;
  consensusTimestamp?: Date;
  verificationHash?: string;
  error?: string;
}

/**
 * Submit a product claim to Hedera Consensus Service
 * @param claimData The claim data to submit
 * @returns Promise with submission result
 */
export async function submitClaimToHCS(claimData: ClaimData): Promise<ClaimSubmissionResult> {
  try {
    console.log(`🔄 Submitting claim for batch: ${claimData.batch_id}...`);

    // Validate required environment variables
    const topicIdString = process.env.HEDERA_TOPIC_ID;
    if (!topicIdString) {
      throw new Error('HEDERA_TOPIC_ID not found in environment variables');
    }

    const topicId = TopicId.fromString(topicIdString);
    const client = hederaClient.getClient();

    // Add verification hash to claim data
    const claimWithHash: ClaimData = {
      ...claimData,
      verification_hash: generateClaimHash(claimData)
    };

    // Convert claim to JSON string
    const claimJson = JSON.stringify(claimWithHash, null, 0);

    // Submit message to HCS topic
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(claimJson)
      .setMaxTransactionFee(100_000_000); // 1 HBAR

    const txResponse: TransactionResponse = await submitTx.execute(client);
    const receipt: TransactionReceipt = await txResponse.getReceipt(client);

    const result: ClaimSubmissionResult = {
      success: true,
      transactionId: txResponse.transactionId.toString(),
      topicId: topicId.toString(),
      claimHash: claimWithHash.verification_hash!
    };

    console.log(`✅ Claim submitted successfully!`);
    console.log(`📋 Transaction ID: ${result.transactionId}`);
    console.log(`🔗 Topic ID: ${result.topicId}`);
    console.log(`#️⃣ Claim Hash: ${result.claimHash}`);

    return result;

  } catch (error) {
    console.error('❌ Error submitting claim to HCS:', error);
    
    return {
      success: false,
      transactionId: '',
      topicId: process.env.HEDERA_TOPIC_ID || '',
      claimHash: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Retrieve a specific claim from HCS using transaction ID
 * @param transactionId The transaction ID to look for
 * @returns Promise with claim data if found
 */
export async function getClaimFromHCS(transactionId: string): Promise<ClaimVerificationResult> {
  try {
    console.log(`🔄 Retrieving claim with transaction ID: ${transactionId}...`);

    const messages = await getAllClaimsForTopic();
    
    // Find message with matching transaction ID (approximate match since we can't get exact tx ID from messages)
    const matchingMessage = messages.find(msg => 
      msg.transactionId?.includes(transactionId.split('@')[0]) || 
      msg.contents.includes(transactionId)
    );

    if (!matchingMessage) {
      return {
        exists: false,
        error: `No claim found with transaction ID: ${transactionId}`
      };
    }

    try {
      const claimData: ClaimData = JSON.parse(matchingMessage.contents);
      
      return {
        exists: true,
        claim: claimData,
        transactionId: matchingMessage.transactionId,
        consensusTimestamp: matchingMessage.consensusTimestamp,
        verificationHash: claimData.verification_hash
      };
    } catch (parseError) {
      return {
        exists: false,
        error: 'Found message but could not parse claim data'
      };
    }

  } catch (error) {
    console.error('❌ Error retrieving claim from HCS:', error);
    
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get all claims from the HCS topic
 * @param limit Optional limit on number of messages to retrieve
 * @returns Promise with array of all messages
 */
export async function getAllClaimsForTopic(limit?: number): Promise<HCSMessage[]> {
  try {
    console.log(`🔄 Retrieving all claims from topic...`);

    const topicIdString = process.env.HEDERA_TOPIC_ID;
    if (!topicIdString) {
      throw new Error('HEDERA_TOPIC_ID not found in environment variables');
    }

    const topicId = TopicId.fromString(topicIdString);
    const client = hederaClient.getClient();
    const messages: HCSMessage[] = [];

    return new Promise((resolve, reject) => {
      const query = new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000))); // Last 24 hours

      const timeout = setTimeout(() => {
        console.log(`📊 Retrieved ${messages.length} messages from topic`);
        resolve(messages);
      }, 20000); // 20 second timeout

      let isResolved = false;
      let noMessageCount = 0;

      const resolveOnce = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve(messages);
        }
      };

      query.subscribe(
        client,
        (message) => {
          if (message && !isResolved) {
            const messageData: HCSMessage = {
              consensusTimestamp: message.consensusTimestamp.toDate(),
              contents: Buffer.from(message.contents).toString(),
              runningHash: message.runningHash.toString(),
              sequenceNumber: message.sequenceNumber.toString(),
            };
            
            messages.push(messageData);
            noMessageCount = 0; // Reset no-message counter
            
            console.log(`📨 Message ${messages.length}: ${messageData.contents.substring(0, 50)}...`);
          }
        },
        (error) => {
          if (!isResolved) {
            console.error('❌ Error in message subscription:', error);
            resolveOnce(); // Resolve with whatever we have instead of rejecting
          }
        }
      );

      // Check for messages periodically and resolve if we have some
      const checkInterval = setInterval(() => {
        if (isResolved) {
          clearInterval(checkInterval);
          return;
        }

        if (messages.length > 0) {
          // We have messages, wait a bit more for any additional ones
          noMessageCount++;
          if (noMessageCount >= 3) { // 3 seconds with no new messages
            clearInterval(checkInterval);
            resolveOnce();
          }
        } else {
          // No messages yet, continue waiting up to timeout
          noMessageCount++;
        }
      }, 1000);
    });

  } catch (error) {
    console.error('❌ Error retrieving all claims:', error);
    throw error;
  }
}

/**
 * Verify if a claim exists for a specific batch ID
 * @param batchId The batch ID to search for
 * @returns Promise with verification result
 */
export async function verifyClaimExists(batchId: string): Promise<ClaimVerificationResult> {
  try {
    console.log(`🔄 Verifying claim exists for batch: ${batchId}...`);

    const messages = await getAllClaimsForTopic();
    
    // Search through all messages for matching batch ID
    for (const message of messages) {
      try {
        const claimData: ClaimData = JSON.parse(message.contents);
        
        if (claimData.batch_id === batchId) {
          console.log(`✅ Found claim for batch: ${batchId}`);
          
          return {
            exists: true,
            claim: claimData,
            consensusTimestamp: message.consensusTimestamp,
            verificationHash: claimData.verification_hash
          };
        }
      } catch (parseError) {
        // Skip messages that aren't valid JSON claims
        continue;
      }
    }

    console.log(`❌ No claim found for batch: ${batchId}`);
    
    return {
      exists: false,
      error: `No claim found for batch ID: ${batchId}`
    };

  } catch (error) {
    console.error('❌ Error verifying claim existence:', error);
    
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate a verification hash for a claim
 * @param claimData The claim data to hash
 * @returns SHA256 hash string
 */
export function generateClaimHash(claimData: Omit<ClaimData, 'verification_hash'>): string {
  const claimString = JSON.stringify({
    batch_id: claimData.batch_id,
    product_name: claimData.product_name,
    supplier: claimData.supplier,
    claims: claimData.claims.sort(), // Sort claims for consistent hashing
    timestamp: claimData.timestamp
  }, null, 0);
  
  return crypto.createHash('sha256').update(claimString).digest('hex');
}

/**
 * Validate claim data format
 * @param claimData The claim data to validate
 * @returns Validation result with errors if any
 */
export function validateClaimData(claimData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!claimData.batch_id || typeof claimData.batch_id !== 'string') {
    errors.push('batch_id is required and must be a string');
  }

  if (!claimData.product_name || typeof claimData.product_name !== 'string') {
    errors.push('product_name is required and must be a string');
  }

  if (!claimData.supplier || typeof claimData.supplier !== 'string') {
    errors.push('supplier is required and must be a string');
  }

  if (!Array.isArray(claimData.claims) || claimData.claims.length === 0) {
    errors.push('claims is required and must be a non-empty array');
  }

  if (!claimData.timestamp || typeof claimData.timestamp !== 'string') {
    errors.push('timestamp is required and must be a string');
  } else {
    // Validate timestamp format
    const date = new Date(claimData.timestamp);
    if (isNaN(date.getTime())) {
      errors.push('timestamp must be a valid ISO 8601 date string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  submitClaimToHCS,
  getClaimFromHCS,
  getAllClaimsForTopic,
  verifyClaimExists,
  generateClaimHash,
  validateClaimData
};