'use client';

import React, { useState } from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Server,
  Clock,
  Shield
} from 'lucide-react';

interface ErrorComponentProps {
  error: Error | string;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
  variant?: 'default' | 'network' | 'server' | 'timeout' | 'validation';
}

export function ErrorComponent({ 
  error, 
  onRetry, 
  onHome, 
  className = '',
  variant = 'default'
}: ErrorComponentProps) {
  const [showDetails, setShowDetails] = useState(false);
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' ? error.stack : null;

  const getErrorConfig = () => {
    switch (variant) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Network Error',
          description: 'Unable to connect to our servers',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'server':
        return {
          icon: Server,
          title: 'Server Error',
          description: 'Something went wrong on our end',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'timeout':
        return {
          icon: Clock,
          title: 'Request Timeout',
          description: 'The request took too long to complete',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'validation':
        return {
          icon: Shield,
          title: 'Validation Error',
          description: 'Please check your input and try again',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          description: 'An unexpected error occurred',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={`veritas-error-state ${className}`}>
      <div className="veritas-error-state__icon">
        <Icon className="w-12 h-12 text-white" />
      </div>
      
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{config.title}</h3>
          <p className="text-gray-600 mb-4">{config.description}</p>
          <div className={`inline-block px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
            <p className={`text-sm font-medium ${config.color}`}>
              {errorMessage}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="veritas-button veritas-button--primary"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          
          {onHome && (
            <button
              onClick={onHome}
              className="veritas-button veritas-button--secondary"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>

        {errorStack && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDetails ? 'Hide' : 'Show'} Technical Details
            </button>
            
            {showDetails && (
              <div className="mt-4 max-w-2xl mx-auto">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-left font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap break-words">
                    {errorStack}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline error for form fields and smaller components
interface InlineErrorProps {
  error: string;
  className?: string;
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  return (
    <div className={`flex items-center gap-2 text-red-600 animate-slide-up ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm">{error}</span>
    </div>
  );
}

// Network status indicator
export function NetworkStatus() {
  // Disabled in development - navigator.onLine can be unreliable
  // const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // React.useEffect(() => {
  //   const handleOnline = () => setIsOnline(true);
  //   const handleOffline = () => setIsOnline(false);

  //   window.addEventListener('online', handleOnline);
  //   window.addEventListener('offline', handleOffline);

  //   return () => {
  //     window.removeEventListener('online', handleOnline);
  //     window.removeEventListener('offline', handleOffline);
  //   };
  // }, []);

  // if (isOnline) return null;

  // Always return null in development to avoid false offline detection
  return null;

  // return (
  //   <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium z-50">
  //     <div className="flex items-center justify-center gap-2">
  //       <WifiOff className="w-4 h-4" />
  //       You're currently offline. Some features may not work.
  //     </div>
  //   </div>
  // );
}

// Loading error boundary fallback
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorBoundaryFallback({ error, resetError }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <ErrorComponent
        error={error}
        onRetry={resetError}
        onHome={() => window.location.href = '/'}
        className="max-w-lg"
      />
    </div>
  );
}