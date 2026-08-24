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
    UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { evidenciasApi } from '@/lib/api/evidencias';
import { Skeleton } from '@/components/ui/Skeleton';
import { ModalAltaCampoInstructor } from '@/components/dashboard/ModalAltaCampoInstructor';
import { toast } from 'sonner';

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        pending: 0,
        totalReviewed: 0,
        activeAlumnos: 0,
        cursosAsignados: 0,
        credencialesEmitidas: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAltaCampoOpen, setIsAltaCampoOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await evidenciasApi.obtenerStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching instructor stats:', error);
                toast.error('No se pudieron cargar tus estadísticas. Verificá tu conexión.');
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
            value: stats.cursosAsignados,
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
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Instructor</h1>
                    <p className="text-gray-500 text-sm mt-1">Bienvenido de nuevo, {user?.nombre}. Tienes {stats.pending} tareas pendientes de revisión.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsAltaCampoOpen(true)}
                        className="bg-primary hover:bg-primary-dark text-white font-bold gap-2 text-sm shadow-md shadow-primary/20"
                    >
                        <UserPlus className="h-4 w-4" />
                        + Alta Rápida en Campo
                    </Button>
                    <Button variant="outline" asChild className="hidden md:flex gap-2 bg-white border-gray-200 text-gray-700">
                        <Link href="/dashboard/instructor/alumnos">
                            <TrendingUp className="h-4 w-4" />
                            Ver Reportes
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="group relative overflow-hidden p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`p-3 rounded-2xl ${stat.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
                                {stat.value > 0 && (
                                    <span className={`text-xs font-bold ${stat.color} flex items-center`}>
                                        <ArrowUpRight className="h-3 w-3" />
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 font-medium">{stat.description}</p>
                        </div>
                        <Link href={stat.link} className="absolute inset-x-0 bottom-0 h-1 bg-transparent group-hover:bg-primary/20 transition-all" />
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
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
                                    <h3 className="font-bold text-gray-900 text-lg">Revisar Evidencias</h3>
                                    <p className="text-sm text-gray-600 mt-1">Hay {stats.pending} tareas esperando tu evaluación para poder emitir credenciales.</p>
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
                                    <h3 className="font-bold text-gray-900 text-lg">Mis Alumnos</h3>
                                    <p className="text-sm text-gray-600 mt-1">Monitorea el progreso de los {stats.activeAlumnos} alumnos inscritos de tu empresa.</p>
                                </div>
                                <Button variant="outline" asChild className="w-full justify-between">
                                    <Link href="/dashboard/instructor/alumnos">
                                        Gestionar alumnos
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Estado de Empresa</h2>
                    <Card className="p-6 space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Credenciales Emitidas</p>
                                <p className="text-xl font-bold text-gray-900">{stats.credencialesEmitidas}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                                <p className="text-xl font-bold text-gray-900">{stats.activeAlumnos}</p>
                            </div>
                        </div>
                        <Button variant="ghost" asChild className="w-full text-primary hover:text-primary hover:bg-primary/5">
                          <Link href="/dashboard/instructor/credenciales">
                            Ver todos los datos
                          </Link>
                        </Button>
                    </Card>
                </div>
            </div>
            <ModalAltaCampoInstructor
                isOpen={isAltaCampoOpen}
                onClose={() => setIsAltaCampoOpen(false)}
                onSuccess={() => {}}
            />
        </div>
    );
}

// Reuse icon
function ChevronRight(props: any) {
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
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
