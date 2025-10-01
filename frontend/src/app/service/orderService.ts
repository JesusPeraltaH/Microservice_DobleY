import { MICROSERVICES } from '@/config/microservices';

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
  createdAt: string;
}

export const orderService = {
  // Obtener todas las órdenes
  getOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${MICROSERVICES.CART}/orders`);
    if (!response.ok) {
      throw new Error('Error fetching orders');
    }
    return response.json();
  },

  // Crear una nueva orden
  createOrder: async (orderData: {
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    total: number;
  }): Promise<Order> => {
    const response = await fetch(`${MICROSERVICES.CART}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating order');
    }
    
    return response.json();
  },

  // Obtener una orden por ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await fetch(`${MICROSERVICES.CART}/orders/${id}`);
    if (!response.ok) {
      throw new Error('Error fetching order');
    }
    return response.json();
  }
};