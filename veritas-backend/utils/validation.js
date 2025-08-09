const Joi = require('joi');

// Validation schemas
const schemas = {
  // Product creation validation
  createProduct: Joi.object({
    product_name: Joi.string()
      .trim()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 255 characters'
      }),
    
    supplier_name: Joi.string()
      .trim()
      .min(2)
      .max(255)
      .required()
      .messages({
        'string.empty': 'Supplier name is required',
        'string.min': 'Supplier name must be at least 2 characters',
        'string.max': 'Supplier name cannot exceed 255 characters'
      }),
    
    description: Joi.string()
      .trim()
      .max(2000)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 2000 characters'
      }),
    
    claims: Joi.array()
      .items(
        Joi.object({
          claim_type: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
              'string.empty': 'Claim type is required',
              'string.min': 'Claim type must be at least 2 characters',
              'string.max': 'Claim type cannot exceed 100 characters'
            }),
          
          description: Joi.string()
            .trim()
            .min(5)
            .max(2000)
            .required()
            .messages({
              'string.empty': 'Claim description is required',
              'string.min': 'Claim description must be at least 5 characters',
              'string.max': 'Claim description cannot exceed 2000 characters'
            })
        })
      )
      .optional()
      .default([])
  }),

  // Claim creation validation
  createClaim: Joi.object({
    product_id: Joi.string()
      .guid({ version: 'uuidv4' })
      .required()
      .messages({
        'string.empty': 'Product ID is required',
        'string.guid': 'Product ID must be a valid UUID'
      }),
    
    claim_type: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .valid('quality', 'authenticity', 'defect', 'packaging', 'delivery', 'other', 'organic_certified', 'fair_trade', 'sustainability', 'purity', 'welfare')
      .messages({
        'string.empty': 'Claim type is required',
        'string.min': 'Claim type must be at least 2 characters',
        'string.max': 'Claim type cannot exceed 100 characters',
        'any.only': 'Claim type must be one of the accepted values'
      }),
    
    description: Joi.string()
      .trim()
      .min(5)
      .max(2000)
      .required()
      .messages({
        'string.empty': 'Claim description is required',
        'string.min': 'Claim description must be at least 5 characters',
        'string.max': 'Claim description cannot exceed 2000 characters'
      })
  }),

  // Batch ID validation
  batchId: Joi.string()
    .pattern(/^[A-Z]+-\d{4}-\d{4}$/)
    .required()
    .messages({
      'string.empty': 'Batch ID is required',
      'string.pattern.base': 'Batch ID must be in format PREFIX-YYYY-XXXX (e.g., COFFEE-2024-1234)'
    }),

  // UUID validation
  uuid: Joi.string()
    .guid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.empty': 'ID is required',
      'string.guid': 'ID must be a valid UUID'
    })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'params' ? req.params : 
                 source === 'query' ? req.query : req.body;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errorMessages,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Replace the original data with validated data
    if (source === 'params') {
      req.params = value;
    } else if (source === 'query') {
      req.query = value;
    } else {
      req.body = value;
    }

    next();
  };
};

// Specific validation middleware
const validation = {
  // Validate product creation
  validateCreateProduct: validate(schemas.createProduct),

  // Validate claim creation
  validateCreateClaim: validate(schemas.createClaim),

  // Validate batch ID in params
  validateBatchId: validate(schemas.batchId.label('batchId'), 'params'),

  // Validate UUID in params
  validateUUID: (paramName = 'id') => {
    const uuidSchema = Joi.object({
      [paramName]: schemas.uuid
    });
    return validate(uuidSchema, 'params');
  },

  // Custom validation for multiple claims
  validateClaimsBatch: (req, res, next) => {
    const { claims } = req.body;
    
    if (!claims || !Array.isArray(claims)) {
      return res.status(400).json({
        error: {
          message: 'Claims must be provided as an array',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (claims.length === 0) {
      return res.status(400).json({
        error: {
          message: 'At least one claim is required',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (claims.length > 10) {
      return res.status(400).json({
        error: {
          message: 'Maximum 10 claims allowed per request',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Validate each claim
    const claimSchema = Joi.object({
      claim_type: schemas.createClaim.extract('claim_type'),
      description: schemas.createClaim.extract('description')
    });

    const errors = [];
    claims.forEach((claim, index) => {
      const { error } = claimSchema.validate(claim);
      if (error) {
        errors.push({
          claimIndex: index,
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Claims validation failed',
          details: errors,
          timestamp: new Date().toISOString()
        }
      });
    }

    next();
  },

  // Sanitize input data
  sanitizeInput: (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.trim().replace(/[<>]/g, '');
    };

    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
            typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item)
          );
        } else if (typeof value === 'object') {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    req.body = sanitizeObject(req.body);
    next();
  }
};

// Error handler for validation errors
const handleValidationError = (error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
  next(error);
};

module.exports = {
  schemas,
  validate,
  validation,
  handleValidationError
};