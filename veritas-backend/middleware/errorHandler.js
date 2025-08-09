const errorHandler = (err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    message: 'Internal server error',
    status: 500,
    timestamp: new Date().toISOString()
  };

  // PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        error = {
          message: 'Duplicate entry found',
          status: 409,
          details: 'A record with this information already exists',
          timestamp: new Date().toISOString()
        };
        break;
      
      case '23503': // foreign_key_violation
        error = {
          message: 'Invalid reference',
          status: 400,
          details: 'Referenced record does not exist',
          timestamp: new Date().toISOString()
        };
        break;
      
      case '23502': // not_null_violation
        error = {
          message: 'Missing required field',
          status: 400,
          details: 'Required field cannot be null',
          timestamp: new Date().toISOString()
        };
        break;
      
      case '22001': // string_data_right_truncation
        error = {
          message: 'Data too long',
          status: 400,
          details: 'Input data exceeds maximum allowed length',
          timestamp: new Date().toISOString()
        };
        break;
      
      case '08006': // connection_failure
      case '08001': // sqlclient_unable_to_establish_sqlconnection
        error = {
          message: 'Database connection error',
          status: 503,
          details: 'Unable to connect to database',
          timestamp: new Date().toISOString()
        };
        break;
      
      default:
        error = {
          message: 'Database error',
          status: 500,
          details: process.env.NODE_ENV === 'development' ? err.message : 'A database error occurred',
          timestamp: new Date().toISOString()
        };
    }
  }
  // Validation errors
  else if (err.name === 'ValidationError') {
    error = {
      message: 'Validation error',
      status: 400,
      details: err.message,
      timestamp: new Date().toISOString()
    };
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401,
      details: 'Authentication token is invalid',
      timestamp: new Date().toISOString()
    };
  }
  else if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401,
      details: 'Authentication token has expired',
      timestamp: new Date().toISOString()
    };
  }
  // Syntax errors (malformed JSON, etc.)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = {
      message: 'Invalid JSON',
      status: 400,
      details: 'Request body contains invalid JSON',
      timestamp: new Date().toISOString()
    };
  }
  // Custom application errors
  else if (err.status) {
    error = {
      message: err.message || 'Application error',
      status: err.status,
      details: err.details,
      timestamp: new Date().toISOString()
    };
  }
  // Generic errors
  else if (err.message) {
    error = {
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      status: 500,
      timestamp: new Date().toISOString()
    };
  }

  // Include request ID if available
  if (req.id) {
    error.requestId = req.id;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  // Send error response
  res.status(error.status).json({ error });
};

// Helper function to create custom errors
const createError = (message, status = 500, details = null) => {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  createError,
  asyncHandler
};