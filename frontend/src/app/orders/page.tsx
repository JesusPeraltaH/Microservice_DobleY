// src/app/orders/page.tsx (corregido)
'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { orderService, Order } from '@/services/orderService';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Obteniendo órdenes...');
      
      const ordersData = await orderService.getOrders();
      console.log('✅ Órdenes obtenidas:', ordersData.length);
      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Error obteniendo órdenes:', error);
      setError('Error al cargar las órdenes. Verifica que el servicio esté funcionando.');
      // Datos de ejemplo para desarrollo
      setOrders(getSampleOrders());
    } finally {
      setLoading(false);
    }
  };

  // Datos de ejemplo para desarrollo
  const getSampleOrders = (): Order[] => {
    return [
      {
        _id: '1',
        customerName: 'Juan Perez',
        customerEmail: 'juan@gmail.com',
        items: [
          { productName: 'Motorola G60 12GB RAM', quantity: 1, price: 5000, productId: '1' },
          { productName: 'Cable usb-c 5m', quantity: 1, price: 20, productId: '2' }
        ],
        total: 5020,
        status: 'completed',
        paymentMethod: 'cash',
        date: new Date().toISOString()
      }
    ];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getProductSummary = (items: any[]) => {
    if (items.length === 0) return 'Sin productos';
    if (items.length === 1) return items[0].productName;
    return `${items[0].productName} +${items.length - 1} más`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!user} userEmail={user?.email} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">Órdenes de Compra</h1>
          {user && (
            <p className="text-gray-600">
              Usuario: <span className="font-medium text-black">{user.email}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-black">No hay órdenes registradas</h3>
                <p className="mt-1 text-sm text-gray-500">Todavía no se han realizado órdenes en el sistema.</p>
                <button
                  onClick={fetchOrders}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-black">
                          {order.items.map((item, index) => (
                            <div key={index} className="mb-1">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-gray-600 ml-2">x{item.quantity} - ${item.price}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-black">{formatDate(order.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={fetchOrders}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
          >
            Actualizar Lista
          </button>
        </div>
      </div>
    </div>
  );
}