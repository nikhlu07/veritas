'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError?: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error; 
  resetError?: () => void; 
}) {
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
            Something went wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          
          <div className="space-y-3">
            {resetError && (
              <button
                onClick={resetError}
                className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Home
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show error details
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Component-specific error fallbacks
export function FormErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error; 
  resetError?: () => void; 
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold mb-2">Form Error</h3>
          <p className="text-red-700 text-sm mb-4">
            {error?.message || 'Something went wrong with the form. Please try again.'}
          </p>
          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center gap-2 text-red-800 hover:text-red-900 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function APIErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error; 
  resetError?: () => void; 
}) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-yellow-800 font-semibold mb-2">Connection Error</h3>
          <p className="text-yellow-700 text-sm mb-4">
            {error?.message || 'Unable to connect to the server. Please check your internet connection and try again.'}
          </p>
          {resetError && (
            <button
              onClick={resetError}
              className="flex items-center gap-2 text-yellow-800 hover:text-yellow-900 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;