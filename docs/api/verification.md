# Verification API 🔍

API endpoints for verifying product claims and blockchain records.

## Base URL
```
Production:  https://api.veritas.app
Development: http://localhost:3002
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/verify/{batchId}` | Verify product by batch ID |
| `GET` | `/api/blockchain/{messageId}` | Get blockchain proof |
| `POST` | `/api/verify/batch` | Bulk verification |
| `GET` | `/api/verify/stats/{batchId}` | Verification statistics |

## Verify Product

### `GET /api/verify/{batchId}`

Verify a product's claims using its batch ID. This is the primary verification endpoint used by consumers.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batchId` | string | ✅ | Unique batch identifier |

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_blockchain` | boolean | false | Include blockchain proof data |
| `include_stats` | boolean | false | Include verification statistics |
| `format` | string | json | Response format (json, xml) |

#### Response
```javascript
{
  "success": true,
  "data": {
    "verification": {
      "batch_id": "COFFEE-2024-1001",
      "status": "verified",
      "verified_at": "2024-01-01T12:00:00Z",
      "trust_score": 98.5,
      "verification_id": "ver_1234567890"
    },
    "product": {
      "product_name": "Organic Colombian Coffee",
      "supplier_name": "Mountain View Coffee Cooperative",
      "description": "Single-origin coffee from the Huila region",
      "category": "food_beverage",
      "created_at": "2024-01-01T10:00:00Z"
    },
    "claims": [
      {
        "id": "claim_001",
        "type": "organic_certified",
        "description": "USDA Organic Certified #2024-COL-089",
        "evidence": "Certificate from USDA Organic Program",
        "verification_url": "https://organic.usda.gov/verify/2024-COL-089",
        "status": "verified",
        "verified_at": "2024-01-01T10:00:00Z",
        "valid_from": "2024-01-01",
        "valid_until": "2025-01-01",
        "confidence_score": 99.2
      },
      {
        "id": "claim_002",
        "type": "fair_trade",
        "description": "Fair Trade USA Certified #FT-2024-1001",
        "evidence": "Fair Trade certification document",
        "verification_url": "https://fairtrade.org/verify/FT-2024-1001",
        "status": "verified",
        "verified_at": "2024-01-01T10:00:00Z",
        "confidence_score": 97.8
      }
    ],
    "blockchain": {
      "message_id": "0.0.1234567-1640995200-123456789",
      "topic_id": "0.0.1234567",
      "consensus_timestamp": "2024-01-01T10:00:00.123456789Z",
      "hashscan_url": "https://hashscan.io/testnet/topic/0.0.1234567/message/1640995200-123456789",
      "transaction_hash": "0x7f9a2b8c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      "network": "testnet",
      "finality": "confirmed"
    },
    "metadata": {
      "origin_country": "Colombia",
      "harvest_date": "2024-03-15",
      "processing_method": "Washed",
      "altitude": "1800m",
      "certifying_body": "USDA Organic Program"
    }
  },
  "message": "Product verified successfully"
}
```

#### Verification Status Values
| Status | Description |
|--------|-------------|
| `verified` | All claims verified and valid |
| `partially_verified` | Some claims verified |
| `unverified` | No claims could be verified |
| `expired` | Claims have expired |
| `revoked` | Claims have been revoked |
| `pending` | Verification in progress |

#### Trust Score Calculation
The trust score (0-100) is calculated based on:
- **Blockchain Confirmation** (40%): Immutable record exists
- **Claim Verification** (30%): External verification of claims
- **Supplier Reputation** (20%): Historical verification success
- **Evidence Quality** (10%): Quality and completeness of evidence

#### Example Requests
```bash
# Basic verification
curl https://api.veritas.app/api/verify/COFFEE-2024-1001

# With blockchain proof
curl "https://api.veritas.app/api/verify/COFFEE-2024-1001?include_blockchain=true"

