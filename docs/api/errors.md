# Error Handling 🚨

Comprehensive guide to API error responses and handling strategies.

## Error Response Format

All API errors follow a consistent JSON structure:

```javascript
{
  "success": false,
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_ERROR_CODE",
  "status": 400,
  "details": {
    // Additional error-specific information
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "request_id": "req_1234567890"
}
```

## HTTP Status Codes

### 2xx Success
| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 202 | Accepted | Request accepted for processing |

### 4xx Client Errors
| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request format or parameters |
| 401 | Unauthorized | Authentication required or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |

### 5xx Server Errors
| Code | Status | Description |
|------|--------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream service error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Upstream service timeout |

## Error Codes

### Authentication Errors

#### INVALID_API_KEY
```javascript
{
  "success": false,
  "error": "Invalid API key provided",
  "code": "INVALID_API_KEY",
  "status": 401,
  "details": {
    "provided_key": "vrt_test_invalid...",
    "key_format": "Expected format: vrt_{env}_{32_chars}"
  }
}
```

#### TOKEN_EXPIRED
```javascript
{
  "success": false,
  "error": "Authentication token has expired",
  "code": "TOKEN_EXPIRED",
  "status": 401,
  "details": {
    "expired_at": "2024-01-01T10:00:00Z",
    "current_time": "2024-01-01T12:00:00Z",
    "refresh_url": "/api/auth/refresh"
  }
}
```

#### INSUFFICIENT_PERMISSIONS
```javascript
{
  "success": false,
  "error": "Insufficient permissions for this operation",
  "code": "INSUFFICIENT_PERMISSIONS",
  "status": 403,
  "details": {
    "required_scope": "products:write",
    "current_scopes": ["products:read", "verification:read"],
    "upgrade_url": "/dashboard/upgrade"
  }
}
```

### Validation Errors

#### VALIDATION_ERROR
```javascript
{
  "success": false,
  "error": "Request validation failed",
  "code": "VALIDATION_ERROR",
  "status": 422,
  "details": {
    "field_errors": {
      "product_name": [
        "Product name is required",
        "Product name must be between 1 and 255 characters"
      ],
      "claims": [
        "At least one claim is required"
      ],
      "claims.0.type": [
        "Claim type must be one of: organic_certified, fair_trade, ..."
      ]
    },
    "error_count": 3
  }
}
```

#### INVALID_BATCH_ID
```javascript
{
  "success": false,
  "error": "Invalid batch ID format",
  "code": "INVALID_BATCH_ID",
  "status": 400,
  "details": {
    "provided": "invalid-batch-id",
    "expected_format": "PRODUCT-YYYY-NNNN",
    "examples": [
      "COFFEE-2024-1001",
      "SHIRT-2024-0456"
    ]
  }
}
```

### Resource Errors

#### PRODUCT_NOT_FOUND
```javascript
{
  "success": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "status": 404,
  "details": {
    "batch_id": "COFFEE-2024-9999",
    "suggestions": [
      "COFFEE-2024-1001",
      "COFFEE-2024-1002"
    ],
    "search_url": "/api/products?search=COFFEE-2024"
  }
}
```

#### DUPLICATE_BATCH_ID
```javascript
{
  "success": false,
  "error": "Product with this batch ID already exists",
  "code": "DUPLICATE_BATCH_ID",
  "status": 409,
  "details": {
    "batch_id": "COFFEE-2024-1001",
    "existing_product": {
      "created_at": "2024-01-01T10:00:00Z",
      "supplier_name": "Mountain View Coffee Cooperative"
    },
    "suggestion": "Use a different batch ID or update the existing product"
  }
}
```

### Rate Limiting Errors

#### RATE_LIMIT_EXCEEDED
```javascript
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "details": {
    "limit": 1000,
    "window": 3600,
    "reset_at": "2024-01-01T13:00:00Z",
    "retry_after": 300,
    "current_usage": 1000
  }
}
```

### Blockchain Errors

#### BLOCKCHAIN_ERROR
```javascript
{
  "success": false,
  "error": "Blockchain operation failed",
  "code": "BLOCKCHAIN_ERROR",
  "status": 502,
  "details": {
    "operation": "submit_message",
    "hedera_error": "INSUFFICIENT_ACCOUNT_BALANCE",
    "required_balance": "1.0 HBAR",
    "current_balance": "0.5 HBAR",
    "retry_after": 300
  }
}
```

