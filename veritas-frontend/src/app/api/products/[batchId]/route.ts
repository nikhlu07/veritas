import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import QRCode from 'qrcode';

// Database connection
function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  let client: Client | null = null;
  
  try {
    const { batchId } = params;

    // Validate batch ID
    if (!batchId || typeof batchId !== 'string' || batchId.trim().length === 0) {
      return NextResponse.json({
        error: {
          message: 'Invalid batch ID',
          timestamp: new Date().toISOString()
        }
      }, { status: 400 });
    }

    // Create database client
    client = createClient();
    await client.connect();

    // Get product with claims
    const productResult = await client.query(`
      SELECT 
        p.*,
        json_agg(
          CASE WHEN c.id IS NOT NULL THEN
            json_build_object(
              'id', c.id,
              'claim_type', c.claim_type,
              'claim_description', c.claim_description,
              'hcs_transaction_id', c.hcs_transaction_id,
              'hcs_timestamp', c.hcs_timestamp,
              'created_at', c.created_at
            )
          ELSE NULL END
        ) FILTER (WHERE c.id IS NOT NULL) as claims
      FROM products p
      LEFT JOIN claims c ON p.id = c.product_id
      WHERE p.batch_id = $1
      GROUP BY p.id
    `, [batchId]);

    if (productResult.rows.length === 0) {
      return NextResponse.json({
        error: {
          message: 'Product not found',
          batch_id: batchId,
          timestamp: new Date().toISOString()
        }
      }, { status: 404 });
    }

    const product = productResult.rows[0];
    const claims = product.claims || [];

    // Generate QR code for the product
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
      data: {
        product: {
          ...product,
          claims: undefined // Remove from main object since we're including it separately
        },
        claims: claims,
        qr_code: qrCode,
        summary: {
          total_claims: claims.length,
          claim_types: [...new Set(claims.map(c => c.claim_type))],
          has_hcs_data: claims.some(c => c.hcs_transaction_id)
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json({
      error: {
        message: error.message || 'Failed to fetch product',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  } finally {
    if (client) {
      await client.end();
    }
  }
}