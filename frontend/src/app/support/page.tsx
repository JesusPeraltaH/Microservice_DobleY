'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { supportAPI, SupportTicket, TicketStats } from '@/lib/api/support';

export default function SupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [stats, setStats] = useState<TicketStats | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado'>('all');
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
            const [ticketsData, statsData] = await Promise.all([
                supportAPI.getTickets(filter === 'all' ? undefined : { estado: filter as any }),
                supportAPI.getTicketStats()
            ]);

            setTickets(ticketsData.tickets);
            setStats(statsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'abierto':
                return 'bg-red-100 text-red-800';
            case 'en_proceso':
                return 'bg-yellow-100 text-yellow-800';
            case 'resuelto':
                return 'bg-green-100 text-green-800';
            case 'cerrado':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'abierto':
                return 'Abierto';
            case 'en_proceso':
                return 'En Proceso';
            case 'resuelto':
                return 'Resuelto';
            case 'cerrado':
                return 'Cerrado';
            default:
                return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'queja':
                return 'Queja';
            case 'devolucion':
                return 'Devolución';
            case 'problema':
                return 'Problema';
            default:
                return type;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'queja':
                return '😠';
            case 'devolucion':
                return '↩️';
            case 'problema':
                return '⚠️';
            default:
                return '🎫';
        }
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
                            <h1 className="text-2xl font-bold text-gray-900">Centro de Soporte</h1>
                            <p className="text-gray-600">Gestiona tus tickets de soporte y obtén ayuda</p>
                        </div>
                        <Link href="/support/create">
                            <Button>Crear Ticket</Button>
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Abiertos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.byStatus.abierto}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">En Proceso</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.byStatus.en_proceso}</p>
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
                                        <p className="text-sm font-medium text-gray-600">Resueltos</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.byStatus.resuelto}</p>
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
                            onClick={() => setFilter('abierto')}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'abierto'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Abiertos
                        </button>
                        <button
                            onClick={() => setFilter('en_proceso')}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'en_proceso'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            En Proceso
                        </button>
                        <button
                            onClick={() => setFilter('resuelto')}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'resuelto'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Resueltos
                        </button>
                    </div>
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando tickets...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">Error: {error}</div>
                        <Button onClick={loadData}>Reintentar</Button>
                    </div>
                ) : tickets.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tickets</h3>
                            <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer ticket de soporte.</p>
                            <div className="mt-6">
                                <Link href="/support/create">
                                    <Button>Crear Ticket</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <Card key={ticket.idTicket}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-lg">{getTypeIcon(ticket.tipo_ticket)}</span>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {getTypeLabel(ticket.tipo_ticket)}
                                                </h3>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.estado_ticket)}`}>
                                                    {getStatusLabel(ticket.estado_ticket)}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                {ticket.descripcion}
                                            </p>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Creado: {formatDate(ticket.fechaCreacion)}</span>
                                                {ticket.customerName && (
                                                    <span>Cliente: {ticket.customerName}</span>
                                                )}
                                                {ticket.total && (
                                                    <span>Total: ${ticket.total}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-4">
                                            <Link href={`/support/${ticket.idTicket}`}>
                                                <Button variant="outline" size="sm">
                                                    Ver Detalles
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}