#### BLOCKCHAIN_TIMEOUT
```javascript
{
  "success": false,
  "error": "Blockchain operation timed out",
  "code": "BLOCKCHAIN_TIMEOUT",
  "status": 504,
  "details": {
    "operation": "submit_message",
    "timeout": 30000,
    "network_status": "degraded",
    "retry_recommended": true
  }
}
```

#### MESSAGE_NOT_FOUND
```javascript
{
  "success": false,
  "error": "Blockchain message not found",
  "code": "MESSAGE_NOT_FOUND",
  "status": 404,
  "details": {
    "message_id": "0.0.1234567-1640995200-123456789",
    "topic_id": "0.0.1234567",
    "possible_reasons": [
      "Message ID is incorrect",
      "Message not yet propagated",
      "Network synchronization delay"
    ]
  }
}
```

### Service Errors

#### SERVICE_UNAVAILABLE
```javascript
{
  "success": false,
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "status": 503,
  "details": {
    "service": "hedera_consensus_service",
    "estimated_recovery": "2024-01-01T13:00:00Z",
    "status_page": "https://status.veritas.app"
  }
}
```

#### DATABASE_ERROR
```javascript
{
  "success": false,
  "error": "Database operation failed",
  "code": "DATABASE_ERROR",
  "status": 500,
  "details": {
    "operation": "insert_product",
    "error_type": "connection_timeout",
    "retry_recommended": true
  }
}
```

## Error Handling Strategies

### Retry Logic

#### Exponential Backoff
```javascript
async function retryWithBackoff(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Check if error is retryable
      if (!isRetryableError(error)) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function isRetryableError(error) {
  const retryableCodes = [
    'BLOCKCHAIN_TIMEOUT',
    'SERVICE_UNAVAILABLE',
    'DATABASE_ERROR',
    'RATE_LIMIT_EXCEEDED'
  ];
  return retryableCodes.includes(error.code);
}

// Usage
try {
  const result = await retryWithBackoff(() => 
    client.products.create(productData)
  );
} catch (error) {
  console.error('Operation failed after retries:', error);
}
```

#### Rate Limit Handling
```javascript
async function handleRateLimit(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = error.details.retry_after * 1000;
      console.log(`Rate limited. Retrying after ${retryAfter}ms`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter));
      return await operation();
    }
    throw error;
  }
}
```

### Error Classification

#### Client vs Server Errors
```javascript
function classifyError(error) {
  const status = error.status || 500;
  
  if (status >= 400 && status < 500) {
    return {
      type: 'client_error',
      retryable: false,
      action: 'fix_request'
    };
  }
  
  if (status >= 500) {
    return {
      type: 'server_error',
      retryable: true,
      action: 'retry_later'
    };
  }
  
  return {
    type: 'unknown',
    retryable: false,
    action: 'investigate'
  };
}
```

#### Error Recovery
```javascript
async function recoverFromError(error, context) {
  switch (error.code) {
    case 'INVALID_API_KEY':
      // Refresh API key
      await refreshApiKey();
      return 'retry';
      
    case 'TOKEN_EXPIRED':
      // Refresh authentication token
      await refreshToken();
      return 'retry';
      
    case 'PRODUCT_NOT_FOUND':
      // Check if product exists with similar ID
      const suggestions = error.details.suggestions;
      if (suggestions.length > 0) {
        return { action: 'suggest', alternatives: suggestions };
      }
      return 'fail';
      
    case 'BLOCKCHAIN_ERROR':
      // Check if it's a temporary issue
      if (error.details.retry_recommended) {
        return 'retry_later';
      }
      return 'fail';
      
    default:
      return 'fail';
  }
}
```

## SDK Error Handling

### Node.js SDK
```javascript
const { VeritasClient, VeritasError } = require('@veritas/node-sdk');

const client = new VeritasClient({
  apiKey: process.env.VERITAS_API_KEY,
  retryConfig: {
    maxRetries: 3,
    backoffMultiplier: 2,
    retryableErrors: ['BLOCKCHAIN_TIMEOUT', 'SERVICE_UNAVAILABLE']
  }
});

try {
  const product = await client.products.create(productData);
} catch (error) {
  if (error instanceof VeritasError) {
    console.error('Veritas API Error:', {
      code: error.code,
      message: error.message,
      status: error.status,
      details: error.details
    });
    
    // Handle specific errors
    switch (error.code) {
      case 'VALIDATION_ERROR':
        console.error('Validation errors:', error.details.field_errors);
        break;
      case 'RATE_LIMIT_EXCEEDED':
        console.log(`Rate limited. Retry after ${error.details.retry_after}s`);
        break;
      default:
        console.error('Unexpected error:', error);
    }
  } else {
    console.error('Network or other error:', error);
  }
}
```

