const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Supabase specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this value already exists'
        });
      case '23503': // Foreign key constraint violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist'
        });
      case '23502': // Not null constraint violation
        return res.status(400).json({
          error: 'Missing required field',
          message: 'A required field is missing'
        });
      default:
        return res.status(500).json({
          error: 'Database error',
          message: err.message
        });
    }
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;