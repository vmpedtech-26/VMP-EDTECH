'use client';

import React from 'react';
import {
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Building2,
    ArrowRight,
    Calculator
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function SuperDashboardPage() {
    const stats = [
        { label: 'Empresas Activas', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Cursos Globales', value: '8', icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Alumnos Totales', value: '1,240', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Credenciales Emitidas', value: '856', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs font-bold text-success">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>+12% este mes</span>
                            </div>
                        </Card>
                    );
                })}
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
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                                Ir al validador
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* System Activity */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Actividad Reciente</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <Users className="h-4 w-4 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-900">
                                        <span className="font-bold">Juan Pérez</span> se inscribió al curso <span className="font-bold text-primary">Seguridad Vial</span>
                                    </p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Hace {i * 10} minutos</p>
                                </div>
                            </div>
                        ))}
                        <div className="p-4">
                            <Button variant="ghost" size="sm" className="w-full text-slate-600 hover:text-primary transition-colors">
                                Ver todo el historial
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
