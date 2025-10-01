# Apply Coupon API Endpoint

## Overview

This API endpoint allows applying discount coupons to existing orders in the microservices system. It validates coupons stored in Supabase and updates orders stored in MongoDB.

## Endpoint

```
POST /api/orders/apply-coupon
```

## Request Body

```json
{
  "orderId": "string", // MongoDB ObjectId of the order
  "couponCode": "string" // Coupon code to apply
}
```

## Response Format

```json
{
  "success": boolean,
  "message": string,
  "totalBeforeDiscount": number,
  "totalAfterDiscount": number,
  "couponCode": string,
  "couponApplied": boolean
}
```

## Validation Rules

### Coupon Validation (Supabase)

1. **Coupon exists**: The coupon code must exist in the `coupons` table
2. **Validity period**: Current time must be between `valid_from` and `valid_until`
3. **Usage limit**: `used_count` must be less than `usage_limit`

### Order Validation (MongoDB)

1. **Order exists**: The order must exist in the `orders` collection
2. **Valid ObjectId**: The orderId must be a valid MongoDB ObjectId

## Discount Calculation

- **Formula**: `newTotal = total - (total * discount / 100)`
- **Minimum**: Total never goes below 0
- **Percentage**: Discount is stored as a number (e.g., 10 = 10%)

## Database Updates

### MongoDB Order Updates

When a coupon is successfully applied, the order is updated with:

```json
{
  "totalAfterDiscount": number,
  "discountApplied": number,
  "couponCode": string,
  "couponId": string,
  "couponDiscount": number,
  "appliedAt": Date,
  "updatedAt": Date
}
```

### Supabase Coupon Updates

The `used_count` is incremented by 1 for the applied coupon.

## Error Handling

### 400 Bad Request

- Missing required fields (`orderId` or `couponCode`)
- Coupon is not valid at current time
- Coupon usage limit has been reached

### 404 Not Found

- Coupon not found
- Order not found

### 405 Method Not Allowed

- Using GET instead of POST

### 500 Internal Server Error

- Database connection issues
- Unexpected server errors

## Example Usage

### JavaScript/TypeScript

```javascript
const response = await fetch("/api/orders/apply-coupon", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    orderId: "68cb430a73bf483fae281c40",
    couponCode: "SAVE10",
  }),
});

const result = await response.json();
console.log(result);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/orders/apply-coupon \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "68cb430a73bf483fae281c40",
    "couponCode": "SAVE10"
  }'
```

## Success Response Example

```json
{
  "success": true,
  "message": "Coupon \"SAVE10\" applied successfully. Discount: 10%",
  "totalBeforeDiscount": 6020,
  "totalAfterDiscount": 5418,
  "couponCode": "SAVE10",
  "couponApplied": true
}
```

## Error Response Example

```json
{
  "success": false,
  "message": "Coupon usage limit has been reached",
  "totalBeforeDiscount": 0,
  "totalAfterDiscount": 0,
  "couponCode": "SAVE10",
  "couponApplied": false
}
```

## Dependencies

- `@supabase/supabase-js`: For Supabase operations
- `mongodb`: For MongoDB operations
- `next`: For Next.js API routes

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `MONGODB_URI`: MongoDB connection string

## Notes

- The endpoint uses async/await for better error handling
- All database operations are properly wrapped in try-catch blocks
- The coupon usage count is updated after successful order update
- In case of coupon update failure, the order update is not rolled back (consider implementing rollback in production)
