'use client';

import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import QRCodeLib from 'qrcode';
import { 
  Download, 
  Copy, 
  Printer, 
  Check, 
  ExternalLink, 
  QrCode as QrCodeIcon,
  Maximize2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { QRCodeData } from '@/types';

export interface QRCodeDisplayProps {
  qrData?: QRCodeData;
  url?: string;
  batchId?: string;
  size?: 'small' | 'medium' | 'large' | 'extra-large' | number;
  title?: string;
  description?: string;
  showUrl?: boolean;
  showBatchId?: boolean;
  showDownloadButtons?: boolean;
  showCopyButton?: boolean;
  showPrintButton?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  variant?: 'default' | 'production' | 'preview';
}

export interface QRCodePreviewProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
}

const SIZE_MAP = {
  small: 128,
  medium: 192,
  large: 256,
  'extra-large': 320,
} as const;

const QR_CONFIG = {
  errorCorrectionLevel: 'M' as const, // Medium error correction for production
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  width: undefined as number | undefined,
};

// Simple QR code preview component
export function QRCodePreview({ url, title = 'QR Code', size = 192, className = '' }: QRCodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className={`text-center space-y-3 ${className}`}>
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 inline-block">
        <QRCode
          value={url}
          size={size}
          fgColor={QR_CONFIG.color.dark}
          bgColor={QR_CONFIG.color.light}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
      </div>
      <div className="space-y-2">
        <p className="font-medium text-gray-900">{title}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy URL'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        </div>
      </div>
    </div>
  );
}

