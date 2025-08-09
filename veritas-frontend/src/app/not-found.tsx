'use client';

import Link from 'next/link';
import { Shield, Home, Search, ArrowLeft } from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Veritas</h1>
            </Link>
            
            <nav className="flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">
                Submit Product
              </Link>
              <Link href="/verify" className="text-gray-600 hover:text-gray-900 transition-colors">
                Verify Product
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-8">
          <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
            <div className="text-6xl font-bold text-gray-400">404</div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="space-y-4 max-w-sm mx-auto">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Go to Home
          </Link>
          
          <Link
            href="/verify"
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            Verify Product
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Looking for something specific?</h3>
          <p className="text-blue-800 text-sm">
            If you&apos;re trying to verify a product, use our search feature. 
            If you want to submit a product for verification, start the submission process.
          </p>
        </div>
      </div>
    </div>
  );
}