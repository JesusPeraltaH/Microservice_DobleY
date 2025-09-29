const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ticketRoutes = require('./src/routes/ticketRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        service: 'Support Tickets Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'supabase'
    });
});

// Routes
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

app.listen(PORT, () => {
    console.log(`🎫 Support Tickets Service running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/tickets`);
});