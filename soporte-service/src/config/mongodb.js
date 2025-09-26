const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection for read-only access to validate users and sales
const connectMongoDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI environment variable is required');
        }

        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            readPreference: 'secondary', // Use secondary for read-only operations
        });

        console.log('✅ Connected to MongoDB (read-only mode)');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

// User schema for validation (read-only)
const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nombre: String,
    email: String,
}, { collection: 'users' });

// Orders schema for validation (read-only)
const ordersSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    customerName: String,
    customerEmail: String,
    items: [{
        productId: String,
        productName: String,
        quantity: Number,
        price: Number
    }],
    total: Number,
    status: String,
    paymentMethod: String,
    date: Date,
    createdAt: Date,
    updatedAt: Date
}, { collection: 'orders' });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', ordersSchema);

module.exports = {
    connectMongoDB,
    User,
    Order
};