// Product and Claims Types
export interface Product {
  id: string;
  batch_id: string;
  product_name: string;
  supplier_name: string;
  description?: string;
  created_at: string;
  qr_code_url?: string;
}

export interface Claim {
  id: string;
  product_id: string;
  claim_type: string;
  description: string;
  hcs_transaction_id?: string;
  hcs_timestamp?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Product Creation Types
export interface CreateProductRequest {
  product_name: string;
  supplier_name: string;
  description?: string;
  claims: CreateClaimRequest[];
}

export interface CreateClaimRequest {
  claim_type: string;
  description: string;
}

export interface CreateProductResponse {
  product: {
    id: number;
    batch_id: string;
    product_name: string;
    supplier_name: string;
    description: string;
    created_at: string;
  };
  claims: {
    id: number;
    product_id: number;
    claim_type: string;
    description: string;
    hcs_transaction_id: string;
    created_at: string;
  }[];
  qr_code: {
    batchId: string;
    verificationData: {
      batch_id: string;
      verification_url: string;
    };
  };
  hcs_results: {
    type: string;
    success: boolean;
    data: {
      transactionId: string;
      topicId: string;
    };
  }[];
}

// QR Code Types
export interface QRCodeData {
  dataUrl: string;
  verificationData: {
    verification_url: string;
  };
}

// HCS (Hedera Consensus Service) Types
export interface HCSResult {
  type: 'PRODUCT' | 'CLAIM';
  success: boolean;
  data?: HCSTransaction;
  error?: string;
  claim_id?: string;
}

export interface HCSTransaction {
  transactionId: string;
  timestamp: string;
  topicId: string;
  sequenceNumber?: number;
  message: string | Record<string, unknown>;
}

// Verification Types
export interface VerificationResponse {
  success: boolean;
  data: {
    product: {
      id: number;
      product_name: string;
      supplier_name: string;
      batch_id: string;
      description: string;
      created_at: string;
    };
    claims: {
      id: number;
      product_id: number;
      claim_type: string;
      description: string;
      hcs_transaction_id: string;
      created_at: string;
    }[];
    qr_code: {
      batchId: string;
      verificationData: {
        batch_id: string;
        verification_url: string;
      };
    };
    summary: {
      total_claims: number;
      verified_claims: number;
      claim_types: string[];
      has_hcs_data: boolean;
    };
  };
  timestamp: string;
}

export interface ProofLinks {
  transactionDetails: string;
  topicMessages: string;
  hashscanTransaction: string;
  hashscanTopic: string;
}

// Form Types
export interface SubmitFormData {
  product_name: string;
  supplier_name: string;
  description?: string;
  claims: Array<{
    claim_type: string;
    description: string;
  }>;
}

export interface SearchFormData {
  batchId: string;
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  claims?: Claim[];
  showActions?: boolean;
  compact?: boolean;
}

export interface QRCodeDisplayProps {
  qrData: QRCodeData;
  size?: number;
  showUrl?: boolean;
  title?: string;
}

export interface VerificationResultsProps {
  data: VerificationResponse['data'];
  loading?: boolean;
  error?: string;
}

// Loading and Error States
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  service: string;
  database: string;
  hedera: string;
  error?: string;
}

// Statistics Types
export interface BatchIdStatistics {
  prefix: string;
  year: number;
  totalCount: number;
  firstBatchId?: string;
  lastBatchId?: string;
  firstCreated?: string;
  lastCreated?: string;
  pattern: string;
}

// Utility Types
export type ClaimType = 'organic' | 'fair-trade' | 'sustainable' | 'quality' | 'origin' | 'other';

export type ProductStatus = 'verified' | 'pending' | 'error';

export type NetworkType = 'mainnet' | 'testnet';

// Re-export commonly used types
export type {
  SubmitFormData as FormData,
  CreateProductRequest as ProductSubmission,
  VerificationResponse as VerificationData,
};