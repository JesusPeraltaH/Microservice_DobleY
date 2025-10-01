const express = require('express');
const ticketController = require('../controllers/ticketController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validate, validateUUID } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   POST /tickets
 * @desc    Create a new support ticket
 * @access  Private (requires JWT token)
 * @body    {
 *   idUsuario: string (required),
 *   idVenta: string (optional),
 *   customerName: string (optional),
 *   total: number (optional),
 *   statusVenta: string (optional),
 *   tipo_ticket: 'queja'|'devolucion'|'problema' (required),
 *   descripcion: string (required, min 10 chars)
 * }
 */
// Test endpoint without authentication (for development/testing)
router.post('/test',
    validate('createTicket', 'body'),
    ticketController.createTicket
);

router.post('/',
    authenticateToken,
    validate('createTicket', 'body'),
    ticketController.createTicket
);

/**
 * @route   GET /tickets/stats
 * @desc    Get ticket statistics
 * @access  Public (but filtered by user if authenticated)
 */
router.get('/stats',
    optionalAuth,
    ticketController.getTicketStats
);

/**
 * @route   GET /tickets/:id
 * @desc    Get ticket by ID
 * @access  Private (users can only see their own tickets unless admin)
 * @params  id: UUID of the ticket
 */
router.get('/:id',
    authenticateToken,
    validateUUID('id'),
    ticketController.getTicketById
);

/**
 * @route   GET /tickets
 * @desc    Get tickets with optional filters
 * @access  Private (users see only their tickets unless admin)
 * @query   {
 *   usuario: string (optional, MongoDB ObjectId),
 *   estado: 'abierto'|'en_proceso'|'resuelto'|'cerrado' (optional),
 *   tipo: 'queja'|'devolucion'|'problema' (optional),
 *   limit: number (optional, default 50, max 100),
 *   offset: number (optional, default 0)
 * }
 */
// Test endpoint to get all tickets without authentication
router.get('/test',
    validate('queryParams', 'query'),
    ticketController.getTickets
);

router.get('/',
    authenticateToken,
    validate('queryParams', 'query'),
    ticketController.getTickets
);

/**
 * @route   PATCH /tickets/:id
 * @desc    Update ticket status or resolution
 * @access  Private (users can update their own tickets, admins can update any)
 * @params  id: UUID of the ticket
 * @body    {
 *   estado_ticket: 'abierto'|'en_proceso'|'resuelto'|'cerrado' (optional),
 *   descripcion: string (optional),
 *   fechaResolucion: date (optional)
 * }
 */
router.patch('/:id',
    authenticateToken,
    validateUUID('id'),
    validate('updateTicket', 'body'),
    ticketController.updateTicket
);

module.exports = router;