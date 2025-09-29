'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { supportAPI, CreateTicketData } from '@/lib/api/support';

export default function CreateTicketPage() {
    const [formData, setFormData] = useState<CreateTicketData>({
        idUsuario: '',
        idVenta: '',
        customerName: '',
        total: 0,
        statusVenta: '',
        tipo_ticket: 'problema',
        descripcion: ''
    });
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check authentication
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Set user ID in form data
        setFormData(prev => ({
            ...prev,
            idUsuario: parsedUser.id || '507f1f77bcf86cd799439011', // Use actual user ID or fallback
            customerName: parsedUser.firstName ? `${parsedUser.firstName} ${parsedUser.lastName || ''}`.trim() : parsedUser.email
        }));
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'total' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Clean up form data - remove empty optional fields
            const cleanData: CreateTicketData = {
                idUsuario: formData.idUsuario,
                tipo_ticket: formData.tipo_ticket,
                descripcion: formData.descripcion
            };

            // Add optional fields only if they have values
            if (formData.idVenta?.trim()) {
                cleanData.idVenta = formData.idVenta.trim();
            }
            if (formData.customerName?.trim()) {
                cleanData.customerName = formData.customerName.trim();
            }
            if (formData.total && formData.total > 0) {
                cleanData.total = formData.total;
            }
            if (formData.statusVenta?.trim()) {
                cleanData.statusVenta = formData.statusVenta.trim();
            }

            await supportAPI.createTicket(cleanData);
            router.push('/support');
        } catch (err: any) {
            setError(err.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
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

            <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Crear Ticket de Soporte</h1>
                    <p className="text-gray-600">Describe tu problema y te ayudaremos a resolverlo</p>
                </div>

                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-medium text-gray-900">Información del Ticket</h2>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tipo de Ticket */}
                            <div>
                                <label htmlFor="tipo_ticket" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Ticket *
                                </label>
                                <select
                                    id="tipo_ticket"
                                    name="tipo_ticket"
                                    value={formData.tipo_ticket}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="problema">Problema Técnico</option>
                                    <option value="queja">Queja</option>
                                    <option value="devolucion">Devolución</option>
                                </select>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción del Problema *
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Describe detalladamente tu problema o solicitud..."
                                    required
                                    minLength={10}
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Mínimo 10 caracteres. Sé específico para obtener mejor ayuda.
                                </p>
                            </div>

                            {/* Información Opcional */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional (Opcional)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* ID de Venta/Orden */}
                                    <Input
                                        label="ID de Orden"
                                        name="idVenta"
                                        value={formData.idVenta}
                                        onChange={handleChange}
                                        placeholder="68cb430a73bf483fae281c40"
                                    />

                                    {/* Nombre del Cliente */}
                                    <Input
                                        label="Nombre del Cliente"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleChange}
                                        placeholder="Tu nombre completo"
                                    />

                                    {/* Total de la Orden */}
                                    <Input
                                        label="Total de la Orden"
                                        name="total"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.total || ''}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                    />

                                    {/* Estado de la Venta */}
                                    <div>
                                        <label htmlFor="statusVenta" className="block text-sm font-medium text-gray-700 mb-1">
                                            Estado de la Orden
                                        </label>
                                        <select
                                            id="statusVenta"
                                            name="statusVenta"
                                            value={formData.statusVenta}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Seleccionar estado</option>
                                            <option value="Completado">Completado</option>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Cancelado">Cancelado</option>
                                            <option value="En Proceso">En Proceso</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/support')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Ticket'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Tipos de Ticket</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>• <strong>Problema:</strong> Errores técnicos, bugs, fallos</p>
                                        <p>• <strong>Queja:</strong> Insatisfacción con el servicio</p>
                                        <p>• <strong>Devolución:</strong> Solicitudes de reembolso</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">Consejos</h3>
                                    <div className="mt-2 text-sm text-green-700">
                                        <p>• Sé específico en la descripción</p>
                                        <p>• Incluye el ID de orden si aplica</p>
                                        <p>• Responderemos en 24-48 horas</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}