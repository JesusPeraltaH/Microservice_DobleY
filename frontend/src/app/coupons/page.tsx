'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function CreateCoupon() {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cupón "${code}" creado con éxito!`);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Crear Cupón de Descuento</h1>
          </div>
        </div>

        <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Código del Cupón
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="EJEMPLO20"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <div className="col-span-3 sm:col-span-1">
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                      Descuento (%)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="discount"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="20"
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-2">
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Fecha de Expiración
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="date"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                    <span className="ml-2 text-sm text-gray-600">Cupón activo</span>
                  </label>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Crear Cupón
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