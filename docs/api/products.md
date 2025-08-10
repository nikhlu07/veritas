# Products API 📦

Complete reference for the Products API endpoints.

## Base URL
```
Production:  https://api.veritas.app
Development: http://localhost:3002
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/products` | Submit new product |
| `GET` | `/api/products/{batchId}` | Get product by batch ID |
| `GET` | `/api/products` | List products |
| `PUT` | `/api/products/{batchId}` | Update product |
| `DELETE` | `/api/products/{batchId}` | Delete product |

## Submit New Product

### `POST /api/products`

Submit a new product with sustainability claims to the blockchain.

#### Request Body
```javascript
{
  "product_name": "Organic Colombian Coffee",
  "supplier_name": "Mountain View Coffee Cooperative",
  "batch_id": "COFFEE-2024-1001", // Optional: auto-generated if not provided
  "description": "Single-origin coffee from the Huila region",
  "category": "food_beverage",
  "claims": [
    {
      "type": "organic_certified",
      "description": "USDA Organic Certified #2024-COL-089",
      "evidence": "Certificate from USDA Organic Program",
      "verification_url": "https://organic.usda.gov/verify/2024-COL-089",
      "valid_from": "2024-01-01",
      "valid_until": "2025-01-01"
    },
    {
      "type": "fair_trade",
      "description": "Fair Trade USA Certified #FT-2024-1001",
      "evidence": "Fair Trade certification document",
      "verification_url": "https://fairtrade.org/verify/FT-2024-1001"
    }
  ],
  "metadata": {
    "origin_country": "Colombia",
    "harvest_date": "2024-03-15",
    "processing_method": "Washed",
    "altitude": "1800m",
    "farm_size": "5 hectares",
    "farmer_count": 12
  }
}
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_name` | string | ✅ | Name of the product |
| `supplier_name` | string | ✅ | Name of the supplier/manufacturer |
| `batch_id` | string | ❌ | Unique identifier (auto-generated if not provided) |
| `description` | string | ❌ | Detailed product description |
| `category` | string | ❌ | Product category (see categories below) |
| `claims` | array | ✅ | Array of sustainability claims |
| `metadata` | object | ❌ | Additional product information |

#### Product Categories
```javascript
const categories = [
  'food_beverage',
  'fashion_textiles',
  'electronics',
  'cosmetics',
  'home_garden',
  'automotive',
  'pharmaceuticals',
  'other'
];
```

#### Claim Types
```javascript
const claimTypes = [
  // Certifications
  'organic_certified',
  'fair_trade',
  'rainforest_alliance',
  'utz_certified',
  'gots_certified',
  'cradle_to_cradle',
  
  // Environmental
  'carbon_neutral',
  'renewable_energy',
  'water_conservation',
  'zero_waste',
  'biodegradable',
  'recyclable',
  
  // Social
  'fair_labor',
  'living_wage',
  'child_labor_free',
  'community_support',
  
  // Quality
  'non_gmo',
  'gluten_free',
  'vegan',
  'cruelty_free',
  'single_origin',
  
  // Custom
  'custom'
];
```

#### Response
```javascript
{
  "success": true,
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "product_name": "Organic Colombian Coffee",
    "supplier_name": "Mountain View Coffee Cooperative",
    "blockchain_message_id": "0.0.1234567-1640995200-123456789",
    "qr_code_url": "https://api.veritas.app/api/qr/COFFEE-2024-1001",
    "verification_url": "https://veritas.app/verify/COFFEE-2024-1001",
    "created_at": "2024-01-01T12:00:00Z",
    "claims_count": 2,
    "status": "submitted"
  },
  "message": "Product submitted successfully to blockchain"
}
```

#### Example Request
```bash
curl -X POST https://api.veritas.app/api/products \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "product_name": "Organic Colombian Coffee",
    "supplier_name": "Mountain View Coffee Cooperative",
    "claims": [
      {
        "type": "organic_certified",
        "description": "USDA Organic Certified",
        "evidence": "Certificate #2024-COL-089"
      }
    ]
  }'
```

## Get Product by Batch ID

### `GET /api/products/{batchId}`

Retrieve detailed information about a specific product.

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `batchId` | string | ✅ | Unique batch identifier |

#### Response
```javascript
{
  "success": true,
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "product_name": "Organic Colombian Coffee",
    "supplier_name": "Mountain View Coffee Cooperative",
    "description": "Single-origin coffee from the Huila region",
    "category": "food_beverage",
    "status": "verified",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "blockchain_message_id": "0.0.1234567-1640995200-123456789",
    "hashscan_url": "https://hashscan.io/testnet/topic/0.0.1234567/message/1640995200-123456789",
    "claims": [
      {
        "id": "claim_001",
        "type": "organic_certified",
        "description": "USDA Organic Certified #2024-COL-089",
        "evidence": "Certificate from USDA Organic Program",
        "verification_url": "https://organic.usda.gov/verify/2024-COL-089",
        "valid_from": "2024-01-01",
        "valid_until": "2025-01-01",
        "status": "verified",
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "metadata": {
      "origin_country": "Colombia",
      "harvest_date": "2024-03-15",
      "processing_method": "Washed",
      "altitude": "1800m"
    },
    "verification_stats": {
      "total_verifications": 1247,
      "last_verified": "2024-01-01T11:59:00Z",
      "trust_score": 98.5
    }
  }
}
```

#### Example Request
```bash
curl https://api.veritas.app/api/products/COFFEE-2024-1001 \
  -H "X-API-Key: your-api-key"
```

## List Products

### `GET /api/products`

