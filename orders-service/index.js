const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://microstore-user:ReadyMate1@cluster0.cwjq9hx.mongodb.net/microstore?retryWrites=true&w=majority')
  .then(() => console.log('✅ Conectado a MongoDB - Órdenes'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquema de Orden
const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, default: 'completado' },
  paymentMethod: { type: String, default: 'cash' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

// 🔥 FUNCIÓN PARA ACTUALIZAR INVENTARIO
const updateInventoryStock = async (items) => {
  try {
    console.log('🔄 Iniciando actualización de inventario...');
    
    for (const item of items) {
      console.log(`📦 Actualizando: ${item.productName} - Reduciendo ${item.quantity} unidades`);
      
      const response = await axios.patch(
        `http://localhost:3001/products/${item.productId}/stock`,
        { quantity: item.quantity },
        { timeout: 10000 }
      );
      
      if (response.data) {
        console.log(`✅ ${item.productName} - Nuevo stock: ${response.data.stock}`);
      }
    }
    
    console.log('🎉 Inventario actualizado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error actualizando inventario:', error.message);
    
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(`Error de inventario: ${error.response.data.error || error.message}`);
    } else if (error.request) {
      throw new Error('No se pudo conectar al servicio de inventario');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};

// 🔥 CREAR ORDEN CON ACTUALIZACIÓN DE INVENTARIO
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📦 Recibiendo nueva orden...');
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    // Validar datos requeridos
    if (!req.body.customerName || !req.body.items || req.body.items.length === 0 || !req.body.total) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos: customerName, items y total son requeridos'
      });
    }

    // 1. PRIMERO ACTUALIZAR EL INVENTARIO
    console.log('🔄 Paso 1: Actualizando inventario...');
    await updateInventoryStock(req.body.items);
    console.log('✅ Inventario actualizado correctamente');
    
    // 2. LUEGO CREAR LA ORDEN
    console.log('🔄 Paso 2: Creando orden en la base de datos...');
    const orderData = {
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail || 'no-email@microstore.com',
      items: req.body.items,
      total: req.body.total,
      status: req.body.status || 'completado',
      paymentMethod: req.body.paymentMethod || 'cash',
      date: new Date(req.body.date || Date.now()),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('✅ Orden creada exitosamente - ID:', savedOrder._id);
    console.log('📊 Resumen orden:');
    console.log('- Cliente:', savedOrder.customerName);
    console.log('- Total: $', savedOrder.total);
    console.log('- Productos:', savedOrder.items.length);
    console.log('- Estado:', savedOrder.status);
    
    res.status(201).json({
      success: true,
      message: 'Orden creada y inventario actualizado exitosamente',
      order: savedOrder
    });
    
  } catch (error) {
    console.error('❌ Error creando orden:', error.message);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Obtener todas las órdenes
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📋 Solicitando todas las órdenes...');
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`✅ Enviando ${orders.length} órdenes`);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error obteniendo órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// Obtener una orden por ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const ordersCount = await Order.countDocuments();
    
    // Verificar conexión con inventory-service
    let inventoryStatus = 'unknown';
    try {
      await axios.get('http://localhost:3001/products', { timeout: 3000 });
      inventoryStatus = 'connected';
    } catch (error) {
      inventoryStatus = 'disconnected';
    }
    
    res.json({ 
      status: 'OK', 
      service: 'orders-service',
      database: dbStatus,
      inventoryService: inventoryStatus,
      totalOrders: ordersCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Order Service is working!',
    endpoints: {
      createOrder: 'POST /api/orders',
      getOrders: 'GET /api/orders',
      health: 'GET /health'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Order-Service ejecutándose en puerto ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📦 Crear Orden: POST http://localhost:${PORT}/api/orders`);
  console.log(`📋 Ver Órdenes: GET http://localhost:${PORT}/api/orders`);
  console.log(`🔧 Test: GET http://localhost:${PORT}/api/test`);
});