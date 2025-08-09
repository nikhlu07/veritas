// QR Code Examples and Usage Patterns
// This file demonstrates how to use the QR code components and utilities

'use client';

import React, { useState } from 'react';
import QRCodeDisplay, { QRCodePreview } from '@/components/ui/QRCodeDisplay';
import { 
  generateVerificationUrl, 
  generateQRCodePNG, 
  generateQRCodeSVG,
  downloadQRCode,
  printQRCode,
  PRODUCTION_GUIDELINES
} from '@/lib/qr-utils';
import { Download, Printer, Eye, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// Example 1: Basic QR Code Display
export function BasicQRCodeExample() {
  const batchId = 'VRT-2024-123456';
  const verificationUrl = generateVerificationUrl(batchId);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Basic QR Code Display</h3>
      
      <QRCodeDisplay
        url={verificationUrl}
        batchId={batchId}
        size="medium"
        title="Product Verification"
        showBatchId={true}
        showUrl={true}
      />
    </div>
  );
}

// Example 2: Production-Ready QR Code
export function ProductionQRCodeExample() {
  const batchId = 'VRT-2024-654321';
  const verificationUrl = generateVerificationUrl(batchId);

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-4 text-green-800">Production QR Code</h3>
      
      <QRCodeDisplay
        url={verificationUrl}
        batchId={batchId}
        size="large"
        title="Ready for Production"
        description="High-resolution QR code for printing on product packaging"
        variant="production"
        showBatchId={true}
        showUrl={false} // Hide URL for cleaner print appearance
        showDownloadButtons={true}
        showPrintButton={true}
        className="bg-white rounded-lg p-4"
      />
      
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Production Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Minimum print size: {PRODUCTION_GUIDELINES.minimumSize.print}</li>
          <li>• Ensure {PRODUCTION_GUIDELINES.contrast.recommended} contrast ratio</li>
          <li>• Maintain {PRODUCTION_GUIDELINES.quietZone.recommended} quiet zone</li>
          <li>• Test scanning before mass production</li>
        </ul>
      </div>
    </div>
  );
}

// Example 3: QR Code Preview (Small/Inline)
export function QRCodePreviewExample() {
  const batchId = 'VRT-2024-789012';
  const verificationUrl = generateVerificationUrl(batchId);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">QR Code Preview</h3>
      <p className="text-gray-600 mb-4">Compact QR code for form previews and summaries</p>
      
      <QRCodePreview
        url={verificationUrl}
        title={`Preview for ${batchId}`}
        size={150}
        className="border border-gray-200 rounded-lg p-3"
      />
    </div>
  );
}

