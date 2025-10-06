const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { connectRabbitMQ, publishEvent } = require('./src/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware con CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Headers CORS adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  next();
});

app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/usuarios')
  .then(() => console.log('Conectado a MongoDB - Usuarios'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'microstore-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rutas
// Registro de usuario
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }
    
    // Crear nuevo usuario
    const newUser = new User({ email, password, firstName, lastName });
    await newUser.save();
    
    // Generar token JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || 'microstore-secret',
      { expiresIn: '24h' }
    );
    
    // Establecer cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'microstore-secret',
      { expiresIn: '24h' }
    );
    
    // Establecer cookie HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los usuarios (para la lista de ventas)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Excluir password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Buscar usuario por email (endpoint adicional si se necesita)
app.get('/api/users/search', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() }, { password: 0 });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error searching user' });
  }
});

// Verificar token (para el frontend)
app.post('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'usuarios-service' });
});

app.listen(PORT, () => {
  console.log(`Servicio de usuarios ejecutándose en puerto ${PORT}`);
});

// Initialize RabbitMQ on startup
(async () => {
  try {
    await connectRabbitMQ();
    await publishEvent('micro.events', 'users.started', { service: 'usuarios-service', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('RabbitMQ init error:', err.message);
  }
})();