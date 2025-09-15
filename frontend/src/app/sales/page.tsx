'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';

interface Sale {
  id: number;
  date: string;
  total: number;
  items: number;
}

export default function Sales() {
  const sales: Sale[] = [
    { id: 1, date: "2023-05-15", total: 2800, items: 3 },
    { id: 2, date: "2023-05-14", total: 150, items: 1 },
    { id: 3, date: "2023-05-12", total: 800, items: 1 }
  ];
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!user} userEmail={user?.email} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Encabezado con información del usuario */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
          {user && (
            <p className="text-gray-600">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>
        
        {sales.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas registradas</h3>
                <p className="mt-1 text-sm text-gray-500">Todavía no se han realizado ventas en el sistema.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.items} productos</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}