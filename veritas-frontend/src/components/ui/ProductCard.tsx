'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  User, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Shield, 
  Eye, 
  QrCode,
  ExternalLink 
} from 'lucide-react';
import { InlineQRCode } from './QRCodeDisplay';
import type { ProductCardProps } from '@/types';

export default function ProductCard({ 
  product, 
  claims = [], 
  showActions = true, 
  compact = false 
}: ProductCardProps) {
  const verifiedClaims = claims.filter(claim => claim.hcs_transaction_id);
  const pendingClaims = claims.filter(claim => !claim.hcs_transaction_id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getClaimTypeColor = (claimType: string) => {
    const colors = {
      'organic': 'bg-green-100 text-green-800',
      'fair-trade': 'bg-blue-100 text-blue-800',
      'sustainable': 'bg-emerald-100 text-emerald-800',
      'quality': 'bg-purple-100 text-purple-800',
      'origin': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[claimType as keyof typeof colors] || colors.other;
  };

  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{product.product_name}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.supplier_name}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="font-mono">{product.batch_id}</span>
              <span>{formatDate(product.created_at)}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <Link
                href={`/verify/${product.batch_id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="View details"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
        
        {claims.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">{claims.length} claims:</span>
            <div className="flex flex-wrap gap-1">
              {claims.slice(0, 3).map((claim, index) => (
                <span
                  key={claim.id}
                  className={`px-2 py-1 text-xs rounded-full ${getClaimTypeColor(claim.claim_type)}`}
                >
                  {claim.claim_type}
                </span>
              ))}
              {claims.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{claims.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{product.product_name}</h3>
              <p className="text-gray-600 flex items-center gap-1 mt-1">
                <User className="w-4 h-4" />
                {product.supplier_name}
              </p>
            </div>
          </div>
          
          {product.qr_code_url && (
            <div className="flex-shrink-0">
              <InlineQRCode 
                value={product.qr_code_url} 
                size={80}
                className="border-2 border-gray-300"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block font-medium text-gray-600">Batch ID</label>
            <p className="font-mono text-gray-900">{product.batch_id}</p>
          </div>
          <div>
            <label className="block font-medium text-gray-600">Created</label>
            <p className="text-gray-900 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(product.created_at)}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <label className="block font-medium text-gray-600 text-sm">Description</label>
            <p className="text-gray-900 mt-1">{product.description}</p>
          </div>
        )}
      </div>

      {/* Claims Section */}
      {claims.length > 0 && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Claims ({claims.length})
            </h4>
            
            <div className="flex items-center gap-4 text-sm">
              {verifiedClaims.length > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {verifiedClaims.length} Verified
                </span>
              )}
              {pendingClaims.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <Clock className="w-4 h-4" />
                  {pendingClaims.length} Pending
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {claims.map((claim, index) => (
              <div key={claim.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getClaimTypeColor(claim.claim_type)}`}>
                      {claim.claim_type.replace('-', ' ')}
                    </span>
                    {claim.hcs_transaction_id ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{claim.description}</p>
                  {claim.hcs_transaction_id && (
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      TX: {claim.hcs_transaction_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/verify/${product.batch_id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Link>
            
            {product.qr_code_url && (
              <button
                onClick={() => window.open(product.qr_code_url, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                QR Code
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton loading component for ProductCard
export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="w-20 h-20 bg-gray-200 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}