# Veritas API - cURL Commands Reference

This document provides comprehensive cURL commands for testing the Veritas API endpoints.

## Configuration

```bash
# Set base URL
export API_BASE_URL="http://localhost:3001"

# Store response variables (modify based on actual responses)
export PRODUCT_ID="your-product-uuid-here"
export BATCH_ID="COFFEE-2024-1234"
export CLAIM_ID="your-claim-uuid-here"
```

## Health Check

### Check API Health Status
```bash
curl -X GET "$API_BASE_URL/health" \
  -H "Content-Type: application/json" \
  | jq '.'
```

### Get API Information
```bash
curl -X GET "$API_BASE_URL/api" \
  -H "Content-Type: application/json" \
  | jq '.'
```

## Products

### Create Product with Multiple Claims
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Colombian Arabica Coffee",
    "supplier_name": "Fair Trade Coffee Co",
    "description": "Single origin beans from Colombian highlands, sustainably sourced",
    "claims": [
      {
        "claim_type": "organic_certified",
        "description": "USDA Organic Certified #COL-2024-001"
      },
      {
        "claim_type": "fair_trade",
        "description": "Fair Trade USA Certified - Supports farmer communities"
      },
      {
        "claim_type": "quality",
        "description": "Specialty Coffee Association rated 85+ points"
      }
    ]
  }' \
  | jq '.'
```

### Create Product without Claims
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Artisan Chocolate Bar",
    "supplier_name": "Swiss Chocolatiers Ltd",
    "description": "70% Dark chocolate made from single-origin cocoa beans"
  }' \
  | jq '.'
```

### Create Product with Custom Prefix (generates HIMALAYAN-2024-XXXX)
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Himalayan Pink Salt",
    "supplier_name": "Pure Mountain Minerals",
    "description": "Hand-mined pink salt from the Khewra Salt Mine",
    "claims": [
      {
        "claim_type": "authenticity",
        "description": "Verified origin from Khewra Salt Mine, Pakistan"
      }
    ]
  }' \
  | jq '.'
```

### Get Product by Batch ID
```bash
curl -X GET "$API_BASE_URL/api/products/$BATCH_ID" \
  -H "Content-Type: application/json" \
  | jq '.'
```

### Get Product by Batch ID (with specific example)
```bash
curl -X GET "$API_BASE_URL/api/products/COFFEE-2024-1234" \
  -H "Content-Type: application/json" \
  | jq '.'
```

## Verification

### Verify Product Authenticity
```bash
curl -X GET "$API_BASE_URL/api/verify/$BATCH_ID" \
  -H "Content-Type: application/json" \
  | jq '.'
```

### Verify Specific Product (with blockchain verification)
```bash
curl -X GET "$API_BASE_URL/api/verify/COFFEE-2024-1234" \
  -H "Content-Type: application/json" \
  | jq '.'
```

## Claims

### Add Claim to Existing Product
```bash
curl -X POST "$API_BASE_URL/api/claims" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "'$PRODUCT_ID'",
    "claim_type": "sustainability",
    "description": "Carbon neutral shipping and packaging verified by third-party auditor"
  }' \
  | jq '.'
```

### Add Quality Claim
```bash
curl -X POST "$API_BASE_URL/api/claims" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "'$PRODUCT_ID'",
    "claim_type": "quality",
    "description": "Winner of International Coffee Excellence Awards 2024"
  }' \
  | jq '.'
```

## Error Testing

### Test Missing Required Field
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Test Product",
    "description": "Missing supplier_name field"
  }' \
  | jq '.'
```
**Expected: 400 Bad Request with validation error**

### Test Invalid Batch ID Format
```bash
curl -X GET "$API_BASE_URL/api/products/invalid-batch-id" \
  -H "Content-Type: application/json" \
  | jq '.'
```
**Expected: 400 Bad Request with validation error**

### Test Non-existent Product
```bash
curl -X GET "$API_BASE_URL/api/products/NONEXISTENT-2024-9999" \
  -H "Content-Type: application/json" \
  | jq '.'
```
**Expected: 404 Not Found**

### Test Invalid UUID in Claim
```bash
curl -X POST "$API_BASE_URL/api/claims" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "invalid-uuid-format",
    "claim_type": "quality",
    "description": "Testing invalid UUID format"
  }' \
  | jq '.'
```
**Expected: 400 Bad Request with validation error**

### Test Empty Product Name
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "",
    "supplier_name": "Test Supplier",
    "description": "Empty product name test"
  }' \
  | jq '.'
```
**Expected: 400 Bad Request**

### Test Product Name Too Long
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "'$(python -c "print('A' * 300)")'",
    "supplier_name": "Test Supplier",
    "description": "Product name exceeds 255 character limit"
  }' \
  | jq '.'
```
**Expected: 400 Bad Request**

### Test Malformed JSON
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Test Product", "invalid_json"}' \
  | jq '.'
```
**Expected: 400 Bad Request**

## Performance Testing

### Concurrent Product Creation Test
```bash
# Create 5 products simultaneously
for i in {1..5}; do
  curl -X POST "$API_BASE_URL/api/products" \
    -H "Content-Type: application/json" \
    -d '{
      "product_name": "Performance Test Product '$i'",
      "supplier_name": "Performance Test Supplier",
      "description": "Product created for performance testing batch '$i'"
    }' &
