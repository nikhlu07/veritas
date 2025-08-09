# 🗃️ Database Setup Guide

## Quick PostgreSQL Setup

### Option 1: Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name veritas-postgres \
  -e POSTGRES_DB=veritas \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Wait for startup, then create schema
docker exec -i veritas-postgres psql -U postgres -d veritas < db/schema.sql
```

### Option 2: Local Installation
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database: `createdb veritas`
3. Run schema: `psql -U postgres -d veritas -f db/schema.sql`

### Option 3: Cloud Database
- **Supabase**: Free tier, instant setup
- **Railway**: PostgreSQL hosting
- **Aiven**: Managed PostgreSQL

## Update Environment Variables

Create/update your `.env` file:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false
```

## Test Database Connection

```bash
# Test connection
npm run validate-db

# Create schema
npm run setup-db

# Load sample data
npm run test:load-data
```

## Full API Test Commands

Once database is running:

```bash
# Start server
npm run server

# Test health (should show database: connected)
curl http://localhost:3001/health

# Submit test product
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Colombian Coffee",
    "supplier_name": "Coffee Co",
    "description": "Premium organic coffee",
    "claims": [
      {
        "claim_type": "organic", 
        "description": "Certified organic by USDA"
      },
      {
        "claim_type": "fair-trade",
        "description": "Fair trade certified"
      }
    ]
  }'

# Get product by batch ID (use the returned batch_id)
curl http://localhost:3001/api/products/COFFEE-2024-1234

# Verify product
curl http://localhost:3001/api/verify/COFFEE-2024-1234
```

## Expected API Response

Successful product creation:
```json
{
  "success": true,
  "product": {
    "id": "uuid-here",
    "batch_id": "COFFEE-2024-1234",
    "product_name": "Colombian Coffee",
    "supplier_name": "Coffee Co",
    "qr_code_url": "http://localhost:3000/verify/COFFEE-2024-1234"
  },
  "claims": [
    {
      "id": "claim-uuid",
      "claim_type": "organic",
      "description": "Certified organic by USDA",
      "hcs_transaction_id": "0.0.123456@1641234567.123456789",
      "hcs_timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "hcs_results": [
    {
      "type": "PRODUCT",
      "success": true,
      "data": {
        "transactionId": "0.0.123456@1641234567.123456789",
        "topicId": "0.0.6526078"
      }
    }
  ]
}
```

## Troubleshooting

### Database Issues
- ❌ Connection timeout → Check PostgreSQL is running
- ❌ Authentication failed → Verify credentials in .env
- ❌ Database not found → Create database first

### Hedera Issues
- ✅ Your configuration is working: Account `0.0.6526688-gvcyy`, Topic `0.0.6526078`
- ❌ Invalid signature → Check account ID matches private key
- ❌ Insufficient funds → Add HBAR to account

### API Issues  
- ❌ 404 errors → Check server is running on port 3001
- ❌ Validation errors → Check request body format
- ❌ 500 errors → Check server logs for details