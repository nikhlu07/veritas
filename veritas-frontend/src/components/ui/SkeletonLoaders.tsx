'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', width, height }: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  
  return (
    <div 
      className={`loading-skeleton ${className}`}
      style={style}
    />
  );
}

// Form skeleton loader
export function FormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="veritas-card p-8">
        <Skeleton height={32} className="w-2/3 mb-3" />
        <Skeleton height={20} className="w-full max-w-lg" />
      </div>

      {/* Form sections skeleton */}
      <div className="veritas-card p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <Skeleton height={24} className="w-1/3 mb-2" />
          <Skeleton height={16} className="w-1/2" />
        </div>
        
        <div className="space-y-4">
          <div>
            <Skeleton height={16} className="w-24 mb-2" />
            <Skeleton height={48} className="w-full" />
          </div>
          <div>
            <Skeleton height={16} className="w-32 mb-2" />
            <Skeleton height={48} className="w-full" />
          </div>
          <div>
            <Skeleton height={16} className="w-28 mb-2" />
            <Skeleton height={96} className="w-full" />
          </div>
        </div>
      </div>

      {/* Claims section skeleton */}
      <div className="veritas-card p-6 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <Skeleton height={24} className="w-1/4 mb-2" />
          <Skeleton height={16} className="w-3/4" />
        </div>
        
        <div className="border-2 border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton height={20} className="w-20" />
            <Skeleton height={32} className="w-24" />
          </div>
          <div>
            <Skeleton height={16} className="w-20 mb-2" />
            <Skeleton height={48} className="w-full" />
          </div>
          <div>
            <Skeleton height={16} className="w-32 mb-2" />
            <Skeleton height={72} className="w-full" />
          </div>
        </div>
      </div>

      {/* Submit button skeleton */}
      <div className="veritas-card p-6">
        <Skeleton height={56} className="w-full max-w-md mx-auto" />
      </div>
    </div>
  );
}

// QR Code skeleton loader
export function QRCodeSkeleton({ size = 256 }: { size?: number }) {
  return (
    <div className="text-center space-y-4">
      <div className="veritas-qr-container">
        <div className="veritas-qr-container__header">
          <Skeleton height={28} className="w-48 mx-auto mb-2" />
          <Skeleton height={16} className="w-64 mx-auto" />
        </div>
        
        <div className="veritas-qr-container__code mx-auto" style={{ width: size + 32, height: size + 32 }}>
          <Skeleton height={size} width={size} className="mx-auto" />
        </div>
        
        <div className="space-y-2">
          <Skeleton height={12} className="w-20 mx-auto" />
          <Skeleton height={32} className="w-40 mx-auto" />
        </div>
        
        <div className="veritas-qr-container__actions">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={60} />
          <Skeleton height={32} width={60} />
          <Skeleton height={32} width={70} />
        </div>
      </div>
    </div>
  );
}

// Verification results skeleton
export function VerificationSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton height={64} width={64} className="mx-auto rounded-full" />
        <Skeleton height={32} className="w-64 mx-auto" />
        <Skeleton height={20} className="w-80 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product details skeleton */}
        <div className="veritas-card p-6 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton height={24} width={24} />
            <Skeleton height={24} className="w-40" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton height={14} className="w-24 mb-1" />
                <Skeleton height={20} className="w-full" />
              </div>
            ))}
          </div>
          
          <div>
            <Skeleton height={14} className="w-28 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={24} className="w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* QR Code skeleton */}
        <div className="space-y-6">
          <QRCodeSkeleton size={200} />
          
          <div className="space-y-3">
            <Skeleton height={48} className="w-full" />
            <Skeleton height={48} className="w-full" />
          </div>
        </div>
      </div>

      {/* Blockchain proofs skeleton */}
      <div className="veritas-card p-6">
        <Skeleton height={24} className="w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton height={24} width={24} />
                  <div>
                    <Skeleton height={16} className="w-32 mb-1" />
                    <Skeleton height={12} className="w-20" />
                  </div>
                </div>
                <Skeleton height={20} className="w-16 rounded-full" />
              </div>
              <Skeleton height={16} className="w-full" />
              <Skeleton height={64} className="w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Card skeleton for grid layouts
export function CardSkeleton() {
  return (
    <div className="veritas-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton height={40} width={40} className="rounded-lg" />
        <div className="flex-1">
          <Skeleton height={20} className="w-3/4 mb-1" />
          <Skeleton height={14} className="w-1/2" />
        </div>
      </div>
      
      <div className="space-y-3">
        <Skeleton height={16} className="w-full" />
        <Skeleton height={16} className="w-5/6" />
        <Skeleton height={16} className="w-4/6" />
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <Skeleton height={32} className="w-24" />
        <Skeleton height={20} className="w-16" />
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200">
      <Skeleton height={48} width={48} className="rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton height={18} className="w-3/4 mb-2" />
        <Skeleton height={14} className="w-1/2 mb-1" />
        <Skeleton height={12} className="w-1/3" />
      </div>
      <Skeleton height={32} className="w-20" />
    </div>
  );
}

// Navigation skeleton
export function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Skeleton height={40} width={40} className="rounded-xl" />
        <Skeleton height={20} className="w-24" />
      </div>
      
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={16} className="w-16" />
        ))}
        <Skeleton height={32} className="w-24" />
      </div>
    </div>
  );
}

// Stats skeleton for dashboard
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="veritas-card p-6 text-center">
          <Skeleton height={48} width={48} className="mx-auto mb-3 rounded-xl" />
          <Skeleton height={32} className="w-16 mx-auto mb-1" />
          <Skeleton height={16} className="w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}