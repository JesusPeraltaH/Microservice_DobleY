const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://microstore-user:ReadyMate1@cluster0.cwjq9hx.mongodb.net/microstore?retryWrites=true&w=majority')
  .then(() => console.log('✅ Conectado a MongoDB - Inventario'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Esquema de Producto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

// 🔥 ENDPOINT CRÍTICO: Actualizar stock (para ventas)
app.patch('/products/:id/stock', async (req, res) => {
  try {
    console.log('🔄 Solicitando actualización de stock...');
    console.log('Producto ID:', req.params.id);
    console.log('Cantidad a reducir:', req.body.quantity);
    
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser un número positivo' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    console.log('📊 Stock actual:', product.stock);
    console.log('📦 Cantidad a vender:', quantity);
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}` 
      });
    }
    
    // Reducir el stock
    const stockAnterior = product.stock;
    product.stock -= quantity;
    await product.save();
    
    console.log('✅ Stock actualizado exitosamente');
    console.log('📈 Stock anterior:', stockAnterior);
    console.log('📉 Stock nuevo:', product.stock);
    
    res.json({
      success: true,
      message: 'Stock actualizado correctamente',
      product: {
        _id: product._id,
        name: product.name,
        stockAnterior: stockAnterior,
        stockNuevo: product.stock,
        cantidadVendida: quantity
      }
    });
    
  } catch (error) {
    console.error('❌ Error actualizando stock:', error);
    res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
  }
});

// Obtener todos los productos
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto por ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo producto
app.post('/products', async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const product = new Product({ name, price, stock, description });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar un producto
app.put('/products/:id', async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, stock, description },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'inventory-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🏪 Inventario-Service ejecutándose en puerto ${PORT}`);
  console.log(`📦 Endpoint stock: PATCH http://localhost:${PORT}/products/:id/stock`);
  console.log(`📋 Ver productos: GET http://localhost:${PORT}/products`);
});