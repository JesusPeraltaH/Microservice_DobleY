'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

interface Ticket {
  id: number;
  title: string;
  customer: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

const initialTickets: Ticket[] = [
  { id: 1, title: "Problema con mi pedido", customer: "Juan Pérez", status: "Abierto", priority: "Alta", createdAt: "2023-05-15", updatedAt: "2023-05-15" },
  { id: 2, title: "Producto defectuoso", customer: "María García", status: "En proceso", priority: "Media", createdAt: "2023-05-14", updatedAt: "2023-05-15" },
  { id: 3, title: "Consulta sobre garantía", customer: "Carlos López", status: "Cerrado", priority: "Baja", createdAt: "2023-05-13", updatedAt: "2023-05-14" },
  { id: 4, title: "Devolución solicitada", customer: "Ana Martínez", status: "Abierto", priority: "Alta", createdAt: "2023-05-12", updatedAt: "2023-05-12" }
];

export default function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'Media'
  });
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Obtener usuario del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Abierto': return 'bg-red-100 text-red-800';
      case 'En proceso': return 'bg-yellow-100 text-yellow-800';
      case 'Cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'text-red-600 font-semibold';
      case 'Media': return 'text-yellow-600 font-semibold';
      case 'Baja': return 'text-green-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  const filteredTickets = activeTab === 'all' 
    ? tickets 
    : tickets.filter(ticket => ticket.status === activeTab);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTicketData: Ticket = {
      id: Math.max(...tickets.map(t => t.id)) + 1,
      title: newTicket.title,
      customer: user?.email || "Usuario Actual",
      status: "Abierto",
      priority: newTicket.priority,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setTickets([newTicketData, ...tickets]);
    setNewTicket({ title: '', description: '', priority: 'Media' });
    setShowNewTicketForm(false);
    
    alert('Ticket creado con éxito!');
  };

  const getStatusCount = (status: string) => {
    return tickets.filter(ticket => ticket.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={!!user} userEmail={user?.email} />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Encabezado con información del usuario */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tickets de Soporte</h1>
          {user && (
            <p className="text-gray-600">
              Usuario: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Gestiona las solicitudes de soporte de tus clientes</p>
          </div>
          <button 
            onClick={() => setShowNewTicketForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Ticket
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                    <dd className="text-lg font-medium text-gray-900">{tickets.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Abiertos</dt>
                    <dd className="text-lg font-medium text-red-600">{getStatusCount('Abierto')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">En proceso</dt>
                    <dd className="text-lg font-medium text-yellow-600">{getStatusCount('En proceso')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Cerrados</dt>
                    <dd className="text-lg font-medium text-green-600">{getStatusCount('Cerrado')}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="sm:hidden">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="all">Todos los tickets</option>
              <option value="Abierto">Abiertos</option>
              <option value="En proceso">En proceso</option>
              <option value="Cerrado">Cerrados</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab('Abierto')}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === 'Abierto'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Abiertos ({getStatusCount('Abierto')})
              </button>
              <button
                onClick={() => setActiveTab('En proceso')}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === 'En proceso'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                En proceso ({getStatusCount('En proceso')})
              </button>
              <button
                onClick={() => setActiveTab('Cerrado')}
                className={`px-3 py-2 font-medium text-sm rounded-md ${
                  activeTab === 'Cerrado'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cerrados ({getStatusCount('Cerrado')})
              </button>
            </nav>
          </div>
        </div>

        {/* Modal de Nuevo Ticket */}
        {showNewTicketForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nuevo Ticket</h3>
                
                <form onSubmit={handleCreateTicket}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Asunto *</label>
                    <input
                      type="text"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Describe el problema..."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Proporciona detalles adicionales..."
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Prioridad *</label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowNewTicketForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Crear Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Lista de tickets */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No hay tickets</h3>
            <p className="mt-2 text-sm text-gray-500">
              {activeTab === 'all' 
                ? 'No se han creado tickets todavía.' 
                : `No hay tickets en estado "${activeTab}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}