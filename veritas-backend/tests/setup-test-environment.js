const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🔧 ${msg}${colors.reset}`)
};

// Configuration
const config = {
  projectRoot: path.join(__dirname, '..'),
  serverPort: process.env.PORT || 3001,
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`,
  testTimeout: 30000,
  maxRetries: 3
};

// Test environment setup class
class TestEnvironmentSetup {
  constructor() {
    this.serverProcess = null;
    this.isServerRunning = false;
  }

  // Check if required files exist
  async checkRequiredFiles() {
    log.header('CHECKING REQUIRED FILES');
    
    const requiredFiles = [
      'package.json',
      'server.js',
      '.env.example',
      'db/schema.sql',
      'db/connection.js',
      'db/migrations.js'
    ];

    const missingFiles = [];

    for (const file of requiredFiles) {
      const filePath = path.join(config.projectRoot, file);
      try {
        await fs.access(filePath);
        log.success(`Found: ${file}`);
      } catch (error) {
        log.error(`Missing: ${file}`);
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
  }

  // Check if dependencies are installed
  async checkDependencies() {
    log.header('CHECKING DEPENDENCIES');
    
    const nodeModulesPath = path.join(config.projectRoot, 'node_modules');
    
    try {
      await fs.access(nodeModulesPath);
      log.success('Node modules directory exists');
      
      // Check specific required packages
      const requiredPackages = ['express', 'pg', 'axios', 'joi', 'qrcode'];
      
      for (const pkg of requiredPackages) {
        const pkgPath = path.join(nodeModulesPath, pkg);
        try {
          await fs.access(pkgPath);
          log.success(`Package installed: ${pkg}`);
        } catch {
          log.warning(`Package missing: ${pkg}`);
        }
      }
      
    } catch (error) {
      log.error('Node modules directory not found');
      log.info('Installing dependencies...');
      await this.installDependencies();
    }
  }

  // Install dependencies
  async installDependencies() {
    return new Promise((resolve, reject) => {
      log.info('Running npm install...');
      
      const npmProcess = spawn('npm', ['install'], {
        cwd: config.projectRoot,
        stdio: 'inherit'
      });

      npmProcess.on('close', (code) => {
        if (code === 0) {
          log.success('Dependencies installed successfully');
          resolve();
        } else {
          log.error(`npm install failed with code ${code}`);
          reject(new Error(`npm install failed with code ${code}`));
        }
      });

      npmProcess.on('error', (error) => {
        log.error(`Failed to start npm install: ${error.message}`);
        reject(error);
      });
    });
  }

  // Check environment configuration
  async checkEnvironment() {
    log.header('CHECKING ENVIRONMENT CONFIGURATION');
    
    const envPath = path.join(config.projectRoot, '.env');
    const envExamplePath = path.join(config.projectRoot, '.env.example');
    
    try {
      await fs.access(envPath);
      log.success('.env file exists');
    } catch (error) {
      log.warning('.env file not found');
      
      try {
        const envExample = await fs.readFile(envExamplePath, 'utf8');
        await fs.writeFile(envPath, envExample);
        log.success('Created .env file from .env.example');
      } catch (copyError) {
        log.warning('Could not create .env file from example');
        log.info('You may need to configure environment variables manually');
      }
    }

    // Check critical environment variables
    const criticalVars = [
      'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'
    ];

    const missingVars = criticalVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log.warning(`Missing environment variables: ${missingVars.join(', ')}`);
      log.info('Tests will use default values where possible');
    } else {
      log.success('All critical environment variables are set');
    }
  }

  // Check database connection
  async checkDatabase() {
    log.header('CHECKING DATABASE CONNECTION');
    
    try {
      const db = require('../db/connection');
      await db.testConnection();
      log.success('Database connection successful');
      
      // Check if tables exist
      const tablesExist = await this.checkDatabaseTables();
      if (!tablesExist) {
        log.warning('Database tables not found');
        log.info('Run database migrations to create tables');
        return false;
      }
      
      return true;
    } catch (error) {
      log.error(`Database connection failed: ${error.message}`);
      log.info('Make sure PostgreSQL is running and configuration is correct');
      return false;
    }
  }

  // Check if database tables exist
  async checkDatabaseTables() {
    try {
      const db = require('../db/connection');
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('products', 'claims')
      `);
      
      if (result.rows.length === 2) {
        log.success('Database tables exist (products, claims)');
        return true;
      } else {
        log.warning(`Found ${result.rows.length}/2 required tables`);
        return false;
      }
    } catch (error) {
      log.error(`Error checking database tables: ${error.message}`);
      return false;
    }
  }

  // Setup database tables
  async setupDatabase() {
    log.header('SETTING UP DATABASE TABLES');
    
    try {
      const DatabaseMigrations = require('../db/migrations');
      const migrations = new DatabaseMigrations();
      
      log.info('Running database setup...');
      await migrations.setup({
        dropFirst: false,
        includeSampleData: true,
        includeViews: true
      });
      
      log.success('Database setup completed');
      return true;
    } catch (error) {
      log.error(`Database setup failed: ${error.message}`);
      return false;
    }
  }

  // Start the API server
  async startServer() {
    log.header('STARTING API SERVER');
    
    if (this.isServerRunning) {
      log.info('Server is already running');
      return true;
    }

    return new Promise((resolve, reject) => {
      log.info(`Starting server on port ${config.serverPort}...`);
      
      this.serverProcess = spawn('node', ['server.js'], {
        cwd: config.projectRoot,
        env: { ...process.env, NODE_ENV: 'test' }
      });

      let serverStarted = false;

      // Handle server output
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Veritas backend server running')) {
          if (!serverStarted) {
            serverStarted = true;
            this.isServerRunning = true;
            log.success(`Server started successfully on port ${config.serverPort}`);
            resolve(true);
          }
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        log.error(`Server error: ${data.toString()}`);
      });

      this.serverProcess.on('error', (error) => {
        log.error(`Failed to start server: ${error.message}`);
        reject(error);
      });

      this.serverProcess.on('close', (code) => {
        this.isServerRunning = false;
        if (!serverStarted) {
          log.error(`Server process exited with code ${code}`);
          reject(new Error(`Server failed to start, exit code: ${code}`));
        }
      });

      // Timeout if server doesn't start
      setTimeout(() => {
        if (!serverStarted) {
          log.error('Server start timeout');
          this.stopServer();
          reject(new Error('Server start timeout'));
        }
      }, 10000);
    });
  }

  // Stop the API server
  async stopServer() {
    if (this.serverProcess && !this.serverProcess.killed) {
      log.info('Stopping server...');
      this.serverProcess.kill('SIGTERM');
      this.isServerRunning = false;
      
      return new Promise((resolve) => {
        this.serverProcess.on('close', () => {
          log.success('Server stopped');
          resolve();
        });
        
        // Force kill after timeout
        setTimeout(() => {
          if (!this.serverProcess.killed) {
            this.serverProcess.kill('SIGKILL');
          }
          resolve();
        }, 5000);
      });
    }
  }

  // Wait for server to be ready
  async waitForServer(maxAttempts = 10) {
    log.info('Waiting for server to be ready...');
    
    const axios = require('axios');
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/health`, {
          timeout: 3000
        });
        
        if (response.status === 200) {
          log.success('Server is ready and responding');
          return true;
        }
      } catch (error) {
        log.info(`Health check attempt ${attempt}/${maxAttempts} failed`);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error('Server failed to respond to health checks');
  }

  // Run basic API tests
  async runBasicTests() {
    log.header('RUNNING BASIC API TESTS');
    
    try {
      const axios = require('axios');
      
      // Test health endpoint
      log.info('Testing health endpoint...');
      const healthResponse = await axios.get(`${config.apiBaseUrl}/health`);
      if (healthResponse.status === 200) {
        log.success('Health endpoint working');
      }
      
      // Test create product
      log.info('Testing product creation...');
      const productResponse = await axios.post(`${config.apiBaseUrl}/api/products`, {
        product_name: 'Test Environment Product',
        supplier_name: 'Test Supplier',
        description: 'Product created during environment setup testing'
      });
      
      if (productResponse.status === 201) {
        log.success('Product creation working');
        
        const batchId = productResponse.data.product.batch_id;
        
        // Test get product
        log.info('Testing product retrieval...');
        const getResponse = await axios.get(`${config.apiBaseUrl}/api/products/${batchId}`);
        if (getResponse.status === 200) {
          log.success('Product retrieval working');
        }
        
        // Test verification
        log.info('Testing product verification...');
        const verifyResponse = await axios.get(`${config.apiBaseUrl}/api/verify/${batchId}`);
        if (verifyResponse.status === 200) {
          log.success('Product verification working');
        }
      }
      
      log.success('Basic API tests completed successfully');
      return true;
      
    } catch (error) {
      log.error(`Basic API tests failed: ${error.message}`);
      return false;
    }
  }

  // Complete environment setup
  async setupComplete() {
    try {
      await this.checkRequiredFiles();
      await this.checkDependencies();
      await this.checkEnvironment();
      
      const dbConnected = await this.checkDatabase();
      if (!dbConnected) {
        log.warning('Database connection failed - attempting setup');
        const dbSetup = await this.setupDatabase();
        if (!dbSetup) {
          throw new Error('Database setup failed');
        }
      }
      
      await this.startServer();
      await this.waitForServer();
      await this.runBasicTests();
      
      log.header('ENVIRONMENT SETUP COMPLETED SUCCESSFULLY');
      log.success(`API server running at: ${config.apiBaseUrl}`);
      log.success('Environment is ready for testing');
      
      return true;
      
    } catch (error) {
      log.error(`Environment setup failed: ${error.message}`);
      await this.cleanup();
      throw error;
    }
  }

  // Cleanup resources
  async cleanup() {
    log.info('Cleaning up resources...');
    await this.stopServer();
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  const setup = new TestEnvironmentSetup();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    log.warning('Setup interrupted by user');
    await setup.cleanup();
    process.exit(1);
  });

