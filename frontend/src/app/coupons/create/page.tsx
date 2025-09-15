'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function CreateCoupon() {
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [minPurchase, setMinPurchase] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cupón "${code}" creado con éxito!`);
    router.push('/');
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Crear Cupón de Descuento</h1>
            <p className="mt-2 text-sm text-gray-600">
              Genera nuevos códigos de descuento para tus clientes
            </p>
          </div>
        </div>

        <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 gap-6">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                  {/* Código del Cupón */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Código del Cupón *
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
                      <button
                        type="button"
                        onClick={generateRandomCode}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Generar
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Código único que los clientes usarán para aplicar el descuento
                    </p>
                  </div>

                  {/* Descuento */}
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                      Descuento (%) *
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

                  {/* Fecha de Expiración */}
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                      Fecha de Expiración *
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Compra Mínima */}
                  <div>
                    <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700">
                      Compra Mínima ($)
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        id="minPurchase"
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Monto mínimo de compra requerido para usar el cupón (opcional)
                    </p>
                  </div>

                  {/* Límite de Usos */}
                  <div>
                    <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
                      Límite de Usos
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="maxUses"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                        placeholder="100"
                        min="1"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Número máximo de veces que se puede usar este cupón (opcional)
                    </p>
                  </div>

                  {/* Estado Activo */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isActive" className="font-medium text-gray-700">
                        Cupón activo
                      </label>
                      <p className="text-gray-500">El cupón estará disponible para uso inmediato</p>
                    </div>
                  </div>
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

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Tipos de Descuento</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• Porcentaje: Descuento basado en porcentaje (ej. 20%)</p>
                  <p>• Los cupones se aplican al total del carrito</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Mejores Prácticas</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>• Usa códigos fáciles de recordar</p>
                  <p>• Establece fechas de expiración realistas</p>
                  <p>• Considera límites de uso para cupones populares</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}