// Main comprehensive QR code display component
export default function QRCodeDisplay({
  qrData,
  url,
  batchId,
  size = 'medium',
  title,
  description,
  showUrl = true,
  showBatchId = true,
  showDownloadButtons = true,
  showCopyButton = true,
  showPrintButton = true,
  className = '',
  onError,
  variant = 'default'
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the URL to use
  const qrUrl = url || qrData?.verificationData?.verification_url || '';
  const displayBatchId = batchId || qrData?.batchId || extractBatchIdFromUrl(qrUrl);
  
  // Determine size
  const qrSize = typeof size === 'number' ? size : SIZE_MAP[size];
  const fullscreenSize = Math.min((typeof window !== 'undefined' ? window.innerWidth * 0.6 : 400), 400);

  if (!qrUrl) {
    return (
      <div className={`text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}>
        <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No QR code data available</p>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
      onError?.(error instanceof Error ? error : new Error('Copy failed'));
    }
  };

  const generateQRCodeDataURL = async (format: 'png' | 'svg', size: number): Promise<string> => {
    if (format === 'svg') {
      // Generate SVG using QRCode library
      try {
        const svgString = await QRCodeLib.toString(qrUrl, {
          type: 'svg',
          width: size,
          ...QR_CONFIG,
        });
        
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
      } catch (error) {
        throw new Error('Failed to generate SVG QR code');
      }
    } else {
      // Generate PNG using QRCode library
      try {
        return await QRCodeLib.toDataURL(qrUrl, {
          width: size,
          ...QR_CONFIG,
        });
      } catch (error) {
        throw new Error('Failed to generate PNG QR code');
      }
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    setDownloading(format);
    try {
      const downloadSize = variant === 'production' ? 512 : qrSize * 2; // Higher resolution
      const dataUrl = await generateQRCodeDataURL(format, downloadSize);
      
      const link = document.createElement('a');
      link.download = `veritas-qr-${displayBatchId || 'code'}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      if (dataUrl.startsWith('blob:')) {
        URL.revokeObjectURL(dataUrl);
      }
      
      toast.success(`QR code downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
      onError?.(error instanceof Error ? error : new Error(`Download failed: ${format}`));
    } finally {
      setDownloading(null);
    }
  };

  const handlePrint = () => {
    if (!mounted) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to enable printing');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${displayBatchId || 'Veritas'}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: white;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            .qr-code {
              margin: 20px 0;
              border: 2px solid #e5e7eb;
              padding: 20px;
              background: white;
              border-radius: 12px;
              display: inline-block;
            }
            .qr-title {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 10px;
            }
            .qr-batch-id {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              color: #374151;
              background: #f3f4f6;
              padding: 8px 16px;
              border-radius: 6px;
              display: inline-block;
              margin: 10px 0;
            }
            .qr-url {
              font-size: 12px;
              color: #6b7280;
              word-break: break-all;
              margin-top: 15px;
              max-width: 400px;
            }
            .qr-instructions {
              font-size: 14px;
              color: #4b5563;
              margin-top: 20px;
              max-width: 400px;
              line-height: 1.5;
            }
            @media print {
              body { margin: 20px; }
              .qr-code { border: 3px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="qr-title">${title || 'Product Verification'}</div>
            ${displayBatchId ? `<div class="qr-batch-id">${displayBatchId}</div>` : ''}
            <div class="qr-code" id="qr-placeholder"></div>
            ${showUrl ? `<div class="qr-url">${qrUrl}</div>` : ''}
            <div class="qr-instructions">
              Scan this QR code with any smartphone camera or QR reader app to verify product authenticity on the Veritas blockchain platform.
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Generate QR code for print
    QRCodeLib.toCanvas(qrUrl, {
      width: 300,
      ...QR_CONFIG,
    })
      .then((canvas) => {
        const placeholder = printWindow.document.getElementById('qr-placeholder');
        if (placeholder) {
          placeholder.appendChild(canvas);
        }
        printWindow.focus();
        printWindow.print();
        setTimeout(() => printWindow.close(), 1000);
      })
      .catch((error) => {
        console.error('Print QR generation failed:', error);
        toast.error('Failed to prepare QR code for printing');
        printWindow.close();
      });
  };

  if (!mounted) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="bg-gray-100 animate-pulse rounded-lg" style={{ width: qrSize, height: qrSize, margin: '0 auto' }}></div>
        <div className="space-y-2">
          <div className="bg-gray-100 animate-pulse h-4 w-32 mx-auto rounded"></div>
          <div className="bg-gray-100 animate-pulse h-3 w-48 mx-auto rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`veritas-qr-container text-center space-y-4 ${className}`}>
        {/* QR Code */}
        <div className="veritas-qr-container__header">
          {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>

        <div className="relative inline-block">
          <div 
            className={`veritas-qr-container__code bg-white rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              variant === 'production' 
                ? 'border-green-300 shadow-lg bg-gradient-to-br from-green-50 to-blue-50' 
                : 'border-gray-200 shadow-sm hover:border-blue-300'
            }`}
            onClick={() => setShowFullscreen(true)}
          >
            <QRCode
              value={qrUrl}
              size={qrSize}
              fgColor={QR_CONFIG.color.dark}
              bgColor={QR_CONFIG.color.light}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
            
            {variant !== 'preview' && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-black bg-opacity-75 rounded-lg p-2">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            {variant === 'production' && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <QrCodeIcon className="w-3 h-3" />
                  READY
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Batch ID Display */}
        {showBatchId && displayBatchId && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batch ID</p>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 inline-block">
              <p className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                {displayBatchId}
              </p>
            </div>
          </div>
        )}

        {/* URL Display */}
        {showUrl && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 break-all max-w-xs mx-auto leading-relaxed">
              {qrUrl}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {(showDownloadButtons || showCopyButton || showPrintButton) && (
          <div className="veritas-qr-container__actions">
            {showCopyButton && (
              <button
                onClick={handleCopy}
                className="veritas-button veritas-button--secondary veritas-button--sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            )}

            {showDownloadButtons && (
              <>
                <button
                  onClick={() => handleDownload('png')}
                  disabled={downloading === 'png'}
                  className="veritas-button veritas-button--outline veritas-button--sm"
                >
                  <Download className="w-4 h-4" />
                  {downloading === 'png' ? 'Downloading...' : 'PNG'}
                </button>
                
                <button
                  onClick={() => handleDownload('svg')}
                  disabled={downloading === 'svg'}
                  className="veritas-button veritas-button--outline veritas-button--sm"
                >
                  <Download className="w-4 h-4" />
                  {downloading === 'svg' ? 'Downloading...' : 'SVG'}
                </button>
              </>
            )}

            {showPrintButton && (
              <button
                onClick={handlePrint}
                className="veritas-button veritas-button--primary veritas-button--sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            )}
          </div>
        )}

        {/* Production Ready Instructions */}
        {variant === 'production' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-sm mx-auto">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Production Guidelines</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Print at minimum 1&quot; × 1&quot; (2.5cm × 2.5cm)</li>
              <li>• Use high contrast (black on white background)</li>
              <li>• Ensure adequate quiet zone around QR code</li>
              <li>• Test scanning before mass production</li>
              <li>• Position where easily accessible to customers</li>
            </ul>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {title || 'QR Code'}
              </h3>
              <button
                onClick={() => setShowFullscreen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <QRCode
                  value={qrUrl}
                  size={fullscreenSize}
                  fgColor={QR_CONFIG.color.dark}
                  bgColor={QR_CONFIG.color.light}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>
              
              {displayBatchId && (
                <p className="font-mono text-lg bg-gray-100 text-gray-900 px-4 py-2 rounded">
                  {displayBatchId}
                </p>
              )}
              
              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy URL'}
                </button>
                
                <button
                  onClick={() => handleDownload('png')}
                  disabled={downloading === 'png'}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {downloading === 'png' ? 'Downloading...' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Utility function to extract batch ID from URL
function extractBatchIdFromUrl(url: string): string | null {
  const match = url.match(/\/verify\/([A-Z]{3}-\d{4}-\d{6})/);
  return match ? match[1] : null;
}

// Legacy exports for backward compatibility
export function InlineQRCode({
  value,
  size = 100,
  className = ''
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  return (
    <QRCodePreview 
      url={value} 
      size={size} 
      className={className} 
      title=""
    />
  );
}