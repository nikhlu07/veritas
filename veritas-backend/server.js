const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');
const { validation } = require('./utils/validation');
const db = require('./db/connection');
const hederaService = require('./utils/hedera');

// Import route modules
const productsRoutes = require('./routes/products');
const claimsRoutes = require('./routes/claims');
const verifyRoutes = require('./routes/verify');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(validation.sanitizeInput);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    
    // Test Hedera connection
    const hederaStatus = hederaService.isReady();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'veritas-backend',
      database: 'connected',
      hedera: hederaStatus ? 'ready' : 'not configured'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'veritas-backend',
      database: 'disconnected',
      hedera: 'unknown',
      error: error.message
    });
  }
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Veritas API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Use route modules
app.use('/api/products', productsRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/verify', verifyRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Veritas backend server running on port ${PORT}`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;