import { MICROSERVICES } from '@/config/microservices';

export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: string;
  paymentMethod: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  paymentMethod: string;
  status?: string;
}

class OrderService {
  private baseURL: string;

  constructor() {
    this.baseURL = MICROSERVICES.ORDERS;
    console.log('OrderService baseURL:', this.baseURL);
  }

  async getOrders(): Promise<Order[]> {
    try {
      console.log('Fetching orders from:', `${this.baseURL}/orders`);
      
      const response = await fetch(`${this.baseURL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Order service response status:', response.status);

      if (!response.ok) {
        console.error('Error fetching orders:', response.status, response.statusText);
        return [];
      }

      const orders = await response.json();
      console.log('Orders received from API:', orders.length);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrderStats(): Promise<any> {
    try {
      console.log('Fetching order stats from:', `${this.baseURL}/orders/stats`);
      
      const response = await fetch(`${this.baseURL}/orders/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error('Error fetching order stats:', response.status, response.statusText);
        return {
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0
        };
      }

      const stats = await response.json();
      console.log('Order stats received:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      };
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order | null> {
    try {
      console.log('Creating order at:', `${this.baseURL}/orders`);
      console.log('Order data:', orderData);
      
      const response = await fetch(`${this.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Create order response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return null;
      }

      const createdOrder = await response.json();
      console.log('Order created successfully:', createdOrder);
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        console.error('Error updating order:', response.status, response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Error deleting order:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }
}

export const orderService = new OrderService();