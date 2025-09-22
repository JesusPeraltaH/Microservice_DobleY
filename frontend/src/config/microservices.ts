// src/config/microservices.ts
export const MICROSERVICES = {
  INVENTORY: process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:3001',
  CART: process.env.NEXT_PUBLIC_CART_SERVICE_URL || 'http://localhost:3102',
  USERS: process.env.NEXT_PUBLIC_USERS_SERVICE_URL || 'http://localhost:3003',
  COUPONS: process.env.NEXT_PUBLIC_COUPONS_SERVICE_URL || 'http://localhost:3004',
  SUPPORT: process.env.NEXT_PUBLIC_SUPPORT_SERVICE_URL || 'http://localhost:3105',
  ORDERS: process.env.NEXT_PUBLIC_ORDERS_SERVICE_URL || 'http://localhost:3006'
};