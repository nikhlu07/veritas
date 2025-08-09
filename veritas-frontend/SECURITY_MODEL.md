# Veritas Security Model for Production

## Credential Management

### 1. Encrypted Storage
```javascript
// Store encrypted private keys
const encryptedKey = encrypt(hederaPrivateKey, masterKey);
await db.businesses.update({
  hedera_private_key_encrypted: encryptedKey
});
```

### 2. Environment Separation
```bash
# Development
HEDERA_ACCOUNT_ID=0.0.6535104-nvsjj
HEDERA_PRIVATE_KEY=your_dev_key

# Production - Multiple accounts
DATABASE_ENCRYPTION_KEY=your_master_key
HEDERA_NETWORK=mainnet
```

### 3. Access Control
- JWT authentication for businesses
- Role-based permissions
- API rate limiting
- Audit logging

## Business Isolation

### 1. Data Separation
- Each business only sees their own products
- Separate Hedera topics per business (optional)
- Encrypted data at rest

### 2. Network Security
- HTTPS only
- API key authentication
- IP whitelisting (enterprise)
- DDoS protection

## Compliance
- SOC 2 Type II
- GDPR compliance
- Data retention policies
- Regular security audits