# Veritas Frontend - TypeScript Types & API Utilities

## ✅ Core Types Implemented

### Product Type
```typescript
export interface Product {
  id: string;
  batch_id: string;
  product_name: string;
  supplier_name: string;
  description?: string;
  created_at: string;
  qr_code_url?: string;
}
```

### Claim Type  
```typescript
export interface Claim {
  id: string;
  product_id: string;
  claim_type: string;
  description: string;
  hcs_transaction_id?: string;
  hcs_timestamp?: string;
  created_at: string;
}
```

### API Response Types
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
  timestamp: string;
}
```

### Form Data Types
```typescript
export interface SubmitFormData {
  product_name: string;
  supplier_name: string;
  description?: string;
  claims: Array<{
    claim_type: string;
    description: string;
  }>;
}
```

## ✅ API Utilities Implemented

### Environment Configuration
- API base URL from `process.env.NEXT_PUBLIC_API_URL` 
- Fallback to `http://localhost:8080`
- Configurable timeout and headers

### Core API Functions

#### 1. Submit Product
```typescript
export const submitProduct = async (
  formData: CreateProductRequest
): Promise<CreateProductResponse>
```
- **Endpoint**: `POST /api/products`
- **Purpose**: Submit new product with claims for verification
- **Returns**: Complete product response with QR code and blockchain results

#### 2. Verify Product  
```typescript
export const verifyProduct = async (
  batchId: string
): Promise<VerificationResponse>
```
- **Endpoint**: `GET /api/verify/:batchId`
- **Purpose**: Verify product authenticity by batch ID
- **Returns**: Verification results with product details and claims

#### 3. Get Product
```typescript
export const getProduct = async (
  batchId: string
): Promise<ApiResponse<Product>>
```
- **Endpoint**: `GET /api/products/:batchId`
- **Purpose**: Get detailed product information
- **Returns**: Product data wrapped in API response

## ✅ Error Handling Features

### Axios Interceptors
- **Request logging**: Logs all outgoing API requests
- **Response logging**: Logs API response status
- **Error handling**: Comprehensive error processing

### Error Processing
```typescript
const handleApiError = (error: AxiosError): ApiError => {
  // Handles different error scenarios:
  // - Server errors (with status codes)
  // - Network errors (no response)  
  // - Request configuration errors
}
```

### Error Types
- **Server Errors**: Status code + error message from server
- **Network Errors**: Connection/timeout issues  
- **Validation Errors**: Request format problems

## ✅ Loading States & TypeScript

### Return Type Safety
- All API functions have explicit TypeScript return types
- Generic `ApiResponse<T>` for flexible data typing
- Proper error type definitions for catch blocks

### Loading State Integration
- Functions throw typed errors for proper catch handling
- Compatible with React state management
- Support for loading indicators and error boundaries

## ✅ Additional Features

### Utility Functions
```typescript
export const isValidBatchId = (batchId: string): boolean
export const formatApiError = (error: ApiError): string
```

### Export Structure
- Named exports for individual functions
- Export configured axios client for custom requests
- Export configuration for debugging

## Usage Examples

### Submit Product
```typescript
try {
  const result = await submitProduct({
    product_name: "Organic Coffee",
    supplier_name: "Green Valley Farms",
    description: "Premium organic coffee beans",
    claims: [
      { claim_type: "organic", description: "USDA Organic certified" }
    ]
  });
  
  console.log('Product submitted:', result.product.batch_id);
} catch (error) {
  console.error('Submission failed:', formatApiError(error));
}
```

### Verify Product
```typescript
try {
  const verification = await verifyProduct('VRT-2024-123456');
  console.log('Product verified:', verification.data.product.product_name);
} catch (error) {
  console.error('Verification failed:', formatApiError(error));
}
```

## Environment Setup

Add to your `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

This will automatically configure the API base URL for all requests.