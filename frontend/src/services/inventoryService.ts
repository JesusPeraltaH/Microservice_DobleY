import { MICROSERVICES } from '@/config/microservices';

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  createdAt: string;
}

export const inventoryService = {
  // Obtener todos los productos
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${MICROSERVICES.INVENTORY}/products`);
    if (!response.ok) {
      throw new Error('Error fetching products');
    }
    return response.json();
  },

  // Obtener un producto por ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await fetch(`${MICROSERVICES.INVENTORY}/products/${id}`);
    if (!response.ok) {
      throw new Error('Error fetching product');
    }
    return response.json();
  },

  // Crear un nuevo producto
  createProduct: async (product: Omit<Product, '_id' | 'createdAt'>): Promise<Product> => {
    const response = await fetch(`${MICROSERVICES.INVENTORY}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Error creating product');
    }
    return response.json();
  },

  // Actualizar un producto
  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${MICROSERVICES.INVENTORY}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Error updating product');
    }
    return response.json();
  },

  // Eliminar un producto
  deleteProduct: async (id: string): Promise<void> => {
    const response = await fetch(`${MICROSERVICES.INVENTORY}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Error deleting product');
    }
  }
};