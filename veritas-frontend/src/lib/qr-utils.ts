import QRCode from 'qrcode';

export interface QRCodeOptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  darkColor: string;
  lightColor: string;
}

export interface QRCodeGenerationResult {
  dataUrl: string;
  svgString?: string;
  size: number;
  format: string;
}

// Production-ready QR code configuration
export const PRODUCTION_QR_CONFIG: QRCodeOptions = {
  size: 512, // High resolution for print
  errorCorrectionLevel: 'M', // Medium error correction - good balance
  margin: 4, // Adequate quiet zone
  darkColor: '#000000',
  lightColor: '#FFFFFF',
};

// Preview QR code configuration
export const PREVIEW_QR_CONFIG: QRCodeOptions = {
  size: 256,
  errorCorrectionLevel: 'M',
  margin: 2,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
};

// Small QR code configuration
export const SMALL_QR_CONFIG: QRCodeOptions = {
  size: 128,
  errorCorrectionLevel: 'L',
  margin: 1,
  darkColor: '#000000',
  lightColor: '#FFFFFF',
};

/**
 * Generate verification URL for QR code
 */
export function generateVerificationUrl(batchId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://veritas.app');
  return `${base}/verify/${batchId}`;
}

/**
 * Validate batch ID format
 */
export function isValidBatchId(batchId: string): boolean {
  return /^[A-Z]{3}-\d{4}-\d{6}$/.test(batchId);
}

/**
 * Extract batch ID from verification URL
 */
export function extractBatchIdFromUrl(url: string): string | null {
  const match = url.match(/\/verify\/([A-Z]{3}-\d{4}-\d{6})/);
  return match ? match[1] : null;
}

/**
 * Generate QR code as data URL (base64 PNG)
 */
