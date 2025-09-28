# Support Tickets Microservice

A Node.js/Express microservice for managing support tickets with Supabase (PostgreSQL) for ticket storage and MongoDB for user/sales validation.

## Features

- ✅ **Create Support Tickets** - Users can create tickets for complaints, returns, or problems
- ✅ **MongoDB Integration** - Validates users and sales from MongoDB (read-only)
- ✅ **Supabase Storage** - Stores tickets in PostgreSQL with full ACID compliance
- ✅ **JWT Authentication** - Secure API access with JWT tokens
- ✅ **Event Publishing** - Publishes ticket events to RabbitMQ for notifications
- ✅ **Input Validation** - Comprehensive validation with Joi
- ✅ **Error Handling** - Robust error handling and logging
- ✅ **Role-based Access** - Users see only their tickets, admins see all

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Support API    │    │   Supabase      │
│   (React)       │───▶│  (Node.js)      │───▶│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │  (Read-only)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   RabbitMQ      │
                       │   (Events)      │
                       └─────────────────┘
```

## Database Schema

### Supabase `tickets` Table

```sql
CREATE TABLE tickets (
    idTicket UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idUsuario TEXT NOT NULL,           -- MongoDB user _id
    idVenta TEXT,                      -- MongoDB sale _id (optional)
    customerName TEXT,                 -- Cached from MongoDB
    total NUMERIC(10,2),               -- Cached from MongoDB
    statusVenta TEXT,                  -- Cached from MongoDB
    tipo_ticket ticket_type NOT NULL,  -- 'queja', 'devolucion', 'problema'
    descripcion TEXT NOT NULL,         -- 10-2000 characters
    estado_ticket ticket_status DEFAULT 'abierto', -- 'abierto', 'en_proceso', 'resuelto', 'cerrado'
    fechaCreacion TIMESTAMP DEFAULT NOW(),
    fechaResolucion TIMESTAMP
);
```

### MongoDB Collections (Read-only)

- **users**: `{ _id, nombre, email }`
- **orders**: `{ _id, customerName, customerEmail, items, total, status, paymentMethod, date }`

## API Endpoints

### Authentication

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints

#### `POST /tickets`

Create a new support ticket.

**Request Body:**

```json
{
  "idUsuario": "507f1f77bcf86cd799439011",
  "idVenta": "507f1f77bcf86cd799439012",
  "customerName": "Juan Pérez",
  "total": 150.0,
  "statusVenta": "completed",
  "tipo_ticket": "problema",
  "descripcion": "El producto llegó dañado y necesito una solución."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ticket created successfully",
  "data": {
    "idTicket": "123e4567-e89b-12d3-a456-426614174000",
    "idUsuario": "507f1f77bcf86cd799439011",
    "tipo_ticket": "problema",
    "estado_ticket": "abierto",
    "fechaCreacion": "2024-01-15T10:30:00Z"
  }
}
```

#### `GET /tickets`

Get tickets with optional filters.

**Query Parameters:**

- `usuario` - Filter by user ID
- `estado` - Filter by status (`abierto`, `en_proceso`, `resuelto`, `cerrado`)
- `tipo` - Filter by type (`queja`, `devolucion`, `problema`)
- `limit` - Limit results (default: 50, max: 100)
- `offset` - Pagination offset (default: 0)

#### `GET /tickets/:id`

Get a specific ticket by ID.

#### `PATCH /tickets/:id`

Update ticket status or resolution.

**Request Body:**

```json
{
  "estado_ticket": "resuelto",
  "descripcion": "Updated description"
}
```

#### `GET /tickets/stats`

Get ticket statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "abierto": 45,
      "en_proceso": 30,
      "resuelto": 60,
      "cerrado": 15
    },
    "byType": {
      "queja": 50,
      "devolucion": 40,
      "problema": 60
    }
  }
}
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Configure the following variables:

```env
# Server
PORT=3005
NODE_ENV=development

# Supabase (for tickets storage)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# MongoDB (for user/sales validation)
MONGODB_URI=mongodb://localhost:27017/microstore

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# RabbitMQ (optional)
RABBITMQ_URL=amqp://localhost:5672

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Supabase Setup

1. Create a new Supabase project
2. Run the SQL script in `database/create_tickets_table.sql`
3. Configure Row Level Security policies as needed

#### MongoDB Setup

Ensure your MongoDB instance has the required collections:

**`users` collection:**

```javascript
{
  _id: ObjectId,
  nombre: String,
  email: String
}
```

**`orders` collection:**

```javascript
{
  _id: ObjectId,
  customerName: String,
  customerEmail: String,
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String, // e.g., "Completado"
  paymentMethod: String, // e.g., "Efectivo"
  date: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Run the Service

```bash
# Development
npm run dev

# Production
npm start
```

## Event Publishing

The service publishes events to RabbitMQ for integration with notification systems:

### Events Published

- `ticket.created` - When a new ticket is created
- `ticket.updated` - When a ticket is updated

### Event Format

```json
{
  "eventType": "created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "idTicket": "123e4567-e89b-12d3-a456-426614174000",
    "idUsuario": "507f1f77bcf86cd799439011",
    "tipo_ticket": "problema",
    "estado_ticket": "abierto",
    "userInfo": {
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    }
  }
}
```

## Security Features

- **JWT Authentication** - All endpoints require valid JWT tokens
- **Input Validation** - Comprehensive validation with Joi schemas
- **SQL Injection Protection** - Parameterized queries via Supabase client
- **Row Level Security** - Supabase RLS policies for data isolation
- **Rate Limiting** - Can be added via middleware
- **CORS Configuration** - Configurable CORS settings

## Error Handling

The service provides comprehensive error handling:

- **400 Bad Request** - Validation errors, invalid input
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3005/health

# Create ticket (requires JWT token)
curl -X POST http://localhost:3005/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "idUsuario": "507f1f77bcf86cd799439011",
    "tipo_ticket": "problema",
    "descripcion": "Test ticket description with enough characters"
  }'
```

### Integration Testing

The service integrates with:

- MongoDB for user/sales validation
- Supabase for ticket storage
- RabbitMQ for event publishing
- JWT authentication system

## Monitoring

The service provides:

- Health check endpoint (`/health`)
- Comprehensive logging
- Error tracking
- Performance metrics (can be extended)

## Deployment

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3005
CMD ["npm", "start"]
```

### Environment-specific Configuration

- Development: Full error details, debug logging
- Production: Minimal error exposure, structured logging

## Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include input validation
4. Write clear documentation
5. Test all endpoints thoroughly

## License

MIT License - see LICENSE file for details.
