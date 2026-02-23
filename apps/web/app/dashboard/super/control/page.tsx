'use client';

import { useEffect, useState } from 'react';
import {
    Settings,
    Database,
    Activity,
    Download,
    Trash2,
    RefreshCw,
    Server,
    Cpu,
    HardDrive,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';



interface HealthStats {
    status: string;
    database: string;
    cpu: string;
    memory: {
        total: string;
        used: string;
        percent: string;
    };
    disk: {
        total: string;
        used: string;
        percent: string;
    };
    environment: string;
}

interface Backup {
    filename: string;
    size: number;
    created_at: string;
}

export default function ControlCenterPage() {
    const [health, setHealth] = useState<HealthStats | null>(null);
    const [backups, setBackups] = useState<Backup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [healthData, backupsData] = await Promise.all([
                api.get('/admin/health'),
                api.get('/admin/backups')
            ]);

            setHealth(healthData);
            setBackups(backupsData);
        } catch (error) {
            console.error('Error fetching control data:', error);
            toast.error('Error al conectar con los servicios de administración');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBackup = async () => {
        setIsCreatingBackup(true);
        try {
            await api.post('/admin/backups/create', {});
            toast.success('Backup creado exitosamente');
            fetchData();
        } catch (error: any) {
            toast.error(`Error: ${error.message || 'No se pudo crear el backup'}`);
        } finally {
            setIsCreatingBackup(false);
        }
    };

    const handleDeleteBackup = async (filename: string) => {
        if (!confirm('¿Estás seguro de eliminar este backup?')) return;

        try {
            await api.delete(`/admin/backups/${filename}`);
            toast.success('Backup eliminado');
            setBackups(backups.filter(b => b.filename !== filename));
        } catch (error) {
            toast.error('No se pudo eliminar el backup');
        }
    };

    const handleDownloadBackup = async (filename: string) => {
        try {
            const token = localStorage.getItem('vmp_token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            window.open(`${API_URL}/api/admin/backups/download/${filename}?token=${token}`, '_blank');
        } catch (error) {
            toast.error('Error al iniciar la descarga');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading && !health) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        Centro de Control
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Monitoreo de infraestructura y gestión de respaldos críticos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refrescar
                    </button>
                    <button
                        onClick={handleCreateBackup}
                        disabled={isCreatingBackup}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isCreatingBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Generar Backup
                    </button>
                </div>
            </div>

            {/* Health Monitor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${health?.database === 'connected' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Estado DB</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                {health?.database === 'connected' ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <p className={`text-sm font-bold ${health?.database === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                                    {health?.database === 'connected' ? 'Conectado' : 'Desconectado'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Cpu className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Uso de CPU</p>
                            <p className="text-sm font-bold text-slate-900 mt-0.5">{health?.cpu || '0%'}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Memoria RAM</p>
                            <p className="text-sm font-bold text-slate-900 mt-0.5">{health?.memory.percent || '0%'}</p>
                            <p className="text-[10px] text-slate-400">{health?.memory.used} / {health?.memory.total}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 border-none shadow-sm ring-1 ring-slate-200 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                            <HardDrive className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Espacio Disco</p>
                            <p className="text-sm font-bold text-slate-900 mt-0.5">{health?.disk.percent || '0%'}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Backups Management */}
                <Card className="lg:col-span-2 p-6 border-none shadow-md ring-1 ring-slate-200 bg-white overflow-hidden">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <Database className="h-5 w-5 text-primary" />
                        Gestión de Backups (SQL)
                    </h2>

                    {backups.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            <Database className="h-12 w-12 mb-3 opacity-20" />
                            <p>No se han generado backups todavía.</p>
                            <button
                                onClick={handleCreateBackup}
                                className="mt-4 text-sm font-semibold text-primary hover:underline"
                            >
                                Crear el primer respaldo ahora
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Archivo</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tamaño</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {backups.map((backup) => (
                                        <tr key={backup.filename} className="hover:bg-slate-50 group transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded text-slate-500">
                                                        <FileCode className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={backup.filename}>
                                                        {backup.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                                    {formatSize(backup.size)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm text-slate-700">
                                                        {new Date(backup.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(backup.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownloadBackup(backup.filename)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="Descargar SQL"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBackup(backup.filename)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* System Activity / Info Section */}
                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-md ring-1 ring-slate-200 bg-white">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                            <Server className="h-5 w-5 text-primary" />
                            Información de Producción
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-500">Entorno</span>
                                <span className="font-bold text-primary uppercase">{health?.environment || 'PROD'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-500">Región</span>
                                <span className="font-medium">US-East (Vercel/Railway)</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-50">
                                <span className="text-slate-500">Último Despliegue</span>
                                <span className="font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Hace pocos minutos
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 border-none shadow-md ring-1 ring-slate-200 bg-primary/5 border-primary/10">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary mt-1">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Consejo de Seguridad</h3>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    Genera un backup manual antes de realizar migraciones de datos o cambios estructurales importantes en los cursos.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function FileCode(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m10 13-2 2 2 2" />
            <path d="m14 17 2-2-2-2" />
        </svg>
    )
}
