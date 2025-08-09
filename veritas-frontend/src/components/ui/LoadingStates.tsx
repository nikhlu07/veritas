'use client';

import React from 'react';
import { Loader2, Shield, Package, Search, Upload } from 'lucide-react';

// Full page loading component
export function PageLoader({ 
  message = "Loading..." 
}: { 
  message?: string; 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="relative">
            <Shield className="w-16 h-16 text-blue-600 mx-auto" />
            <Loader2 className="w-6 h-6 text-blue-400 absolute -bottom-1 -right-1 animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Veritas</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineLoader({ 
  size = 'md',
  color = 'blue',
  message 
}: { 
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray';
  message?: string;
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
  };

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Loader2 className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      {message && (
        <span className="text-gray-600 text-sm">{message}</span>
      )}
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="w-20 h-20 bg-gray-200 rounded"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Form loading skeleton
export function FormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
      
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
        
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-16 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
        
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

// Verification results loading skeleton
export function VerificationSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="bg-gray-200 h-32 rounded-lg"></div>
      
      {/* Product Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-28"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
      
      {/* Claims */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Button loading state
export function LoadingButton({ 
  children, 
  isLoading = false, 
  icon: Icon,
  ...props 
}: { 
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${props.className} ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          Icon && <Icon className="w-4 h-4" />
        )}
        {children}
      </div>
    </button>
  );
}

// Search loading state
export function SearchLoader() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        <div className="relative">
          <Search className="w-8 h-8 text-blue-600" />
          <Loader2 className="w-4 h-4 text-blue-400 absolute -top-1 -right-1 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Searching...</h3>
      <p className="text-gray-600">Looking up product information</p>
    </div>
  );
}

// Upload loading state
export function UploadLoader({ progress }: { progress?: number }) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <div className="relative">
          <Upload className="w-8 h-8 text-green-600" />
          <Loader2 className="w-4 h-4 text-green-400 absolute -top-1 -right-1 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading...</h3>
      <p className="text-gray-600 mb-4">Processing your product submission</p>
      
      {progress !== undefined && (
        <div className="max-w-xs mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}% complete</p>
        </div>
      )}
    </div>
  );
}

// Processing state (for blockchain operations)
export function ProcessingLoader({ 
  step = 1, 
  totalSteps = 3,
  currentStep = "Processing..."
}: { 
  step?: number;
  totalSteps?: number;
  currentStep?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
        <div className="relative">
          <Package className="w-8 h-8 text-purple-600" />
          <Loader2 className="w-4 h-4 text-purple-400 absolute -top-1 -right-1 animate-spin" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing</h3>
      <p className="text-gray-600 mb-4">{currentStep}</p>
      
      <div className="max-w-xs mx-auto">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}