done
wait
echo "All concurrent requests completed"
```

### Load Testing with Different Products
```bash
# Array of test products
products=(
  '{"product_name": "Ethiopian Coffee", "supplier_name": "Highland Farms", "description": "Single origin coffee beans"}'
  '{"product_name": "Swiss Chocolate", "supplier_name": "Alpine Chocolatiers", "description": "Premium dark chocolate"}'
  '{"product_name": "Italian Olive Oil", "supplier_name": "Tuscan Groves", "description": "Extra virgin olive oil"}'
  '{"product_name": "Japanese Matcha", "supplier_name": "Kyoto Gardens", "description": "Ceremonial grade matcha powder"}'
  '{"product_name": "French Lavender Oil", "supplier_name": "Provence Aromatics", "description": "Pure essential oil"}'
)

# Create products in sequence
for product in "${products[@]}"; do
  echo "Creating product: $product"
  curl -X POST "$API_BASE_URL/api/products" \
    -H "Content-Type: application/json" \
    -d "$product" \
    | jq '.product.batch_id'
  sleep 1
done
```

## Advanced Testing

### Test with Special Characters
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Café \"Special\" & <Unique> Product™",
    "supplier_name": "Test Supplier Ltd.",
    "description": "Testing special character handling: áéíóú, çñü, emoji: 🌟✨"
  }' \
  | jq '.'
```

### Test with Unicode Characters
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Unicode Test Product",
    "supplier_name": "International Supplier",
    "description": "Testing unicode: 中文, العربية, русский, 日本語, हिंदी"
  }' \
  | jq '.'
```

### Test Large Claim Description
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Large Description Test",
    "supplier_name": "Test Supplier",
    "description": "Testing large description field",
    "claims": [{
      "claim_type": "quality",
      "description": "'$(python -c "print('This is a very long claim description that tests the maximum length limits of the description field. ' * 20)")''"
    }]
  }' \
  | jq '.'
```

## Monitoring and Debugging

### Check Response Time
```bash
curl -X GET "$API_BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "Response Time: %{time_total}s\nHTTP Status: %{http_code}\n" \
  -o /dev/null -s
```

### Test with Verbose Output
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Verbose Test Product",
    "supplier_name": "Test Supplier",
    "description": "Testing with verbose output"
  }' \
  -v \
  | jq '.'
```

### Save Response to File
```bash
curl -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "File Output Test",
    "supplier_name": "Test Supplier",
    "description": "Saving response to file"
  }' \
  -o response.json

# View the saved response
cat response.json | jq '.'
```

## Batch Operations

### Extract Product Information from Response
```bash
# Create product and extract key information
response=$(curl -s -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Batch Test Product",
    "supplier_name": "Batch Test Supplier",
    "description": "Product for batch operations"
  }')

# Extract values using jq
product_id=$(echo "$response" | jq -r '.product.id')
batch_id=$(echo "$response" | jq -r '.product.batch_id')

echo "Product ID: $product_id"
echo "Batch ID: $batch_id"

# Use extracted values in subsequent requests
curl -X GET "$API_BASE_URL/api/products/$batch_id" \
  -H "Content-Type: application/json" \
  | jq '.data.product.product_name'
```

### Pipeline Multiple Operations
```bash
# Create product, extract batch_id, then verify it
curl -s -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Pipeline Test Product",
    "supplier_name": "Pipeline Supplier",
    "description": "Testing pipeline operations"
  }' \
| jq -r '.product.batch_id' \
| xargs -I {} curl -s -X GET "$API_BASE_URL/api/verify/{}" \
  -H "Content-Type: application/json" \
| jq '.data.verification.overall_status'
```

## Environment-Specific Commands

### Development Environment
```bash
export API_BASE_URL="http://localhost:3001"
```

### Production Environment (if applicable)
```bash
export API_BASE_URL="https://api.veritas.com"
# Add authentication headers if required
export AUTH_HEADER="Authorization: Bearer your-token-here"
```

### Docker Environment
```bash
export API_BASE_URL="http://localhost:8080"
```

## Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash

API_BASE_URL="http://localhost:3001"

echo "🧪 Quick Veritas API Test"
echo "=========================="

# Health check
echo "1. Health Check:"
curl -s "$API_BASE_URL/health" | jq '.status'

# Create product
echo -e "\n2. Creating Product:"
response=$(curl -s -X POST "$API_BASE_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Quick Test Coffee",
    "supplier_name": "Test Supplier",
    "description": "Quick test product",
    "claims": [{
      "claim_type": "quality",
      "description": "High quality test product"
    }]
  }')

batch_id=$(echo "$response" | jq -r '.product.batch_id')
echo "Created product with batch_id: $batch_id"

# Verify product
echo -e "\n3. Verifying Product:"
curl -s "$API_BASE_URL/api/verify/$batch_id" | jq '.data.verification.overall_status'

echo -e "\n✅ Quick test completed!"
```

Make it executable and run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

## Troubleshooting

### Connection Issues
```bash
# Test if server is running
curl -I "$API_BASE_URL/health"

# Test with timeout
curl --max-time 10 "$API_BASE_URL/health"
```

### JSON Formatting Issues
```bash
# Validate JSON before sending
echo '{"product_name": "test"}' | jq '.' > /dev/null && echo "Valid JSON"

# Pretty print JSON response
curl -s "$API_BASE_URL/api" | jq '.'
```

### Debug Network Issues
```bash
# Show all headers and timing
curl -v -w "Total time: %{time_total}s\n" "$API_BASE_URL/health"
```

---

## Notes

- Replace `$API_BASE_URL` with your actual server URL
- Install `jq` for JSON parsing: `sudo apt-get install jq` (Linux) or `brew install jq` (Mac)
- All examples include `| jq '.'` for pretty-printed JSON output
- Expected HTTP status codes are included for error scenarios
- Use `-v` flag for verbose output when debugging
- Use `-s` flag for silent mode (no progress bar)