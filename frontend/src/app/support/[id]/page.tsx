'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { supportAPI, SupportTicket, UpdateTicketData } from '@/lib/api/support';

export default function TicketDetailPage() {
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
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
        loadTicket();
    }, [router]);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const ticketData = await supportAPI.getTicketById(params.id as string);
            setTicket(ticketData);
        } catch (err: any) {
            setError(err.message || 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const updateTicketStatus = async (newStatus: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado') => {
        if (!ticket) return;

        try {
            setUpdating(true);
            const updateData: UpdateTicketData = {
                estado_ticket: newStatus
            };

            const updatedTicket = await supportAPI.updateTicket(ticket.idTicket, updateData);
            setTicket(updatedTicket);
        } catch (err: any) {
            alert('Error al actualizar el ticket: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'abierto':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'en_proceso':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'resuelto':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cerrado':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
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
                return 'Problema Técnico';
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

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando ticket...</p>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar isAuthenticated={true} userEmail={user.email} />
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="text-red-600 mb-4">Error: {error || 'Ticket no encontrado'}</div>
                        <Button onClick={() => router.push('/support')}>
                            Volver a Soporte
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar isAuthenticated={true} userEmail={user.email} />

            <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Button
                                variant="outline"
                                onClick={() => router.push('/support')}
                                className="mb-4"
                            >
                                ← Volver a Soporte
                            </Button>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getTypeIcon(ticket.tipo_ticket)}</span>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {getTypeLabel(ticket.tipo_ticket)}
                                </h1>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.estado_ticket)}`}>
                                    {getStatusLabel(ticket.estado_ticket)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ticket Description */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-medium text-gray-900">Descripción del Problema</h2>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Information */}
                        {ticket.idVenta && (
                            <Card>
                                <CardHeader>
                                    <h2 className="text-lg font-medium text-gray-900">Información de la Orden</h2>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">ID de Orden</p>
                                            <p className="text-sm text-gray-900 font-mono">{ticket.idVenta}</p>
                                        </div>
                                        {ticket.total && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total</p>
                                                <p className="text-sm text-gray-900">${ticket.total}</p>
                                            </div>
                                        )}
                                        {ticket.statusVenta && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Estado de la Orden</p>
                                                <p className="text-sm text-gray-900">{ticket.statusVenta}</p>
                                            </div>
                                        )}
                                        {ticket.customerName && (
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Cliente</p>
                                                <p className="text-sm text-gray-900">{ticket.customerName}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Ticket Info */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-medium text-gray-900">Información del Ticket</h2>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">ID del Ticket</p>
                                    <p className="text-sm text-gray-900 font-mono break-all">{ticket.idTicket}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                                    <p className="text-sm text-gray-900">{formatDate(ticket.fechaCreacion)}</p>
                                </div>
                                {ticket.fechaResolucion && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Fecha de Resolución</p>
                                        <p className="text-sm text-gray-900">{formatDate(ticket.fechaResolucion)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Tipo</p>
                                    <p className="text-sm text-gray-900">{getTypeLabel(ticket.tipo_ticket)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status Actions */}
                        <Card>
                            <CardHeader>
                                <h2 className="text-lg font-medium text-gray-900">Cambiar Estado</h2>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {ticket.estado_ticket !== 'abierto' && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => updateTicketStatus('abierto')}
                                        disabled={updating}
                                    >
                                        Reabrir Ticket
                                    </Button>
                                )}
                                {ticket.estado_ticket === 'abierto' && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => updateTicketStatus('en_proceso')}
                                        disabled={updating}
                                    >
                                        Marcar En Proceso
                                    </Button>
                                )}
                                {(ticket.estado_ticket === 'abierto' || ticket.estado_ticket === 'en_proceso') && (
                                    <Button
                                        className="w-full"
                                        onClick={() => updateTicketStatus('resuelto')}
                                        disabled={updating}
                                    >
                                        Marcar como Resuelto
                                    </Button>
                                )}
                                {ticket.estado_ticket === 'resuelto' && (
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={() => updateTicketStatus('cerrado')}
                                        disabled={updating}
                                    >
                                        Cerrar Ticket
                                    </Button>
                                )}
                                {updating && (
                                    <p className="text-sm text-gray-500 text-center">Actualizando...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Estados del Ticket</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>• <strong>Abierto:</strong> Ticket recién creado</p>
                                            <p>• <strong>En Proceso:</strong> Siendo atendido</p>
                                            <p>• <strong>Resuelto:</strong> Problema solucionado</p>
                                            <p>• <strong>Cerrado:</strong> Ticket finalizado</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}