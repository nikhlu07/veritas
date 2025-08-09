const db = require('../db/connection');

/**
 * Generate a unique batch ID with the given prefix
 * Format: PREFIX-YYYY-XXXX where XXXX is a random 4-digit number
 * 
 * @param {string} prefix - The prefix for the batch ID (default: 'PRODUCT')
 * @returns {Promise<string>} - A unique batch ID
 */
async function generateBatchId(prefix = 'PRODUCT') {
  const currentYear = new Date().getFullYear();
  const maxAttempts = 100;
  let attempt = 0;

  while (attempt < maxAttempts) {
    // Generate random 4-digit number
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const batchId = `${prefix.toUpperCase()}-${currentYear}-${randomDigits}`;

    try {
      // Check if this batch ID already exists
      const existingProduct = await db.query(
        'SELECT id FROM products WHERE batch_id = $1', 
        [batchId]
      );

      if (existingProduct.rows.length === 0) {
        // Batch ID is unique
        return batchId;
      }

      attempt++;
    } catch (error) {
      console.error(`Error checking batch ID uniqueness: ${error.message}`);
      throw new Error(`Failed to generate unique batch ID: ${error.message}`);
    }
  }

  // If we can't generate a unique ID after many attempts, use timestamp
  const timestamp = Date.now().toString().slice(-4);
  const fallbackId = `${prefix.toUpperCase()}-${currentYear}-${timestamp}`;
  
  console.warn(`Using timestamp-based batch ID after ${maxAttempts} attempts: ${fallbackId}`);
  return fallbackId;
}

/**
 * Extract prefix from product name
 * Takes the first word and cleans it for use as a prefix
 * 
 * @param {string} productName - The product name
 * @returns {string} - A clean prefix for batch ID generation
 */
function extractPrefixFromProductName(productName) {
  if (!productName || typeof productName !== 'string') {
    return 'PRODUCT';
  }

  // Take first word, convert to uppercase, remove special characters
  const firstWord = productName.trim().split(' ')[0];
  const cleanPrefix = firstWord
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove non-alphanumeric characters
    .substring(0, 10); // Limit length to 10 characters

  // Ensure we have a valid prefix
  return cleanPrefix.length > 0 ? cleanPrefix : 'PRODUCT';
}

/**
 * Validate batch ID format
 * 
 * @param {string} batchId - The batch ID to validate
 * @returns {boolean} - True if valid format
 */
function validateBatchIdFormat(batchId) {
  if (!batchId || typeof batchId !== 'string') {
    return false;
  }

  // Check format: PREFIX-YYYY-XXXX
  const batchIdRegex = /^[A-Z0-9]+-\d{4}-\d{4}$/;
  return batchIdRegex.test(batchId);
}

/**
 * Parse batch ID components
 * 
 * @param {string} batchId - The batch ID to parse
 * @returns {object|null} - Object with prefix, year, and number, or null if invalid
 */
function parseBatchId(batchId) {
  if (!validateBatchIdFormat(batchId)) {
    return null;
  }

  const parts = batchId.split('-');
  return {
    prefix: parts[0],
    year: parseInt(parts[1]),
    number: parts[2],
    full: batchId
  };
}

/**
 * Generate batch ID statistics for a given prefix
 * 
 * @param {string} prefix - The prefix to get statistics for
 * @returns {Promise<object>} - Statistics object
 */
async function getBatchIdStatistics(prefix) {
  try {
    const currentYear = new Date().getFullYear();
    const prefixPattern = `${prefix.toUpperCase()}-${currentYear}-%`;

    const result = await db.query(`
      SELECT 
        COUNT(*) as total_count,
        MIN(batch_id) as first_batch_id,
        MAX(batch_id) as last_batch_id,
        MIN(created_at) as first_created,
        MAX(created_at) as last_created
      FROM products 
      WHERE batch_id LIKE $1
    `, [prefixPattern]);

    const stats = result.rows[0];

    return {
      prefix: prefix.toUpperCase(),
      year: currentYear,
      totalCount: parseInt(stats.total_count) || 0,
      firstBatchId: stats.first_batch_id,
      lastBatchId: stats.last_batch_id,
      firstCreated: stats.first_created,
      lastCreated: stats.last_created,
      pattern: prefixPattern
    };
  } catch (error) {
    console.error(`Error getting batch ID statistics: ${error.message}`);
    throw error;
  }
}

/**
 * Get all unique prefixes used in batch IDs
 * 
 * @returns {Promise<Array>} - Array of prefix statistics
 */
async function getAllPrefixes() {
  try {
    const result = await db.query(`
      SELECT 
        SPLIT_PART(batch_id, '-', 1) as prefix,
        COUNT(*) as count,
        MIN(created_at) as first_used,
        MAX(created_at) as last_used
      FROM products 
      GROUP BY SPLIT_PART(batch_id, '-', 1)
      ORDER BY count DESC, first_used ASC
    `);

    return result.rows.map(row => ({
      prefix: row.prefix,
      count: parseInt(row.count),
      firstUsed: row.first_used,
      lastUsed: row.last_used
    }));
  } catch (error) {
    console.error(`Error getting all prefixes: ${error.message}`);
    throw error;
  }
}

/**
 * Check if a batch ID exists in the database
 * 
 * @param {string} batchId - The batch ID to check
 * @returns {Promise<boolean>} - True if exists
 */
async function batchIdExists(batchId) {
  try {
    const result = await db.query(
      'SELECT 1 FROM products WHERE batch_id = $1', 
      [batchId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking batch ID existence: ${error.message}`);
    throw error;
  }
}

/**
 * Generate multiple batch IDs at once (for batch operations)
 * 
 * @param {string} prefix - The prefix for batch IDs
 * @param {number} count - Number of batch IDs to generate
 * @returns {Promise<Array>} - Array of unique batch IDs
 */
async function generateMultipleBatchIds(prefix, count) {
  const batchIds = [];
  const maxAttempts = count * 10; // Allow some retries
  let attempts = 0;

  while (batchIds.length < count && attempts < maxAttempts) {
    try {
      const batchId = await generateBatchId(prefix);
      
      // Check if we already generated this ID in this batch
      if (!batchIds.includes(batchId)) {
        batchIds.push(batchId);
      }
      
      attempts++;
    } catch (error) {
      console.error(`Error generating batch ID ${attempts + 1}: ${error.message}`);
      attempts++;
    }
  }

  if (batchIds.length < count) {
    console.warn(`Only generated ${batchIds.length}/${count} unique batch IDs`);
  }

  return batchIds;
}

module.exports = {
  generateBatchId,
  extractPrefixFromProductName,
  validateBatchIdFormat,
  parseBatchId,
  getBatchIdStatistics,
  getAllPrefixes,
  batchIdExists,
  generateMultipleBatchIds
};