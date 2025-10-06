const express = require('express');
const cors = require('cors');
require('dotenv').config();

const couponRoutes = require('./src/routes/couponRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const { connectRabbitMQ, publishEvent, consumeEvents } = require('./src/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'Coupons Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/coupons', couponRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`  Coupons Service running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`   API Base URL: http://localhost:${PORT}/api/coupons`);
});

// Initialize RabbitMQ on startup
(async () => {
  try {
    await connectRabbitMQ();
    await publishEvent('micro.events', 'coupons.started', { service: 'cupones-service', timestamp: new Date().toISOString() });
    // Example consumer that logs all events
    await consumeEvents('micro.events', 'coupons.logs', '#', async (data, fields) => {
      console.log(`[coupons] event received: ${fields.routingKey}`, data);
    });
  } catch (err) {
    console.error('RabbitMQ init error:', err.message);
  }
})();