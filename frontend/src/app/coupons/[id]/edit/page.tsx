'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { couponsAPI, Coupon } from '@/lib/api/coupons';

export default function EditCoupon() {
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingCoupon, setLoadingCoupon] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // Check authentication
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData));
        loadCoupon();
    }, [router]);

    const loadCoupon = async () => {
        try {
            setLoadingCoupon(true);
            const couponData = await couponsAPI.getCouponById(params.id as string);
            setCoupon(couponData);

            // Populate form fields
            setCode(couponData.code);
            setDiscount(couponData.discount.toString());
            setValidFrom(couponData.valid_from ? formatDateForInput(couponData.valid_from) : '');
            setExpiryDate(couponData.valid_until ? formatDateForInput(couponData.valid_until) : '');
            setMaxUses(couponData.usage_limit ? couponData.usage_limit.toString() : '');
        } catch (err: any) {
            setError(err.message || 'Failed to load coupon');
        } finally {
            setLoadingCoupon(false);
        }
    };

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format for datetime-local input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updateData = {
                code: code.toUpperCase(),
                discount: parseFloat(discount),
                valid_from: validFrom || undefined,
                valid_until: expiryDate || undefined,
                usage_limit: maxUses ? parseInt(maxUses) : undefined,
            };

            await couponsAPI.updateCoupon(params.id as string, updateData);
            router.push('/coupons');
        } catch (err: any) {
            setError(err.message || 'Failed to update coupon');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    if (!user || loadingCoupon) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error && !coupon) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar isAuthenticated={true} userEmail={user.email} />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">Error: {error}</div>
                        <button
                            onClick={() => router.push('/coupons')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Volver a Cupones
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar isAuthenticated={true} userEmail={user.email} />
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Editar Cupón</h1>
                    <p className="text-gray-600">Modifica los detalles del cupón "{coupon?.code}"</p>
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
<<<<<<< Updated upstream
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
=======
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 text-gray-900 placeholder-gray-500"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
=======
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 text-gray-900 placeholder-gray-500"
>>>>>>> Stashed changes
                                                placeholder="20"
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Fecha de Inicio */}
                                    <div>
                                        <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
                                            Fecha de Inicio
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="datetime-local"
                                                id="validFrom"
                                                value={validFrom}
                                                onChange={(e) => setValidFrom(e.target.value)}
<<<<<<< Updated upstream
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300"
=======
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300 text-gray-900"
>>>>>>> Stashed changes
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Fecha y hora desde cuando el cupón estará activo (opcional)
                                        </p>
                                    </div>

                                    {/* Fecha de Expiración */}
                                    <div>
                                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                                            Fecha de Expiración
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="datetime-local"
                                                id="expiryDate"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
<<<<<<< Updated upstream
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300"
=======
                                                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border-gray-300 text-gray-900"
>>>>>>> Stashed changes
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Fecha y hora hasta cuando el cupón será válido (opcional)
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
<<<<<<< Updated upstream
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
=======
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 text-gray-900 placeholder-gray-500"
>>>>>>> Stashed changes
                                                placeholder="100"
                                                min="1"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Número máximo de veces que se puede usar este cupón (opcional)
                                        </p>
                                    </div>

                                    {/* Usage Info */}
                                    {coupon && (
                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Información de Uso</h4>
                                            <div className="text-sm text-gray-600">
                                                <p>Veces usado: <span className="font-medium">{coupon.used_count}</span></p>
                                                {coupon.usage_limit && (
                                                    <p>Límite actual: <span className="font-medium">{coupon.usage_limit}</span></p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                                <div className="mt-2 text-sm text-red-700">
                                                    <p>{error}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/coupons')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                        disabled={loading}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
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