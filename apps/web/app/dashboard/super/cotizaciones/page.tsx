'use client';

import React, { useEffect, useState } from 'react';
import {
    Calculator,
    Building2,
    Mail,
    Phone,
    User,
    Calendar,
    TrendingUp,
    Filter,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
    Search,
    RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCotizaciones, updateCotizacionStatus, CotizacionResponse } from '@/lib/api';
import ConvertQuoteModal from '@/components/admin/ConvertQuoteModal';

const STATUS_CONFIG = {
    pending: {
        label: 'Pendiente',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: Clock
    },
    contacted: {
        label: 'Contactado',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Phone
    },
    converted: {
        label: 'Convertido',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: CheckCircle
    },
    rejected: {
        label: 'Rechazado',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: XCircle
    }
};

const COURSE_LABELS: Record<string, string> = {
    defensivo: 'Manejo Defensivo',
    carga_pesada: 'Carga Pesada',
    '4x4': '4x4 Profesional',
    completo: 'Paquete Completo'
};

const MODALITY_LABELS: Record<string, string> = {
    online: '100% Online',
    presencial: 'Presencial',
    mixto: 'Mixto'
};

export default function CotizacionesPage() {
    const [cotizaciones, setCotizaciones] = useState<CotizacionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCotizacion, setSelectedCotizacion] = useState<CotizacionResponse | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<{ id: number; status: string } | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [cotizacionToConvert, setCotizacionToConvert] = useState<CotizacionResponse | null>(null);

    useEffect(() => {
        fetchCotizaciones();
    }, [filterStatus]);

    const fetchCotizaciones = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getCotizaciones(
                0,
                100,
                filterStatus === 'all' ? undefined : filterStatus
            );
            setCotizaciones(data);
        } catch (err) {
            console.error('Error fetching cotizaciones:', err);
            setError('Error al cargar las cotizaciones. Verifica que el backend esté corriendo.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCotizaciones = cotizaciones.filter(cot =>
        cot.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cot.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cot.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStatusChange = async (id: number, newStatus: string) => {
        setStatusToUpdate({ id, status: newStatus });
        setShowStatusModal(true);
    };

    const confirmStatusChange = async () => {
        if (!statusToUpdate) return;

        try {
            setIsUpdatingStatus(true);
            await updateCotizacionStatus(statusToUpdate.id, statusToUpdate.status as any);

            // Update local state optimistically
            setCotizaciones(prev =>
                prev.map(cot =>
                    cot.id === statusToUpdate.id
                        ? { ...cot, status: statusToUpdate.status }
                        : cot
                )
            );

            setShowStatusModal(false);
            setStatusToUpdate(null);
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar el estado. Intenta nuevamente.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const stats = {
        total: cotizaciones.length,
        pending: cotizaciones.filter(c => c.status === 'pending').length,
        contacted: cotizaciones.filter(c => c.status === 'contacted').length,
        converted: cotizaciones.filter(c => c.status === 'converted').length,
        totalRevenue: cotizaciones
            .filter(c => c.status === 'converted')
            .reduce((sum, c) => sum + c.totalPrice, 0)
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Cotizaciones
                </h1>
                <p className="text-slate-700 mt-1">
                    Gestiona los leads generados desde el cotizador de la landing page
                </p>
            </div>

            {/* Error State */}
            {error && (
                <Card className="p-6 border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                                onClick={fetchCotizaciones}
                            >
                                Reintentar
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="p-4 border-none shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-700 uppercase">Total</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <Calculator className="h-8 w-8 text-slate-600" />
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-yellow-100 bg-yellow-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-yellow-700 uppercase">Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-blue-100 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase">Contactados</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.contacted}</p>
                        </div>
                        <Phone className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-green-100 bg-green-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-green-700 uppercase">Convertidos</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{stats.converted}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-purple-100 bg-purple-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-purple-700 uppercase">Ingresos</p>
                            <p className="text-xl font-bold text-purple-900 mt-1">
                                ${(stats.totalRevenue / 1000).toFixed(0)}k
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant={filterStatus === 'all' ? 'primary' : 'outline'}
                        onClick={() => setFilterStatus('all')}
                    >
                        Todos
                    </Button>
                    <Button
                        size="sm"
                        variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                        onClick={() => setFilterStatus('pending')}
                    >
                        Pendientes
                    </Button>
                    <Button
                        size="sm"
                        variant={filterStatus === 'contacted' ? 'primary' : 'outline'}
                        onClick={() => setFilterStatus('contacted')}
                    >
                        Contactados
                    </Button>
                    <Button
                        size="sm"
                        variant={filterStatus === 'converted' ? 'primary' : 'outline'}
                        onClick={() => setFilterStatus('converted')}
                    >
                        Convertidos
                    </Button>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {/* Cotizaciones List */}
            <div className="space-y-4">
                {filteredCotizaciones.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-2">
                            No hay cotizaciones
                        </h3>
                        <p className="text-sm text-slate-700">
                            {searchTerm
                                ? 'No se encontraron resultados para tu búsqueda'
                                : 'Las cotizaciones aparecerán aquí cuando los usuarios completen el formulario'}
                        </p>
                    </Card>
                ) : (
                    filteredCotizaciones.map((cot) => {
                        const statusConfig = STATUS_CONFIG[cot.status as keyof typeof STATUS_CONFIG];
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Card key={cot.id} className="p-6 hover:shadow-md transition-shadow">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Main Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-primary" />
                                                    {cot.empresa}
                                                </h3>
                                                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-800">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        {cot.nombre}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {cot.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {cot.telefono}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.border} flex items-center gap-2`}>
                                                <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                                                <span className={`text-xs font-semibold ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                                            <div>
                                                <p className="text-xs text-slate-700 font-semibold uppercase">Conductores</p>
                                                <p className="text-lg font-bold text-slate-900 mt-1">{cot.quantity}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-700 font-semibold uppercase">Curso</p>
                                                <p className="text-sm font-semibold text-slate-900 mt-1">
                                                    {COURSE_LABELS[cot.course] || cot.course}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-700 font-semibold uppercase">Modalidad</p>
                                                <p className="text-sm font-semibold text-slate-900 mt-1">
                                                    {MODALITY_LABELS[cot.modality] || cot.modality}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-700 font-semibold uppercase">Fecha</p>
                                                <p className="text-sm font-semibold text-slate-900 mt-1">
                                                    {new Date(cot.createdAt).toLocaleDateString('es-AR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price and Actions */}
                                    <div className="lg:w-48 flex flex-col justify-between items-end gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-slate-700 font-semibold uppercase">Valor Total</p>
                                            <p className="text-3xl font-bold text-primary mt-1">
                                                ${(cot.totalPrice / 1000).toFixed(0)}k
                                            </p>
                                            <p className="text-xs text-slate-700 mt-1">
                                                ${Math.round(cot.totalPrice / cot.quantity).toLocaleString('es-AR')} por alumno
                                            </p>
                                        </div>

                                        {/* Status Actions */}
                                        {cot.status !== 'converted' && cot.status !== 'rejected' && (
                                            <div className="flex flex-wrap gap-2">
                                                {cot.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handleStatusChange(cot.id, 'contacted')}
                                                        className="flex-1"
                                                    >
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        Marcar Contactado
                                                    </Button>
                                                )}
                                                {cot.status === 'contacted' && (
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => {
                                                            setCotizacionToConvert(cot);
                                                            setShowConvertModal(true);
                                                        }}
                                                        className="flex-1"
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        Convertir en Cliente
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedCotizacion(cot)}
                                            className="w-full"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Detail Modal - Simplified version */}
            {selectedCotizacion && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCotizacion(null)}
                >
                    <Card
                        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Cotización #{selectedCotizacion.id}
                                    </h2>
                                    <p className="text-sm text-slate-700 mt-1">
                                        Recibida el {new Date(selectedCotizacion.createdAt).toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedCotizacion(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Información de Contacto</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">Empresa:</span> {selectedCotizacion.empresa}</p>
                                        <p><span className="font-semibold">Contacto:</span> {selectedCotizacion.nombre}</p>
                                        <p><span className="font-semibold">Email:</span> {selectedCotizacion.email}</p>
                                        <p><span className="font-semibold">Teléfono:</span> {selectedCotizacion.telefono}</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-2">Detalles de la Cotización</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-semibold">Conductores:</span> {selectedCotizacion.quantity}</p>
                                        <p><span className="font-semibold">Curso:</span> {COURSE_LABELS[selectedCotizacion.course]}</p>
                                        <p><span className="font-semibold">Modalidad:</span> {MODALITY_LABELS[selectedCotizacion.modality]}</p>
                                        <p><span className="font-semibold">Precio Total:</span> ${selectedCotizacion.totalPrice.toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Status Confirmation Modal */}
            {showStatusModal && statusToUpdate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Confirmar Cambio de Estado
                        </h3>
                        <p className="text-slate-800 mb-6">
                            ¿Estás seguro que deseas cambiar el estado a{' '}
                            <span className="font-semibold">
                                {STATUS_CONFIG[statusToUpdate.status as keyof typeof STATUS_CONFIG]?.label}
                            </span>
                            ?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setStatusToUpdate(null);
                                }}
                                disabled={isUpdatingStatus}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={confirmStatusChange}
                                disabled={isUpdatingStatus}
                            >
                                {isUpdatingStatus ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    'Confirmar'
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Convert Quote Modal */}
            {cotizacionToConvert && (
                <ConvertQuoteModal
                    cotizacion={cotizacionToConvert}
                    isOpen={showConvertModal}
                    onClose={() => {
                        setShowConvertModal(false);
                        setCotizacionToConvert(null);
                    }}
                    onSuccess={() => {
                        fetchCotizaciones();
                        setShowConvertModal(false);
                        setCotizacionToConvert(null);
                    }}
                />
            )}
        </div>
    );
}