export async function generateQRCodePNG(
  data: string,
  options: Partial<QRCodeOptions> = {}
): Promise<QRCodeGenerationResult> {
  const config = { ...PRODUCTION_QR_CONFIG, ...options };
  
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: config.size,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      color: {
        dark: config.darkColor,
        light: config.lightColor,
      },
    });

    return {
      dataUrl,
      size: config.size,
      format: 'png',
    };
  } catch (error) {
    throw new Error(`Failed to generate QR code PNG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options: Partial<QRCodeOptions> = {}
): Promise<QRCodeGenerationResult> {
  const config = { ...PRODUCTION_QR_CONFIG, ...options };
  
  try {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: config.size,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      color: {
        dark: config.darkColor,
        light: config.lightColor,
      },
    });

    // Create blob URL for download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const dataUrl = URL.createObjectURL(blob);

    return {
      dataUrl,
      svgString,
      size: config.size,
      format: 'svg',
    };
  } catch (error) {
    throw new Error(`Failed to generate QR code SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code for canvas rendering
 */
export async function generateQRCodeCanvas(
  data: string,
  canvas: HTMLCanvasElement,
  options: Partial<QRCodeOptions> = {}
): Promise<void> {
  const config = { ...PRODUCTION_QR_CONFIG, ...options };
  
  try {
    await QRCode.toCanvas(canvas, data, {
      width: config.size,
      margin: config.margin,
      errorCorrectionLevel: config.errorCorrectionLevel,
      color: {
        dark: config.darkColor,
        light: config.lightColor,
      },
    });
  } catch (error) {
    throw new Error(`Failed to generate QR code on canvas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download QR code as file
 */
export async function downloadQRCode(
  data: string,
  filename: string,
  format: 'png' | 'svg' = 'png',
  options: Partial<QRCodeOptions> = {}
): Promise<void> {
  try {
    let result: QRCodeGenerationResult;
    
    if (format === 'svg') {
      result = await generateQRCodeSVG(data, options);
    } else {
      result = await generateQRCodePNG(data, options);
    }

    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = result.dataUrl;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL if it was created
    if (result.dataUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(result.dataUrl), 100);
    }
  } catch (error) {
    throw new Error(`Failed to download QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Print QR code with product information
 */
export function printQRCode(
  data: string,
  productInfo: {
    title?: string;
    batchId?: string;
    description?: string;
    url?: string;
  },
  options: Partial<QRCodeOptions> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      reject(new Error('Failed to open print window. Please allow popups.'));
      return;
    }

    const config = { ...PRODUCTION_QR_CONFIG, ...options };
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${productInfo.batchId || 'Veritas'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              padding: 20px;
            }
            
            .print-container {
              text-align: center;
              max-width: 600px;
              page-break-inside: avoid;
            }
            
            .qr-title {
              font-size: 28px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 12px;
            }
            
            .qr-batch-id {
              font-family: 'Courier New', 'Monaco', monospace;
              font-size: 20px;
              font-weight: bold;
              color: #374151;
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              padding: 12px 20px;
              border-radius: 8px;
              display: inline-block;
              margin-bottom: 24px;
            }
            
            .qr-code-container {
              display: inline-block;
              padding: 24px;
              background: white;
              border: 3px solid #d1d5db;
              border-radius: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .qr-description {
              font-size: 16px;
              color: #4b5563;
              margin: 20px 0;
              line-height: 1.6;
            }
            
            .qr-url {
              font-family: 'Courier New', 'Monaco', monospace;
              font-size: 12px;
              color: #6b7280;
              word-break: break-all;
              margin: 16px 0;
              padding: 12px;
              background: #f9fafb;
              border-radius: 6px;
            }
            
            .qr-instructions {
              font-size: 14px;
              color: #4b5563;
              margin-top: 24px;
              text-align: left;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }
            
            .instructions-list {
              list-style: none;
              padding: 0;
            }
            
            .instructions-list li {
              margin: 8px 0;
              padding-left: 20px;
              position: relative;
            }
            
            .instructions-list li:before {
              content: "•";
              color: #059669;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            
            .footer {
              margin-top: 32px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              display: flex;
              justify-content: space-between;
            }
            
            .logo {
              font-weight: bold;
              color: #059669;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              
              .qr-code-container {
                border-width: 4px;
                border-color: #000;
              }
              
              .footer {
                page-break-inside: avoid;
              }
            }
            
            @page {
              margin: 0.5in;
              size: auto;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${productInfo.title ? `<h1 class="qr-title">${productInfo.title}</h1>` : ''}
            ${productInfo.batchId ? `<div class="qr-batch-id">${productInfo.batchId}</div>` : ''}
            
            <div class="qr-code-container">
              <canvas id="qr-canvas"></canvas>
            </div>
            
            ${productInfo.description ? `<p class="qr-description">${productInfo.description}</p>` : ''}
            ${productInfo.url ? `<div class="qr-url">${productInfo.url}</div>` : ''}
            
            <div class="qr-instructions">
              <h3 style="margin-bottom: 12px; color: #111827;">Scan Instructions:</h3>
              <ul class="instructions-list">
                <li>Open your smartphone camera or any QR code scanner app</li>
                <li>Point the camera at this QR code</li>
                <li>Tap the notification that appears to verify the product</li>
                <li>View complete product verification details online</li>
              </ul>
            </div>
            
            <div class="footer">
              <span class="logo">Veritas - Blockchain Product Verification</span>
              <span>${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Generate QR code on canvas
    const canvas = printWindow.document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      generateQRCodeCanvas(data, canvas, { ...config, size: 300 })
        .then(() => {
          // Small delay to ensure rendering is complete
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            
            // Close window after printing
            setTimeout(() => {
              printWindow.close();
              resolve();
            }, 1000);
          }, 500);
        })
        .catch((error) => {
          printWindow.close();
          reject(error);
        });
    } else {
      printWindow.close();
      reject(new Error('Failed to create canvas element for QR code'));
    }
  });
}

/**
 * Validate QR code scannability
 * This function tests if a QR code can be generated successfully
 */
export async function validateQRCodeData(data: string): Promise<boolean> {
  try {
    await QRCode.toDataURL(data, { width: 100 });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get QR code capacity information
 */
export function getQRCodeCapacity(errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): {
  numeric: number;
  alphanumeric: number;
  binary: number;
} {
  // These are approximate capacities for QR codes with different error correction levels
  const capacities = {
    L: { numeric: 7089, alphanumeric: 4296, binary: 2953 },
    M: { numeric: 5596, alphanumeric: 3391, binary: 2331 },
    Q: { numeric: 3993, alphanumeric: 2420, binary: 1663 },
    H: { numeric: 3057, alphanumeric: 1852, binary: 1273 },
  };
  
  return capacities[errorCorrectionLevel];
}

/**
 * Estimate QR code version based on data length
 */
export function estimateQRCodeVersion(data: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'M'): number {
  const dataLength = data.length;
  const capacity = getQRCodeCapacity(errorCorrectionLevel);
  
  if (dataLength <= capacity.alphanumeric * 0.1) return 1;
  if (dataLength <= capacity.alphanumeric * 0.2) return 5;
  if (dataLength <= capacity.alphanumeric * 0.4) return 10;
  if (dataLength <= capacity.alphanumeric * 0.6) return 20;
  if (dataLength <= capacity.alphanumeric * 0.8) return 30;
  return 40; // Maximum version
}

/**
 * Production guidelines for QR code implementation
 */
export const PRODUCTION_GUIDELINES = {
  minimumSize: {
    print: '25mm', // 1 inch
    screen: '128px',
    description: 'Minimum size for reliable scanning'
  },
  
  quietZone: {
    minimum: '4 modules',
    recommended: '6 modules',
    description: 'White space around QR code'
  },
  
  contrast: {
    minimum: '70%',
    recommended: '100%',
    description: 'Dark on light background contrast ratio'
  },
  
  placement: {
    accessibility: 'Easy to reach and scan',
    lighting: 'Well-lit area, avoid shadows',
    surface: 'Flat surface, avoid curves when possible'
  },
  
  testing: {
    devices: 'Test with multiple smartphone models',
    angles: 'Test scanning from different angles',
    lighting: 'Test in various lighting conditions'
  }
};