'use client';

import { useEffect, useState } from 'react';
import {
    Settings,
    Database,
    Activity,
    RefreshCw,
    Server,
    Cpu,
    HardDrive,
    AlertCircle,
    CheckCircle2,
    Clock,
    Plus,
    Loader2,
    CircleDollarSign
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

export default function ControlCenterPage() {
    const [health, setHealth] = useState<HealthStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSeedingAccounting, setIsSeedingAccounting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const healthData = await api.get('/admin/health');
            setHealth(healthData);
        } catch (error) {
            console.error('Error fetching control data:', error);
            toast.error('Error al conectar con los servicios de administración');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeedAccounting = async () => {
        setIsSeedingAccounting(true);
        try {
            await api.post('/accounting/seed', {});
            toast.success('Plan de Cuentas inicializado correctamente');
        } catch (error: any) {
            toast.error(`Error: ${error.message || 'No se pudo inicializar la contabilidad'}`);
        } finally {
            setIsSeedingAccounting(false);
        }
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
                        Monitoreo de infraestructura del sistema.
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
                            <span className="font-medium">US-East (Vercel/Render)</span>
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
                            <Database className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Backups de la Base de Datos</h3>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                Los respaldos los gestiona automáticamente Neon (point-in-time recovery) a nivel de infraestructura, según la retención del plan contratado. Revisá esa retención directamente en el dashboard de Neon.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-md ring-1 ring-slate-200 bg-white">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <CircleDollarSign className="h-5 w-5 text-primary" />
                        Inicialización Contable
                    </h2>
                    <p className="text-xs text-slate-500 mb-4">
                        Si es la primera vez que usas el módulo de contabilidad, debes inicializar el Plan de Cuentas base.
                    </p>
                    <button
                        onClick={handleSeedAccounting}
                        disabled={isSeedingAccounting}
                        className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSeedingAccounting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Configurar Contabilidad
                    </button>
                </Card>
            </div>
        </div>
    );
}
