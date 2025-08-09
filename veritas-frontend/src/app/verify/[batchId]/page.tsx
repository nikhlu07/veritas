'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Search, RefreshCw, AlertTriangle, Home, Share2, ExternalLink } from 'lucide-react';
import VerificationResults from '@/components/verification/VerificationResults';
import { verifyProduct, isValidBatchId } from '@/lib/api';
import toast from 'react-hot-toast';
import type { VerificationResponse } from '@/types';

export default function VerifyBatchPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = Array.isArray(params.batchId) ? params.batchId[0] : params.batchId;
  
  const [verificationData, setVerificationData] = useState<VerificationResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update document meta tags dynamically
  useEffect(() => {
    if (verificationData) {
      const { product } = verificationData;
      const title = `${product.product_name} - Verified on Veritas`;
      const description = `Blockchain-verified authenticity for ${product.product_name} by ${product.supplier_name}. View verification details and claims.`;
      const url = window.location.href;
      const imageUrl = `${window.location.origin}/api/og?batchId=${batchId}&product=${encodeURIComponent(product.product_name)}`;

      // Update document title
      document.title = title;

      // Update or create meta tags
      const updateMeta = (property: string, content: string, isProperty = false) => {
        const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (isProperty) {
            meta.setAttribute('property', property);
          } else {
            meta.setAttribute('name', property);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Basic meta tags
      updateMeta('description', description);
      updateMeta('keywords', `blockchain verification, product authenticity, ${product.supplier_name}, supply chain, verification`);

      // Open Graph tags
      updateMeta('og:title', title, true);
      updateMeta('og:description', description, true);
      updateMeta('og:url', url, true);
      updateMeta('og:type', 'website', true);
      updateMeta('og:image', imageUrl, true);
      updateMeta('og:image:width', '1200', true);
      updateMeta('og:image:height', '630', true);
      updateMeta('og:site_name', 'Veritas - Blockchain Product Verification', true);

      // Twitter Card tags
      updateMeta('twitter:card', 'summary_large_image');
      updateMeta('twitter:title', title);
      updateMeta('twitter:description', description);
      updateMeta('twitter:image', imageUrl);
      updateMeta('twitter:url', url);

      // Additional structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.product_name,
        "manufacturer": {
          "@type": "Organization",
          "name": product.supplier_name
        },
        "identifier": product.batch_id,
        "url": url,
        "description": product.description || description,
        "additionalProperty": verificationData.claims.map(claim => ({
          "@type": "PropertyValue",
          "name": claim.claim_type,
          "value": claim.description
        }))
      };

      // Update or create structured data script
      let structuredDataScript = document.querySelector('#structured-data-script') as HTMLScriptElement;
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data-script';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    } else if (batchId) {
      // Default meta tags for loading/error states
      const defaultTitle = `Verifying ${batchId} - Veritas`;
      const defaultDescription = `Verifying product authenticity for batch ${batchId} using blockchain technology.`;
      
      document.title = defaultTitle;
      
      const updateMeta = (property: string, content: string, isProperty = false) => {
        const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (isProperty) {
            meta.setAttribute('property', property);
          } else {
            meta.setAttribute('name', property);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMeta('description', defaultDescription);
      updateMeta('og:title', defaultTitle, true);
      updateMeta('og:description', defaultDescription, true);
    }
  }, [verificationData, batchId]);

  const fetchVerificationData = async (id: string, isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    setError(null);

    try {
      // Validate batch ID format
      if (!isValidBatchId(id)) {
        throw new Error('Invalid batch ID format. Expected format: VRT-YYYY-XXXXXX');
      }

      const response = await verifyProduct(id);
      
      if (response.success && response.data) {
        setVerificationData(response.data);
      } else {
        throw new Error('Product not found or verification failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify product';
      setError(errorMessage);
      setVerificationData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchVerificationData(batchId);
    }
  }, [batchId]);

  const handleRefresh = () => {
    if (batchId) {
      fetchVerificationData(batchId, true);
    }
  };

  const handleSearchAnother = () => {
    router.push('/verify');
  };

  const handleShare = async () => {
    if (!verificationData) return;

    const shareData = {
      title: `${verificationData.product.product_name} - Verified on Veritas`,
      text: `Check out the verified authenticity of ${verificationData.product.product_name} by ${verificationData.product.supplier_name}. All claims verified on blockchain.`,
      url: window.location.href,
    };

    // Try native Web Share API first (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to manual sharing
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Unable to share. Please copy the URL manually.');
    }
  };

  // Error state for invalid/missing batch ID
  if (!batchId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-600" />
                <h1 className="text-2xl font-bold text-gray-900">Veritas</h1>
              </Link>
              <nav className="flex items-center gap-8">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="/verify" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Verify Product
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Batch ID</h1>
          <p className="text-xl text-gray-600 mb-8">
            The batch ID in the URL is missing or invalid.
          </p>
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            Search for Product
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Veritas</h1>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link href="/verify" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Search className="w-4 h-4" />
                Search Another
              </Link>
              <Link href="/submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Submit Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Batch ID Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Verification</h1>
              <p className="text-gray-600 mt-1">
                Batch ID: <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{batchId}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {verificationData && !isLoading && !error && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button
                onClick={handleSearchAnother}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Another
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        <VerificationResults
          data={verificationData}
          loading={isLoading}
          error={error}
        />

        {/* Error Actions */}
        {error && !isLoading && (
          <div className="max-w-4xl mx-auto px-6 mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What can you do?</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Retrying...' : 'Try Again'}
                  </button>
                  
                  <button
                    onClick={handleSearchAnother}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    Search Different Product
                  </button>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <p><strong>Check the batch ID:</strong> Make sure it matches exactly what's on your product packaging.</p>
                  <p><strong>Wait and retry:</strong> The product might still be processing on the blockchain.</p>
                  <p><strong>Contact support:</strong> If the product should exist but isn't found, there might be an issue.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Actions */}
        {verificationData && !isLoading && !error && (
          <div className="max-w-4xl mx-auto px-6 mt-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Product Verified Successfully</h3>
              <p className="text-green-800 mb-4">
                This product's authenticity has been verified using blockchain technology. 
                All claims have been recorded immutably on the Hedera network.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/verify"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Search className="w-4 h-4" />
                  Verify Another Product
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 bg-white text-green-700 border border-green-300 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Product</h3>
              <p className="text-gray-600 text-center text-sm">
                Checking blockchain records for batch {batchId}...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}