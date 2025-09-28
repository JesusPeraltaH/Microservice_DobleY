<<<<<<< Updated upstream
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Port:', process.env.PORT);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3105;
=======
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import configurations and middleware
const { connectMongoDB } = require('./src/config/mongodb');
// RabbitMQ removed - notifications handled by separate microservice
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import routes
const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3005;

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    // Connect to MongoDB (read-only for user/sales validation)
    await connectMongoDB();

    // RabbitMQ removed - notifications handled by separate microservice

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    process.exit(1);
  }
}
>>>>>>> Stashed changes

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
<<<<<<< Updated upstream
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://microstore-user:ReadyMate1@cluster0.cwjq9hx.mongodb.net/microstore?retryWrites=true&w=majority')
  .then(() => console.log('Conectado a MongoDB - Soporte'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Esquema de Ticket - ELIMINAR VALIDACIÓN ENUM que causa error
const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  customer: { type: String, required: true },
  priority: { type: String, default: "Media" },
  status: { type: String, default: "Abierto" }, // Cambiar a "Abierto" que es válido
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  collection: 'support_tickets',
  // Desactivar validación estricta para evitar errores de enum
  strict: false
});

const Ticket = mongoose.model('Ticket', ticketSchema);

// Rutas

// Obtener todos los tickets
app.get('/tickets', async (req, res) => {
  try {
    console.log('Fetching all tickets from MongoDB...');
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    console.log(`Found ${tickets.length} tickets`);
    
    if (tickets.length > 0) {
      console.log('Sample ticket:', {
        _id: tickets[0]._id,
        title: tickets[0].title,
        customer: tickets[0].customer,
        status: tickets[0].status
      });
    }
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Crear nuevo ticket
app.post('/tickets', async (req, res) => {
  try {
    console.log('Creating new ticket with data:', req.body);
    
    const ticketData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Usar "Abierto" en lugar de "Adjetro" para evitar errores de validación
    if (!ticketData.status) {
      ticketData.status = "Abierto";
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();
    
    console.log('Ticket created successfully:', {
      _id: ticket._id,
      title: ticket.title,
      customer: ticket.customer,
      status: ticket.status
    });
    
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Error al crear ticket: ' + error.message });
  }
});

// Obtener estadísticas de tickets (NUEVO ENDPOINT)
app.get('/tickets/stats', async (req, res) => {
  try {
    console.log('Fetching ticket statistics...');
    const tickets = await Ticket.find();
    
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(ticket => 
      ticket.status === 'Abierto' || ticket.status === 'Adjetro' || ticket.status === 'Open'
    ).length;

    const inProgressTickets = tickets.filter(ticket => 
      ticket.status === 'En proceso' || ticket.status === 'In Progress'
    ).length;

    const resolvedTickets = tickets.filter(ticket => 
      ticket.status === 'Resuelto' || ticket.status === 'Cerrado' || ticket.status === 'Closed'
    ).length;

    console.log('Ticket statistics:', {
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets
    });

    res.json({
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'soporte-service',
    timestamp: new Date().toISOString()
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servicio de soporte ejecutándose en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Tickets endpoint: http://localhost:${PORT}/tickets`);
  console.log(`Stats endpoint: http://localhost:${PORT}/tickets/stats`);
=======
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'Support Tickets Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    connections: {
      mongodb: 'connected',
      supabase: 'configured',
      rabbitmq: 'optional'
    }
  });
});

// API routes
app.use('/tickets', ticketRoutes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeApp();

  app.listen(PORT, () => {
    console.log(`🎫 Support Tickets Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/tickets`);
    console.log(`📚 Available endpoints:`);
    console.log(`   POST   /tickets          - Create new ticket`);
    console.log(`   GET    /tickets          - Get tickets (with filters)`);
    console.log(`   GET    /tickets/stats    - Get ticket statistics`);
    console.log(`   GET    /tickets/:id      - Get ticket by ID`);
    console.log(`   PATCH  /tickets/:id      - Update ticket`);
    console.log(`🔐 Authentication: JWT token required (Bearer token)`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
>>>>>>> Stashed changes
});