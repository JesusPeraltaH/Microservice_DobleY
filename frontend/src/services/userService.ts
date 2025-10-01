// src/services/orderService.ts (completamente corregido)
const ORDERS_SERVICE_URL = process.env.NEXT_PUBLIC_ORDERS_SERVICE_URL || 'http://localhost:3006';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: string;
  totalAfterDiscount?: number;
  discountApplied?: number;
  couponCode?: string | null;
  couponId?: string | null;
  couponDiscount?: number | null;
  paymentMethod: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

class OrderService {
  async createOrder(orderData: any): Promise<Order> {
    try {
      console.log('📤 Enviando orden a:', `${ORDERS_SERVICE_URL}/api/orders`);
      console.log('Datos de la orden:', orderData);
      
      const response = await fetch(`${ORDERS_SERVICE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Error del servidor');
      }
      
      console.log('✅ Orden creada exitosamente:', result);
      return result.order;
      
    } catch (error) {
      console.error('❌ Error en orderService.createOrder:', error);
      // Manejar el error como unknown
      if (error instanceof Error) {
        throw new Error(`No se pudo crear la orden: ${error.message}`);
      } else {
        throw new Error('No se pudo crear la orden: Unknown error');
      }
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      console.log('📋 Obteniendo órdenes desde:', `${ORDERS_SERVICE_URL}/api/orders`);
      const response = await fetch(`${ORDERS_SERVICE_URL}/api/orders`, {
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const orders = await response.json();
      console.log(`✅ Órdenes obtenidas: ${orders.length}`);
      return orders;
    } catch (error) {
      console.error('❌ Error en orderService.getOrders:', error);
      // Manejar el error como unknown
      if (error instanceof Error) {
        throw new Error(`No se pudieron obtener las órdenes: ${error.message}`);
      } else {
        throw new Error('No se pudieron obtener las órdenes: Unknown error');
      }
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await fetch(`${ORDERS_SERVICE_URL}/api/orders/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en orderService.getOrderById:', error);
      // Manejar el error como unknown
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order: ${error.message}`);
      } else {
        throw new Error('Failed to fetch order: Unknown error');
      }
    }
  }
}

export const orderService = new OrderService();