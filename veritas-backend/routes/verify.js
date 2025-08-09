const express = require('express');
const router = express.Router();

const db = require('../db/connection');
const { validation } = require('../utils/validation');
const hederaService = require('../utils/hedera');

// GET /api/verify/:batchId - Verify product and blockchain data
router.get('/:batchId', 
  validation.validateBatchId, 
  async (req, res, next) => {
    try {
      const { batchId } = req.params;

      // Get product and claims from database
      const product = await db.helpers.getProductByBatchId(batchId);
      
      if (!product) {
        return res.status(404).json({
          error: {
            message: 'Product not found',
            batch_id: batchId,
            timestamp: new Date().toISOString()
          }
        });
      }

      const claims = await db.helpers.getClaimsByProduct(product.id);
      
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
              process.env.HEDERA_TOPIC_ID
            );
            proofLinks.push({
              claim_id: claim.id,
              transaction_id: claim.hcs_transaction_id,
              links
            });

          } catch (error) {
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

      res.json({
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

    } catch (error) {
      next(error);
    }
  }
);

// GET /api/verify/:batchId/claims/:claimId - Verify specific claim
router.get('/:batchId/claims/:claimId',
  validation.validateBatchId,
  validation.validateUUID('claimId'),
  async (req, res, next) => {
    try {
      const { batchId, claimId } = req.params;

      // Get product
      const product = await db.helpers.getProductByBatchId(batchId);
      
      if (!product) {
        return res.status(404).json({
          error: {
            message: 'Product not found',
            batch_id: batchId,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Get specific claim
      const claimResult = await db.query(`
        SELECT * FROM claims 
        WHERE id = $1 AND product_id = $2
      `, [claimId, product.id]);

      if (claimResult.rows.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Claim not found for this product',
            batch_id: batchId,
            claim_id: claimId,
            timestamp: new Date().toISOString()
          }
        });
      }

      const claim = claimResult.rows[0];
      let verification = null;
      let proofLinks = null;

      // Verify HCS transaction if exists
      if (claim.hcs_transaction_id) {
        try {
          verification = await hederaService.verifyTransaction(claim.hcs_transaction_id);
          proofLinks = hederaService.generateProofLinks(
            claim.hcs_transaction_id, 
            process.env.HEDERA_TOPIC_ID
          );
        } catch (error) {
          verification = {
            verified: false,
            error: error.message
          };
        }
      } else {
        verification = {
          verified: false,
          message: 'No blockchain transaction found for this claim'
        };
      }

      res.json({
        success: true,
        data: {
          product: {
            id: product.id,
            batch_id: product.batch_id,
            product_name: product.product_name,
            supplier_name: product.supplier_name
          },
          claim,
          verification,
          proof_links: proofLinks
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

// GET /api/verify/transaction/:transactionId - Verify HCS transaction directly
router.get('/transaction/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    // Validate transaction ID format (basic)
    if (!transactionId.match(/^\d+\.\d+\.\d+@\d+\.\d+$/)) {
      return res.status(400).json({
        error: {
          message: 'Invalid transaction ID format',
          transaction_id: transactionId,
          expected_format: '0.0.12345@1640995200.123456789',
          timestamp: new Date().toISOString()
        }
      });
    }

    const verification = await hederaService.verifyTransaction(transactionId);
    const proofLinks = hederaService.generateProofLinks(
      transactionId,
      process.env.HEDERA_TOPIC_ID
    );

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        verification,
        proof_links: proofLinks
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify transaction',
        transaction_id: req.params.transactionId,
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = router;