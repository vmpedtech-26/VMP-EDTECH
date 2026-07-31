'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Settings,
    Database,
    Shield,
    Server,
    Globe,
    Cpu,
    HardDrive,
    Activity,
    CheckCircle2,
    ExternalLink,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Copy,
    Check,
    AlertCircle,
    UserCheck,
    Lock,
    DollarSign,
    GraduationCap,
    FileText
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';

interface AuditLog {
    id: string;
    userId: string | null;
    userEmail: string | null;
    action: string;
    details: string | null;
    ipAddress: string | null;
    requestId: string | null;
    createdAt: string;
}

export default function SistemaPage() {
    // Info del sistema
    const systemInfo = [
        { label: 'Versión API', value: '0.1.0-beta', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Base de Datos', value: 'PostgreSQL (Railway)', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Frontend', value: 'Next.js (Vercel)', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Estado', value: 'Operativo', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const services = [
        { name: 'API Backend', url: 'https://vmp-edtech-production.up.railway.app', status: 'online' },
        { name: 'Frontend Web', url: 'https://www.vmp-edtech.com', status: 'online' },
        { name: 'Base de Datos', url: 'Railway PostgreSQL', status: 'online' },
    ];

    // Estados para Logs de Auditoría
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [logError, setLogError] = useState<string | null>(null);

    // Filtros y Paginación
    const [searchEmail, setSearchEmail] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);

    // Estado para feedback de copiado
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Cargar Logs de Auditoría
    const fetchAuditLogs = async () => {
        setIsLoadingLogs(true);
        setLogError(null);
        try {
            const params: Record<string, any> = {
                limit,
                offset
            };
            if (searchEmail) params.user_email = searchEmail;
            if (filterAction) params.action = filterAction;

            const res = await api.get('/admin/audit-logs', { params });
            setLogs(res.logs || []);
            setTotalLogs(res.total || 0);
        } catch (error: any) {
            console.error('Error fetching audit logs:', error);
            setLogError(error.message || 'Error al obtener registros de auditoría.');
        } finally {
            setIsLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [limit, offset, filterAction]);

    // Manejar búsqueda por Enter o botón
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOffset(0); // Resetear a la primera página
        fetchAuditLogs();
    };

    // Copiar al portapapeles
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copiado al portapapeles');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Badge de color por Tipo de Acción de Auditoría
    const getActionBadge = (action: string) => {
        let style = 'bg-slate-50 text-slate-700 border-slate-200';
        let Icon = Settings;

        if (action.startsWith('USER_LOGIN') || action.startsWith('USER_LOGOUT')) {
            style = 'bg-blue-50 text-blue-700 border-blue-200';
            Icon = Lock;
        } else if (action.startsWith('USER_REGISTER')) {
            style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            Icon = UserCheck;
        } else if (action.startsWith('EXAM_')) {
            style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
            Icon = GraduationCap;
        } else if (action.startsWith('INVOICE_')) {
            style = 'bg-amber-50 text-amber-700 border-amber-200';
            Icon = DollarSign;
        }

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
                <Icon className="h-3 w-3" />
                {action}
            </span>
        );
    };

    const totalPages = Math.ceil(totalLogs / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Consola de Sistema</h1>
                <p className="text-slate-700 mt-1">Supervisión en tiempo real, auditorías inmutables de seguridad y enlaces rápidos del backend.</p>
            </div>

            {/* System Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemInfo.map((info) => {
                    const Icon = info.icon;
                    return (
                        <Card key={info.label} className="p-6 border-none shadow-sm ring-1 ring-gray-100/50 bg-white hover:shadow-md transition-all duration-300" hover={false}>
                            <div className="flex items-center gap-4">
                                <div className={`${info.bg} ${info.color} p-3 rounded-2xl`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{info.label}</p>
                                    <p className="text-lg font-bold text-slate-900 mt-0.5">{info.value}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Panel de Auditoría Inmutable (Step 4) */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            Registro de Auditoría de Seguridad (SOC2/ISO)
                        </h2>
                        <p className="text-slate-700 text-sm mt-0.5">Logs inmutables de auditoría transaccional e ingresos al sistema con Request-ID.</p>
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                        Total: {totalLogs} registros
                    </span>
                </div>

                <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 bg-white" hover={false}>
                    {/* Filtros de Auditoría */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por email del alumno/admin..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                        </div>
                        <div className="w-full md:w-60">
                            <select
                                value={filterAction}
                                onChange={(e) => {
                                    setFilterAction(e.target.value);
                                    setOffset(0);
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium text-slate-800"
                            >
                                <option value="">Todas las acciones</option>
                                <option value="USER_LOGIN">USER_LOGIN (Ingresos)</option>
                                <option value="USER_REGISTER">USER_REGISTER (Registros)</option>
                                <option value="USER_PASSWORD_RESET">USER_PASSWORD_RESET (Claves)</option>
                                <option value="EXAM_PASS">EXAM_PASS (Aprobaciones)</option>
                                <option value="EXAM_FAIL">EXAM_FAIL (Exámenes reprobados)</option>
                                <option value="INVOICE_SALE_CREATE">INVOICE_SALE_CREATE (Ventas)</option>
                                <option value="INVOICE_SALE_DELETE">INVOICE_SALE_DELETE (Ventas Anuladas)</option>
                                <option value="INVOICE_PURCHASE_CREATE">INVOICE_PURCHASE_CREATE (Compras)</option>
                                <option value="INVOICE_PURCHASE_DELETE">INVOICE_PURCHASE_DELETE (Compras Anuladas)</option>
                            </select>
                        </div>
                        <Button type="submit" size="lg">
                            Filtrar
                        </Button>
                    </form>

                    {/* Tabla de Logs de Auditoría */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        {isLoadingLogs ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm font-semibold text-slate-800">Cargando logs de auditoría inmutables...</p>
                            </div>
                        ) : logError ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4 space-y-3">
                                <AlertCircle className="h-10 w-10 text-red-500" />
                                <p className="text-slate-900 font-bold">Error de conexión</p>
                                <p className="text-sm text-slate-700 max-w-md">{logError}</p>
                                <Button size="sm" onClick={fetchAuditLogs}>Reintentar consulta</Button>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-slate-800 font-bold text-lg">Sin resultados</p>
                                <p className="text-slate-700 text-sm mt-1">No se encontraron registros de auditoría con los criterios de búsqueda actuales.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <th className="p-4">Fecha y Hora</th>
                                        <th className="p-4">Usuario</th>
                                        <th className="p-4">Acción</th>
                                        <th className="p-4">Detalle</th>
                                        <th className="p-4">IP Address</th>
                                        <th className="p-4">Request ID (Tracing)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm text-slate-700 bg-white">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-xs font-medium text-slate-600">
                                                {new Date(log.createdAt).toLocaleString('es-AR', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'medium'
                                                })}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-900">
                                                {log.userEmail || <span className="text-slate-700 italic">Público / N/A</span>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {getActionBadge(log.action)}
                                            </td>
                                            <td className="p-4 text-xs font-medium text-slate-900 max-w-xs truncate" title={log.details || ''}>
                                                {log.details || <span className="text-slate-700 italic">Sin detalles</span>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap text-xs font-mono text-slate-600">
                                                {log.ipAddress || 'N/A'}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {log.requestId ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 max-w-[130px] truncate" title={log.requestId}>
                                                            {log.requestId}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(log.requestId || '', log.id)}
                                                            className="text-slate-700 hover:text-primary transition-colors"
                                                        >
                                                            {copiedId === log.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-700 italic">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Paginador */}
                    {!isLoadingLogs && !logError && totalLogs > limit && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                            <span className="text-xs font-semibold text-slate-800">
                                Página {currentPage} de {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={offset === 0}
                                    onClick={() => setOffset(Math.max(0, offset - limit))}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setOffset(offset + limit)}
                                >
                                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Services Status */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Estado de Servicios</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50 bg-white" hover={false}>
                        {services.map((service) => (
                            <div key={service.name} className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="font-bold text-slate-900">{service.name}</p>
                                        <p className="text-xs text-slate-500">{service.url}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </span>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-slate-900">Enlaces Rápidos</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50 bg-white" hover={false}>
                        <a href="https://vmp-edtech-production.up.railway.app/docs" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Server className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">API Docs (Swagger)</p>
                                    <p className="text-xs text-slate-500">Documentación interactiva de la API</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                        <a href="https://github.com/vmpedtech-26/VMP-EDTECH" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Repositorio GitHub</p>
                                    <p className="text-xs text-slate-500">Código fuente del proyecto</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                        <a href="https://railway.com" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <HardDrive className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Railway Dashboard</p>
                                    <p className="text-xs text-slate-500">Hosting y base de datos</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                    </Card>
                </div>
            </div>

            {/* Security */}
            <Card className="p-6 border-none shadow-sm ring-1 ring-emerald-100 bg-emerald-50/30 bg-white" hover={false}>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900">Seguridad del Sistema</h4>
                        <p className="text-xs text-emerald-700 mt-1">CORS configurado • JWT Auth activo • Rate limiting habilitado • HTTPS forzado • Trazabilidad X-Request-ID</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