// Example 4: Custom QR Code Actions
export function CustomQRActionsExample() {
  const [loading, setLoading] = useState<string | null>(null);
  const batchId = 'VRT-2024-345678';
  const verificationUrl = generateVerificationUrl(batchId);

  const handleDownloadPNG = async () => {
    setLoading('png');
    try {
      await downloadQRCode(verificationUrl, `veritas-qr-${batchId}`, 'png', { size: 512 });
      toast.success('QR code downloaded as PNG');
    } catch (error) {
      toast.error('Failed to download QR code');
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadSVG = async () => {
    setLoading('svg');
    try {
      await downloadQRCode(verificationUrl, `veritas-qr-${batchId}`, 'svg', { size: 512 });
      toast.success('QR code downloaded as SVG');
    } catch (error) {
      toast.error('Failed to download QR code');
    } finally {
      setLoading(null);
    }
  };

  const handlePrint = async () => {
    setLoading('print');
    try {
      await printQRCode(verificationUrl, {
        title: 'Product Verification QR Code',
        batchId: batchId,
        description: 'Scan this code to verify product authenticity on the Veritas platform.',
        url: verificationUrl
      });
      toast.success('Print dialog opened');
    } catch (error) {
      toast.error('Failed to open print dialog');
    } finally {
      setLoading(null);
    }
  };

  const handlePreviewGeneration = async () => {
    setLoading('preview');
    try {
      const pngResult = await generateQRCodePNG(verificationUrl, { size: 256 });
      const svgResult = await generateQRCodeSVG(verificationUrl, { size: 256 });
      
      console.log('Generated QR codes:', { pngResult, svgResult });
      toast.success('QR codes generated successfully (check console)');
    } catch (error) {
      toast.error('Failed to generate QR codes');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Custom QR Code Actions</h3>
      <p className="text-gray-600 mb-4">Programmatic QR code generation and handling</p>
      
      {/* QR Code Display */}
      <div className="mb-6">
        <QRCodePreview
          url={verificationUrl}
          title="Custom Actions Example"
          size={180}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={handleDownloadPNG}
          disabled={loading === 'png'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {loading === 'png' ? 'Loading...' : 'PNG'}
        </button>

        <button
          onClick={handleDownloadSVG}
          disabled={loading === 'svg'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {loading === 'svg' ? 'Loading...' : 'SVG'}
        </button>

        <button
          onClick={handlePrint}
          disabled={loading === 'print'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          {loading === 'print' ? 'Loading...' : 'Print'}
        </button>

        <button
          onClick={handlePreviewGeneration}
          disabled={loading === 'preview'}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {loading === 'preview' ? 'Loading...' : 'Generate'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Implementation Details
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• PNG downloads at 512x512 resolution for high quality printing</li>
          <li>• SVG format provides infinite scalability</li>
          <li>• Print function opens formatted print dialog with instructions</li>
          <li>• Generate button demonstrates programmatic QR code creation</li>
        </ul>
      </div>
    </div>
  );
}

// Example 5: QR Code with Real Product Data
export function RealProductQRExample() {
  const productData = {
    batchId: 'VRT-2024-456789',
    productName: 'Organic Fair Trade Coffee Beans',
    supplier: 'Green Valley Farms',
    verificationUrl: ''
  };

  productData.verificationUrl = generateVerificationUrl(productData.batchId);

  // Simulate QR code data structure
  const qrCodeData = {
    batchId: productData.batchId,
    verificationData: {
      verification_url: productData.verificationUrl,
      qr_code_data: productData.verificationUrl
    },
    generated_at: new Date().toISOString()
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Real Product Integration</h3>
      
      {/* Product Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Product Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Product:</span> {productData.productName}
          </div>
          <div>
            <span className="font-medium">Supplier:</span> {productData.supplier}
          </div>
          <div>
            <span className="font-medium">Batch ID:</span> 
            <code className="ml-2 px-2 py-1 bg-white border rounded">{productData.batchId}</code>
          </div>
          <div>
            <span className="font-medium">URL:</span> 
            <code className="ml-2 text-xs break-all">{productData.verificationUrl}</code>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <QRCodeDisplay
        qrData={qrCodeData}
        size="large"
        title={`QR Code: ${productData.productName}`}
        description="Scan to verify product authenticity and view claims"
        variant="production"
        showBatchId={true}
        showUrl={true}
        showDownloadButtons={true}
        showPrintButton={true}
        className="border border-gray-200 rounded-lg p-4"
      />
    </div>
  );
}

// Example 6: QR Code Usage Guide
export function QRCodeUsageGuide() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">QR Code Implementation Guide</h3>
      
      <div className="space-y-6">
        {/* For Suppliers */}
        <div>
          <h4 className="font-semibold text-blue-600 mb-2">For Suppliers (Product Submission)</h4>
          <div className="p-4 bg-blue-50 rounded-lg">
            <code className="text-sm block mb-2">
              {`// After successful product submission
<QRCodeDisplay
  qrData={submissionResult.qr_code}
  batchId={submissionResult.product.batch_id}
  variant="production"
  size="large"
  showDownloadButtons={true}
  showPrintButton={true}
/>`}
            </code>
            <p className="text-sm text-blue-800">Provides production-ready QR codes with download and print options.</p>
          </div>
        </div>

        {/* For Verification Pages */}
        <div>
          <h4 className="font-semibold text-green-600 mb-2">For Verification Results</h4>
          <div className="p-4 bg-green-50 rounded-lg">
            <code className="text-sm block mb-2">
              {`// In verification results sidebar
<QRCodePreview
  url={verificationData.qr_code.verification_url}
  title="Product QR Code"
  size={180}
/>`}
            </code>
            <p className="text-sm text-green-800">Compact display for verification results pages.</p>
          </div>
        </div>

        {/* For Custom Implementations */}
        <div>
          <h4 className="font-semibold text-purple-600 mb-2">For Custom Implementations</h4>
          <div className="p-4 bg-purple-50 rounded-lg">
            <code className="text-sm block mb-2">
              {`// Generate and download programmatically
import { downloadQRCode, generateVerificationUrl } from '@/lib/qr-utils';

const batchId = 'VRT-2024-123456';
const url = generateVerificationUrl(batchId);
await downloadQRCode(url, 'my-qr-code', 'png', { size: 512 });`}
            </code>
            <p className="text-sm text-purple-800">Programmatic QR code generation for batch operations.</p>
          </div>
        </div>

        {/* Production Guidelines */}
        <div>
          <h4 className="font-semibold text-red-600 mb-2">Production Guidelines</h4>
          <div className="p-4 bg-red-50 rounded-lg">
            <ul className="text-sm text-red-800 space-y-2">
              <li>• <strong>Size:</strong> Minimum 1" × 1" (2.5cm × 2.5cm) for reliable scanning</li>
              <li>• <strong>Contrast:</strong> Always use black QR code on white background</li>
              <li>• <strong>Quiet Zone:</strong> Maintain clear space around QR code (4-6 modules)</li>
              <li>• <strong>Testing:</strong> Test with multiple devices and angles before production</li>
              <li>• <strong>Placement:</strong> Position where easily accessible to customers</li>
              <li>• <strong>Error Correction:</strong> Medium level provides good balance of capacity and reliability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Examples Container
export default function QRCodeExamples() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Veritas QR Code Examples</h1>
          <p className="text-xl text-gray-600">Comprehensive QR code implementation showcase</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <BasicQRCodeExample />
          <ProductionQRCodeExample />
          <QRCodePreviewExample />
          <CustomQRActionsExample />
          <RealProductQRExample />
          <div className="lg:col-span-2">
            <QRCodeUsageGuide />
          </div>
        </div>
      </div>
    </div>
  );
}