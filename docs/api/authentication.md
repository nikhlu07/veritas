# Authentication 🔐

API authentication and authorization for Veritas.

## Current Status

**Note**: Veritas is currently in **open beta** mode. Authentication is not required for API access during the demo phase. This will change in future versions.

## Planned Authentication System

### Authentication Methods

#### 1. API Key Authentication (Coming Soon)
```bash
# Header-based authentication
curl -H "X-API-Key: your-api-key-here" \
     https://api.veritas.app/api/products
```

#### 2. JWT Token Authentication (Coming Soon)
```bash
# Bearer token authentication
curl -H "Authorization: Bearer your-jwt-token" \
     https://api.veritas.app/api/products
```

#### 3. OAuth 2.0 (Future)
```bash
# OAuth flow for third-party integrations
curl -H "Authorization: Bearer oauth-access-token" \
     https://api.veritas.app/api/products
```

## API Key Management

### Obtaining API Keys

#### Business Account Registration
```javascript
// POST /api/auth/register
{
  "company_name": "Your Company Name",
  "email": "admin@yourcompany.com",
  "industry": "food_beverage",
  "website": "https://yourcompany.com",
  "contact_person": "John Doe",
  "phone": "+1-555-0123"
}
```

Response:
```javascript
{
  "success": true,
  "data": {
    "account_id": "acc_1234567890",
    "api_key": "vrt_live_1234567890abcdef",
    "api_secret": "vrt_secret_abcdef1234567890",
    "rate_limit": 1000,
    "expires_at": "2025-01-01T00:00:00Z"
  }
}
```

### API Key Types

#### Development Keys
```
Format: vrt_test_[32_characters]
Rate Limit: 100 requests/hour
Environment: Testnet only
Cost: Free
```

#### Production Keys
```
Format: vrt_live_[32_characters]
Rate Limit: 10,000 requests/hour
Environment: Mainnet
Cost: Pay-per-use
```

#### Enterprise Keys
```
Format: vrt_ent_[32_characters]
Rate Limit: Unlimited
Environment: Mainnet + dedicated support
Cost: Monthly subscription
```

## Authentication Headers

### Required Headers
```http
X-API-Key: your-api-key
Content-Type: application/json
User-Agent: YourApp/1.0.0
```

### Optional Headers
```http
X-Request-ID: unique-request-identifier
X-Idempotency-Key: unique-operation-key
X-Client-Version: 1.2.3
```

## JWT Token Authentication

### Login Flow
```javascript
// POST /api/auth/login
{
  "email": "admin@yourcompany.com",
  "password": "secure-password",
  "remember_me": true
}
```

Response:
```javascript
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "read write"
  }
}
```

### Token Usage
```javascript
// Using the access token
fetch('https://api.veritas.app/api/products', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh
```javascript
// POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Authorization Scopes

### Available Scopes

#### Read Scopes
- `products:read` - View product information
- `verification:read` - Access verification data
- `analytics:read` - View usage analytics

#### Write Scopes
- `products:write` - Submit new products
- `products:update` - Update existing products
- `products:delete` - Delete products

#### Admin Scopes
- `account:admin` - Manage account settings
- `users:admin` - Manage team members
- `billing:admin` - Access billing information

### Scope Examples
```javascript
// Request specific scopes during authentication
{
  "email": "admin@yourcompany.com",
  "password": "secure-password",
  "scopes": ["products:read", "products:write", "verification:read"]
}
```

## Rate Limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

#### Free Tier
- 100 requests per hour
- 1,000 requests per day
- 10,000 requests per month

#### Pro Tier
- 1,000 requests per hour
- 10,000 requests per day
- 100,000 requests per month

#### Enterprise Tier
- 10,000 requests per hour
- 100,000 requests per day
- Unlimited monthly requests

### Rate Limit Exceeded Response
```javascript
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": 1000,
    "window": 3600,
    "reset_at": "2024-01-01T13:00:00Z"
  }
}
```

## Security Best Practices

