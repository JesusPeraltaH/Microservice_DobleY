import { MICROSERVICES } from '@/config/microservices';

const API_BASE_URL = MICROSERVICES.SUPPORT;

export interface SupportTicket {
    idTicket: string;
    idUsuario: string;
    idVenta?: string;
    customerName?: string;
    total?: number;
    statusVenta?: string;
    tipo_ticket: 'queja' | 'devolucion' | 'problema';
    descripcion: string;
    estado_ticket: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
    fechaCreacion: string;
    fechaResolucion?: string;
}

export interface CreateTicketData {
    idUsuario: string;
    idVenta?: string;
    customerName?: string;
    total?: number;
    statusVenta?: string;
    tipo_ticket: 'queja' | 'devolucion' | 'problema';
    descripcion: string;
}

export interface UpdateTicketData {
    estado_ticket?: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
    descripcion?: string;
    fechaResolucion?: string;
}

export interface TicketStats {
    total: number;
    byStatus: {
        abierto: number;
        en_proceso: number;
        resuelto: number;
        cerrado: number;
    };
    byType: {
        queja: number;
        devolucion: number;
        problema: number;
    };
}

export interface TicketFilters {
    usuario?: string;
    estado?: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
    tipo?: 'queja' | 'devolucion' | 'problema';
    limit?: number;
    offset?: number;
}

class SupportAPI {
    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}/api/tickets${endpoint}`;

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Network error' }));
            throw new Error(error.error || error.message || 'Request failed');
        }

        return response.json();
    }

    async createTicket(data: CreateTicketData): Promise<SupportTicket> {
        const response = await this.request('', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response;
    }

    async getTickets(filters?: TicketFilters): Promise<{ tickets: SupportTicket[]; total: number }> {
        const params = new URLSearchParams();
        if (filters?.usuario) params.append('usuario', filters.usuario);
        if (filters?.estado) params.append('estado', filters.estado);
        if (filters?.tipo) params.append('tipo', filters.tipo);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await this.request(`${query}`);
        return {
            tickets: response.tickets || response,
            total: response.total || response.length
        };
    }

    async getTicketById(id: string): Promise<SupportTicket> {
        const response = await this.request(`/${id}`);
        return response;
    }

    async updateTicket(id: string, data: UpdateTicketData): Promise<SupportTicket> {
        const response = await this.request(`/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
        return response;
    }

    async getTicketStats(): Promise<TicketStats> {
        const response = await this.request('/stats');
        return response;
    }
}

export const supportAPI = new SupportAPI();