  try {
    switch (command) {
      case 'full':
        log.header('FULL ENVIRONMENT SETUP');
        await setup.setupComplete();
        log.info('Press Ctrl+C to stop the server and exit');
        // Keep process alive to maintain server
        process.stdin.resume();
        break;
        
      case 'check':
        log.header('ENVIRONMENT CHECK ONLY');
        await setup.checkRequiredFiles();
        await setup.checkDependencies();
        await setup.checkEnvironment();
        await setup.checkDatabase();
        log.success('Environment check completed');
        break;
        
      case 'database':
        log.header('DATABASE SETUP ONLY');
        await setup.setupDatabase();
        break;
        
      case 'server':
        log.header('START SERVER ONLY');
        await setup.startServer();
        await setup.waitForServer();
        log.info('Press Ctrl+C to stop the server and exit');
        process.stdin.resume();
        break;
        
      case 'test':
        log.header('RUN BASIC TESTS ONLY');
        await setup.runBasicTests();
        break;
        
      default:
        console.log(`
🔧 Veritas Test Environment Setup

Usage: node setup-test-environment.js [command]

Commands:
  full     - Complete environment setup (check, install, database, server, test)
  check    - Check environment requirements only
  database - Setup database tables and sample data only
  server   - Start API server only
  test     - Run basic API tests only

Default: full

Examples:
  node setup-test-environment.js full
  node setup-test-environment.js check
  node setup-test-environment.js database
        `);
        await setup.setupComplete();
        log.info('Press Ctrl+C to stop the server and exit');
        process.stdin.resume();
    }
    
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    await setup.cleanup();
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`Setup execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = TestEnvironmentSetup;