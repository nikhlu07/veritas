const express = require('express');
const router = express.Router();

const QRCode = require('qrcode');
const db = require('../db/connection');
const { validation } = require('../utils/validation');
const hederaService = require('../utils/hedera');

// POST /api/claims - Add new claim to existing product
router.post('/', 
  validation.validateCreateClaim, 
  async (req, res, next) => {
    try {
      const { product_id, claim_type, description } = req.body;

      // Verify product exists
      const productResult = await db.query('SELECT * FROM products WHERE id = $1', [product_id]);
      
      if (productResult.rows.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Product not found',
            product_id,
            timestamp: new Date().toISOString()
          }
        });
      }

      const product = productResult.rows[0];

      // Insert claim
      const claimResult = await db.query(`
        INSERT INTO claims (product_id, claim_type, claim_description)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [product_id, claim_type, description]);

      const claim = claimResult.rows[0];
      let hcsResult = null;

      // Submit to HCS
      try {
        if (hederaService.isReady()) {
          hcsResult = await hederaService.submitClaim(claim, product);
          
          // Update claim with HCS data
          await db.query(`
            UPDATE claims 
            SET hcs_transaction_id = $1, hcs_timestamp = $2 
            WHERE id = $3
          `, [hcsResult.transactionId, hcsResult.timestamp, claim.id]);

          claim.hcs_transaction_id = hcsResult.transactionId;
          claim.hcs_timestamp = hcsResult.timestamp;
        }
      } catch (hcsError) {
        console.warn('⚠️  Failed to submit claim to HCS:', hcsError.message);
        hcsResult = { error: hcsError.message, success: false };
      }

      // Generate QR code for the claim
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const verificationUrl = `${baseUrl}/verify/${product.batch_id}?claim=${claim.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      
      const qrCode = {
        dataUrl: qrCodeDataUrl,
        verificationData: {
          verification_url: verificationUrl
        }
      };

      res.status(201).json({
        success: true,
        data: {
          claim,
          product: {
            id: product.id,
            batch_id: product.batch_id,
            product_name: product.product_name,
            supplier_name: product.supplier_name
          },
          qr_code: qrCode,
          hcs_result: hcsResult,
          proof_links: hcsResult && hcsResult.transactionId ? 
            hederaService.generateProofLinks(hcsResult.transactionId, process.env.HEDERA_TOPIC_ID) : 
            null
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

// GET /api/claims - Get all claims (optional endpoint for admin/debug)
router.get('/', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, product_id } = req.query;
    
    let query = `
      SELECT 
        c.*,
        p.batch_id,
        p.product_name,
        p.supplier_name
      FROM claims c
      LEFT JOIN products p ON c.product_id = p.id
    `;
    
    const params = [];
    
    if (product_id) {
      query += ' WHERE c.product_id = $1';
      params.push(product_id);
    }
    
    query += ' ORDER BY c.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        claims: result.rows,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: result.rows.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/claims/:claimId - Get specific claim details
router.get('/:claimId', 
  validation.validateUUID('claimId'),
  async (req, res, next) => {
    try {
      const { claimId } = req.params;

      const result = await db.query(`
        SELECT 
          c.*,
          p.batch_id,
          p.product_name,
          p.supplier_name,
          p.description as product_description
        FROM claims c
        LEFT JOIN products p ON c.product_id = p.id
        WHERE c.id = $1
      `, [claimId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: {
            message: 'Claim not found',
            claim_id: claimId,
            timestamp: new Date().toISOString()
          }
        });
      }

      const claim = result.rows[0];

      // Generate proof links if HCS data exists
      let proofLinks = null;
      if (claim.hcs_transaction_id) {
        proofLinks = hederaService.generateProofLinks(
          claim.hcs_transaction_id, 
          process.env.HEDERA_TOPIC_ID
        );
      }

      res.json({
        success: true,
        data: {
          claim,
          proof_links: proofLinks
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;