const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'veritas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database connection test
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('📅 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', { text, error: error.message });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

// Initialize connection test on startup
testConnection();

// Helper functions for common database operations
const helpers = {
  // Generate a new batch_id with optional prefix
  generateBatchId: async (prefix = 'PRODUCT') => {
    const result = await query('SELECT generate_batch_id($1) as batch_id', [prefix]);
    return result.rows[0].batch_id;
  },

  // Get product by batch_id
  getProductByBatchId: async (batchId) => {
    const result = await query('SELECT * FROM products WHERE batch_id = $1', [batchId]);
    return result.rows[0] || null;
  },

  // Get product with claims
  getProductWithClaims: async (productId) => {
    const result = await query(`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', c.id,
            'claim_type', c.claim_type,
            'claim_description', c.claim_description,
            'hcs_transaction_id', c.hcs_transaction_id,
            'hcs_timestamp', c.hcs_timestamp,
            'created_at', c.created_at
          )
        ) FILTER (WHERE c.id IS NOT NULL) as claims
      FROM products p
      LEFT JOIN claims c ON p.id = c.product_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [productId]);
    return result.rows[0] || null;
  },

  // Insert product with automatic batch_id generation
  insertProduct: async (productName, supplierName, description, prefix = 'PRODUCT') => {
    const batchId = await helpers.generateBatchId(prefix);
    const result = await query(`
      INSERT INTO products (batch_id, product_name, supplier_name, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [batchId, productName, supplierName, description]);
    return result.rows[0];
  },

  // Insert claim
  insertClaim: async (productId, claimType, description, hcsTransactionId = null, hcsTimestamp = null) => {
    const result = await query(`
      INSERT INTO claims (product_id, claim_type, claim_description, hcs_transaction_id, hcs_timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [productId, claimType, description, hcsTransactionId, hcsTimestamp]);
    return result.rows[0];
  },

  // Get claims by product
  getClaimsByProduct: async (productId) => {
    const result = await query(`
      SELECT * FROM claims 
      WHERE product_id = $1 
      ORDER BY created_at DESC
    `, [productId]);
    return result.rows;
  },

  // Get products with claim summary
  getProductsWithClaimSummary: async (limit = 50) => {
    const result = await query(`
      SELECT * FROM products_with_claims 
      ORDER BY created_at DESC 
      LIMIT $1
    `, [limit]);
    return result.rows;
  },

  // Search products by name or supplier
  searchProducts: async (searchTerm, limit = 20) => {
    const result = await query(`
      SELECT * FROM products 
      WHERE product_name ILIKE $1 OR supplier_name ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [`%${searchTerm}%`, limit]);
    return result.rows;
  },

  // Get database statistics
  getStatistics: async () => {
    const stats = await Promise.all([
      query('SELECT COUNT(*) as count FROM products'),
      query('SELECT COUNT(*) as count FROM claims'),
      query('SELECT claim_type, COUNT(*) as count FROM claims GROUP BY claim_type ORDER BY count DESC'),
      query('SELECT DATE(created_at) as date, COUNT(*) as count FROM products WHERE created_at >= CURRENT_DATE - INTERVAL \'30 days\' GROUP BY DATE(created_at) ORDER BY date DESC')
    ]);

    return {
      totalProducts: parseInt(stats[0].rows[0].count),
      totalClaims: parseInt(stats[1].rows[0].count),
      claimsByType: stats[2].rows,
      recentProductsByDay: stats[3].rows
    };
  }
};

module.exports = {
  query,
  transaction,
  pool,
  testConnection,
  closePool,
  helpers
};