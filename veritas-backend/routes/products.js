const express = require('express');
const router = express.Router();

const QRCode = require('qrcode');
const db = require('../db/connection');
const { validation } = require('../utils/validation');
const hederaService = require('../utils/hedera');
const { generateBatchId } = require('../utils/batchId');

// POST /api/products - Create product with HCS integration
router.post('/', 
  validation.validateCreateProduct, 
  async (req, res, next) => {
    try {
      const { product_name, supplier_name, description, claims = [] } = req.body;

      // Generate appropriate prefix from product name
      const prefix = product_name.toUpperCase().split(' ')[0] || 'PRODUCT';

      // Start database transaction
      await db.transaction(async (client) => {
        // Generate batch_id and insert product
        const batchId = await generateBatchId(prefix);
        const productResult = await client.query(`
          INSERT INTO products (batch_id, product_name, supplier_name, description)
          VALUES ($1, $2, $3, $4)
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
        } catch (hcsError) {
          console.warn('⚠️  Failed to submit product to HCS:', hcsError.message);
          hcsResults.push({
            type: 'PRODUCT',
            success: false,
            error: hcsError.message
          });
        }

        // Insert and submit claims if provided
        for (const claimData of claims) {
          const claimResult = await client.query(`
            INSERT INTO claims (product_id, claim_type, claim_description)
            VALUES ($1, $2, $3)
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
          } catch (hcsError) {
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
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/verify/${product.batch_id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        
        const qrCode = {
          dataUrl: qrCodeDataUrl,
          verificationData: {
            verification_url: verificationUrl
          }
        };

        // Format response to match expected structure
        res.status(201).json({
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
        });
      });

    } catch (error) {
      next(error);
    }
  }
);

// GET /api/products/:batchId - Get product by batch ID
router.get('/:batchId', 
  validation.validateBatchId, 
  async (req, res, next) => {
    try {
      const { batchId } = req.params;

      // Get product with claims
      const productResult = await db.query(`
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
        return res.status(404).json({
          error: {
            message: 'Product not found',
            batch_id: batchId,
            timestamp: new Date().toISOString()
          }
        });
      }

      const product = productResult.rows[0];
      const claims = product.claims || [];

      // Generate QR code for the product
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify/${product.batch_id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      
      const qrCode = {
        dataUrl: qrCodeDataUrl,
        verificationData: {
          verification_url: verificationUrl
        }
      };

      res.json({
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

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;