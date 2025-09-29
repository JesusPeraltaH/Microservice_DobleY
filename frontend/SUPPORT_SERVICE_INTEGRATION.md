# Support Service Integration

This document describes how the Support Service (soporte-service) is integrated with the frontend.

## 🏗️ Architecture

The support service uses **pure Supabase** (no MongoDB) and follows the same pattern as the cupones-service:

```
Frontend (Next.js) → Support API → Soporte Service (Express + Supabase)
```

## 🔧 Configuration

### Backend (soporte-service)

- **Port**: 3005
- **Database**: Supabase
- **Base URL**: `http://localhost:3005`
- **API Endpoints**: `/api/tickets/*`

### Frontend Configuration

- **API Client**: `src/lib/api/support.ts`
- **Environment**: `NEXT_PUBLIC_SOPORTE_SERVICE_URL=http://localhost:3005`
- **Config**: `src/config/microservices.ts`

## 📋 Available Features

### 1. Ticket Management

- ✅ Create tickets (POST `/api/tickets`)
- ✅ List tickets with filters (GET `/api/tickets`)
- ✅ Get ticket by ID (GET `/api/tickets/:id`)
- ✅ Update ticket status (PATCH `/api/tickets/:id`)
- ✅ Get ticket statistics (GET `/api/tickets/stats`)

### 2. Frontend Pages

- ✅ **Support Dashboard** (`/support`) - List all tickets with stats
- ✅ **Create Ticket** (`/support/create`) - Form to create new tickets
- ✅ **Ticket Details** (`/support/[id]`) - View and update individual tickets

### 3. Ticket Types

- **Problema**: Technical issues, bugs, errors
- **Queja**: Service complaints
- **Devolución**: Refund requests

### 4. Ticket States

- **Abierto**: Newly created ticket
- **En Proceso**: Being worked on
- **Resuelto**: Problem solved
- **Cerrado**: Ticket closed

## 🚀 Getting Started

### 1. Start the Support Service

```bash
cd soporte-service
npm install
npm run dev
```

### 2. Configure Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SOPORTE_SERVICE_URL=http://localhost:3005
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Test Integration

```bash
cd frontend
node test-support-integration.js
```

## 🔌 API Integration

### TypeScript Interfaces

```typescript
interface SupportTicket {
  idTicket: string;
  idUsuario: string;
  idVenta?: string;
  customerName?: string;
  total?: number;
  statusVenta?: string;
  tipo_ticket: "queja" | "devolucion" | "problema";
  descripcion: string;
  estado_ticket: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  fechaCreacion: string;
  fechaResolucion?: string;
}

interface CreateTicketData {
  idUsuario: string;
  idVenta?: string;
  customerName?: string;
  total?: number;
  statusVenta?: string;
  tipo_ticket: "queja" | "devolucion" | "problema";
  descripcion: string;
}
```

### Usage Example

```typescript
import { supportAPI } from "@/lib/api/support";

// Create a ticket
const ticket = await supportAPI.createTicket({
  idUsuario: "user123",
  tipo_ticket: "problema",
  descripcion: "Unable to complete checkout process",
});

// Get all tickets
const { tickets, total } = await supportAPI.getTickets();

// Update ticket status
await supportAPI.updateTicket(ticketId, {
  estado_ticket: "resuelto",
});
```

## 🎯 Key Features

### Dashboard Statistics

- Total tickets count
- Tickets by status (abierto, en_proceso, resuelto, cerrado)
- Tickets by type (problema, queja, devolución)

### Filtering & Search

- Filter by status
- Filter by type
- Filter by user
- Pagination support

### Status Management

- Visual status indicators
- One-click status updates
- Automatic resolution timestamps

### Order Integration

- Link tickets to specific orders
- Display order information
- Track order status within tickets

## 🔍 Testing

### Manual Testing

1. Visit `http://localhost:3000/support`
2. Create a new ticket
3. View ticket details
4. Update ticket status
5. Check statistics

### Automated Testing

```bash
# Run integration test
node frontend/test-support-integration.js
```

### Health Check

```bash
curl http://localhost:3005/health
```

## 🛠️ Troubleshooting

### Common Issues

1. **Service not starting**

   - Check if port 3005 is available
   - Verify Supabase credentials in `.env`
   - Ensure all dependencies are installed

2. **Frontend can't connect**

   - Verify `NEXT_PUBLIC_SOPORTE_SERVICE_URL` in environment
   - Check CORS configuration
   - Ensure service is running

3. **Database errors**
   - Verify Supabase service role key
   - Check table structure in Supabase
   - Ensure proper permissions

### Debug Commands

```bash
# Check service health
curl http://localhost:3005/health

# Test ticket creation
curl -X POST http://localhost:3005/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"idUsuario":"test","tipo_ticket":"problema","descripcion":"Test ticket"}'

# Get all tickets
curl http://localhost:3005/api/tickets
```

## 📝 Notes

- The service uses **pure Supabase** - no MongoDB dependencies
- Authentication is handled at the frontend level
- All timestamps are in ISO format
- The service follows RESTful API conventions
- Error handling includes detailed error messages
- The implementation is consistent with other microservices (cupones-service pattern)
