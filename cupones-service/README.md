# Coupons Microservice

A Node.js/Express microservice for managing discount coupons with Supabase integration.

## Features

- ✅ Create, read, update, delete coupons
- ✅ Validate coupon codes
- ✅ Apply coupons (increment usage)
- ✅ Date-based validity checks
- ✅ Usage limit enforcement
- ✅ Coupon statistics
- ✅ Error handling and validation

## Database Schema

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount NUMERIC NOT NULL, -- percentage or amount
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  usage_limit INT,
  used_count INT DEFAULT 0
);
```

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment variables:**

   ```bash
   cp .env.example .env
   # Add your Supabase credentials
   ```

3. **Run the service:**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Health Check

- `GET /health` - Service health status

### Coupons

- `POST /api/coupons` - Create coupon
- `GET /api/coupons` - Get all coupons (with filters)
- `GET /api/coupons/stats` - Get coupon statistics
- `GET /api/coupons/validate/:code` - Validate coupon
- `POST /api/coupons/apply/:code` - Apply coupon
- `GET /api/coupons/:id` - Get coupon by ID
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon

## Example Usage

### Create Coupon

```bash
curl -X POST http://localhost:3004/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "discount": 20,
    "valid_from": "2024-01-01T00:00:00Z",
    "valid_until": "2024-12-31T23:59:59Z",
    "usage_limit": 100
  }'
```

### Validate Coupon

```bash
curl http://localhost:3004/api/coupons/validate/SAVE20
```

### Apply Coupon

```bash
curl -X POST http://localhost:3004/api/coupons/apply/SAVE20
```

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `PORT` - Server port (default: 3004)
