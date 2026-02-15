'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Building2,
    ArrowRight,
    Calculator,
    Loader2,
    FileText,
    GraduationCap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { api } from '@/lib/api-client';

interface OverviewMetrics {
    totals: {
        users: number;
        companies: number;
        courses: number;
        enrollments: number;
        credentials: number;
        quotes: number;
    };
    quotes: {
        pending: number;
        contacted: number;
        converted: number;
        rejected: number;
        conversion_rate: number;
    };
    enrollments: {
        active: number;
        completed: number;
        completion_rate: number;
    };
}

export default function SuperDashboardPage() {
    const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMetrics = useCallback(async () => {
        try {
            const data = await api.get('/metrics/overview');
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <Skeleton className="h-10 w-80" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            </div>
        );
    }

    const t = metrics?.totals;
    const q = metrics?.quotes;
    const e = metrics?.enrollments;

    const stats = [
        { label: 'Empresas Activas', value: t?.companies ?? 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Cursos Globales', value: t?.courses ?? 0, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Alumnos Totales', value: t?.users ?? 0, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Credenciales Emitidas', value: t?.credentials ?? 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
                <p className="text-slate-700 mt-1">Bienvenido al centro de administración global de VMP Servicios</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value.toLocaleString('es-AR')}</p>
                                </div>
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Secondary stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 border-none shadow-sm ring-1 ring-gray-100" hover={false}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-yellow-50">
                            <Calculator className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cotizaciones</p>
                            <p className="text-xl font-bold text-slate-900">{t?.quotes ?? 0}</p>
                            <p className="text-xs text-slate-500">{q?.pending ?? 0} pendientes</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-none shadow-sm ring-1 ring-gray-100" hover={false}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-50">
                            <GraduationCap className="h-5 w-5 text-cyan-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inscripciones</p>
                            <p className="text-xl font-bold text-slate-900">{t?.enrollments ?? 0}</p>
                            <p className="text-xs text-slate-500">{e?.active ?? 0} activas · {e?.completed ?? 0} completadas</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-5 border-none shadow-sm ring-1 ring-gray-100" hover={false}>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-50">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tasa Conversión</p>
                            <p className="text-xl font-bold text-slate-900">{q?.conversion_rate ?? 0}%</p>
                            <p className="text-xs text-slate-500">{q?.converted ?? 0} convertidas de {t?.quotes ?? 0}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shortcuts */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Accesos Rápidos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/super/cursos">
                            <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100 hover:ring-primary transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Gestionar Cursos</h4>
                                            <p className="text-xs text-slate-700">Crear, editar y organizar contenidos</p>
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
                                            <h4 className="font-bold text-slate-900">Gestionar Empresas</h4>
                                            <p className="text-xs text-slate-700">Alta y administración de clientes</p>
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
                                            <h4 className="font-bold text-slate-900">Gestionar Alumnos</h4>
                                            <p className="text-xs text-slate-700">Ver y administrar estudiantes</p>
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
                                            <h4 className="font-bold text-slate-900">Ver Cotizaciones</h4>
                                            <p className="text-xs text-slate-700">Leads desde landing page</p>
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
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100" asChild>
                                <Link href="/dashboard/super/credenciales">Ir a credenciales</Link>
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Quota breakdown */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Cotizaciones</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50">
                        {[
                            { label: 'Pendientes', value: q?.pending ?? 0, color: 'text-amber-600', dot: 'bg-amber-500' },
                            { label: 'Contactadas', value: q?.contacted ?? 0, color: 'text-blue-600', dot: 'bg-blue-500' },
                            { label: 'Convertidas', value: q?.converted ?? 0, color: 'text-emerald-600', dot: 'bg-emerald-500' },
                            { label: 'Rechazadas', value: q?.rejected ?? 0, color: 'text-red-600', dot: 'bg-red-500' },
                        ].map((item) => (
                            <div key={item.label} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                </div>
                                <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                            </div>
                        ))}
                        <div className="p-4">
                            <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:text-primary transition-colors" asChild>
                                <Link href="/dashboard/super/cotizaciones">Ver todas las cotizaciones</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
