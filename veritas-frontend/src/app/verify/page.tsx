'use client';

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Shield, 
  Search, 
  ArrowLeft, 
  QrCode, 
  Loader2, 
  AlertCircle, 
  Camera, 
  X, 
  History,
  Zap,
  CheckCircle,
  ExternalLink,
  Share2,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { isValidBatchId } from '@/lib/api';

// Force dynamic rendering
export const dynamicParams = false;

// Dynamically import QR scanner to avoid SSR issues
const QrScanner = dynamic(() => import('react-qr-barcode-scanner'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">Loading camera...</div>
});

const searchSchema = z.object({
  batchId: z.string()
    .min(1, 'Batch ID is required')
    .regex(/^[A-Z]{3}-\d{4}-\d{6}$/, 'Invalid batch ID format. Expected format: VRT-2024-123456'),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface RecentVerification {
  batchId: string;
  productName: string;
  timestamp: string;
  verified: boolean;
}

export default function VerifyPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState<RecentVerification[]>([]);
  const [searchMode, setSearchMode] = useState<'manual' | 'qr'>('manual');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });

  const batchIdValue = watch('batchId');

  // Load recent verifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentVerifications');
    if (stored) {
      try {
        setRecentVerifications(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent verifications:', error);
      }
    }
  }, []);

  const addToRecentVerifications = (batchId: string, productName: string = 'Unknown Product', verified: boolean = true) => {
    const newVerification: RecentVerification = {
      batchId,
      productName,
      timestamp: new Date().toISOString(),
      verified,
    };
    
    const updated = [newVerification, ...recentVerifications.filter(v => v.batchId !== batchId)].slice(0, 5);
    setRecentVerifications(updated);
    localStorage.setItem('recentVerifications', JSON.stringify(updated));
  };

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    
    try {
      const batchId = data.batchId.toUpperCase();
      addToRecentVerifications(batchId);
      router.push(`/verify/${batchId}`);
    } catch (error) {
      toast.error('Failed to navigate to verification page');
      setIsSearching(false);
    }
  };

  const handleQrScan = (result: string) => {
    try {
      // Extract batch ID from QR code data or URL
      let batchId = result;
      
      // If it's a URL, try to extract the batch ID
      if (result.includes('/verify/')) {
        const match = result.match(/\/verify\/([A-Z]{3}-\d{4}-\d{6})/);
        if (match) {
          batchId = match[1];
        }
      }
      
      // Validate and format the batch ID
      if (isValidBatchId(batchId)) {
        setValue('batchId', batchId);
        setShowQrScanner(false);
        toast.success('QR code scanned successfully!');
        
        // Auto-submit after successful scan
        setTimeout(() => {
          router.push(`/verify/${batchId}`);
        }, 500);
      } else {
        toast.error('QR code does not contain a valid batch ID');
      }
    } catch (error) {
      toast.error('Error processing QR code');
    }
  };

  const handleQrError = (error: any) => {
    console.error('QR Scanner Error:', error);
    toast.error('Camera access error. Please check permissions.');
  };

  const handleSampleBatchId = () => {
    setValue('batchId', 'VRT-2024-123456');
  };

  const formatBatchId = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 13)}`;
    }
  };

  const handleBatchIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBatchId(e.target.value);
    setValue('batchId', formatted);
  };

  const handleRecentVerificationClick = (batchId: string) => {
    router.push(`/verify/${batchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
              <Link href="/submit" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Submit Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-6 rounded-full">
              <Search className="w-16 h-16 text-purple-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verify Product Authenticity
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Scan a QR code or enter a batch ID to instantly verify product authenticity using blockchain technology.
          </p>

          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md border">
              <button
                onClick={() => setSearchMode('manual')}
                className={`px-6 py-2 rounded-md transition-colors font-medium flex items-center gap-2 ${
                  searchMode === 'manual' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Search className="w-4 h-4" />
                Manual Entry
              </button>
              <button
                onClick={() => setSearchMode('qr')}
                className={`px-6 py-2 rounded-md transition-colors font-medium flex items-center gap-2 ${
                  searchMode === 'qr' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Camera className="w-4 h-4" />
                QR Scanner
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Search Section */}
          <div className="lg:col-span-2">
            {searchMode === 'manual' ? (
              /* Manual Search Form */
              <div className="bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Search className="w-6 h-6 text-purple-600" />
                    Enter Batch ID
                  </h2>
                  <p className="text-gray-600 mt-1">Type or paste the batch ID found on your product</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                  <div className="mb-6">
                    <label htmlFor="batchId" className="block text-sm font-semibold text-gray-700 mb-3">
                      Product Batch ID *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="batchId"
                        {...register('batchId')}
                        onChange={handleBatchIdChange}
                        className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center"
                        placeholder="VRT-2024-123456"
                        disabled={isSearching}
                        maxLength={14}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    {errors.batchId && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-sm">{errors.batchId.message}</p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-sm text-gray-500">
                      <p>Expected format: <span className="font-mono bg-gray-100 px-2 py-1 rounded">VRT-YYYY-XXXXXX</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isSearching || !batchIdValue}
                      className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Verifying Product...
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6" />
                          Verify Product
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSampleBatchId}
                      className="w-full py-3 px-6 border-2 border-purple-200 text-purple-700 rounded-lg hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium"
                      disabled={isSearching}
                    >
                      Try Demo: VRT-2024-123456
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* QR Scanner */
              <div className="bg-white rounded-xl shadow-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Camera className="w-6 h-6 text-purple-600" />
                        QR Code Scanner
                      </h2>
                      <p className="text-gray-600 mt-1">Point your camera at the QR code on the product</p>
                    </div>
                    <button
                      onClick={() => setShowQrScanner(!showQrScanner)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        showQrScanner
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {showQrScanner ? 'Stop Camera' : 'Start Camera'}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {showQrScanner ? (
                    <div className="relative">
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-4">
                        <QrScanner
                          onUpdate={(err: any, result: any) => {
                            if (result) {
                              handleQrScan(result.text);
                            }
                          }}
                          onError={handleQrError}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full border-2 border-purple-500 rounded-lg relative">
                          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-500"></div>
                          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-500"></div>
                          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-500"></div>
                          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-500"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Camera Ready</h3>
                      <p className="text-gray-500 mb-4">Click "Start Camera" to begin scanning QR codes</p>
                      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                        <span>• Make sure QR code is visible</span>
                        <span>• Hold steady for best results</span>
                        <span>• Good lighting helps</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent Verifications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Recent Verifications
                </h3>
                <p className="text-gray-600 text-sm mt-1">Your recently verified products</p>
              </div>

              <div className="p-6">
                {recentVerifications.length > 0 ? (
                  <div className="space-y-3">
                    {recentVerifications.map((verification, index) => (
                      <div
                        key={`${verification.batchId}-${index}`}
                        onClick={() => handleRecentVerificationClick(verification.batchId)}
                        className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {verification.verified ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            )}
                            <span className="font-mono text-sm text-purple-700 group-hover:text-purple-800">
                              {verification.batchId}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-purple-600" />
                        </div>
                        
                        <p className="text-sm text-gray-700 group-hover:text-gray-900 mb-1 truncate">
                          {verification.productName}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(verification.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-2">No recent verifications</p>
                    <p className="text-gray-400 text-xs">Verified products will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Link
                  href="/submit"
                  className="w-full flex items-center gap-2 px-3 py-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Submit New Product
                </Link>
                <button
                  onClick={() => {
                    setRecentVerifications([]);
                    localStorage.removeItem('recentVerifications');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <QrCode className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">QR Code Scanning</h3>
            </div>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>• Point camera at QR code on product packaging</p>
              <p>• Automatic batch ID extraction and verification</p>
              <p>• Works with any standard QR code reader</p>
              <p>• Instant results with blockchain proof</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Blockchain Security</h3>
            </div>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>• All data stored on Hedera blockchain</p>
              <p>• Tamper-proof and immutable records</p>
              <p>• Real-time verification against network</p>
              <p>• Direct links to blockchain explorer</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Instant Results</h3>
            </div>
            <div className="space-y-2 text-gray-600 text-sm">
              <p>• Complete product information display</p>
              <p>• All verified claims with evidence</p>
              <p>• Trust indicators and certification badges</p>
              <p>• Social sharing and bookmarking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}