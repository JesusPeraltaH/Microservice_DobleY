const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * JWT Authentication middleware
 * Validates JWT token and extracts user information
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            message: 'Please provide a valid JWT token in Authorization header'
        });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('❌ JWT_SECRET environment variable not set');
        return res.status(500).json({
            error: 'Server configuration error',
            message: 'JWT secret not configured'
        });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error('❌ JWT verification failed:', err.message);
            return res.status(403).json({
                error: 'Invalid token',
                message: 'The provided token is invalid or expired'
            });
        }

        // Add user information to request object
        req.user = user;
        next();
    });
};

/**
 * Optional authentication middleware
 * Extracts user info if token is provided, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        req.user = null;
        return next();
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

module.exports = {
    authenticateToken,
    optionalAuth
};