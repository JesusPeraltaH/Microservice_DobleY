import { MICROSERVICES } from '@/config/microservices';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = MICROSERVICES.USERS;
  }

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ← Agregado para enviar cookies
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      if (!data.user || !data.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      return data;
    } catch (error: any) {
      console.error('Error en authService.login:', error);
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ← Agregado para enviar cookies
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }

      if (!data.user || !data.token) {
        throw new Error('Respuesta inválida del servidor');
      }

      return data;
    } catch (error: any) {
      console.error('Error en authService.register:', error);
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Cerrar sesión
  logout(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Eliminar cookie también
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.dispatchEvent(new Event('authChange'));
  }
}

export const authService = new AuthService();