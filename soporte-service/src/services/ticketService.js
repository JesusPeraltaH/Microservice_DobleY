const supabase = require('../config/supabase');
// Pure Supabase implementation - no MongoDB dependencies

/**
 * Service class for ticket operations
 */
class TicketService {
    // Pure Supabase implementation - validation removed for simplicity

    /**
     * Create a new support ticket
     * @param {object} ticketData - Ticket data
     * @param {string} ticketData.idUsuario - User ID
     * @param {string} ticketData.idVenta - Sale ID (optional)
     * @param {string} ticketData.customerName - Customer name (optional)
     * @param {number} ticketData.total - Sale total (optional)
     * @param {string} ticketData.statusVenta - Sale status (optional)
     * @param {string} ticketData.tipo_ticket - Ticket type (queja, devolucion, problema)
     * @param {string} ticketData.descripcion - Ticket description
     * @returns {Promise<object>} Created ticket
     */
    async createTicket(ticketData) {
        const { idUsuario, idVenta, customerName, total, statusVenta, tipo_ticket, descripcion } = ticketData;

        // Prepare ticket data for Supabase
        const ticketToCreate = {
            idUsuario,
            idVenta: idVenta || null,
            customerName: customerName || null,
            total: total || null,
            statusVenta: statusVenta || null,
            tipo_ticket,
            descripcion,
            estado_ticket: 'abierto',
            fechaCreacion: new Date().toISOString(),
            fechaResolucion: null
        };

        // Insert ticket into Supabase
        const { data, error } = await supabase
            .from('tickets')
            .insert([ticketToCreate])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error creating ticket:', error);
            throw new Error(`Failed to create ticket: ${error.message}`);
        }

        console.log('✅ Ticket created successfully:', data.idTicket);

        return data;
    }

    /**
     * Get ticket by ID
     * @param {string} ticketId - Ticket UUID
     * @returns {Promise<object|null>} Ticket object or null if not found
     */
    async getTicketById(ticketId) {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('idTicket', ticketId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Ticket not found
            }
            console.error('❌ Supabase error fetching ticket:', error);
            throw new Error(`Failed to fetch ticket: ${error.message}`);
        }

        return data;
    }

    /**
     * Get tickets with optional filters
     * @param {object} filters - Filter options
     * @param {string} filters.usuario - Filter by user ID
     * @param {string} filters.estado - Filter by ticket status
     * @param {string} filters.tipo - Filter by ticket type
     * @param {number} filters.limit - Limit number of results
     * @param {number} filters.offset - Offset for pagination
     * @returns {Promise<object>} Object with tickets array and total count
     */
    async getTickets(filters = {}) {
        let query = supabase.from('tickets').select('*', { count: 'exact' });

        // Apply filters
        if (filters.usuario) {
            query = query.eq('idUsuario', filters.usuario);
        }
        if (filters.estado) {
            query = query.eq('estado_ticket', filters.estado);
        }
        if (filters.tipo) {
            query = query.eq('tipo_ticket', filters.tipo);
        }

        // Apply pagination
        const limit = filters.limit || 50;
        const offset = filters.offset || 0;
        query = query.range(offset, offset + limit - 1);

        // Order by creation date (newest first)
        query = query.order('fechaCreacion', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            console.error('❌ Supabase error fetching tickets:', error);
            throw new Error(`Failed to fetch tickets: ${error.message}`);
        }

        return {
            tickets: data || [],
            total: count || 0,
            limit,
            offset
        };
    }

    /**
     * Update ticket status and/or resolution
     * @param {string} ticketId - Ticket UUID
     * @param {object} updateData - Data to update
     * @param {string} updateData.estado_ticket - New ticket status
     * @param {string} updateData.descripcion - Updated description
     * @param {string} updateData.fechaResolucion - Resolution date
     * @returns {Promise<object>} Updated ticket
     */
    async updateTicket(ticketId, updateData) {
        // Check if ticket exists
        const existingTicket = await this.getTicketById(ticketId);
        if (!existingTicket) {
            throw new Error(`Ticket with ID ${ticketId} not found`);
        }

        // Prepare update data
        const dataToUpdate = { ...updateData };

        // If status is being changed to 'resuelto' or 'cerrado', set resolution date
        if (updateData.estado_ticket &&
            (updateData.estado_ticket === 'resuelto' || updateData.estado_ticket === 'cerrado') &&
            !updateData.fechaResolucion) {
            dataToUpdate.fechaResolucion = new Date().toISOString();
        }

        // Update ticket in Supabase
        const { data, error } = await supabase
            .from('tickets')
            .update(dataToUpdate)
            .select()
            .eq('idTicket', ticketId)
            .single();

        if (error) {
            console.error('❌ Supabase error updating ticket:', error);
            throw new Error(`Failed to update ticket: ${error.message}`);
        }

        console.log('✅ Ticket updated successfully:', ticketId);

        return data;
    }

    /**
     * Get ticket statistics
     * @returns {Promise<object>} Statistics object
     */
    async getTicketStats() {
        const { data, error } = await supabase
            .from('tickets')
            .select('estado_ticket, tipo_ticket');

        if (error) {
            console.error('❌ Supabase error fetching ticket stats:', error);
            throw new Error(`Failed to fetch ticket statistics: ${error.message}`);
        }

        const stats = {
            total: data.length,
            byStatus: {
                abierto: 0,
                en_proceso: 0,
                resuelto: 0,
                cerrado: 0
            },
            byType: {
                queja: 0,
                devolucion: 0,
                problema: 0
            }
        };

        data.forEach(ticket => {
            if (stats.byStatus.hasOwnProperty(ticket.estado_ticket)) {
                stats.byStatus[ticket.estado_ticket]++;
            }
            if (stats.byType.hasOwnProperty(ticket.tipo_ticket)) {
                stats.byType[ticket.tipo_ticket]++;
            }
        });

        return stats;
    }
}

module.exports = new TicketService();