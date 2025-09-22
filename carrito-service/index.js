const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3102;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());


// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://microstore-user:ReadyMate1@cluster0.cwjq9hx.mongodb.net/microstore?retryWrites=true&w=majority')
  .then(() => console.log('Conectado a MongoDB - Carrito'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Esquemas
const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  status: { type: String, default: 'Completado' },
  paymentMethod: { type: String, default: 'Efectivo' },
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Rutas
// Obtener todas las órdenes
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear una nueva orden
app.post('/orders', async (req, res) => {
  try {
    const { customerName, customerEmail, items, total } = req.body;
    
    // Verificar stock y actualizar inventario
    for (const item of items) {
      try {
        await axios.patch(`${process.env.INVENTORY_SERVICE_URL}/products/${item.productId}/stock`, {
          quantity: item.quantity
        });
      } catch (error) {
        return res.status(400).json({ 
          error: `Error con el producto ${item.productName}: ${error.response?.data?.error || error.message}` 
        });
      }
    }
    
    // Crear la orden
    const order = new Order({
      customerName,
      customerEmail,
      items,
      total
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una orden por ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servicio de carrito ejecutándose en puerto ${PORT}`);
});