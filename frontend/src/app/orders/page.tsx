'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';

interface Order {
  id: number;
  date: string;
  customer: string;
  total: number;
  status: string;
  items: number;
}

export default function Orders() {
  const orders: Order[] = [
    { id: 1001, date: "2023-05-15", customer: "Juan Pérez", total: 2800, status: "Completado", items: 3 },
    { id: 1002, date: "2023-05-14", customer: "María García", total: 150, status: "Completado", items: 1 },
    { id: 1003, date: "2023-05-13", customer: "Carlos López", total: 800, status: "Pendiente", items: 1 },
    { id: 1004, date: "2023-05-12", customer: "Ana Martínez", total: 1950, status: "En proceso", items: 2 }
  ];
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En proceso': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!user} userEmail={user?.email} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Encabezado con información del usuario */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Órdenes de Compra</h1>
          {user && (
            <p className="text-gray-600">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.items}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Resumen de Órdenes</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden">
                <div className="text-sm font-medium text-gray-500 truncate">Total de Órdenes</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">{orders.length}</div>
              </div>
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden">
                <div className="text-sm font-medium text-gray-500 truncate">Órdenes Completadas</div>
                <div className="mt-1 text-3xl font-semibold text-green-600">
                  {orders.filter(o => o.status === 'Completado').length}
                </div>
              </div>
              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden">
                <div className="text-sm font-medium text-gray-500 truncate">Ingresos Totales</div>
                <div className="mt-1 text-3xl font-semibold text-blue-600">
                  ${orders.reduce((total, order) => total + order.total, 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}