# With statistics
curl "https://api.veritas.app/api/verify/COFFEE-2024-1001?include_stats=true"
```

## Get Blockchain Proof

### `GET /api/blockchain/{messageId}`

Retrieve detailed blockchain proof for a specific message.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | string | ✅ | Blockchain message identifier |

#### Response
```javascript
{
  "success": true,
  "data": {
    "message_id": "0.0.1234567-1640995200-123456789",
    "topic_id": "0.0.1234567",
    "sequence_number": 123456789,
    "consensus_timestamp": "2024-01-01T10:00:00.123456789Z",
    "payer_account_id": "0.0.1234",
    "message": {
      "type": "product_submission",
      "version": "1.0",
      "data": {
        "batch_id": "COFFEE-2024-1001",
        "product_name": "Organic Colombian Coffee",
        "supplier_name": "Mountain View Coffee Cooperative",
        "claims_hash": "sha256:a1b2c3d4e5f6...",
        "submission_timestamp": "2024-01-01T10:00:00Z"
      }
    },
    "proof": {
      "transaction_hash": "0x7f9a2b8c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
      "block_number": 12345678,
      "network": "testnet",
      "finality": "confirmed",
      "confirmations": 1000000
    },
    "verification": {
      "signature_valid": true,
      "timestamp_valid": true,
      "hash_valid": true,
      "network_consensus": true
    },
    "links": {
      "hashscan": "https://hashscan.io/testnet/topic/0.0.1234567/message/1640995200-123456789",
      "explorer": "https://explorer.hedera.com/testnet/topic/0.0.1234567"
    }
  }
}
```

#### Example Request
```bash
curl https://api.veritas.app/api/blockchain/0.0.1234567-1640995200-123456789
```

## Bulk Verification

### `POST /api/verify/batch`

Verify multiple products in a single request.

#### Request Body
```javascript
{
  "batch_ids": [
    "COFFEE-2024-1001",
    "COFFEE-2024-1002",
    "TEA-2024-0501"
  ],
  "options": {
    "include_blockchain": false,
    "include_stats": false,
    "fail_fast": false
  }
}
```

#### Response
```javascript
{
  "success": true,
  "data": {
    "total_requested": 3,
    "verified": 2,
    "failed": 1,
    "results": [
      {
        "batch_id": "COFFEE-2024-1001",
        "status": "verified",
        "trust_score": 98.5,
        "claims_verified": 2
      },
      {
        "batch_id": "COFFEE-2024-1002",
        "status": "verified",
        "trust_score": 95.2,
        "claims_verified": 3
      },
      {
        "batch_id": "TEA-2024-0501",
        "status": "not_found",
        "error": "Product not found"
      }
    ]
  }
}
```

#### Example Request
```bash
curl -X POST https://api.veritas.app/api/verify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "batch_ids": ["COFFEE-2024-1001", "COFFEE-2024-1002"],
    "options": {
      "include_stats": true
    }
  }'
```

## Verification Statistics

### `GET /api/verify/stats/{batchId}`

Get detailed verification statistics for a product.

#### Response
```javascript
{
  "success": true,
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "statistics": {
      "total_verifications": 1247,
      "unique_verifiers": 892,
      "verification_rate": {
        "daily": 45,
        "weekly": 312,
        "monthly": 1247
      },
      "geographic_distribution": {
        "US": 456,
        "EU": 321,
        "CA": 234,
        "Other": 236
      },
      "verification_methods": {
        "qr_scan": 789,
        "manual_entry": 321,
        "api_call": 137
      },
      "trust_metrics": {
        "current_score": 98.5,
        "average_score": 97.2,
        "score_trend": "increasing",
        "last_updated": "2024-01-01T12:00:00Z"
      },
      "timeline": [
        {
          "date": "2024-01-01",
          "verifications": 45,
          "trust_score": 98.5
        }
      ]
    }
  }
}
```

#### Example Request
```bash
curl https://api.veritas.app/api/verify/stats/COFFEE-2024-1001
```

## QR Code Verification

### `GET /api/verify/qr/{qrToken}`

Verify product using QR code token (alternative to batch ID).

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `qrToken` | string | ✅ | QR code token |

#### Response
Same as standard verification endpoint.

#### Example Request
```bash
curl https://api.veritas.app/api/verify/qr/qr_abc123def456
```

## Real-time Verification

### WebSocket Connection

For real-time verification updates, connect to the WebSocket endpoint.

#### Connection
```javascript
const ws = new WebSocket('wss://api.veritas.app/ws/verify');

