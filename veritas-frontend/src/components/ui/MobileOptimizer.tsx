'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, Wifi, WifiOff, Battery, Signal } from 'lucide-react';

// Mobile detection and optimization utilities
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [touchSupport, setTouchSupport] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTabletDevice = /ipad|tablet|playbook|silk/i.test(userAgent) || 
        (isMobileDevice && window.innerWidth >= 768);
      
      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);
      setTouchSupport('ontouchstart' in window);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkDevice();
    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return { isMobile, isTablet, orientation, touchSupport };
}

// Network status for mobile demo
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    setIsOnline(navigator.onLine);

    // @ts-ignore - Connection API is not fully standardized
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
}

// Mobile demo status bar
interface MobileDemoBarProps {
  className?: string;
}

export function MobileDemoBar({ className = '' }: MobileDemoBarProps) {
  const { isMobile, isTablet } = useMobileDetection();
  const { isOnline, connectionType } = useNetworkStatus();

  if (!isMobile && !isTablet) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 bg-black text-white text-xs px-4 py-1 flex justify-between items-center z-50 ${className}`}>
      <div className="flex items-center gap-2">
        <span>9:41</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-white">Veritas Demo</span>
      </div>
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Signal className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <Wifi className="w-3 h-3" />
        <Battery className="w-3 h-3" />
        <span>100%</span>
      </div>
    </div>
  );
}

// Mobile-optimized input wrapper
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  children?: React.ReactNode;
}

export function MobileInput({ label, error, className = '', children, ...props }: MobileInputProps) {
  const { isMobile, touchSupport } = useMobileDetection();
  
  const inputClasses = `
    veritas-input 
    ${isMobile || touchSupport ? 'veritas-input--mobile' : ''}
    ${className}
  `;

  if (children) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="veritas-label">
            {label}
          </label>
        )}
        <div className={inputClasses}>
          {children}
        </div>
        {error && (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="veritas-label">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="text-red-600 text-sm flex items-center gap-2">
          <span className="w-1 h-1 bg-red-600 rounded-full"></span>
          {error}
        </div>
      )}
    </div>
  );
}

// Mobile-optimized button
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function MobileButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: MobileButtonProps) {
  const { isMobile, touchSupport } = useMobileDetection();
  
  const buttonClasses = `
    veritas-button 
    veritas-button--${variant} 
    veritas-button--${size}
    ${isMobile || touchSupport ? 'veritas-button--touch' : ''}
    ${className}
  `;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}

// Touch gesture helpers for mobile demo
export function useTouchGestures(elementRef: React.RefObject<HTMLElement>) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null);
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [elementRef]);

  const getSwipeDirection = () => {
    if (!touchStart || !touchEnd) return null;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'left' : 'right';
    } else {
      return deltaY > 0 ? 'up' : 'down';
    }
  };

  return { getSwipeDirection, touchStart, touchEnd };
}

// Haptic feedback for supported devices
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
}