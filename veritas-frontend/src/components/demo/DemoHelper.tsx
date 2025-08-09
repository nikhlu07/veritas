'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { DEMO_PRODUCTS, DEMO_SCENARIOS, DEMO_TIPS } from '@/data/demoData';

interface DemoHelperProps {
  page?: 'submit' | 'verify' | 'results';
  onFillDemo?: (data: any) => void;
  className?: string;
}

export default function DemoHelper({ page = 'submit', onFillDemo, className = '' }: DemoHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const tips = DEMO_TIPS[page.toUpperCase() as keyof typeof DEMO_TIPS] || DEMO_TIPS.FORM_FILLING;

  useEffect(() => {
    if (!autoAdvance) return;
    
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoAdvance, tips.length]);

  const handleFillDemo = (demoIndex: number) => {
    if (onFillDemo && DEMO_PRODUCTS[demoIndex]) {
      onFillDemo(DEMO_PRODUCTS[demoIndex]);
      setIsOpen(false);
    }
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <>
      {/* Demo Helper Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group ${className}`}
        aria-label="Open demo helper"
      >
        <Lightbulb className="w-6 h-6 group-hover:animate-pulse" />
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Demo Helper
        </div>
      </button>

      {/* Demo Helper Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Demo Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Device Preview Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Preview Mode:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDevicePreview('mobile')}
                    className={`p-2 rounded-lg transition-colors ${
                      devicePreview === 'mobile' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDevicePreview('tablet')}
                    className={`p-2 rounded-lg transition-colors ${
                      devicePreview === 'tablet' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDevicePreview('desktop')}
                    className={`p-2 rounded-lg transition-colors ${
                      devicePreview === 'desktop' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Demo Fill */}
              {page === 'submit' && onFillDemo && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Demo Fill</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {DEMO_PRODUCTS.map((product, index) => (
                      <button
                        key={index}
                        onClick={() => handleFillDemo(index)}
                        className="text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                      >
                        <div className="font-medium text-blue-900">{product.product_name}</div>
                        <div className="text-sm text-blue-700 mt-1">{product.supplier_name}</div>
                        <div className="text-xs text-blue-600 mt-2">
                          {product.claims.length} claims • Click to auto-fill
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Tips */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Demo Tips</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAutoAdvance(!autoAdvance)}
                      className={`p-2 rounded-lg transition-colors ${
                        autoAdvance 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={autoAdvance ? 'Pause auto-advance' : 'Auto-advance tips'}
                    >
                      {autoAdvance ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setCurrentTip(0)}
                      className="p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                      title="Reset to first tip"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-purple-700 font-medium">
                      Tip {currentTip + 1} of {tips.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevTip}
                        className="p-1 rounded-full hover:bg-purple-100 text-purple-600 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextTip}
                        className="p-1 rounded-full hover:bg-purple-100 text-purple-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-purple-900 font-medium">
                    {tips[currentTip]}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-purple-200 rounded-full h-1">
                    <div 
                      className="bg-purple-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${((currentTip + 1) / tips.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Demo Scenarios */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Demo Scenarios</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(DEMO_SCENARIOS).map(([key, scenario]) => (
                    <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-medium text-gray-900">{scenario.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{scenario.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device-specific Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {devicePreview.charAt(0).toUpperCase() + devicePreview.slice(1)} Optimization
                </h3>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  {devicePreview === 'mobile' && (
                    <div className="text-yellow-800">
                      <div className="font-medium mb-2">Mobile Demo Tips:</div>
                      <ul className="text-sm space-y-1">
                        <li>• Touch targets are optimized for finger taps</li>
                        <li>• QR code scanning works with camera apps</li>
                        <li>• Forms are simplified for mobile input</li>
                        <li>• Offline scenarios are handled gracefully</li>
                      </ul>
                    </div>
                  )}
                  {devicePreview === 'tablet' && (
                    <div className="text-yellow-800">
                      <div className="font-medium mb-2">Tablet Demo Tips:</div>
                      <ul className="text-sm space-y-1">
                        <li>• Layout adapts to tablet screen size</li>
                        <li>• Touch and keyboard input supported</li>
                        <li>• Perfect for point-of-sale demos</li>
                        <li>• QR codes display larger for easy scanning</li>
                      </ul>
                    </div>
                  )}
                  {devicePreview === 'desktop' && (
                    <div className="text-yellow-800">
                      <div className="font-medium mb-2">Desktop Demo Tips:</div>
                      <ul className="text-sm space-y-1">
                        <li>• Full feature set available</li>
                        <li>• Keyboard shortcuts enabled</li>
                        <li>• Multiple windows can be opened</li>
                        <li>• Best for detailed demonstrations</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Perfect demo experience ready! 🚀
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="veritas-button veritas-button--primary veritas-button--sm"
                >
                  Start Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}