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
  totalAfterDiscount: { type: Number, default:0 },
  discountApplied: { type: Number, default:0 },
  couponCode: { type: String, default: null },
  couponId: { type: String, default: null},
  couponDiscount: { type: Number, default:0 },
  status: { type: String, default: 'completado' },
  paymentMethod: { type: String, default: 'cash' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

// Función para actualizar inventario
const updateInventoryStock = async (items) => {
  try {
    console.log('🔄 Iniciando actualización de inventario...');
    
    const updatedItems = [];
    for (const item of items) {
      console.log(`📦 Actualizando: ${item.productName} - Reduciendo ${item.quantity} unidades`);
      const response = await axios.patch(
        `http://localhost:3001/products/${item.productId}/stock`,
        { quantity: item.quantity },
        { timeout: 10000 }
      );
      if (response.data) {
        console.log(`✅ ${item.productName} - Nuevo stock: ${response.data.stock}`);
        updatedItems.push({ productId: item.productId, previousStock: response.data.previousStock });
      }
    }
    console.log('🎉 Inventario actualizado exitosamente');
    return updatedItems;
  } catch (error) {
    console.error('❌ Error actualizando inventario:', error.message);
    throw new Error('Error actualizando inventario');
  }
};

// Función para revertir inventario en caso de fallo
const rollbackInventory = async (items) => {
  try {
    console.log('⏪ Revirtiendo inventario...');
    for (const item of items) {
      await axios.patch(
        `http://localhost:3001/products/${item.productId}/stock`,
        { quantity: item.previousStock, operation: 'set' },
        { timeout: 10000 }
      );
      console.log(`🔄 Revertido stock de producto ${item.productId} a ${item.previousStock}`);
    }
  } catch (error) {
    console.error('❌ Error revirtiendo inventario:', error.message);
  }
};

// Crear orden
app.post('/api/orders', async (req, res) => {
  let inventoryBackup = [];
  try {
    console.log('📦 Recibiendo nueva orden:', JSON.stringify(req.body, null, 2));

    const { customerName, customerEmail, items, total, totalAfterDiscount, discountApplied, couponCode, couponId, couponDiscount, status, paymentMethod, date } = req.body;

    if (!customerName || !items || items.length === 0 || !total) {
      return res.status(400).json({ success: false, error: 'Datos incompletos: customerName, items y total son requeridos' });
    }

    // Guardar la orden primero en MongoDB
    const order = new Order({
      customerName,
      customerEmail: customerEmail || 'no-email@microstore.com',
      items,
      total,
      totalAfterDiscount: totalAfterDiscount || total,
      discountApplied: discountApplied || 0,
      couponCode: couponCode || null,
      couponId: couponId || null,
      couponDiscount: couponDiscount || 0,
      status: status || 'completado',
      paymentMethod: paymentMethod || 'cash',
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedOrder = await order.save();
    console.log('✅ Orden creada en MongoDB - ID:', savedOrder._id);

    // Actualizar inventario después
    inventoryBackup = await updateInventoryStock(items);

    res.status(201).json({
      success: true,
      message: 'Orden creada y inventario actualizado exitosamente',
      order: savedOrder
    });

  } catch (error) {
    console.error('❌ Error creando orden:', error.message);

    // Si falló después de crear la orden, revertir inventario
    if (inventoryBackup.length > 0) {
      await rollbackInventory(inventoryBackup);
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener todas las órdenes
// Obtener todas las órdenes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    // Forzar que los campos de cupón siempre existan aunque sean null
    const ordersWithCoupon = orders.map(o => ({
      ...o.toObject(),
      couponCode: o.couponCode || null,
      couponId: o.couponId || null,
      couponDiscount: o.couponDiscount != null ? o.couponDiscount : null
    }));

    res.json(ordersWithCoupon);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});


// Obtener orden por ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
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
    res.json({ status: 'OK', service: 'orders-service', database: dbStatus, totalOrders: ordersCount, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Order Service is working!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Order-Service ejecutándose en puerto ${PORT}`);
});
