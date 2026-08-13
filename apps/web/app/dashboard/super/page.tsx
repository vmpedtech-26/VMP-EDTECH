'use client';

import React, { useEffect, useState } from 'react';
import {
    Users,
    BookOpen,
    Award,
    Building2,
    ArrowRight,
    Calculator
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { metricsApi, MetricsOverview, RecentActivityItem } from '@/lib/api/metrics';

export default function SuperDashboardPage() {
    const [overview, setOverview] = useState<MetricsOverview | null>(null);
    const [activity, setActivity] = useState<RecentActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, activityRes] = await Promise.all([
                    metricsApi.overview(),
                    metricsApi.recentActivity(5),
                ]);
                setOverview(overviewRes);
                setActivity(activityRes.items);
            } catch (error) {
                console.error('Error fetching dashboard metrics:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = [
        { label: 'Empresas Activas', value: overview?.totals.companies ?? 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Cursos Globales', value: overview?.totals.courses ?? 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Alumnos Totales', value: overview?.totals.users ?? 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Credenciales Emitidas', value: overview?.totals.credentials ?? 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
                <p className="text-gray-500 mt-1">Bienvenido al centro de administración global de VMP EdTech</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {isLoading ? '—' : stat.value.toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shortcuts */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Accesos Rápidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/super/cursos">
                            <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:ring-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Gestionar Cursos</h4>
                                            <p className="text-xs text-gray-500">Crear, editar y organizar contenidos</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Card>
                        </Link>

                        <Link href="/dashboard/super/empresas">
                            <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:ring-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Gestionar Empresas</h4>
                                            <p className="text-xs text-gray-500">Alta y administración de clientes</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Card>
                        </Link>

                        <Link href="/dashboard/super/alumnos">
                            <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:ring-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Gestionar Alumnos</h4>
                                            <p className="text-xs text-gray-500">Ver y administrar estudiantes</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Card>
                        </Link>

                        <Link href="/dashboard/super/cotizaciones">
                            <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:ring-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-all">
                                            <Calculator className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Ver Cotizaciones</h4>
                                            <p className="text-xs text-gray-500">Leads desde landing page</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                                </div>
                            </Card>
                        </Link>
                    </div>

                    <Card className="p-6 border-none shadow-sm ring-1 ring-emerald-100 bg-emerald-50/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                    <Award className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-900">Validación de Credenciales</h4>
                                    <p className="text-xs text-emerald-700">Verificar autenticidad de credenciales emitidas</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                                Ir al validador
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* System Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50">
                        {!isLoading && activity.length === 0 && (
                            <div className="p-4 text-sm text-gray-400">Todavía no hay inscripciones registradas.</div>
                        )}
                        {activity.map((item) => (
                            <div key={item.id} className="p-4 flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-bold">{item.alumnoNombre}</span> se inscribió al curso <span className="font-bold text-primary">{item.cursoNombre}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div className="p-4">
                            <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-primary transition-colors">
                                Ver todo el historial
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
