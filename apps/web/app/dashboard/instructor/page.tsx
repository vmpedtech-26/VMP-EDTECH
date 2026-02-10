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
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { evidenciasApi } from '@/lib/api/evidencias';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        totalReviewed: 0,
        activeAlumnos: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerateLink = (platform: 'meet' | 'teams') => {
        const id = Math.random().toString(36).substring(7);
        const link = platform === 'meet'
            ? `https://meet.google.com/vmp-${id}`
            : `https://teams.microsoft.com/l/meetup-join/vmp-${id}`;
        setGeneratedLink(link);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await evidenciasApi.listarRevisiones();
                setStats({
                    pending: data.length,
                    totalReviewed: 12, // Placeholder for total reviewed
                    activeAlumnos: 8   // Placeholder for active students
                });
            } catch (error) {
                console.error('Error fetching instructor stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Tareas Pendientes',
            value: stats.pending,
            description: 'Evidencias sin revisar',
            icon: Clock,
            color: 'text-warning',
            bg: 'bg-warning/10',
            link: '/dashboard/instructor/tareas'
        },
        {
            title: 'Alumnos Activos',
            value: stats.activeAlumnos,
            description: 'En tu empresa',
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/10',
            link: '/dashboard/instructor/alumnos'
        },
        {
            title: 'Cursos Asignados',
            value: 4,
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
                    <p className="text-slate-800 mt-2">Bienvenido de nuevo, {user?.nombre}. Tienes {stats.pending} tareas pendientes de revisión.</p>
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
                                    <p className="text-sm text-slate-800 mt-1">Hay {stats.pending} tareas esperando tu evaluación para poder emitir credenciales.</p>
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
                                    <p className="text-sm text-slate-800 mt-1">Monitorea el progreso de los {stats.activeAlumnos} alumnos inscritos de tu empresa.</p>
                                </div>
                                <Button variant="outline" asChild className="w-full justify-between">
                                    <Link href="/dashboard/instructor/alumnos">
                                        Gestionar alumnos
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent-cyan/5 to-transparent border-accent-cyan/10 md:col-span-2">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Video className="h-5 w-5 text-accent-cyan" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Nueva Clase en Vivo</h3>
                                        <p className="text-sm text-slate-800 mt-1">Genera un enlace instantáneo para tu próxima sesión de capacitación.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleGenerateLink('meet')}
                                            variant="outline"
                                            className="flex-1 gap-2 border-accent-cyan/20 text-accent-cyan hover:bg-accent-cyan/5"
                                        >
                                            Google Meet
                                        </Button>
                                        <Button
                                            onClick={() => handleGenerateLink('teams')}
                                            variant="outline"
                                            className="flex-1 gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                        >
                                            MS Teams
                                        </Button>
                                    </div>
                                </div>

                                {generatedLink && (
                                    <div className="w-full md:w-72 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Enlace Generado</span>
                                            {copySuccess && <span className="text-[10px] text-success font-bold animate-pulse">¡Copiado!</span>}
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 break-all text-xs font-mono text-slate-600">
                                            {generatedLink}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 gap-1" onClick={() => copyToClipboard(generatedLink)}>
                                                <Copy className="h-3 w-3" />
                                                Copiar
                                            </Button>
                                            <Button size="sm" variant="outline" className="px-2" asChild>
                                                <a href={generatedLink} target="_blank" rel="noopener noreferrer">
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
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Credenciales Emitidas</p>
                                <p className="text-xl font-bold text-slate-900">128</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-700">Total Usuarios</p>
                                <p className="text-xl font-bold text-slate-900">15</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
                            Ver todos los datos
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}


