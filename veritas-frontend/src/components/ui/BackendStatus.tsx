'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { getBackendStatus, refreshBackendStatus } from '@/lib/api-with-fallback';

export function BackendStatus() {
  const [status, setStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check status on mount
    const checkStatus = () => {
      const { status: currentStatus } = getBackendStatus();
      setStatus(currentStatus);
    };

    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const isAvailable = await refreshBackendStatus();
      setStatus(isAvailable ? 'available' : 'unavailable');
    } catch (error) {
      setStatus('unavailable');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          message: 'Backend Connected',
          description: 'Full functionality available'
        };
      case 'unavailable':
        return {
          icon: WifiOff,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          message: 'Demo Mode',
          description: 'Using demo data - backend unavailable'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          message: 'Checking...',
          description: 'Verifying backend connection'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Don't show if backend is available (no need to clutter UI)
  if (status === 'available') {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg max-w-sm`}>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm font-medium ${config.color}`}>
              {config.message}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`text-xs ${config.color} hover:underline`}
            >
              {showDetails ? 'Hide' : 'Info'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-1 rounded hover:bg-white/50 ${config.color}`}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-2 pt-2 border-t border-current/20">
            <p className={`text-xs ${config.color}/80`}>
              {config.description}
            </p>
            {status === 'unavailable' && (
              <p className={`text-xs ${config.color}/60 mt-1`}>
                All features work with realistic demo data
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}