'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
    Users,
    BookOpen,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    TrendingUp,
    Star,
    Video,
    Copy,
    ExternalLink,
    ChevronRight,
    Award,
    Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/Skeleton';

interface InstructorMetrics {
    pending_evidencias: number;
    active_alumnos: number;
    cursos_count: number;
    credenciales_count: number;
    inscripciones_activas: number;
}

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<InstructorMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Live class link state
    const [liveLink, setLiveLink] = useState('');
    const [savedLink, setSavedLink] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.get('/metrics/instructor');
                setMetrics(data);
            } catch (error) {
                console.error('Error fetching instructor stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const handleSaveLink = () => {
        if (!liveLink.trim()) return;
        let url = liveLink.trim();
        // Auto-prepend https if user forgot
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        setSavedLink(url);
        setLiveLink('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const m = metrics;

    const statCards = [
        {
            title: 'Tareas Pendientes',
            value: m?.pending_evidencias ?? 0,
            description: 'Evidencias sin revisar',
            icon: Clock,
            color: 'text-warning',
            bg: 'bg-warning/10',
            link: '/dashboard/instructor/tareas'
        },
        {
            title: 'Alumnos Activos',
            value: m?.active_alumnos ?? 0,
            description: 'En tu empresa',
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/10',
            link: '/dashboard/instructor/alumnos'
        },
        {
            title: 'Cursos Asignados',
            value: m?.cursos_count ?? 0,
            description: 'Programas activos',
            icon: BookOpen,
            color: 'text-secondary',
            bg: 'bg-secondary/10',
            link: '/dashboard/instructor/cursos'
        }
    ];

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Panel de Instructor</h1>
                    <p className="text-slate-800 mt-2">Bienvenido de nuevo, {user?.nombre}. Tienes {m?.pending_evidencias ?? 0} tareas pendientes de revisión.</p>
                </div>
                <Button className="hidden md:flex gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ver Reportes
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="group relative overflow-hidden p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wider">{stat.title}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                                {stat.value > 0 && (
                                    <span className={`text-xs font-bold ${stat.color} flex items-center`}>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 font-medium">{stat.description}</p>
                        </div>
                        <Link href={stat.link} className="absolute inset-x-0 bottom-0 h-1 bg-transparent group-hover:bg-primary/20 transition-all" />
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Star className="h-5 w-5 text-warning fill-warning" />
                            Acciones Recomendadas
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                            <div className="space-y-4">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Clock className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Revisar Evidencias</h3>
                                    <p className="text-sm text-slate-800 mt-1">Hay {m?.pending_evidencias ?? 0} tareas esperando tu evaluación para poder emitir credenciales.</p>
                                </div>
                                <Button asChild className="w-full justify-between">
                                    <Link href="/dashboard/instructor/tareas">
                                        Ir a tareas
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-secondary/5 to-transparent border-secondary/10">
                            <div className="space-y-4">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Users className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">Mis Alumnos</h3>
                                    <p className="text-sm text-slate-800 mt-1">Monitorea el progreso de los {m?.active_alumnos ?? 0} alumnos inscritos de tu empresa.</p>
                                </div>
                                <Button variant="outline" asChild className="w-full justify-between">
                                    <Link href="/dashboard/instructor/alumnos">
                                        Gestionar alumnos
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        {/* Live Class Link - Fixed: input your own link */}
                        <Card className="p-6 bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/10 md:col-span-2">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Video className="h-5 w-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Nueva Clase en Vivo</h3>
                                        <p className="text-sm text-slate-800 mt-1">Pegá tu enlace de Google Meet o Microsoft Teams para compartir con tus alumnos.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="url"
                                                placeholder="https://meet.google.com/abc-defg-hij"
                                                value={liveLink}
                                                onChange={(e) => setLiveLink(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveLink()}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan transition-all"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSaveLink}
                                            disabled={!liveLink.trim()}
                                            className="gap-1.5 bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                                        >
                                            Guardar
                                        </Button>
                                    </div>
                                </div>

                                {savedLink && (
                                    <div className="w-full md:w-72 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Enlace Guardado</span>
                                            {copySuccess && <span className="text-[10px] text-success font-bold animate-pulse">¡Copiado!</span>}
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 break-all text-xs font-mono text-slate-600">
                                            {savedLink}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 gap-1" onClick={() => copyToClipboard(savedLink)}>
                                                <Copy className="h-3 w-3" />
                                                Copiar
                                            </Button>
                                            <Button size="sm" variant="outline" className="px-2" asChild>
                                                <a href={savedLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Estado de Empresa</h2>
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Award className="h-8 w-8 text-emerald-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Credenciales Emitidas</p>
                                <p className="text-xl font-bold text-slate-900">{m?.credenciales_count ?? 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Total Alumnos</p>
                                <p className="text-xl font-bold text-slate-900">{m?.active_alumnos ?? 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <CheckCircle2 className="h-8 w-8 text-cyan-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Inscripciones Activas</p>
                                <p className="text-xl font-bold text-slate-900">{m?.inscripciones_activas ?? 0}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5" asChild>
                            <Link href="/dashboard/instructor/credenciales">Ver credenciales</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