ws.onopen = function() {
  // Subscribe to verification updates
  ws.send(JSON.stringify({
    action: 'subscribe',
    batch_ids: ['COFFEE-2024-1001', 'COFFEE-2024-1002']
  }));
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Verification update:', data);
};
```

#### Message Format
```javascript
{
  "type": "verification_update",
  "batch_id": "COFFEE-2024-1001",
  "status": "verified",
  "trust_score": 98.5,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Verification Webhooks

### Configure Webhooks

Register webhook endpoints to receive verification events.

#### Webhook Events
- `verification.completed` - Product verification completed
- `verification.failed` - Product verification failed
- `trust_score.updated` - Trust score changed
- `claim.expired` - Claim expired
- `claim.revoked` - Claim revoked

#### Webhook Payload
```javascript
{
  "event": "verification.completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "verification_id": "ver_1234567890",
    "status": "verified",
    "trust_score": 98.5,
    "verifier_ip": "192.168.1.1",
    "verifier_location": "US"
  }
}
```

## Error Responses

### Product Not Found
```javascript
{
  "success": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "batch_id": "INVALID-BATCH-ID",
    "suggestions": [
      "COFFEE-2024-1001",
      "COFFEE-2024-1002"
    ]
  }
}
```

### Verification Failed
```javascript
{
  "success": false,
  "error": "Verification failed",
  "code": "VERIFICATION_FAILED",
  "details": {
    "batch_id": "COFFEE-2024-1001",
    "reason": "Claims could not be verified",
    "failed_claims": ["organic_certified"],
    "retry_after": 300
  }
}
```

### Blockchain Error
```javascript
{
  "success": false,
  "error": "Blockchain verification failed",
  "code": "BLOCKCHAIN_ERROR",
  "details": {
    "message_id": "0.0.1234567-1640995200-123456789",
    "reason": "Message not found on blockchain",
    "network_status": "operational"
  }
}
```

## SDK Examples

### Node.js
```javascript
const { VeritasClient } = require('@veritas/node-sdk');

const client = new VeritasClient({
  apiKey: process.env.VERITAS_API_KEY
});

// Verify single product
const verification = await client.verify('COFFEE-2024-1001');
console.log('Trust Score:', verification.trust_score);

// Bulk verification
const results = await client.verifyBatch([
  'COFFEE-2024-1001',
  'COFFEE-2024-1002'
]);

// Get blockchain proof
const proof = await client.getBlockchainProof('0.0.1234567-1640995200-123456789');

// Real-time verification
client.onVerification('COFFEE-2024-1001', (update) => {
  console.log('Verification update:', update);
});
```

### Python
```python
from veritas import VeritasClient

client = VeritasClient(api_key=os.environ['VERITAS_API_KEY'])

# Verify single product
verification = client.verify('COFFEE-2024-1001')
print(f"Trust Score: {verification.trust_score}")

# Bulk verification
results = client.verify_batch([
    'COFFEE-2024-1001',
    'COFFEE-2024-1002'
])

# Get blockchain proof
proof = client.get_blockchain_proof('0.0.1234567-1640995200-123456789')
```

### JavaScript (Browser)
```javascript
import { VeritasClient } from '@veritas/js-sdk';

const client = new VeritasClient({
  apiKey: 'your-public-api-key'
});

// Verify product
const verification = await client.verify('COFFEE-2024-1001');

// Display results
document.getElementById('trust-score').textContent = verification.trust_score;
document.getElementById('status').textContent = verification.status;

// Real-time updates
client.subscribe('COFFEE-2024-1001', (update) => {
  updateUI(update);
});
```

## Rate Limits

### Verification Limits
- **Single Verification**: 2000 per hour
- **Bulk Verification**: 100 per hour (max 50 products per request)
- **Blockchain Proof**: 500 per hour
- **Statistics**: 1000 per hour

### Headers
```http
X-RateLimit-Limit: 2000
X-RateLimit-Remaining: 1999
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 3600
```

---

**Next:** [Error Handling](./errors.md) for comprehensive error documentation.