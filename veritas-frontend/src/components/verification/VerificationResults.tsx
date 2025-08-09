'use client';

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Info, 
  Shield, 
  Calendar, 
  User, 
  Package,
  Award,
  Zap,
  Globe,
  Share2,
  Copy,
  QrCode,
  Star,
  Verified,
  TrendingUp,
  Link as LinkIcon,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodePreview } from '@/components/ui/QRCodeDisplay';
import { ErrorComponent } from '@/components/ui/ErrorComponents';
import { VerificationSkeleton } from '@/components/ui/SkeletonLoaders';
import { TrustBadge, TrustScore, SecurityIndicator, BlockchainProof } from '@/components/ui/TrustIndicators';
import type { VerificationResultsProps, Claim, ProofLinks } from '@/types';

export default function VerificationResults({ data, loading, error }: VerificationResultsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  
  if (loading) {
    return <VerificationSkeleton />;
  }

  if (error) {
    const getErrorVariant = (errorMessage: string) => {
      if (errorMessage.toLowerCase().includes('network')) return 'network';
      if (errorMessage.toLowerCase().includes('timeout')) return 'timeout';
      if (errorMessage.toLowerCase().includes('server')) return 'server';
      return 'default';
    };

    return (
      <div className="max-w-6xl mx-auto p-6">
        <ErrorComponent
          error={error}
          variant={getErrorVariant(error)}
          onRetry={() => window.location.reload()}
          onHome={() => window.location.href = '/'}
        />
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Possible reasons for verification failure:</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Product batch ID doesn't exist in our database</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Product hasn't been submitted for verification yet</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Blockchain records are still being processed</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Network connectivity issues preventing data retrieval</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Verification Data</h2>
          <p className="text-gray-600">Unable to retrieve product verification information.</p>
        </div>
      </div>
    );
  }

  const { product, claims, qr_code, summary } = data;
  
  // Calculate trust score based on various factors
  const calculateTrustScore = () => {
    let score = 0;
    const verifiedClaims = claims.filter(c => c.hcs_transaction_id).length;
    const totalClaims = claims.length;
    
    // Base score for having data
    score += 20;
    
    // Score for verified claims
    score += (verifiedClaims / totalClaims) * 60;
    
    // Score for having blockchain data
    if (summary.has_hcs_data) score += 20;
    
    return Math.round(score);
  };

  const trustScore = calculateTrustScore();
  
  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100', icon: Award };
    if (score >= 75) return { level: 'Very Good', color: 'text-blue-600', bg: 'bg-blue-100', icon: Verified };
    if (score >= 60) return { level: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: CheckCircle };
    return { level: 'Needs Review', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle };
  };

  const trustLevel = getTrustLevel(trustScore);
  const TrustIcon = trustLevel.icon;

  const getClaimStatusIcon = (claim: Claim) => {
    if (claim.hcs_transaction_id) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getClaimStatusText = (claim: Claim) => {
    if (claim.hcs_transaction_id) {
      return 'Verified on Hedera';
    }
    return 'Pending verification';
  };

  const generateProofLinks = (claim: Claim): ProofLinks | null => {
    if (!claim.hcs_transaction_id) return null;
    
    const baseUrl = 'https://hashscan.io/testnet';
    return {
      transactionDetails: `${baseUrl}/transaction/${claim.hcs_transaction_id}`,
      topicMessages: `${baseUrl}/topic/0.0.123456`,
      hashscanTransaction: `${baseUrl}/transaction/${claim.hcs_transaction_id}`,
      hashscanTopic: `${baseUrl}/topic/0.0.123456`,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out the verified authenticity of ${product.product_name} on Veritas`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
    setShowShareModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Verification Status Header with Trust Score */}
      <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-200 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-green-100 rounded-full">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Product Verified</h1>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${trustLevel.bg} ${trustLevel.color}`}>
                  <TrustIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{trustLevel.level}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-700">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Authenticated Product</span>
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span>{claims.filter(c => c.hcs_transaction_id).length} of {claims.length} Claims Verified</span>
                </span>
                {summary.has_hcs_data && (
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-500" />
                    <span>Blockchain Secured</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Trust Score */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{trustScore}</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded-full border shadow-sm">
                <span className="text-xs font-medium text-gray-600">Trust Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share Verification
          </button>
          {qr_code && (
            <button
              onClick={() => toast.success('QR code download feature coming soon!')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <QrCode className="w-4 h-4" />
              Download QR Code
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Information */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Product Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Product Name</label>
                  <p className="text-xl font-bold text-gray-900">{product.product_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Batch ID</label>
                  <p className="text-lg font-mono bg-gray-100 text-gray-900 px-3 py-2 rounded border">
                    {product.batch_id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Supplier</label>
                  <p className="text-lg text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    {product.supplier_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Created</label>
                  <p className="text-lg text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    {formatDate(product.created_at)}
                  </p>
                </div>
                {product.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Description</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Claims Verification */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-green-600" />
                  Verified Claims ({claims.length})
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    {claims.filter(c => c.hcs_transaction_id).length} Verified
                  </span>
                  {claims.some(c => !c.hcs_transaction_id) && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                      {claims.filter(c => !c.hcs_transaction_id).length} Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {claims.map((claim, index) => {
                const proofLinks = generateProofLinks(claim);
                const isVerified = !!claim.hcs_transaction_id;
                
                return (
                  <div 
                    key={claim.id} 
                    className={`border-2 rounded-xl p-6 ${
                      isVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          isVerified ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {getClaimStatusIcon(claim)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 capitalize mb-1">
                            {claim.claim_type.replace('-', ' ')} Certification
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getClaimStatusText(claim)}
                            </span>
                            {isVerified && (
                              <div className="flex items-center gap-1 text-green-600">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-xs font-medium">Blockchain Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Claim #{index + 1}</div>
                        <div className="text-xs text-gray-500">{formatDate(claim.created_at)}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-800 leading-relaxed bg-white p-4 rounded-lg border">
                        {claim.description}
                      </p>
                    </div>

                    {proofLinks && (
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Blockchain Verification Proof
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <a
                            href={proofLinks.hashscanTransaction}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group"
                          >
                            <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">View Transaction</span>
                          </a>
                          <a
                            href={proofLinks.hashscanTopic}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors group"
                          >
                            <LinkIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">View Topic</span>
                          </a>
                        </div>
                        <div className="mt-3 p-2 bg-gray-50 rounded border">
                          <p className="text-xs text-gray-600 font-mono break-all">
                            Transaction ID: {claim.hcs_transaction_id}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code Display */}
          {qr_code && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                Product QR Code
              </h3>
              <QRCodePreview 
                url={qr_code.verificationData.verification_url}
                title="Scan to Verify"
                size={180}
              />
            </div>
          )}

          {/* Trust Metrics */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Trust Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Score</span>
                <span className="text-xl font-bold text-green-600">{trustScore}/100</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verification Progress</span>
                  <span className="font-medium">
                    {Math.round((claims.filter(c => c.hcs_transaction_id).length / claims.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(claims.filter(c => c.hcs_transaction_id).length / claims.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{claims.filter(c => c.hcs_transaction_id).length}</div>
                  <div className="text-xs text-gray-600">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{summary.claim_types.length}</div>
                  <div className="text-xs text-gray-600">Claim Types</div>
                </div>
              </div>
            </div>
          </div>

          {/* Claim Types */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Claim Categories</h3>
            <div className="space-y-2">
              {summary.claim_types.map((type, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium capitalize">
                    {type.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Verification</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share on Twitter</span>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 p-3 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share on Facebook</span>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full flex items-center gap-3 p-3 text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share on LinkedIn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}