# API Overview 📡

The Veritas API provides RESTful endpoints for product submission, verification, and blockchain interaction.

## Base URL

```
Production:  https://veritas-api.railway.app
Development: http://localhost:3002
```

## Authentication

Currently, the API is open for demo purposes. Authentication will be added in future versions.

## Core Endpoints

### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/products` | Submit new product with claims |
| `GET` | `/api/products/{batchId}` | Get product details |
| `GET` | `/api/products` | List all products |

### Verification API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/verify/{batchId}` | Verify product claims |
| `GET` | `/api/blockchain/{messageId}` | Get blockchain proof |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health status |

## Request/Response Format

All requests and responses use JSON format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

## Error Handling

Errors follow standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| `200` | Success |
| `400` | Bad Request |
| `404` | Not Found |
| `500` | Internal Server Error |

Error response format:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

- **Development**: No limits
- **Production**: 100 requests per minute per IP

## Examples

### Submit Product

```bash
curl -X POST https://veritas-api.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Organic Coffee",
    "supplier_name": "Mountain View Cooperative",
    "claims": [
      {
        "type": "organic_certified",
        "description": "USDA Organic Certified"
      }
    ]
  }'
```

### Verify Product

```bash
curl https://veritas-api.railway.app/api/verify/COFFEE-2024-1001
```

## SDKs and Libraries

- **JavaScript/Node.js**: Built-in fetch API
- **Python**: Coming soon
- **Go**: Coming soon

---

**Next:** [Products API](./products.md) for detailed endpoint documentation.