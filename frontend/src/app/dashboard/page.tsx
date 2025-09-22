'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import StatsCard from '@/components/dashboard/StatsCard';
import QuickActions from '@/components/dashboard/QuickActions';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { inventoryService } from '@/services/inventoryService';
import { orderService } from '@/services/orderService';
import { supportService } from '@/services/supportService';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      if (!authService.isAuthenticated()) {
        router.replace('/login');
        return;
      }

      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace('/login');
      }
    };

    checkAuth();
    fetchDashboardStats();

    // Escuchar eventos de cambio de autenticación
    const handleAuthChange = () => {
      if (!authService.isAuthenticated()) {
        router.replace('/login');
      }
    };

    window.addEventListener('authChange', handleAuthChange as EventListener);
    return () => window.removeEventListener('authChange', handleAuthChange as EventListener);
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      setError('');
      setLoading(true);

      console.log('Fetching dashboard statistics...');
      
      // Obtener datos de los microservicios usando los métodos de estadísticas
      const [products, orderStats, ticketStats] = await Promise.allSettled([
        inventoryService.getProducts(),
        orderService.getOrderStats(), // Usar el método de estadísticas de órdenes
        supportService.getTicketStats() // Usar el método de estadísticas de tickets
      ]);

      console.log('Products:', products);
      console.log('Order Stats:', orderStats);
      console.log('Ticket Stats:', ticketStats);

      // Procesar productos
      const productsCount = products.status === 'fulfilled' ? products.value.length : 0;

      // Procesar estadísticas de órdenes
      let totalRevenue = 0;
      let completedOrders = 0;
      let totalOrders = 0;

      if (orderStats.status === 'fulfilled') {
        totalRevenue = orderStats.value.totalRevenue || 0;
        completedOrders = orderStats.value.completedOrders || 0;
        totalOrders = orderStats.value.totalOrders || 0;
      } else {
        console.error('Error fetching order stats:', orderStats.reason);
      }

      // Procesar estadísticas de tickets
      let ticketsCount = 0;
      let openTickets = 0;

      if (ticketStats.status === 'fulfilled') {
        ticketsCount = ticketStats.value.totalTickets || 0;
        openTickets = ticketStats.value.openTickets || 0;
      } else {
        console.error('Error fetching ticket stats:', ticketStats.reason);
      }

      // Set stats con datos reales
      setStats([
        {
          title: 'Ventas Totales',
          value: `$${totalRevenue.toLocaleString()}`,
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          ),
          trend: { 
            value: totalRevenue > 0 ? 12 : 0, 
            isPositive: totalRevenue > 0,
            label: totalRevenue > 0 ? '+12%' : 'Sin ventas'
          }
        },
        {
          title: 'Productos',
          value: productsCount.toString(),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
          trend: { 
            value: productsCount > 0 ? 8 : 0, 
            isPositive: productsCount > 0,
            label: productsCount > 0 ? '+8%' : 'Sin productos'
          }
        },
        {
          title: 'Órdenes Completadas',
          value: completedOrders.toString(),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 01118 0z" />
            </svg>
          ),
          trend: totalOrders > 0 ? {
            value: Math.round((completedOrders / totalOrders) * 100),
            isPositive: completedOrders > 0,
            label: `${Math.round((completedOrders / totalOrders) * 100)}% completadas`
          } : undefined
        },
        {
          title: 'Tickets de Soporte',
          value: ticketsCount.toString(),
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          trend: { 
            value: openTickets, 
            isPositive: openTickets === 0,
            label: openTickets > 0 ? `${openTickets} abiertos` : 'Todos resueltos'
          }
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Error al cargar las estadísticas del dashboard');
      
      // Stats de respaldo con datos de tu MongoDB
      setStats([
        {
          title: 'Ventas Totales',
          value: '$6,800',
          icon: '💰',
          trend: { value: 12, isPositive: true, label: '+12%' }
        },
        {
          title: 'Productos',
          value: '5',
          icon: '📦',
          trend: { value: 8, isPositive: true, label: '+8%' }
        },
        {
          title: 'Órdenes Completadas',
          value: '1',
          icon: '✅',
          trend: { value: 25, isPositive: true, label: '25% completadas' }
        },
        {
          title: 'Tickets de Soporte',
          value: '2',
          icon: '🎫',
          trend: { value: 2, isPositive: false, label: '2 abiertos' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userEmail={user.email} showMobileMenu={false} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName || user.email}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your store today.</p>
          </div>
          
          {/* Botones de acceso rápido */}
          <div className="flex flex-wrap gap-2">
            <Link 
              href="/products" 
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Manage Products
            </Link>
            
            <Link 
              href="/sales/create" 
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Venta
            </Link>
            
            <Link 
              href="/orders" 
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              View Orders
            </Link>
            
            <Link 
              href="/coupons" 
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Manage Coupons
            </Link>
            
            <Link 
              href="/support" 
              className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support Tickets
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md text-sm mb-6">
            {error} - Mostrando datos de ejemplo
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Skeleton loading
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Resumen del Negocio</h2>
              <p className="text-gray-600">Aquí puedes agregar gráficos o métricas importantes de tu negocio.</p>
              
              {/* Información adicional */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <h3 className="font-medium text-blue-800">Productos más vendidos</h3>
                  <p className="text-sm text-blue-600">Próximamente...</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h3 className="font-medium text-green-800">Ventas del mes</h3>
                  <p className="text-sm text-green-600">Próximamente...</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}