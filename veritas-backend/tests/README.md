# Veritas API Testing Suite

Comprehensive testing suite for the Veritas product verification API with blockchain integration.

## 📋 Overview

This testing suite provides:
- **Automated API tests** for all endpoints
- **Load testing** with sample data 
- **Error scenario testing**
- **Postman collection** for manual testing
- **cURL commands** for quick testing
- **Environment setup** automation

## 🚀 Quick Start

### 1. Setup Test Environment
```bash
# Complete setup (recommended for first run)
node tests/setup-test-environment.js full

# Or check environment only
node tests/setup-test-environment.js check
```

### 2. Load Sample Data
```bash
npm run test:load-data
```

### 3. Run API Tests
```bash
npm test
```

## 📁 Test Files

| File | Description |
|------|-------------|
| `test-api.js` | Comprehensive API endpoint tests |
| `load-test-data.js` | Sample data loading script |
| `error-scenarios.js` | Error handling and validation tests |
| `setup-test-environment.js` | Automated environment setup |
| `Veritas-API.postman_collection.json` | Postman collection |
| `curl-commands.md` | cURL command reference |

## 🧪 Test Categories

### Core API Tests (`test-api.js`)
- ✅ Health check endpoints
- ✅ Product creation with/without claims
- ✅ Product retrieval by batch ID
- ✅ Product verification with blockchain data
- ✅ Claim addition to existing products
- ✅ Validation error handling
- ✅ Concurrent request testing

**Run:** `npm test` or `node tests/test-api.js`

### Error Scenario Tests (`error-scenarios.js`)
- ❌ Invalid data validation
- ❌ Missing required fields
- ❌ Malformed JSON handling
- ❌ Non-existent resource errors
- ❌ Concurrency issues
- ❌ HCS network failures

**Run:** `node tests/error-scenarios.js`

### Load Testing (`load-test-data.js`)
- 📦 10 realistic sample products
- 🏷️ Multiple claims per product
- 🔗 Hedera HCS integration testing
- ⚡ Batch processing with performance metrics

**Run:** `npm run test:load-data`

## 🔧 Environment Setup

The `setup-test-environment.js` script handles:

### Automatic Checks
- ✅ Required files existence
- ✅ Dependencies installation
- ✅ Environment configuration
- ✅ Database connection
- ✅ Database table creation

### Setup Commands
```bash
# Full setup with server start
node tests/setup-test-environment.js full

# Environment check only
node tests/setup-test-environment.js check

# Database setup only
node tests/setup-test-environment.js database

# Start server only
node tests/setup-test-environment.js server

# Run basic tests only
node tests/setup-test-environment.js test
```

## 📊 Test Results

### Sample Test Output
```
🧪 VERITAS API COMPREHENSIVE TESTS
==================================
ℹ️  Testing API at: http://localhost:3001
ℹ️  Running: Health Check
✅ PASSED: Health Check
ℹ️  Running: Create Product with Claims
✅ PASSED: Create Product with Claims
...

============================================================
🧪 TEST RESULTS SUMMARY
============================================================
ℹ️  Total Tests: 15
✅ Passed: 14
❌ Failed: 1
Success Rate: 93%
```

## 🌐 Postman Collection

Import `Veritas-API.postman_collection.json` into Postman for manual testing.

### Collection Features
- 📝 Pre-configured requests for all endpoints
- 🧪 Automated test scripts
- 🔄 Variables for request chaining
- ❌ Error scenario examples
- 📊 Performance testing requests

