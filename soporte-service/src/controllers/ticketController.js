const ticketService = require('../services/ticketService');

/**
 * Controller for ticket operations
 */
class TicketController {
    /**
     * Create a new support ticket
     * POST /tickets
     */
    async createTicket(req, res) {
        try {
            const ticketData = req.body;

            // If user is authenticated via JWT, use that user ID
            if (req.user && req.user.userId) {
                ticketData.idUsuario = req.user.userId;
            }

            // For testing purposes, ensure idUsuario is provided
            if (!ticketData.idUsuario) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing user ID',
                    message: 'idUsuario is required'
                });
            }

            console.log('📝 Creating ticket for user:', ticketData.idUsuario);

            const ticket = await ticketService.createTicket(ticketData);

            res.status(201).json({
                success: true,
                message: 'Ticket created successfully',
                data: ticket
            });
        } catch (error) {
            console.error('❌ Error creating ticket:', error.message);

            // Handle specific error types
            if (error.message.includes('not found in MongoDB')) {
                return res.status(404).json({
                    success: false,
                    error: 'Resource not found',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to create ticket',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get ticket by ID
     * GET /tickets/:id
     */
    async getTicketById(req, res) {
        try {
            const { id } = req.params;

            console.log('🔍 Fetching ticket:', id);

            const ticket = await ticketService.getTicketById(id);

            if (!ticket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found',
                    message: `Ticket with ID ${id} does not exist`
                });
            }

            // Check if user has permission to view this ticket
            if (req.user && req.user.userId && ticket.idUsuario !== req.user.userId) {
                // Allow admin users to view any ticket (you can implement role-based access here)
                if (!req.user.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied',
                        message: 'You can only view your own tickets'
                    });
                }
            }

            res.json({
                success: true,
                data: ticket
            });
        } catch (error) {
            console.error('❌ Error fetching ticket:', error.message);

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch ticket',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get tickets with optional filters
     * GET /tickets
     */
    async getTickets(req, res) {
        try {
            const filters = req.query;

            // If user is authenticated and not admin, only show their tickets
            if (req.user && req.user.userId && !req.user.isAdmin) {
                filters.usuario = req.user.userId;
            }

            // For test endpoints, allow viewing all tickets if no user is authenticated

            console.log('📋 Fetching tickets with filters:', filters);

            const result = await ticketService.getTickets(filters);

            res.json({
                success: true,
                data: result.tickets,
                pagination: {
                    total: result.total,
                    limit: result.limit,
                    offset: result.offset,
                    hasMore: result.offset + result.limit < result.total
                }
            });
        } catch (error) {
            console.error('❌ Error fetching tickets:', error.message);

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch tickets',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Update ticket status or resolution
     * PATCH /tickets/:id
     */
    async updateTicket(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            console.log('✏️ Updating ticket:', id, 'with data:', updateData);

            // Check if ticket exists and user has permission
            const existingTicket = await ticketService.getTicketById(id);
            if (!existingTicket) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found',
                    message: `Ticket with ID ${id} does not exist`
                });
            }

            // Check permissions
            if (req.user && req.user.userId && existingTicket.idUsuario !== req.user.userId) {
                if (!req.user.isAdmin) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied',
                        message: 'You can only update your own tickets'
                    });
                }
            }

            const updatedTicket = await ticketService.updateTicket(id, updateData);

            res.json({
                success: true,
                message: 'Ticket updated successfully',
                data: updatedTicket
            });
        } catch (error) {
            console.error('❌ Error updating ticket:', error.message);

            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: 'Ticket not found',
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to update ticket',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Get ticket statistics
     * GET /tickets/stats
     */
    async getTicketStats(req, res) {
        try {
            console.log('📊 Fetching ticket statistics');

            const stats = await ticketService.getTicketStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('❌ Error fetching ticket stats:', error.message);

            res.status(500).json({
                success: false,
                error: 'Internal server error',
                message: 'Failed to fetch ticket statistics',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new TicketController();