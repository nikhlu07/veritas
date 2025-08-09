# Multi-Business Veritas Setup

## Business Onboarding Process

### 1. Business Registration
- Business creates account on your platform
- You create a Hedera account for them OR they provide their own
- Store their credentials securely in your database

### 2. Database Schema Addition
```sql
-- Add business table
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  hedera_account_id VARCHAR(50) NOT NULL,
  hedera_private_key_encrypted TEXT NOT NULL,
  hedera_topic_id VARCHAR(50),
  subscription_plan VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add business_id to products table
ALTER TABLE products ADD COLUMN business_id UUID REFERENCES businesses(id);
```

### 3. Authentication Flow
```
Business Login → JWT Token → API calls with business context
```

### 4. Environment Variables Per Business
Instead of single credentials, use business-specific credentials:
```javascript
// Backend: Get business credentials from database
const business = await getBusiness(businessId);
const hederaAccount = business.hedera_account_id;
const hederaPrivateKey = decrypt(business.hedera_private_key_encrypted);
```

## Pricing Models

### Option 1: Per-Transaction
- $0.10 per product submission
- $0.05 per verification request
- Includes Hedera network fees

### Option 2: Monthly Subscription
- Starter: $29/month (100 products)
- Business: $99/month (1000 products)
- Enterprise: $299/month (unlimited)

### Option 3: White-Label
- $5000 setup fee
- $500/month hosting
- Business uses their own branding