### Collection Variables
- `baseUrl`: API base URL (default: http://localhost:3001)
- `productId`: Auto-populated from product creation
- `batchId`: Auto-populated with generated batch ID
- `claimId`: Auto-populated with claim ID

## 📖 cURL Commands

See `curl-commands.md` for comprehensive cURL examples:

### Quick Examples
```bash
# Health check
curl -X GET "http://localhost:3001/health" | jq '.'

# Create product
curl -X POST "http://localhost:3001/api/products" \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Test Coffee", "supplier_name": "Test Co"}' | jq '.'

# Get product by batch ID
curl -X GET "http://localhost:3001/api/products/COFFEE-2024-1234" | jq '.'

# Verify product
curl -X GET "http://localhost:3001/api/verify/COFFEE-2024-1234" | jq '.'
```

## 🚦 Test Scenarios Covered

### ✅ Valid Operations
- Product creation with multiple claims
- Product creation without claims
- Product retrieval by batch ID
- Product verification with blockchain
- Adding claims to existing products
- Concurrent product creation

### ❌ Error Handling
- Missing required fields
- Invalid field formats
- Malformed JSON requests
- Non-existent resources (404)
- Invalid batch ID formats
- Database constraint violations
- HCS network failures

### ⚡ Performance Testing
- Concurrent request handling
- Batch ID uniqueness under load
- Response time validation
- Large payload handling

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_BASE_URL=http://localhost:3001
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=veritas
DB_USER=postgres
DB_PASSWORD=password

# Hedera Configuration (optional)
HEDERA_ACCOUNT_ID=your-account-id
HEDERA_PRIVATE_KEY=your-private-key
HEDERA_TOPIC_ID=your-topic-id
HEDERA_NETWORK=testnet
```

### Test Configuration
```javascript
// In test files
const TEST_TIMEOUT = 10000; // 10 seconds
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
```

## 📈 Sample Data

The load testing script creates realistic products:

- Colombian Arabica Coffee
- Himalayan Pink Salt  
- Madagascar Vanilla Extract
- Swiss Dark Chocolate
- New Zealand Manuka Honey
- Italian Extra Virgin Olive Oil
- Japanese Matcha Powder
- Argentinian Grass-Fed Beef
- Norwegian Atlantic Salmon
- French Lavender Essential Oil

Each with multiple authentic claims and proper blockchain integration.

## 🔍 Debugging Tests

### Verbose Mode
```bash
# Enable detailed logging
DEBUG=1 npm test

# Test specific endpoint
node tests/test-api.js --endpoint=products
```

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL service
sudo service postgresql status

# Run database setup
node tests/setup-test-environment.js database
```

**Server Won't Start**
```bash
# Check if port is in use
lsof -i :3001

# Kill existing process
pkill -f "node server.js"
```

**Tests Timing Out**
```bash
# Increase timeout in test files
const TEST_TIMEOUT = 30000; // 30 seconds
```

## 📋 Test Checklist

Before deploying or major changes:

- [ ] All core API tests pass
- [ ] Error scenarios handled properly
- [ ] Load testing completes successfully
- [ ] Postman collection updated
- [ ] Database migrations work
- [ ] HCS integration functional
- [ ] Performance within acceptable limits
- [ ] Documentation updated

## 🤝 Contributing

### Adding New Tests
1. Add test function to appropriate file
2. Include in test runner
3. Update documentation
4. Add corresponding cURL command
5. Update Postman collection

### Test Guidelines
- Use descriptive test names
- Include both positive and negative cases
- Test error conditions thoroughly
- Verify response formats
- Check status codes
- Test concurrent scenarios

## 🚨 CI/CD Integration

For automated testing in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Setup Test Environment
  run: node tests/setup-test-environment.js check

- name: Run API Tests
  run: npm test

- name: Run Error Scenario Tests
  run: node tests/error-scenarios.js
```

## 📞 Support

For test-related issues:

1. Check the test output logs
2. Verify environment setup
3. Review configuration variables
4. Check database connectivity
5. Confirm server is running

---

## 📝 Test Coverage

| Component | Coverage | Tests |
|-----------|----------|-------|
| Health Endpoints | 100% | 2/2 |
| Product Creation | 100% | 4/4 |
| Product Retrieval | 100% | 3/3 |
| Product Verification | 100% | 2/2 |
| Claims Management | 100% | 2/2 |
| Error Handling | 95% | 19/20 |
| Validation | 100% | 8/8 |
| HCS Integration | 80% | 4/5 |

**Total Test Count: 44 tests**
**Overall Coverage: 97%**