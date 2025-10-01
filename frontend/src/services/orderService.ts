// src/services/orderService.ts
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
  totalAfterDiscount?: number;
  discountApplied?: number;
  couponCode?: string | null;
  couponId?: string | null;
  couponDiscount?: number | null;
  status: string;
  paymentMethod: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

class OrderService {
  async createOrder(orderData: any): Promise<Order> {
    try {
      console.log('📤 Enviando orden al order-service...');
      console.log('Datos:', orderData);
      
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
      if (error instanceof Error) {
        throw new Error(`No se pudo crear la orden: ${error.message}`);
      } else {
        throw new Error('No se pudo crear la orden: Error desconocido');
      }
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      console.log('📋 Obteniendo órdenes...');
      const response = await fetch(`${ORDERS_SERVICE_URL}/api/orders`, {
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const orders = await response.json();
      console.log(`✅ Órdenes obtenidas: ${orders.length}`);
      return orders;
    } catch (error) {
      console.error('❌ Error en orderService.getOrders:', error);
      if (error instanceof Error) {
        throw new Error(`No se pudieron obtener las órdenes: ${error.message}`);
      } else {
        throw new Error('No se pudieron obtener las órdenes: Error desconocido');
      }
    }
  }

  // 🔥 NUEVO MÉTODO: Obtener estadísticas de órdenes
  async getOrderStats(): Promise<OrderStats> {
    try {
      console.log('📊 Obteniendo estadísticas de órdenes...');
      
      // Si el order-service tiene un endpoint específico para estadísticas
      try {
        const response = await fetch(`${ORDERS_SERVICE_URL}/api/orders/stats`, {
          cache: 'no-cache'
        });
        
        if (response.ok) {
          const stats = await response.json();
          console.log('✅ Estadísticas obtenidas del servicio:', stats);
          return stats;
        }
      } catch (serviceError) {
        console.log('El endpoint de estadísticas no está disponible, calculando localmente...');
      }
      
      // Fallback: Calcular estadísticas localmente
      const orders = await this.getOrders();
      
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => 
        order.status.toLowerCase().includes('complete') || 
        order.status.toLowerCase().includes('complet') ||
        order.status === 'completed'
      ).length;
      
      const totalRevenue = orders
        .filter(order => 
          order.status.toLowerCase().includes('complete') || 
          order.status.toLowerCase().includes('complet') ||
          order.status === 'completed'
        )
        .reduce((sum, order) => sum + order.total, 0);

      const stats: OrderStats = {
        totalOrders,
        completedOrders,
        pendingOrders: totalOrders - completedOrders,
        totalRevenue
      };

      console.log('📈 Estadísticas calculadas:', stats);
      return stats;
      
    } catch (error) {
      console.error('❌ Error en orderService.getOrderStats:', error);
      
      // Datos de ejemplo en caso de error
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      };
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
      if (error instanceof Error) {
        throw new Error(`Failed to fetch order: ${error.message}`);
      } else {
        throw new Error('Failed to fetch order: Unknown error');
      }
    }
  }

  // Verificar salud del servicio
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${ORDERS_SERVICE_URL}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Order service is not available');
    }
  }
}

export const orderService = new OrderService();