console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Port:', process.env.PORT);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://microstore-user:ReadyMate1@cluster0.cwjq9hx.mongodb.net/microstore?retryWrites=true&w=majority')
  .then(() => console.log('Conectado a MongoDB - Órdenes'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Esquema de Orden (ajustado a la estructura real de tu BD)
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    productId: { type: String },
    productName: { type: String },
    price: { type: Number },
    quantity: { type: Number }
  }],
  total: { type: Number, required: true },
  status: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'orders' }); // Forzar el nombre de la colección

const Order = mongoose.model('Order', orderSchema);

// Rutas

// Obtener todas las órdenes
app.get('/orders', async (req, res) => {
  try {
    console.log('Fetching all orders from MongoDB...');
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);
    
    if (orders.length > 0) {
      console.log('Sample order:', {
        _id: orders[0]._id,
        customerName: orders[0].customerName,
        total: orders[0].total,
        status: orders[0].status
      });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener estadísticas de órdenes (NUEVO ENDPOINT)
app.get('/orders/stats', async (req, res) => {
  try {
    console.log('Fetching order statistics...');
    const orders = await Order.find();
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => 
      order.status.toLowerCase().includes('complete') || 
      order.status.toLowerCase().includes('complet')
    ).length;
    
    const totalRevenue = orders
      .filter(order => 
        order.status.toLowerCase().includes('complete') || 
        order.status.toLowerCase().includes('complet')
      )
      .reduce((sum, order) => sum + order.total, 0);

    console.log('Order statistics:', {
      totalOrders,
      completedOrders,
      totalRevenue
    });

    res.json({
      totalOrders,
      completedOrders,
      pendingOrders: totalOrders - completedOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'ordenes-service',
    timestamp: new Date().toISOString()
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servicio de órdenes ejecutándose en puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Orders endpoint: http://localhost:${PORT}/orders`);
  console.log(`Stats endpoint: http://localhost:${PORT}/orders/stats`);
});