Retrieve a list of products with optional filtering and pagination.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `category` | string | - | Filter by category |
| `supplier` | string | - | Filter by supplier name |
| `status` | string | - | Filter by status |
| `search` | string | - | Search in product names |
| `sort` | string | created_at | Sort field |
| `order` | string | desc | Sort order (asc/desc) |
| `date_from` | string | - | Filter from date (ISO 8601) |
| `date_to` | string | - | Filter to date (ISO 8601) |

#### Response
```javascript
{
  "success": true,
  "data": {
    "products": [
      {
        "batch_id": "COFFEE-2024-1001",
        "product_name": "Organic Colombian Coffee",
        "supplier_name": "Mountain View Coffee Cooperative",
        "category": "food_beverage",
        "status": "verified",
        "claims_count": 2,
        "verification_count": 1247,
        "trust_score": 98.5,
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Example Requests
```bash
# Basic list
curl "https://api.veritas.app/api/products" \
  -H "X-API-Key: your-api-key"

# Filtered list
curl "https://api.veritas.app/api/products?category=food_beverage&limit=10&sort=trust_score&order=desc" \
  -H "X-API-Key: your-api-key"

# Search products
curl "https://api.veritas.app/api/products?search=organic%20coffee" \
  -H "X-API-Key: your-api-key"
```

## Update Product

### `PUT /api/products/{batchId}`

Update product information. Note: Claims cannot be modified once submitted to blockchain.

#### Request Body
```javascript
{
  "description": "Updated product description",
  "metadata": {
    "updated_field": "new_value",
    "additional_info": "Extra information"
  }
}
```

#### Response
```javascript
{
  "success": true,
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "updated_fields": ["description", "metadata"],
    "updated_at": "2024-01-01T13:00:00Z"
  },
  "message": "Product updated successfully"
}
```

#### Example Request
```bash
curl -X PUT https://api.veritas.app/api/products/COFFEE-2024-1001 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "description": "Premium single-origin coffee with enhanced traceability"
  }'
```

## Delete Product

### `DELETE /api/products/{batchId}`

Soft delete a product. Blockchain records remain immutable.

#### Response
```javascript
{
  "success": true,
  "data": {
    "batch_id": "COFFEE-2024-1001",
    "status": "deleted",
    "deleted_at": "2024-01-01T14:00:00Z"
  },
  "message": "Product deleted successfully"
}
```

#### Example Request
```bash
curl -X DELETE https://api.veritas.app/api/products/COFFEE-2024-1001 \
  -H "X-API-Key: your-api-key"
```

## Bulk Operations

### Bulk Submit Products

### `POST /api/products/bulk`

Submit multiple products in a single request.

#### Request Body
```javascript
{
  "products": [
    {
      "product_name": "Organic Coffee #1",
      "supplier_name": "Supplier A",
      "claims": [...]
    },
    {
      "product_name": "Organic Coffee #2",
      "supplier_name": "Supplier B",
      "claims": [...]
    }
  ]
}
```

#### Response
```javascript
{
  "success": true,
  "data": {
    "submitted": 2,
    "failed": 0,
    "results": [
      {
        "batch_id": "COFFEE-2024-1001",
        "status": "success"
      },
      {
        "batch_id": "COFFEE-2024-1002",
        "status": "success"
      }
    ]
  }
}
```

## QR Code Generation

### `GET /api/qr/{batchId}`

Generate QR code for product verification.

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | integer | 200 | QR code size in pixels |
| `format` | string | png | Image format (png, svg) |
| `margin` | integer | 4 | Margin size |

#### Response
Returns QR code image in specified format.

#### Example Request
```bash
# Get QR code as PNG
curl https://api.veritas.app/api/qr/COFFEE-2024-1001?size=300 \
  -H "X-API-Key: your-api-key" \
  -o qr-code.png

# Get QR code as SVG
curl https://api.veritas.app/api/qr/COFFEE-2024-1001?format=svg \
  -H "X-API-Key: your-api-key" \
  -o qr-code.svg
```

## Error Responses

### Validation Errors
```javascript
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "product_name": ["Product name is required"],
    "claims": ["At least one claim is required"]
  }
}
```

### Not Found
```javascript
{
  "success": false,
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "batch_id": "INVALID-BATCH-ID"
  }
}
```

### Blockchain Error
```javascript
{
  "success": false,
  "error": "Blockchain submission failed",
  "code": "BLOCKCHAIN_ERROR",
  "details": {
    "hedera_error": "Insufficient account balance",
    "retry_after": 300
  }
}
```

## Rate Limits

### Standard Limits
- **Submit Products**: 100 per hour
- **Get Product**: 1000 per hour
- **List Products**: 500 per hour
- **QR Generation**: 2000 per hour

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## SDK Examples

### Node.js
```javascript
const { VeritasClient } = require('@veritas/node-sdk');

const client = new VeritasClient({
  apiKey: process.env.VERITAS_API_KEY,
  environment: 'production'
});

// Submit product
const product = await client.products.create({
  product_name: 'Organic Coffee',
  supplier_name: 'Coffee Co.',
  claims: [{
    type: 'organic_certified',
    description: 'USDA Organic Certified'
  }]
});

// Get product
const retrieved = await client.products.get('COFFEE-2024-1001');

// List products
const products = await client.products.list({
  category: 'food_beverage',
  limit: 10
});
```

### Python
```python
from veritas import VeritasClient

client = VeritasClient(
    api_key=os.environ['VERITAS_API_KEY'],
    environment='production'
)

# Submit product
product = client.products.create({
    'product_name': 'Organic Coffee',
    'supplier_name': 'Coffee Co.',
    'claims': [{
        'type': 'organic_certified',
        'description': 'USDA Organic Certified'
    }]
})

# Get product
retrieved = client.products.get('COFFEE-2024-1001')

# List products
products = client.products.list(
    category='food_beverage',
    limit=10
)
```

---

**Next:** [Verification API](./verification.md) for product verification endpoints.