### API Key Security
```javascript
// ✅ Good: Store in environment variables
const apiKey = process.env.VERITAS_API_KEY;

// ❌ Bad: Hardcode in source code
const apiKey = 'vrt_live_1234567890abcdef';

// ✅ Good: Use HTTPS only
const apiUrl = 'https://api.veritas.app';

// ❌ Bad: Use HTTP
const apiUrl = 'http://api.veritas.app';
```

### Token Storage
```javascript
// ✅ Good: Secure storage
localStorage.setItem('veritas_token', token); // For web apps
// Use secure keychain for mobile apps

// ❌ Bad: Insecure storage
document.cookie = `token=${token}`; // Vulnerable to XSS
```

### Request Signing (Enterprise)
```javascript
// HMAC-SHA256 signature for enterprise accounts
const crypto = require('crypto');

function signRequest(method, path, body, timestamp, secret) {
  const payload = `${method}\n${path}\n${body}\n${timestamp}`;
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Usage
const timestamp = Date.now();
const signature = signRequest('POST', '/api/products', JSON.stringify(data), timestamp, apiSecret);

const headers = {
  'X-API-Key': apiKey,
  'X-Timestamp': timestamp,
  'X-Signature': signature,
  'Content-Type': 'application/json'
};
```

## Error Handling

### Authentication Errors

#### Invalid API Key
```javascript
{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY",
  "status": 401
}
```

#### Expired Token
```javascript
{
  "success": false,
  "error": "Token expired",
  "code": "TOKEN_EXPIRED",
  "status": 401,
  "details": {
    "expired_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Insufficient Permissions
```javascript
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "status": 403,
  "details": {
    "required_scope": "products:write",
    "current_scopes": ["products:read"]
  }
}
```

## SDK Examples

### Node.js SDK
```javascript
const VeritasSDK = require('@veritas/sdk');

const client = new VeritasSDK({
  apiKey: process.env.VERITAS_API_KEY,
  environment: 'production' // or 'sandbox'
});

// Automatic authentication handling
const product = await client.products.create({
  product_name: 'Organic Coffee',
  supplier_name: 'Coffee Co.',
  claims: [...]
});
```

### Python SDK
```python
from veritas import VeritasClient

client = VeritasClient(
    api_key=os.environ['VERITAS_API_KEY'],
    environment='production'
)

# Automatic authentication handling
product = client.products.create({
    'product_name': 'Organic Coffee',
    'supplier_name': 'Coffee Co.',
    'claims': [...]
})
```

### JavaScript (Browser)
```javascript
import { VeritasClient } from '@veritas/js-sdk';

const client = new VeritasClient({
  apiKey: 'your-public-api-key', // Public key for browser
  environment: 'production'
});

// JWT token authentication for user-specific operations
await client.authenticate('user-jwt-token');

const verification = await client.verify('BATCH-ID-123');
```

## Webhook Authentication

### Webhook Signatures
```javascript
// Verify webhook authenticity
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Express middleware
app.post('/webhooks/veritas', (req, res) => {
  const signature = req.headers['x-veritas-signature'];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  res.status(200).json({ received: true });
});
```

## Migration Guide

### From Open Beta to Authenticated API

#### Step 1: Register for API Key
1. Visit [Veritas Dashboard](https://dashboard.veritas.app)
2. Create business account
3. Generate API key

#### Step 2: Update Code
```javascript
// Before (open beta)
fetch('https://api.veritas.app/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(productData)
});

// After (authenticated)
fetch('https://api.veritas.app/api/products', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.VERITAS_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(productData)
});
```

#### Step 3: Test Integration
```bash
# Test API key
curl -H "X-API-Key: your-api-key" \
     https://api.veritas.app/api/auth/test

# Expected response
{
  "success": true,
  "data": {
    "account_id": "acc_1234567890",
    "rate_limit": 1000,
    "scopes": ["products:read", "products:write"]
  }
}
```

---

**Next:** [Products API](./products.md) for detailed endpoint documentation.