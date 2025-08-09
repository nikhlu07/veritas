import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  Product,
  CreateProductRequest,
  CreateProductResponse,
  VerificationResponse,
  HealthCheckResponse,
  BatchIdStatistics,
  ApiResponse,
  ApiError,
  ApiConfig
} from '@/types';

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

const apiClient = axios.create({
  baseURL: DEFAULT_CONFIG.baseUrl,
  timeout: DEFAULT_CONFIG.timeout,
  headers: DEFAULT_CONFIG.headers,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Retry utility function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError, attempt: number): boolean => {
  if (attempt >= RETRY_CONFIG.maxRetries) return false;
  
  if (!error.response) return true; // Network errors
  
  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  let lastError: AxiosError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as AxiosError;
      
      if (!shouldRetry(lastError, attempt)) {
        throw lastError;
      }
      
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, attempt); // Exponential backoff
      console.warn(`API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Error handler utility
const handleApiError = (error: AxiosError): ApiError => {
  const apiError: ApiError = {
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    // Server responded with error status
    apiError.status = error.response.status;
    const errorData = error.response.data;
    
    // Handle different error response formats
    if (typeof errorData === 'string') {
      apiError.message = errorData;
    } else if (errorData?.message) {
      apiError.message = errorData.message;
    } else if (errorData?.error) {
      apiError.message = errorData.error;
    } else {
      // Fallback to status text or generic message
      apiError.message = error.response.statusText || error.message;
    }
    
    apiError.details = errorData;
  } else if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timed out. Please try again.';
    } else if (error.code === 'NETWORK_ERROR') {
      apiError.message = 'Network error. Please check your internet connection.';
    } else {
      apiError.message = 'Network error - please check your connection';
    }
  } else {
    // Request configuration error
    apiError.message = error.message;
  }

  return apiError;
};

// API Functions

/**
 * Submit a new product with claims
 * POST /api/products
 */
export const submitProduct = async (
  formData: CreateProductRequest
): Promise<CreateProductResponse> => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.post<CreateProductResponse>('/api/products', formData);
      return response.data;
    });
  } catch (error) {
    console.error('Error submitting product:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Verify a product by batch ID
 * GET /api/verify/:batchId
 */
export const verifyProduct = async (batchId: string): Promise<VerificationResponse> => {
  try {
    return await retryRequest(async () => {
      const response = await apiClient.get<VerificationResponse>(`/api/verify/${batchId}`);
      return response.data;
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Get product details by batch ID
 * GET /api/products/:batchId
 */
export const getProduct = async (batchId: string): Promise<ApiResponse<Product>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product>>(`/api/products/${batchId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting product:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Get application health status
 */
export const getHealthStatus = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health status:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Get batch ID statistics
 */
export const getBatchIdStats = async (): Promise<BatchIdStatistics[]> => {
  try {
    const response = await apiClient.get<BatchIdStatistics[]>('/batch-stats');
    return response.data;
  } catch (error) {
    console.error('Error getting batch ID stats:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Search products (if available)
 */
export const searchProducts = async (query: string): Promise<ApiResponse<Product[]>> => {
  try {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw handleApiError(error as AxiosError);
  }
};

/**
 * Upload file (if needed for product images, etc.)
 */
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw handleApiError(error as AxiosError);
  }
};

// Export API client for custom requests
export { apiClient };

// Export configuration
export { DEFAULT_CONFIG };

// Utility functions
export const isValidBatchId = (batchId: string): boolean => {
  // Batch IDs follow a pattern like VRT-2024-XXXXXX (3 letters, 4 digits, 6 digits)
  const pattern = /^[A-Z]{3}-\d{4}-\d{6}$/;
  return pattern.test(batchId);
};

export const formatApiError = (error: ApiError): string => {
  return error.message || 'An unknown error occurred';
};