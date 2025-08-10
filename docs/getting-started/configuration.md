# Configuration Guide ⚙️

Comprehensive configuration options for Veritas frontend and backend.

## Environment Variables

### Backend Configuration (`veritas-backend/.env`)

#### Hedera Blockchain Settings
```env
# Required: Your Hedera testnet account credentials
HEDERA_ACCOUNT_ID=0.0.1234567
HEDERA_PRIVATE_KEY=302e020100300506032b65700422042012345...
HEDERA_NETWORK=testnet
HEDERA_TOPIC_ID=0.0.7654321

# Optional: Advanced Hedera settings
HEDERA_MAX_TRANSACTION_FEE=100000000  # 1 HBAR in tinybars
HEDERA_MAX_QUERY_PAYMENT=100000000    # 1 HBAR in tinybars
```

#### Database Configuration
```env
# PostgreSQL connection (choose one method)

# Method 1: Full connection string
DATABASE_URL=postgresql://username:password@localhost:5432/veritas

# Method 2: Individual components
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=veritas_user
DB_PASSWORD=secure_password
DB_SSL=false

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
```

#### Server Configuration
```env
# Server settings
PORT=3002
NODE_ENV=development
HOST=0.0.0.0

# CORS settings
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Security settings
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12
```

#### Logging Configuration
```env
# Log levels: error, warn, info, debug
LOG_LEVEL=info
LOG_FORMAT=json

# Log file settings
LOG_FILE=logs/veritas.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

### Frontend Configuration (`veritas-frontend/.env.local`)

#### API Configuration
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3002

# API timeout settings
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_RETRY_ATTEMPTS=3
```

#### App Configuration
```env
# App metadata
NEXT_PUBLIC_APP_NAME=Veritas
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_DESCRIPTION=Blockchain-powered supply chain verification

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_QR_SCANNER=true
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
```

#### Analytics & Monitoring
```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry error tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
```

#### UI Configuration
```env
# Theme settings
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_ENABLE_DARK_MODE=true

# Branding
NEXT_PUBLIC_BRAND_COLOR=#10b981
NEXT_PUBLIC_LOGO_URL=/logo.svg
```

## Advanced Configuration

### Database Schema Configuration

#### Migration Settings
```javascript
// veritas-backend/knexfile.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
```

#### Connection Pool Configuration
```javascript
// veritas-backend/config/database.js
const config = {
  client: 'postgresql',
  connection: process.env.DATABASE_URL,
  pool: {
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
  }
};
```

### Hedera Configuration

#### Network Settings
```javascript
// veritas-backend/config/hedera.js
const { Client, PrivateKey, AccountId } = require('@hashgraph/sdk');

const client = Client.forTestnet(); // or Client.forMainnet()

client.setOperator(
  AccountId.fromString(process.env.HEDERA_ACCOUNT_ID),
  PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
);

// Set maximum fees
client.setDefaultMaxTransactionFee(new Hbar(1));
client.setDefaultMaxQueryPayment(new Hbar(1));

module.exports = client;
```

#### Topic Configuration
```javascript
// veritas-backend/config/topic.js
const topicConfig = {
  topicId: process.env.HEDERA_TOPIC_ID,
  submitKey: process.env.HEDERA_PRIVATE_KEY,
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
  timeout: 30000,   // milliseconds
};
```

### Next.js Configuration

#### Custom Next.js Config
```javascript
// veritas-frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@hashgraph/sdk'],
  },
  
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack config
    return config;
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/documentation',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### Tailwind CSS Configuration

```javascript
// veritas-frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#10b981',
          900: '#064e3b',
        },
        brand: process.env.NEXT_PUBLIC_BRAND_COLOR || '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

## Production Configuration

### Environment-Specific Settings

#### Production Backend (`.env.production`)
```env
# Hedera Mainnet
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.YOUR_MAINNET_ACCOUNT
HEDERA_PRIVATE_KEY=your_mainnet_private_key
HEDERA_TOPIC_ID=0.0.YOUR_MAINNET_TOPIC

# Production Database
DATABASE_URL=postgresql://user:pass@prod-db:5432/veritas
DB_SSL=true
DB_POOL_MAX=20

# Security
NODE_ENV=production
JWT_SECRET=super-secure-production-secret
BCRYPT_ROUNDS=15

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json
```

#### Production Frontend (`.env.production`)
```env
NEXT_PUBLIC_API_URL=https://api.veritas.app
NEXT_PUBLIC_APP_URL=https://veritas.app
NEXT_PUBLIC_GA_ID=G-PRODUCTION-ID
NEXT_PUBLIC_SENTRY_DSN=https://production-sentry-dsn
```

### Docker Configuration

#### Docker Compose Production
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./veritas-frontend
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3002
    depends_on:
      - backend

  backend:
    build:
      context: ./veritas-backend
      dockerfile: Dockerfile.prod
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/veritas
    depends_on:
      - db
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=veritas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

## Security Configuration

### SSL/TLS Configuration
```env
# Enable HTTPS
HTTPS=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# Security headers
ENABLE_HSTS=true
ENABLE_CSP=true
ENABLE_CSRF_PROTECTION=true
```

### Rate Limiting
```javascript
// veritas-backend/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;
```

## Monitoring Configuration

### Health Check Endpoints
```javascript
// veritas-backend/routes/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

### Logging Configuration
```javascript
// veritas-backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

## Configuration Validation

### Environment Validation
```javascript
// veritas-backend/config/validate.js
const Joi = require('joi');

const envSchema = Joi.object({
  HEDERA_ACCOUNT_ID: Joi.string().pattern(/^0\.0\.\d+$/).required(),
  HEDERA_PRIVATE_KEY: Joi.string().required(),
  HEDERA_NETWORK: Joi.string().valid('testnet', 'mainnet').required(),
  DATABASE_URL: Joi.string().uri().required(),
  PORT: Joi.number().port().default(3002),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVars;
```

## Troubleshooting Configuration

### Common Configuration Issues

1. **Hedera Connection Issues**
   - Verify account ID format (0.0.xxxxxx)
   - Check private key format (DER encoded)
   - Ensure sufficient HBAR balance

2. **Database Connection Issues**
   - Verify connection string format
   - Check database server status
   - Validate credentials

3. **CORS Issues**
   - Check FRONTEND_URL setting
   - Verify ALLOWED_ORIGINS list
   - Ensure protocol matches (http/https)

### Configuration Testing
```bash
# Test backend configuration
cd veritas-backend
npm run config:test

# Test frontend configuration
cd veritas-frontend
npm run config:test

# Test database connection
npm run db:test

# Test Hedera connection
npm run hedera:test
```

---

**Next:** [First Steps](./first-steps.md) to start using your configured Veritas instance.