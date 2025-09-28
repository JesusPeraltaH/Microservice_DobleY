/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('🚨 Unhandled error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        details = err.message;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        details = err.message;
    } else if (err.name === 'MongoError' || err.name === 'MongooseError') {
        statusCode = 500;
        message = 'Database error';
        details = process.env.NODE_ENV === 'development' ? err.message : undefined;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        details = err.message;
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        details = err.message;
    }

    // Include error details in development mode
    if (process.env.NODE_ENV === 'development') {
        details = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        message: details || message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            'POST /tickets': 'Create a new support ticket',
            'GET /tickets': 'Get tickets with optional filters',
            'GET /tickets/stats': 'Get ticket statistics',
            'GET /tickets/:id': 'Get ticket by ID',
            'PATCH /tickets/:id': 'Update ticket status or resolution',
            'GET /health': 'Health check endpoint'
        }
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};