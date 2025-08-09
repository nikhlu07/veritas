'use client';

import React, { useState } from 'react';

// Force dynamic rendering
export const dynamicParams = false;
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import SubmitForm from '@/components/forms/SubmitForm';
import QRCodeDisplay from '@/components/ui/QRCodeDisplay';
import DemoHelper from '@/components/demo/DemoHelper';
import type { CreateProductResponse, CreateProductRequest } from '@/types';

export default function SubmitPage() {
  const [submissionResult, setSubmissionResult] = useState<CreateProductResponse | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [demoData, setDemoData] = useState<CreateProductRequest | null>(null);

  const handleSubmissionSuccess = (response: CreateProductResponse) => {
    setSubmissionResult(response);
    setIsSuccess(true);
  };

  const handleSubmissionError = (error: Error) => {
    console.error('Submission error:', error);
    setIsSuccess(false);
  };

  const resetForm = () => {
    setSubmissionResult(null);
    setIsSuccess(false);
  };

  if (isSuccess && submissionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.svg" 
                  alt="Veritas Logo" 
                  className="w-8 h-8"
                />
                <h1 className="text-2xl font-bold text-gray-900">Veritas</h1>
              </div>
              
              <nav className="flex items-center gap-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <button
                  onClick={resetForm}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Another
                </button>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Product Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your product has been recorded on the blockchain and is ready for verification.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Product Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Product Name</label>
                    <p className="text-lg font-semibold text-gray-900">{submissionResult.product.product_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Supplier</label>
                    <p className="text-lg text-gray-900">{submissionResult.product.supplier_name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Batch ID</label>
                    <p className="text-lg font-mono text-blue-600 bg-blue-50 px-3 py-2 rounded border">
                      {submissionResult.product.batch_id}
                    </p>
                  </div>
                  
                  {submissionResult.product.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900">{submissionResult.product.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Claims Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Verified Claims ({submissionResult.claims.length})
                </h2>
                
                <div className="space-y-4">
                  {submissionResult.claims.map((claim, index) => (
                    <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {claim.claim_type.replace('-', ' ')} Claim
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{claim.description}</p>
                      
                      {claim.hcs_transaction_id && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-xs text-green-800">
                            <strong>Blockchain TX:</strong> {claim.hcs_transaction_id}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain Results */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Blockchain Status</h2>
                
                <div className="space-y-3">
                  {submissionResult.hcs_results.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border ${
                        result.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {result.type} Record
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      
                      {result.success && result.data && (
                        <p className="text-xs text-gray-600 font-mono">
                          TX: {result.data.transactionId}
                        </p>
                      )}
                      
                      {!result.success && result.error && (
                        <p className="text-xs text-red-600">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-6">
              <QRCodeDisplay
                qrData={submissionResult.qr_code}
                size={250}
                showUrl={true}
                title="Product Verification QR Code"
              />

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Next Steps</h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p className="text-sm">Download and print the QR code for your product packaging</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p className="text-sm">Share the batch ID with your customers</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p className="text-sm">Customers can scan the QR code or search the batch ID to verify authenticity</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  href={`/verify/${submissionResult.product.batch_id}`}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  View Verification Page
                </Link>
                
                <button
                  onClick={resetForm}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Submit Another Product
                </button>
                
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Veritas Logo" 
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-bold text-slate-900">Veritas</h1>
            </Link>
            
            <nav className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <Link href="/verify" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Verify Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Submit Product for Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Submit your product details and claims to generate a unique QR code and blockchain-verified proof of authenticity.
          </p>
        </div>

        {/* Form */}
        <SubmitForm
          onSuccess={handleSubmissionSuccess}
          onError={handleSubmissionError}
          demoData={demoData || undefined}
        />

        {/* Information Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                <p className="text-sm">Your product details are recorded on the Hedera blockchain</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                <p className="text-sm">A unique batch ID and QR code are generated</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
                <p className="text-sm">You can download the QR code for printing on packaging</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
                <p className="text-sm">Customers can verify your product&apos;s authenticity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why use Veritas?</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Immutable blockchain records that cannot be tampered with</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Instant verification through QR codes or batch ID search</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Built on Hedera Consensus Service for maximum security</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">Global accessibility and transparent verification process</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Helper */}
      <DemoHelper 
        page="submit" 
        onFillDemo={setDemoData}
      />
    </div>
  );
}