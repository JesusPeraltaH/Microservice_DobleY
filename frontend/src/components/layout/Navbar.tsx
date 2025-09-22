'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

interface NavbarProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export default function Navbar({ 
  isAuthenticated: initialAuth = false, 
  userEmail = '', 
  onMenuClick,
  showMobileMenu = false 
}: NavbarProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [email, setEmail] = useState(userEmail);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(showMobileMenu);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Función para verificar auth
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const user = authService.getCurrentUser();
        if (user) {
          setEmail(user.email);
        }
      } else {
        setEmail('');
      }
    };

    // Verificación inicial
    checkAuth();

    // Escuchar cambios de autenticación
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChange', handleAuthChange as EventListener);
    return () => window.removeEventListener('authChange', handleAuthChange as EventListener);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setEmail('');
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (onMenuClick) onMenuClick();
  };

  const isDashboardPage = pathname?.startsWith('/dashboard') || 
                         pathname?.startsWith('/products') ||
                         pathname?.startsWith('/orders') ||
                         pathname?.startsWith('/sales') ||
                         pathname?.startsWith('/support') ||
                         pathname?.startsWith('/coupons');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Botón de menú móvil */}
            {isDashboardPage && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden text-gray-600 hover:text-gray-800 mr-4"
              >
                <span className="text-2xl">☰</span>
              </button>
            )}
            
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">MicroStore</h1>
            </Link>
            
            {/* Navegación desktop */}
            {!isDashboardPage && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/products" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Productos
                </Link>
                <Link href="/sales/create" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Nueva Venta
                </Link>
                <Link href="/orders" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Órdenes
                </Link>
                <Link href="/coupons" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Cupones
                </Link>
                <Link href="/support" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Soporte
                </Link>
              </div>
            )}

            {/* Título de la página */}
            {isDashboardPage && (
              <h1 className="text-xl font-semibold text-gray-800 ml-4 hidden sm:block">
                {pathname === '/dashboard' && 'Dashboard'}
                {pathname?.startsWith('/products') && 'Productos'}
                {pathname?.startsWith('/orders') && 'Órdenes'}
                {pathname?.startsWith('/sales') && 'Ventas'}
                {pathname?.startsWith('/coupons') && 'Cupones'}
                {pathname?.startsWith('/support') && 'Soporte'}
              </h1>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 hidden sm:block">
                  Hola, <span className="font-medium">{email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="text-gray-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100">
                  Iniciar Sesión
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && isDashboardPage && (
          <div className="lg:hidden bg-white border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-1 px-2">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/products" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link 
                href="/sales/create" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nueva Venta
              </Link>
              <Link 
                href="/orders" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Órdenes
              </Link>
              <Link 
                href="/coupons" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cupones
              </Link>
              <Link 
                href="/support" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Soporte
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}