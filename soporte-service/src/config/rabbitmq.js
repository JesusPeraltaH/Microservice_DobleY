const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

/**
 * Initialize RabbitMQ connection and channel
 */
const initRabbitMQ = async () => {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

        connection = await amqp.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Declare exchange for ticket events
        await channel.assertExchange('ticket_events', 'topic', { durable: true });

        console.log('✅ Connected to RabbitMQ');

        // Handle connection errors
        connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err);
        });

        connection.on('close', () => {
            console.log('🔌 RabbitMQ connection closed');
        });

    } catch (error) {
        console.error('❌ Failed to connect to RabbitMQ:', error.message);
        // Don't throw error - service should work without RabbitMQ
    }
};

/**
 * Publish ticket event to RabbitMQ
 * @param {string} eventType - Type of event (ticket_created, ticket_updated, etc.)
 * @param {object} ticketData - Ticket data to publish
 */
const publishTicketEvent = async (eventType, ticketData) => {
    try {
        if (!channel) {
            console.warn('⚠️ RabbitMQ channel not available, skipping event publication');
            return;
        }

        const routingKey = `ticket.${eventType}`;
        const message = {
            eventType,
            timestamp: new Date().toISOString(),
            data: ticketData
        };

        await channel.publish(
            'ticket_events',
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );

        console.log(`📨 Published event: ${eventType} for ticket ${ticketData.idTicket}`);
    } catch (error) {
        console.error('❌ Failed to publish ticket event:', error.message);
        // Don't throw error - ticket creation should succeed even if event publishing fails
    }
};

/**
 * Close RabbitMQ connection gracefully
 */
const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
        }
        if (connection) {
            await connection.close();
        }
        console.log('🔌 RabbitMQ connection closed gracefully');
    } catch (error) {
        console.error('❌ Error closing RabbitMQ connection:', error.message);
    }
};

module.exports = {
    initRabbitMQ,
    publishTicketEvent,
    closeRabbitMQ
};