'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string;
}

// Datos de ejemplo
const products: Product[] = [
  { id: 1, name: "Laptop Gaming", price: 1200, stock: 15, description: "Potente laptop para gaming" },
  { id: 2, name: "Smartphone", price: 800, stock: 30, description: "Último modelo con cámara de alta resolución" },
  { id: 3, name: "Auriculares Bluetooth", price: 150, stock: 50, description: "Sonido de calidad con cancelación de ruido" }
];

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const productId = parseInt(params.id as string);
  const [user, setUser] = useState<any>(null);
  
  const product = products.find(p => p.id === productId);
  
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [stock, setStock] = useState(product?.stock.toString() || '');
  const [description, setDescription] = useState(product?.description || '');

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Producto "${name}" actualizado con éxito!`);
    router.push('/products');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar isAuthenticated={!!user} userEmail={user?.email} />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Producto no encontrado</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>El producto que intentas editar no existe.</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                >
                  Volver a productos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!user} userEmail={user?.email} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Encabezado con información del usuario */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          {user && (
            <p className="text-gray-600">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nombre del producto
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="Nombre del producto"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="col-span-3 sm:col-span-1">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Precio ($)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                      Stock disponible
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="stock"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Describe el producto..."
                    />
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/products')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}