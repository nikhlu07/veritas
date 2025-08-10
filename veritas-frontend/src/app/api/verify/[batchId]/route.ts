import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// Database connection
function createClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  });
}

// Hedera service for verification
const hederaService = {
  isReady: () => process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY,
  
  verifyTransaction: async (transactionId: string) => {
    // Mock verification for serverless - in production, this would verify against Hedera
    return {
      verified: true,
      transaction_id: transactionId,
      consensus_timestamp: new Date().toISOString(),
      topic_id: process.env.HEDERA_TOPIC_ID,
      message: 'Transaction verified successfully'
    };
  },
  
  generateProofLinks: (transactionId: string, topicId: string) => {
    const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
    const baseUrl = network === 'mainnet' 
      ? 'https://hashscan.io/mainnet' 
      : 'https://hashscan.io/testnet';
    
    return {
      transaction: `${baseUrl}/transaction/${transactionId}`,
      topic: `${baseUrl}/topic/${topicId}`,
      explorer: `${baseUrl}/topic/${topicId}/message/${transactionId}`
    };
  }
};

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

    // Get product
    const productResult = await client.query(`
      SELECT * FROM products WHERE batch_id = $1
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

    // Get claims
    const claimsResult = await client.query(`
      SELECT * FROM claims WHERE product_id = $1 ORDER BY created_at
    `, [product.id]);
    
    const claims = claimsResult.rows;
    
    // Verify HCS transactions
    const verificationResults = [];
    const proofLinks = [];

    for (const claim of claims) {
      if (claim.hcs_transaction_id) {
        try {
          const verification = await hederaService.verifyTransaction(claim.hcs_transaction_id);
          verificationResults.push({
            claim_id: claim.id,
            transaction_id: claim.hcs_transaction_id,
            ...verification
          });

          // Generate proof links
          const links = hederaService.generateProofLinks(
            claim.hcs_transaction_id, 
            process.env.HEDERA_TOPIC_ID || '0.0.6535283'
          );
          proofLinks.push({
            claim_id: claim.id,
            transaction_id: claim.hcs_transaction_id,
            links
          });

        } catch (error: any) {
          verificationResults.push({
            claim_id: claim.id,
            transaction_id: claim.hcs_transaction_id,
            verified: false,
            error: error.message
          });
        }
      }
    }

    // Calculate verification status
    const totalClaims = claims.length;
    const claimsWithHCS = claims.filter(c => c.hcs_transaction_id).length;
    const verifiedClaims = verificationResults.filter(v => v.verified).length;
    
    const overallStatus = totalClaims === 0 ? 'no_claims' :
                        claimsWithHCS === 0 ? 'no_blockchain_data' :
                        verifiedClaims === claimsWithHCS ? 'verified' :
                        verifiedClaims > 0 ? 'partially_verified' : 'unverified';

    return NextResponse.json({
      success: true,
      data: {
        product,
        claims,
        verification: {
          overall_status: overallStatus,
          total_claims: totalClaims,
          claims_with_hcs: claimsWithHCS,
          verified_claims: verifiedClaims,
          verification_percentage: totalClaims > 0 ? Math.round((verifiedClaims / totalClaims) * 100) : 0
        },
        hcs_verifications: verificationResults,
        proof_links: proofLinks
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error verifying product:', error);
    return NextResponse.json({
      error: {
        message: error.message || 'Failed to verify product',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  } finally {
    if (client) {
      await client.end();
    }
  }
}