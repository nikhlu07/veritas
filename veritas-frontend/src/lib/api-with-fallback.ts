/**
 * API with Smart Fallback to Demo Data
 * 
 * This module provides API functions that automatically fallback to demo data
 * when the backend is unavailable, ensuring the frontend always works.
 */

import { DEMO_VERIFICATION_RESULTS, DEMO_PRODUCTS } from '@/data/demoData';
import type { CreateProductRequest, CreateProductResponse, VerificationResponse } from '@/types';

// Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  timeout: 5000, // 5 second timeout
  retries: 2
};

// Backend availability status
let backendStatus: 'unknown' | 'available' | 'unavailable' = 'unknown';
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

/**
 * Check if backend is available
 */
async function checkBackendHealth(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached status if recent
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL && backendStatus !== 'unknown') {
    return backendStatus === 'available';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    
    if (response.ok) {
      backendStatus = 'available';
      lastHealthCheck = now;
      return true;
    }
  } catch (error) {
    console.warn('Backend health check failed:', error);
  }

  backendStatus = 'unavailable';
  lastHealthCheck = now;
  return false;
}

/**
 * Make API request with fallback
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackData?: T
): Promise<{ data: T; source: 'backend' | 'demo'; error?: string }> {
  
  // Check backend availability first
  const isBackendAvailable = await checkBackendHealth();
  
  if (!isBackendAvailable) {
    if (fallbackData) {
      return {
        data: fallbackData,
        source: 'demo'
      };
    }
    throw new Error('Backend unavailable and no fallback data provided');
  }

  // Try backend request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data: data.data || data,
      source: 'backend'
    };

  } catch (error) {
    console.warn(`Backend request failed for ${endpoint}:`, error);
    
    // Mark backend as unavailable
    backendStatus = 'unavailable';
    lastHealthCheck = Date.now();

    // Use fallback if available
    if (fallbackData) {
      return {
        data: fallbackData,
        source: 'demo',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    throw error;
  }
}

/**
 * Submit product with fallback to demo response
 */
export async function submitProduct(productData: CreateProductRequest): Promise<{
  data: CreateProductResponse;
  source: 'backend' | 'demo';
  error?: string;
}> {
  // Generate demo response
  const demoResponse: CreateProductResponse = {
    product: {
      id: Math.floor(Math.random() * 1000),
      batch_id: `VRT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
      product_name: productData.product_name,
      supplier_name: productData.supplier_name,
      description: productData.description || '',
      created_at: new Date().toISOString()
    },
    claims: productData.claims.map((claim, index) => ({
      id: index + 1,
      product_id: 1,
      claim_type: claim.claim_type,
      description: claim.description,
      hcs_transaction_id: `0.0.6535104@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`,
      created_at: new Date().toISOString()
    })),
    qr_code: {
      batchId: `VRT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
      verificationData: {
        batch_id: `VRT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
        verification_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/VRT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`
      }
    },
    hcs_results: [
      {
        type: 'product',
        success: true,
        data: {
          transactionId: `0.0.6535104@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`,
          topicId: '0.0.6535283'
        }
      },
      ...productData.claims.map(claim => ({
        type: 'claim' as const,
        success: true,
        data: {
          transactionId: `0.0.6535104@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`,
          topicId: '0.0.6535283'
        }
      }))
    ]
  };

  return apiRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }, demoResponse);
}

/**
 * Verify product with fallback to demo data
 */
export async function verifyProduct(batchId: string): Promise<{
  data: VerificationResponse['data'];
  source: 'backend' | 'demo';
  error?: string;
}> {
  // Check if we have demo data for this batch ID
  const demoData = DEMO_VERIFICATION_RESULTS[batchId];
  
  // If no demo data, create generic demo response
  const fallbackData = demoData || {
    product: {
      id: 1,
      product_name: "Demo Product",
      supplier_name: "Demo Supplier",
      batch_id: batchId,
      description: "This is a demo product for testing purposes.",
      created_at: new Date().toISOString()
    },
    claims: [
      {
        id: 1,
        product_id: 1,
        claim_type: "demo",
        description: "This is a demo claim showing fallback functionality.",
        hcs_transaction_id: `0.0.6535104@${Date.now()}.${Math.floor(Math.random() * 1000000000)}`,
        created_at: new Date().toISOString()
      }
    ],
    qr_code: {
      batchId: batchId,
      verificationData: {
        batch_id: batchId,
        verification_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${batchId}`
      }
    },
    summary: {
      total_claims: 1,
      verified_claims: 1,
      claim_types: ["demo"],
      has_hcs_data: true
    }
  };

  return apiRequest(`/api/verify/${batchId}`, {
    method: 'GET',
  }, fallbackData);
}

/**
 * Get backend status for UI display
 */
export function getBackendStatus(): {
  status: 'unknown' | 'available' | 'unavailable';
  lastCheck: number;
} {
  return {
    status: backendStatus,
    lastCheck: lastHealthCheck
  };
}

/**
 * Force backend health check
 */
export async function refreshBackendStatus(): Promise<boolean> {
  lastHealthCheck = 0; // Force fresh check
  return checkBackendHealth();
}