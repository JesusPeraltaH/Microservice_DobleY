import { MICROSERVICES } from '@/config/microservices';

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  customer: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class SupportService {
  private baseURL: string;

  constructor() {
    this.baseURL = MICROSERVICES.SUPPORT;
    console.log('SupportService baseURL:', this.baseURL);
  }

  async getTickets(): Promise<Ticket[]> {
    try {
      console.log('Fetching tickets from:', `${this.baseURL}/tickets`);
      
      const response = await fetch(`${this.baseURL}/tickets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      console.log('Support service response status:', response.status);

      if (!response.ok) {
        console.error('Error fetching tickets:', response.status, response.statusText);
        return []; // Retornar array vacío en lugar de throw error
      }

      const tickets = await response.json();
      console.log('Tickets received from API:', tickets.length);
      return tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  async getTicketStats(): Promise<any> {
    try {
      console.log('Fetching ticket stats from:', `${this.baseURL}/tickets/stats`);
      
      const response = await fetch(`${this.baseURL}/tickets/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error('Error fetching ticket stats:', response.status, response.statusText);
        // Retornar valores por defecto en lugar de throw error
        return {
          totalTickets: 0,
          openTickets: 0,
          inProgressTickets: 0,
          resolvedTickets: 0
        };
      }

      const stats = await response.json();
      console.log('Ticket stats received:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
      return {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0
      };
    }
  }

  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket | null> {
    try {
      console.log('Creating ticket at:', `${this.baseURL}/tickets`);
      console.log('Ticket data:', ticketData);
      
      // Usar "Abierto" en lugar de "Adjetro" para evitar errores de validación
      const dataToSend = {
        ...ticketData,
        status: 'Abierto' // Forzar estado válido
      };
      
      const response = await fetch(`${this.baseURL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      console.log('Create ticket response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return null; // Retornar null en lugar de throw error
      }

      const createdTicket = await response.json();
      console.log('Ticket created successfully:', createdTicket);
      return createdTicket;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  }
}

export const supportService = new SupportService();