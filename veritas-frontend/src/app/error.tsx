'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="bg-red-100 p-4 rounded-full inline-block">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-32 whitespace-pre-wrap">
                {error.stack}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-gray-500">
                  Error ID: {error.digest}
                </p>
              )}
            </details>
          )}
        </div>
      </div>
    </div>
  );
}