### Python SDK
```python
from veritas import VeritasClient, VeritasError
import time

client = VeritasClient(
    api_key=os.environ['VERITAS_API_KEY'],
    retry_config={
        'max_retries': 3,
        'backoff_multiplier': 2,
        'retryable_errors': ['BLOCKCHAIN_TIMEOUT', 'SERVICE_UNAVAILABLE']
    }
)

try:
    product = client.products.create(product_data)
except VeritasError as e:
    print(f"Veritas API Error: {e.code} - {e.message}")
    
    if e.code == 'VALIDATION_ERROR':
        for field, errors in e.details['field_errors'].items():
            print(f"  {field}: {', '.join(errors)}")
    elif e.code == 'RATE_LIMIT_EXCEEDED':
        retry_after = e.details['retry_after']
        print(f"Rate limited. Sleeping for {retry_after} seconds...")
        time.sleep(retry_after)
        # Retry the operation
except Exception as e:
    print(f"Unexpected error: {e}")
```

### JavaScript (Browser)
```javascript
import { VeritasClient, VeritasError } from '@veritas/js-sdk';

const client = new VeritasClient({
  apiKey: 'your-public-api-key'
});

async function handleVerification(batchId) {
  try {
    const result = await client.verify(batchId);
    displayVerificationResult(result);
  } catch (error) {
    if (error instanceof VeritasError) {
      switch (error.code) {
        case 'PRODUCT_NOT_FOUND':
          showError('Product not found. Please check the batch ID.');
          if (error.details.suggestions) {
            showSuggestions(error.details.suggestions);
          }
          break;
        case 'RATE_LIMIT_EXCEEDED':
          showError('Too many requests. Please try again later.');
          break;
        default:
          showError(`Verification failed: ${error.message}`);
      }
    } else {
      showError('Network error. Please check your connection.');
    }
  }
}
```

## Error Monitoring

### Error Tracking
```javascript
// Sentry integration example
const Sentry = require('@sentry/node');

function trackError(error, context) {
  Sentry.withScope((scope) => {
    scope.setTag('error_code', error.code);
    scope.setLevel('error');
    scope.setContext('api_context', context);
    Sentry.captureException(error);
  });
}

// Usage
try {
  await client.products.create(productData);
} catch (error) {
  trackError(error, {
    operation: 'product_creation',
    batch_id: productData.batch_id,
    user_id: userId
  });
  throw error;
}
```

### Error Metrics
```javascript
// Prometheus metrics example
const prometheus = require('prom-client');

const errorCounter = new prometheus.Counter({
  name: 'veritas_api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['error_code', 'status_code', 'endpoint']
});

function recordError(error, endpoint) {
  errorCounter.inc({
    error_code: error.code,
    status_code: error.status,
    endpoint: endpoint
  });
}
```

## Best Practices

### Error Handling Checklist
- ✅ Always check for error responses
- ✅ Implement appropriate retry logic
- ✅ Log errors with sufficient context
- ✅ Provide meaningful user feedback
- ✅ Monitor error rates and patterns
- ✅ Handle rate limits gracefully
- ✅ Validate input before sending requests
- ✅ Use circuit breakers for external services

### User Experience
```javascript
// Good: Provide helpful error messages
function showUserFriendlyError(error) {
  const messages = {
    'PRODUCT_NOT_FOUND': 'We couldn\'t find that product. Please check the batch ID and try again.',
    'RATE_LIMIT_EXCEEDED': 'You\'re making requests too quickly. Please wait a moment and try again.',
    'BLOCKCHAIN_ERROR': 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
    'VALIDATION_ERROR': 'Please check your input and correct any errors highlighted below.'
  };
  
  return messages[error.code] || 'Something went wrong. Please try again or contact support.';
}

// Bad: Show raw error messages
function showRawError(error) {
  alert(error.message); // Don't do this
}
```

---

**Next:** [Development Setup](../development/setup.md) for contributing to the API.