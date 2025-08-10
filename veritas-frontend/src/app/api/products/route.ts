import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import QRCode from 'qrcode';

// Database connection
function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  });
}

// Validation functions
function validateCreateProduct(data: any) {
  const { product_name, supplier_name } = data;
  
  if (!product_name || typeof product_name !== 'string' || product_name.trim().length === 0) {
    throw new Error('Product name is required');
  }
  
  if (!supplier_name || typeof supplier_name !== 'string' || supplier_name.trim().length === 0) {
    throw new Error('Supplier name is required');
  }
  
  return true;
}

// Generate batch ID
async function generateBatchId(prefix: string): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// Hedera service mock (simplified for serverless)
const hederaService = {
  isReady: () => process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY,
  submitProduct: async (product: any) => ({
    transactionId: `0.0.${Date.now()}@${Date.now()}.000000000`,
    timestamp: new Date().toISOString(),
  }),
  submitClaim: async (claim: any, product: any) => ({
    transactionId: `0.0.${Date.now()}@${Date.now()}.000000000`,
    timestamp: new Date().toISOString(),
  }),
};

export async function POST(request: NextRequest) {
  let client: Client | null = null;
  
  try {
    const body = await request.json();
    const { product_name, supplier_name, description = '', claims = [] } = body;

    // Validate input
    validateCreateProduct({ product_name, supplier_name });

    // Create database client
    client = createClient();
    await client.connect();

    // Generate batch ID
    const prefix = product_name.toUpperCase().split(' ')[0] || 'PRODUCT';
    const batchId = await generateBatchId(prefix);

    // Insert product
    const productResult = await client.query(`
      INSERT INTO products (batch_id, product_name, supplier_name, description, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [batchId, product_name, supplier_name, description]);
    
    const product = productResult.rows[0];
    let hcsResults = [];
    let claimsWithHCS = [];

    // Submit product to Hedera HCS
    try {
      if (hederaService.isReady()) {
        const hcsResult = await hederaService.submitProduct(product);
        hcsResults.push({
          type: 'PRODUCT',
          success: true,
          data: hcsResult
        });
      }
    } catch (hcsError: any) {
      console.warn('⚠️  Failed to submit product to HCS:', hcsError.message);
      hcsResults.push({
        type: 'PRODUCT',
        success: false,
        error: hcsError.message
      });
    }

    // Process claims
    for (const claimData of claims) {
      const claimResult = await client.query(`
        INSERT INTO claims (product_id, claim_type, claim_description, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `, [product.id, claimData.claim_type, claimData.description]);

      const claim = claimResult.rows[0];

      // Submit claim to HCS
      try {
        if (hederaService.isReady()) {
          const hcsClaimResult = await hederaService.submitClaim(claim, product);
          
          // Update claim with HCS transaction info
          await client.query(`
            UPDATE claims 
            SET hcs_transaction_id = $1, hcs_timestamp = $2 
            WHERE id = $3
          `, [hcsClaimResult.transactionId, hcsClaimResult.timestamp, claim.id]);

          claim.hcs_transaction_id = hcsClaimResult.transactionId;
          claim.hcs_timestamp = hcsClaimResult.timestamp;

          hcsResults.push({
            type: 'CLAIM',
            claim_id: claim.id,
            success: true,
            data: hcsClaimResult
          });
        }
      } catch (hcsError: any) {
        console.warn('⚠️  Failed to submit claim to HCS:', hcsError.message);
        hcsResults.push({
          type: 'CLAIM',
          claim_id: claim.id,
          success: false,
          error: hcsError.message
        });
      }

      claimsWithHCS.push(claim);
    }

    // Generate QR code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
    const verificationUrl = `${baseUrl}/verify/${product.batch_id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    
    const qrCode = {
      dataUrl: qrCodeDataUrl,
      verificationData: {
        verification_url: verificationUrl
      }
    };

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        batch_id: product.batch_id,
        product_name: product.product_name,
        supplier_name: product.supplier_name,
        qr_code_url: qrCode.verificationData.verification_url
      },
      claims: claimsWithHCS.map(claim => ({
        id: claim.id,
        claim_type: claim.claim_type,
        description: claim.claim_description,
        hcs_transaction_id: claim.hcs_transaction_id,
        hcs_timestamp: claim.hcs_timestamp
      })),
      qr_code: qrCode,
      hcs_results: hcsResults,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      error: {
        message: error.message || 'Failed to create product',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  } finally {
    if (client) {
      await client.end();
    }
  }
}