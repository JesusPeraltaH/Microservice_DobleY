'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { couponsAPI, Coupon, CouponStats } from '@/lib/api/coupons';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadData();
  }, [router, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [couponsData, statsData] = await Promise.all([
        couponsAPI.getCoupons(filter === 'active' ? { active: true } : undefined),
        couponsAPI.getCouponStats()
      ]);

      let filteredCoupons = couponsData;
      if (filter === 'expired') {
        const now = new Date();
        filteredCoupons = couponsData.filter(coupon =>
          coupon.valid_until && new Date(coupon.valid_until) < now
        );
      }

      setCoupons(filteredCoupons);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el cupón "${code}"?`)) {
      return;
    }

    try {
      await couponsAPI.deleteCoupon(id);
      loadData(); // Reload data
    } catch (err: any) {
      alert('Error al eliminar el cupón: ' + err.message);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin límite';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date();

    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { status: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' };
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { status: 'expired', label: 'Expirado', color: 'bg-red-100 text-red-800' };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { status: 'exhausted', label: 'Agotado', color: 'bg-gray-100 text-gray-800' };
    }

    return { status: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userEmail={user.email} />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Cupones</h1>
              <p className="text-gray-600">Administra los cupones de descuento de tu tienda</p>
            </div>
            <Link href="/coupons/create">
              <Button>Crear Cupón</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cupones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_coupons}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active_coupons}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Expirados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.expired_coupons}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_usage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'active'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'expired'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Expirados
            </button>
          </div>
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando cupones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <Button onClick={loadData}>Reintentar</Button>
          </div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cupones</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer cupón de descuento.</p>
              <div className="mt-6">
                <Link href="/coupons/create">
                  <Button>Crear Cupón</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <Card key={coupon.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{coupon.code}</h3>
                        <p className="text-sm text-gray-500">{coupon.discount}% de descuento</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Usos:</span>
                        <span className="text-gray-900">
                          {coupon.used_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Válido desde:</span>
                        <span className="text-gray-900">{formatDate(coupon.valid_from)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expira:</span>
                        <span className="text-gray-900">{formatDate(coupon.valid_until)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Link href={`/coupons/${coupon.id}/edit`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                        className="flex-1"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}