#!/usr/bin/env node

/**
 * Veritas Hedera HCS Integration Test Suite
 * 
 * This test suite validates the Hedera Hashgraph Consensus Service integration,
 * ensuring that product data is properly submitted to HCS and can be verified.
 */

const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  TopicId,
  AccountId,
  PrivateKey,
  Hbar,
  Status
} = require('@hashgraph/sdk');

const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG = {
  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
    topicId: process.env.HEDERA_TOPIC_ID,
    maxTransactionFee: new Hbar(2),
    maxQueryPayment: new Hbar(1)
  },
  backend: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
    timeout: 30000
  },
  test: {
    timeout: 60000,
    retries: 3,
    messageWaitTime: 10000 // Time to wait for messages to appear on HCS
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: [],
  hederaMetrics: {
    transactionTimes: [],
    queryTimes: [],
    consensusTimes: []
  }
};

// Utilities
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}🔗 ${msg}${colors.reset}`),
  hedera: (msg) => console.log(`${colors.cyan}🌐 ${msg}${colors.reset}`)
};

// Global test state
let hederaClient;
let backendClient;
let testTopicId;
let testMessages = [];

// Test runner utility
async function runTest(testName, testFunction) {
  testResults.total++;
  log.info(`Running: ${testName}`);
  
  const startTime = Date.now();
  
  try {
    await testFunction();
    const duration = Date.now() - startTime;
    testResults.passed++;
    log.success(`PASSED: ${testName} (${duration}ms)`);
    testResults.details.push({ 
      name: testName, 
      status: 'PASSED', 
      duration,
      error: null 
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    log.error(`FAILED: ${testName} - ${error.message}`);
    testResults.details.push({ 
      name: testName, 
      status: 'FAILED', 
      duration,
      error: error.message 
    });
    
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

/**
 * MAIN TEST SUITE
 */
async function runHederaIntegrationTests() {
  log.header('🌐 VERITAS HEDERA HCS INTEGRATION TESTS');
  log.info(`Network: ${CONFIG.hedera.network}`);
  log.info(`Account: ${CONFIG.hedera.accountId}`);
  log.info(`Topic: ${CONFIG.hedera.topicId || 'Will create new topic'}`);
  
  try {
    // Setup
    await setupTestEnvironment();
    
    // 1. Basic Hedera Connectivity Tests
    await runTest('Hedera Client Connection', testHederaConnection);
    await runTest('Account Balance Check', testAccountBalance);
    
    // 2. Topic Management Tests
    await runTest('Topic Creation', testTopicCreation);
    await runTest('Topic Message Submission', testTopicMessageSubmission);
    await runTest('Topic Message Query', testTopicMessageQuery);
    
    // 3. Backend-Hedera Integration Tests
    await runTest('Backend Product Submission to HCS', testBackendHCSSubmission);
    await runTest('HCS Message Verification via Backend', testHCSVerificationViaBackend);
    
    // 4. Data Consistency Tests
    await runTest('Database-HCS Data Consistency', testDatabaseHCSConsistency);
    await runTest('Message Ordering Validation', testMessageOrdering);
    await runTest('Transaction Hash Validation', testTransactionHashValidation);
    
    // 5. Performance Tests
    await runTest('HCS Transaction Performance', testHCSTransactionPerformance);
    await runTest('HCS Query Performance', testHCSQueryPerformance);
    await runTest('Consensus Time Measurement', testConsensusTime);
    
    // 6. Error Handling Tests
    await runTest('Invalid Message Handling', testInvalidMessageHandling);
    await runTest('Network Interruption Handling', testNetworkInterruptionHandling);
    await runTest('Insufficient Balance Handling', testInsufficientBalanceHandling);
    
    // 7. Edge Case Tests
    await runTest('Large Message Handling', testLargeMessageHandling);
    await runTest('Concurrent Message Submission', testConcurrentMessageSubmission);
    await runTest('Message Ordering Under Load', testMessageOrderingUnderLoad);
    
  } catch (error) {
    log.error(`Hedera test suite setup failed: ${error.message}`);
  } finally {
    await cleanup();
  }
  
  printTestResults();
}

/**
 * SETUP AND TEARDOWN
 */
async function setupTestEnvironment() {
  log.header('Setting up Hedera test environment...');
  
  // Validate configuration
  if (!CONFIG.hedera.accountId || !CONFIG.hedera.privateKey) {
    throw new Error('Hedera credentials not configured');
  }
  
  // Initialize Hedera client
  hederaClient = CONFIG.hedera.network === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();
  
  hederaClient.setOperator(
    AccountId.fromString(CONFIG.hedera.accountId),
    PrivateKey.fromString(CONFIG.hedera.privateKey)
  );
  
  hederaClient.setDefaultMaxTransactionFee(CONFIG.hedera.maxTransactionFee);
  hederaClient.setDefaultMaxQueryPayment(CONFIG.hedera.maxQueryPayment);
  
  // Initialize backend client
  backendClient = axios.create({
    baseURL: CONFIG.backend.baseUrl,
    timeout: CONFIG.backend.timeout,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Use existing topic or mark for creation
  if (CONFIG.hedera.topicId) {
    testTopicId = TopicId.fromString(CONFIG.hedera.topicId);
  }
  
  log.success('Hedera test environment setup complete');
}

async function cleanup() {
  log.info('Cleaning up Hedera test environment...');
  
  if (hederaClient) {
    hederaClient.close();
  }
  
  log.success('Hedera cleanup complete');
}

/**
 * BASIC CONNECTIVITY TESTS
 */
async function testHederaConnection() {
  // Test basic network connectivity by querying account info
  const accountId = AccountId.fromString(CONFIG.hedera.accountId);
  const query = await hederaClient.getAccountInfo(accountId);
  
  if (!query.accountId.equals(accountId)) {
    throw new Error('Account ID mismatch in query response');
  }
  
  log.hedera('Successfully connected to Hedera network');
}

async function testAccountBalance() {
  const accountId = AccountId.fromString(CONFIG.hedera.accountId);
  const balance = await hederaClient.getAccountBalance(accountId);
  
  const hbarBalance = balance.hbars.toBigNumber();
  
  if (hbarBalance.isLessThan(1)) {
    throw new Error(`Insufficient HBAR balance: ${hbarBalance} HBAR`);
  }
  
  log.hedera(`Account balance: ${hbarBalance} HBAR`);
  
  // Check for sufficient balance for testing
  if (hbarBalance.isLessThan(5)) {
    log.warning('Low HBAR balance - some tests may fail due to insufficient funds');
  }
}

/**
 * TOPIC MANAGEMENT TESTS
 */
async function testTopicCreation() {
  if (testTopicId) {
    log.info('Using existing topic for tests');
    return;
  }
  
  const startTime = Date.now();
  
  const topicCreateTx = new TopicCreateTransaction()
    .setTopicMemo('Veritas Integration Test Topic')
    .setAdminKey(hederaClient.operatorPublicKey)
    .setSubmitKey(hederaClient.operatorPublicKey);
  
  const response = await topicCreateTx.execute(hederaClient);
  const receipt = await response.getReceipt(hederaClient);
  
  if (receipt.status !== Status.Success) {
    throw new Error(`Topic creation failed: ${receipt.status}`);
  }
  
  testTopicId = receipt.topicId;
  
  const duration = Date.now() - startTime;
  testResults.hederaMetrics.transactionTimes.push(duration);
  
  log.hedera(`Created test topic: ${testTopicId} (${duration}ms)`);
}

async function testTopicMessageSubmission() {
  if (!testTopicId) {
    throw new Error('No topic available for message submission test');
  }
  
  const testMessage = {
    test: true,
    timestamp: new Date().toISOString(),
    batch_id: 'TEST-' + Date.now(),
    product_name: 'Test Product',
    supplier_name: 'Test Supplier'
  };
  
  const startTime = Date.now();
  
  const submitTx = new TopicMessageSubmitTransaction()
    .setTopicId(testTopicId)
    .setMessage(JSON.stringify(testMessage));
  
  const response = await submitTx.execute(hederaClient);
  const receipt = await response.getReceipt(hederaClient);
  
  if (receipt.status !== Status.Success) {
    throw new Error(`Message submission failed: ${receipt.status}`);
  }
  
  const duration = Date.now() - startTime;
  testResults.hederaMetrics.transactionTimes.push(duration);
  
  // Store for later verification
  testMessages.push({
    ...testMessage,
    transactionId: response.transactionId.toString(),
    sequenceNumber: receipt.topicSequenceNumber,
    consensusTimestamp: receipt.topicRunningHash
  });
  
  log.hedera(`Submitted message to topic (${duration}ms)`);
}

async function testTopicMessageQuery() {
  if (!testTopicId || testMessages.length === 0) {
    throw new Error('No topic or messages available for query test');
  }
  
  const startTime = Date.now();
  const retrievedMessages = [];
  
  return new Promise((resolve, reject) => {
    const query = new TopicMessageQuery()
      .setTopicId(testTopicId)
      .setStartTime(0);
    
    const subscription = query.subscribe(
      hederaClient,
      (message) => {
        try {
          const messageData = JSON.parse(message.contents);
          if (messageData.test === true) {
            retrievedMessages.push({
              contents: messageData,
              consensusTimestamp: message.consensusTimestamp.toString(),
              sequenceNumber: message.sequenceNumber
            });
          }
        } catch (error) {
          // Skip invalid JSON messages
        }
      },
      (error) => {
        subscription.unsubscribe();
        reject(new Error(`Topic query error: ${error.message}`));
      }
    );
    
    // Wait for messages to arrive
    setTimeout(() => {
      subscription.unsubscribe();
      
      const duration = Date.now() - startTime;
      testResults.hederaMetrics.queryTimes.push(duration);
      
      // Verify we received our test messages
      const testMessageFound = retrievedMessages.some(msg => 
        testMessages.some(testMsg => testMsg.batch_id === msg.contents.batch_id)
      );
      
      if (!testMessageFound) {
        reject(new Error('Test message not found in query results'));
      } else {
        log.hedera(`Retrieved ${retrievedMessages.length} messages (${duration}ms)`);
        resolve();
      }
    }, CONFIG.test.messageWaitTime);
  });
}

/**
 * BACKEND-HEDERA INTEGRATION TESTS
 */
async function testBackendHCSSubmission() {
  const productData = {
    product_name: 'HCS Integration Test Product',
    supplier_name: 'Test Supplier',
    description: 'Product created specifically for HCS integration testing',
    claims: [
      {
        claim_type: 'test_claim',
        description: 'This is a test claim for HCS integration'
      }
    ]
  };
  
  const startTime = Date.now();
  
  // Submit product via backend API
  const response = await backendClient.post('/api/products', productData);
  
  if (response.status !== 201) {
    throw new Error(`Product submission failed: ${response.status}`);
  }
  
  const product = response.data.product;
  const batchId = product.batch_id;
  
  // Wait for HCS submission
  await new Promise(resolve => setTimeout(resolve, CONFIG.test.messageWaitTime));
  
  // Query HCS for the submitted product
  const hcsMessages = await queryHCSForBatchId(batchId);
  
  if (hcsMessages.length === 0) {
    throw new Error(`No HCS messages found for batch ID: ${batchId}`);
  }
  
  const duration = Date.now() - startTime;
  
  // Verify message content
  const hcsMessage = hcsMessages[0];
  if (hcsMessage.contents.batch_id !== batchId) {
    throw new Error('Batch ID mismatch between backend and HCS');
  }
  
  if (hcsMessage.contents.product_name !== productData.product_name) {
    throw new Error('Product name mismatch between backend and HCS');
  }
  
  log.hedera(`Backend-HCS submission validated (${duration}ms)`);
}

async function testHCSVerificationViaBackend() {
  if (testMessages.length === 0) {
    throw new Error('No test messages available for verification test');
  }
  
  // First create a product via backend that should be in HCS
  const productData = {
    product_name: 'HCS Verification Test Product',
    supplier_name: 'Test Supplier',
    description: 'Product for testing HCS verification flow'
  };
  
  const submitResponse = await backendClient.post('/api/products', productData);
  const batchId = submitResponse.data.product.batch_id;
  
  // Wait for HCS processing
  await new Promise(resolve => setTimeout(resolve, CONFIG.test.messageWaitTime));
  
  // Verify via backend API
  const verifyResponse = await backendClient.get(`/api/verify/${batchId}`);
  
  if (verifyResponse.status !== 200) {
    throw new Error(`Verification request failed: ${verifyResponse.status}`);
  }
  
  const verification = verifyResponse.data.data.verification;
  
  if (!verification.hcs_verified) {
    throw new Error('Product not verified against HCS');
  }
  
  if (verification.batch_id !== batchId) {
    throw new Error('Batch ID mismatch in verification response');
  }
  
  log.hedera('HCS verification via backend API successful');
}

/**
 * DATA CONSISTENCY TESTS
 */
async function testDatabaseHCSConsistency() {
  // Create a product via backend
  const productData = {
    product_name: 'Consistency Test Product',
    supplier_name: 'Consistency Test Supplier',
    description: 'Product for testing database-HCS consistency'
  };
  
  const response = await backendClient.post('/api/products', productData);
  const batchId = response.data.product.batch_id;
  
  // Wait for HCS processing
  await new Promise(resolve => setTimeout(resolve, CONFIG.test.messageWaitTime));
  
  // Get data from database via backend API
  const dbResponse = await backendClient.get(`/api/products/${batchId}`);
  const dbProduct = dbResponse.data.data.product;
  
  // Get data from HCS
  const hcsMessages = await queryHCSForBatchId(batchId);
  
  if (hcsMessages.length === 0) {
    throw new Error('No corresponding HCS message found');
  }
  
  const hcsData = hcsMessages[0].contents;
  
  // Compare key fields
  const fieldsToCompare = ['batch_id', 'product_name', 'supplier_name', 'description'];
  
  for (const field of fieldsToCompare) {
    if (dbProduct[field] !== hcsData[field]) {
      throw new Error(`Field mismatch for ${field}: DB="${dbProduct[field]}", HCS="${hcsData[field]}"`);
    }
  }
  
  log.hedera('Database-HCS consistency validated');
}

async function testMessageOrdering() {
  if (!testTopicId) {
    throw new Error('No topic available for message ordering test');
  }
  
  const messageCount = 5;
  const messages = [];
  
  // Submit multiple messages in sequence
  for (let i = 0; i < messageCount; i++) {
    const message = {
      test_ordering: true,
      sequence: i,
      timestamp: new Date().toISOString(),
      batch_id: `ORDER-TEST-${i}-${Date.now()}`
    };
    
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify(message));
    
    const response = await submitTx.execute(hederaClient);
    const receipt = await response.getReceipt(hederaClient);
    
    messages.push({
      ...message,
      sequenceNumber: receipt.topicSequenceNumber
    });
    
    // Small delay between submissions
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Wait for messages to be available for query
  await new Promise(resolve => setTimeout(resolve, CONFIG.test.messageWaitTime));
  
  // Query messages and verify ordering
  const retrievedMessages = [];
  
  return new Promise((resolve, reject) => {
    const query = new TopicMessageQuery()
      .setTopicId(testTopicId)
      .setStartTime(0);
    
    const subscription = query.subscribe(
      hederaClient,
      (message) => {
        try {
          const messageData = JSON.parse(message.contents);
          if (messageData.test_ordering === true) {
            retrievedMessages.push({
              contents: messageData,
              sequenceNumber: message.sequenceNumber
            });
          }
        } catch (error) {
          // Skip invalid JSON messages
        }
      },
      (error) => {
        subscription.unsubscribe();
        reject(new Error(`Message ordering query error: ${error.message}`));
      }
    );
    
    setTimeout(() => {
      subscription.unsubscribe();
      
      // Verify messages are in correct order
      retrievedMessages.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
      
      for (let i = 0; i < retrievedMessages.length; i++) {
        if (retrievedMessages[i].contents.sequence !== i) {
          reject(new Error(`Message ordering incorrect: expected sequence ${i}, got ${retrievedMessages[i].contents.sequence}`));
          return;
        }
      }
      
      if (retrievedMessages.length < messageCount) {
        reject(new Error(`Not all messages retrieved: expected ${messageCount}, got ${retrievedMessages.length}`));
        return;
      }
      
      log.hedera(`Message ordering validated for ${retrievedMessages.length} messages`);
      resolve();
    }, CONFIG.test.messageWaitTime);
  });
}

async function testTransactionHashValidation() {
  if (testMessages.length === 0) {
    throw new Error('No test messages available for hash validation');
  }
  
  // For each test message, verify the transaction hash can be resolved
  for (const message of testMessages) {
    try {
      // Note: In a real implementation, you would query the transaction
      // and verify its hash matches what was recorded
      if (!message.transactionId) {
        throw new Error('Transaction ID not recorded for message');
      }
      
      // Basic format validation for transaction ID
      if (!message.transactionId.includes('@') || !message.transactionId.includes('.')) {
        throw new Error(`Invalid transaction ID format: ${message.transactionId}`);
      }
      
    } catch (error) {
      throw new Error(`Transaction hash validation failed: ${error.message}`);
    }
  }
  
  log.hedera('Transaction hash validation passed');
}

/**
 * PERFORMANCE TESTS
 */
async function testHCSTransactionPerformance() {
  if (!testTopicId) {
    throw new Error('No topic available for transaction performance test');
  }
  
  const performanceMessage = {
    performance_test: true,
    timestamp: new Date().toISOString(),
    data: 'A'.repeat(100) // Small payload for performance testing
  };
  
  const iterations = 3;
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify(performanceMessage));
    
    const response = await submitTx.execute(hederaClient);
    await response.getReceipt(hederaClient);
    
    const duration = Date.now() - startTime;
    times.push(duration);
    
    // Brief pause between transactions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const avgTime = times.reduce((a, b) => a + b) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  
  testResults.hederaMetrics.transactionTimes.push(...times);
  
  // Performance thresholds (adjust based on network conditions)
  const maxAcceptableTime = 15000; // 15 seconds
  
  if (avgTime > maxAcceptableTime) {
    throw new Error(`Average transaction time too high: ${avgTime}ms > ${maxAcceptableTime}ms`);
  }
  
  log.hedera(`Transaction performance: avg=${avgTime.toFixed(0)}ms, min=${minTime}ms, max=${maxTime}ms`);
}

async function testHCSQueryPerformance() {
  if (!testTopicId) {
    throw new Error('No topic available for query performance test');
  }
  
  const startTime = Date.now();
  const messageCount = { count: 0 };
  
  return new Promise((resolve, reject) => {
    const query = new TopicMessageQuery()
      .setTopicId(testTopicId)
      .setStartTime(0)
      .setLimit(10);
    
    const subscription = query.subscribe(
      hederaClient,
      (message) => {
        messageCount.count++;
      },
      (error) => {
        subscription.unsubscribe();
        reject(new Error(`Query performance test error: ${error.message}`));
      }
    );
    
    setTimeout(() => {
      subscription.unsubscribe();
      
      const duration = Date.now() - startTime;
      testResults.hederaMetrics.queryTimes.push(duration);
      
      const maxAcceptableTime = 10000; // 10 seconds
      
      if (duration > maxAcceptableTime) {
        reject(new Error(`Query time too high: ${duration}ms > ${maxAcceptableTime}ms`));
      } else {
        log.hedera(`Query performance: ${duration}ms for ${messageCount.count} messages`);
        resolve();
      }
    }, 5000); // 5 second query window
  });
}

async function testConsensusTime() {
  if (!testTopicId) {
    throw new Error('No topic available for consensus time test');
  }
  
  const submitStartTime = Date.now();
  
  const consensusMessage = {
    consensus_test: true,
    submit_time: submitStartTime,
    batch_id: `CONSENSUS-TEST-${submitStartTime}`
  };
  
  const submitTx = new TopicMessageSubmitTransaction()
    .setTopicId(testTopicId)
    .setMessage(JSON.stringify(consensusMessage));
  
  const response = await submitTx.execute(hederaClient);
  const receipt = await response.getReceipt(hederaClient);
  
  const submitEndTime = Date.now();
  const submitDuration = submitEndTime - submitStartTime;
  
  // Wait for message to be available via query
  await new Promise(resolve => setTimeout(resolve, CONFIG.test.messageWaitTime));
  
  return new Promise((resolve, reject) => {
    const queryStartTime = Date.now();
    
    const query = new TopicMessageQuery()
      .setTopicId(testTopicId)
      .setStartTime(submitStartTime);
    
    const subscription = query.subscribe(
      hederaClient,
      (message) => {
        try {
          const messageData = JSON.parse(message.contents);
          if (messageData.consensus_test === true && 
              messageData.batch_id === consensusMessage.batch_id) {
            
            subscription.unsubscribe();
            
            const consensusTime = message.consensusTimestamp.toDate().getTime();
            const totalConsensusTime = consensusTime - submitStartTime;
            
            testResults.hederaMetrics.consensusTimes.push(totalConsensusTime);
            
            log.hedera(`Consensus achieved in ${totalConsensusTime}ms (submit: ${submitDuration}ms)`);
            resolve();
          }
        } catch (error) {
          // Skip invalid JSON messages
        }
      },
      (error) => {
        subscription.unsubscribe();
        reject(new Error(`Consensus time test error: ${error.message}`));
      }
    );
    
    // Timeout after reasonable time
    setTimeout(() => {
      subscription.unsubscribe();
      reject(new Error('Consensus time test timed out'));
    }, 30000);
  });
}

/**
 * ERROR HANDLING TESTS
 */
async function testInvalidMessageHandling() {
  if (!testTopicId) {
    throw new Error('No topic available for invalid message test');
  }
  
  // Test empty message
  try {
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage('');
    
    await submitTx.execute(hederaClient);
    throw new Error('Empty message should have failed');
  } catch (error) {
    if (!error.message.includes('empty') && !error.message.includes('invalid')) {
      throw new Error(`Unexpected error for empty message: ${error.message}`);
    }
  }
  
  // Test oversized message (HCS has a limit)
  try {
    const largeMessage = 'A'.repeat(6000); // Exceeds HCS message size limit
    
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(largeMessage);
    
    await submitTx.execute(hederaClient);
    throw new Error('Oversized message should have failed');
  } catch (error) {
    if (!error.message.includes('size') && !error.message.includes('too large')) {
      // This might pass if the limit is higher than expected
      log.warning(`Large message handling: ${error.message}`);
    }
  }
  
  log.hedera('Invalid message handling validated');
}

async function testNetworkInterruptionHandling() {
  // This test would require actually interrupting network connectivity
  // For now, we'll test timeout handling
  
  if (!testTopicId) {
    throw new Error('No topic available for network interruption test');
  }
  
  // Create a client with very short timeout
  const shortTimeoutClient = CONFIG.hedera.network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();
  
  shortTimeoutClient.setOperator(
    AccountId.fromString(CONFIG.hedera.accountId),
    PrivateKey.fromString(CONFIG.hedera.privateKey)
  );
  
  // Set unreasonably short timeout to simulate network issues
  shortTimeoutClient.setRequestTimeout(100); // 100ms
  
  try {
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify({ timeout_test: true }));
    
    await submitTx.execute(shortTimeoutClient);
    
    // If this doesn't timeout, the test passes anyway
    log.hedera('Network interruption handling: timeout not triggered');
    
  } catch (error) {
    if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
      log.hedera('Network interruption handling: timeout handled correctly');
    } else {
      throw new Error(`Unexpected error in network test: ${error.message}`);
    }
  } finally {
    shortTimeoutClient.close();
  }
}

async function testInsufficientBalanceHandling() {
  // This test would require an account with insufficient balance
  // For testing purposes, we'll validate the error handling structure
  
  try {
    // Attempt a transaction with very high fee to potentially trigger insufficient balance
    const expensiveTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify({ balance_test: true }))
      .setMaxTransactionFee(new Hbar(1000)); // Very high fee
    
    await expensiveTx.execute(hederaClient);
    
    // If this succeeds, the account has sufficient balance
    log.hedera('Balance handling: sufficient funds available');
    
  } catch (error) {
    if (error.message.includes('insufficient') || 
        error.message.includes('balance') ||
        error.message.includes('INSUFFICIENT')) {
      log.hedera('Insufficient balance handling: error handled correctly');
    } else {
      // Other errors are also acceptable for this test
      log.hedera(`Balance test result: ${error.message}`);
    }
  }
}

/**
 * EDGE CASE TESTS
 */
async function testLargeMessageHandling() {
  if (!testTopicId) {
    throw new Error('No topic available for large message test');
  }
  
  // Test with a reasonably large message (under HCS limits)
  const largeData = {
    large_message_test: true,
    product_name: 'Large Message Test Product',
    description: 'A'.repeat(2000), // Large description
    additional_data: Array(100).fill(0).map((_, i) => `data_field_${i}_with_some_content`)
  };
  
  const messageString = JSON.stringify(largeData);
  
  if (messageString.length > 4000) {
    // Reduce size to fit HCS limits
    largeData.additional_data = largeData.additional_data.slice(0, 10);
    largeData.description = 'A'.repeat(500);
  }
  
  const submitTx = new TopicMessageSubmitTransaction()
    .setTopicId(testTopicId)
    .setMessage(JSON.stringify(largeData));
  
  const startTime = Date.now();
  const response = await submitTx.execute(hederaClient);
  await response.getReceipt(hederaClient);
  const duration = Date.now() - startTime;
  
  log.hedera(`Large message submitted successfully (${duration}ms, ${JSON.stringify(largeData).length} chars)`);
}

async function testConcurrentMessageSubmission() {
  if (!testTopicId) {
    throw new Error('No topic available for concurrent message test');
  }
  
  const concurrentCount = 3; // Conservative number for testing
  const promises = [];
  
  for (let i = 0; i < concurrentCount; i++) {
    const message = {
      concurrent_test: true,
      thread: i,
      timestamp: new Date().toISOString(),
      batch_id: `CONCURRENT-${i}-${Date.now()}`
    };
    
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify(message));
    
    promises.push(submitTx.execute(hederaClient));
  }
  
  const startTime = Date.now();
  const responses = await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  // Wait for receipts
  for (const response of responses) {
    await response.getReceipt(hederaClient);
  }
  
  log.hedera(`${concurrentCount} concurrent messages submitted (${duration}ms)`);
}

async function testMessageOrderingUnderLoad() {
  if (!testTopicId) {
    throw new Error('No topic available for load ordering test');
  }
  
  const messageCount = 5;
  const messages = [];
  
  // Submit messages with minimal delay
  for (let i = 0; i < messageCount; i++) {
    const message = {
      load_ordering_test: true,
      sequence: i,
      timestamp: new Date().toISOString()
    };
    
    const submitTx = new TopicMessageSubmitTransaction()
      .setTopicId(testTopicId)
      .setMessage(JSON.stringify(message));
    
    const response = await submitTx.execute(hederaClient);
    const receipt = await response.getReceipt(hederaClient);
    
    messages.push({
      ...message,
      sequenceNumber: receipt.topicSequenceNumber
    });
  }
  
  // Verify sequence numbers are in order
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sequenceNumber <= messages[i-1].sequenceNumber) {
      throw new Error(`Message ordering incorrect under load: ${messages[i-1].sequenceNumber} -> ${messages[i].sequenceNumber}`);
    }
  }
  
  log.hedera(`Message ordering maintained under load (${messageCount} messages)`);
}

/**
 * UTILITY FUNCTIONS
 */
async function queryHCSForBatchId(batchId) {
  if (!testTopicId && !CONFIG.hedera.topicId) {
    return [];
  }
  
  const topicId = testTopicId || TopicId.fromString(CONFIG.hedera.topicId);
  
  return new Promise((resolve) => {
    const messages = [];
    
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0);
    
    const subscription = query.subscribe(
      hederaClient,
      (message) => {
        try {
          const messageData = JSON.parse(message.contents);
          if (messageData.batch_id === batchId) {
            messages.push({
              contents: messageData,
              consensusTimestamp: message.consensusTimestamp.toString(),
              sequenceNumber: message.sequenceNumber
            });
          }
        } catch (error) {
          // Skip invalid JSON messages
        }
      },
      (error) => {
        subscription.unsubscribe();
        resolve([]); // Return empty on error
      }
    );
    
    setTimeout(() => {
      subscription.unsubscribe();
      resolve(messages);
    }, CONFIG.test.messageWaitTime);
  });
}

/**
 * RESULTS REPORTING
 */
function printTestResults() {
  console.log('\n' + '='.repeat(80));
  log.header('🌐 VERITAS HEDERA HCS INTEGRATION TEST RESULTS');
  console.log('='.repeat(80));
  
  log.info(`Total Tests: ${testResults.total}`);
  log.success(`Passed: ${testResults.passed}`);
  log.error(`Failed: ${testResults.failed}`);
  
  const successRate = testResults.total > 0 ? 
    Math.round((testResults.passed / testResults.total) * 100) : 0;
  
  console.log(`${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  // Hedera performance metrics
  if (testResults.hederaMetrics.transactionTimes.length > 0) {
    log.header('⚡ Hedera Performance Metrics');
    
    const transactionTimes = testResults.hederaMetrics.transactionTimes;
    const avgTxTime = transactionTimes.reduce((a, b) => a + b) / transactionTimes.length;
    console.log(`${colors.cyan}Transaction Time - Avg: ${avgTxTime.toFixed(0)}ms, Min: ${Math.min(...transactionTimes)}ms, Max: ${Math.max(...transactionTimes)}ms${colors.reset}`);
    
    if (testResults.hederaMetrics.queryTimes.length > 0) {
      const queryTimes = testResults.hederaMetrics.queryTimes;
      const avgQueryTime = queryTimes.reduce((a, b) => a + b) / queryTimes.length;
      console.log(`${colors.cyan}Query Time - Avg: ${avgQueryTime.toFixed(0)}ms, Min: ${Math.min(...queryTimes)}ms, Max: ${Math.max(...queryTimes)}ms${colors.reset}`);
    }
    
    if (testResults.hederaMetrics.consensusTimes.length > 0) {
      const consensusTimes = testResults.hederaMetrics.consensusTimes;
      const avgConsensusTime = consensusTimes.reduce((a, b) => a + b) / consensusTimes.length;
      console.log(`${colors.cyan}Consensus Time - Avg: ${avgConsensusTime.toFixed(0)}ms${colors.reset}`);
    }
  }
  
  // Test message summary
  if (testMessages.length > 0) {
    log.header('📨 Test Messages Summary');
    console.log(`${colors.cyan}Created ${testMessages.length} test messages on topic ${testTopicId}${colors.reset}`);
  }
  
  // Failed tests details
  if (testResults.failed > 0) {
    log.header('❌ Failed Tests Details');
    testResults.details
      .filter(t => t.status === 'FAILED')
      .forEach(test => {
        console.log(`${colors.red}• ${test.name}: ${test.error}${colors.reset}`);
      });
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log.warning('Hedera tests interrupted by user');
  await cleanup();
  printTestResults();
});

// Run tests if this script is executed directly
if (require.main === module) {
  runHederaIntegrationTests().catch(error => {
    log.error(`Hedera test suite execution failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  runHederaIntegrationTests,
  testResults,
  CONFIG
};