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
    GraduationCap,
    AlertTriangle,
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
    const [isPurging, setIsPurging] = useState(false);

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

    const handlePurgeData = async () => {
        if (!confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente todos los datos de prueba (alumnos, exámenes, etc). Esta acción no se puede deshacer.')) {
            return;
        }

        setIsPurging(true);
        try {
            await api.post('/admin/purge-test-data', {});
            alert('Base de datos purgada exitosamente. Solo quedan los administradores e instructores.');
            fetchMetrics(); // Refresh stats
        } catch (error) {
            console.error('Error purging data:', error);
            alert('Error al purgar la base de datos.');
        } finally {
            setIsPurging(false);
        }
    };

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
        { label: 'Alumnos Totales', value: t?.users ?? 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Credenciales Emitidas', value: t?.credentials ?? 0, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
                <p className="text-slate-700 mt-1">Bienvenido al centro de administración global de VMP - EDTECH</p>
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
                <Card className="p-5 border-none shadow-sm ring-1 ring-cyan-50" hover={false}>
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
                <Card className="p-5 border-none shadow-sm ring-1 ring-green-50" hover={false}>
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
                    </Card>
                </div>
            </div>

            {/* Maintenance Section */}
            <div className="mt-12 pt-8 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Mantenimiento de Sistema</h2>
                <Card className="p-8 border-none shadow-sm ring-1 ring-red-100 bg-red-50/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h4 className="font-extrabold text-red-900 flex items-center gap-2 justify-center md:justify-start">
                                <AlertTriangle className="h-5 w-5" />
                                Zona de Peligro: Limpieza de Base de Datos
                            </h4>
                            <p className="text-sm text-red-700 max-w-xl">
                                Esta acción eliminará todos los alumnos y datos de prueba. 
                                <span className="font-bold underline"> Se mantendrán las cuentas de Administrador e Instructores.</span>
                            </p>
                        </div>
                        <Button 
                            onClick={handlePurgeData} 
                            disabled={isPurging}
                            className="bg-red-600 hover:bg-red-700 text-white font-black px-8 py-6 rounded-2xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {isPurging ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Purgando...
                                </>
                            ) : (
                                "LIMPIAR TODOS LOS DATOS"
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
