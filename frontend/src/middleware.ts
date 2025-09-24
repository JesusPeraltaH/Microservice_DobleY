import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MICROSERVICES } from './config/microservices';

export async function middleware(request: NextRequest) {
  // Buscar token en múltiples ubicaciones
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  const protectedRoutes = ['/dashboard', '/products', '/sales', '/orders', '/coupons', '/support'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Si es una ruta protegida y no hay token, redirigir a login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, verificar su validez con el microservicio
  if (token && isProtectedRoute) {
    try {
      const response = await fetch(`${MICROSERVICES.USERS}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token inválido, redirigir a login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // Token válido, permitir acceso
      return NextResponse.next();
    } catch (error) {
      console.error('Error verificando token:', error);
      // Error en la verificación, redirigir a login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*', 
    '/sales/:path*', 
    '/orders/:path*', 
    '/coupons/:path*', 
    '/support/:path*'
  ]
};