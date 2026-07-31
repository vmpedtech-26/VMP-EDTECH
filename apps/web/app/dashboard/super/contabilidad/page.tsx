'use client';

import React from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PieChart,
    Plus,
    ArrowRight,
    CircleDollarSign,
    Calculator,
    BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ContabilidadDashboard() {
    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-r from-white to-slate-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Finanzas en tiempo real</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Centro Contable</h1>
                        <p className="text-slate-600 font-medium">Visualiza y gestiona la salud financiera de VMP.</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" className="rounded-2xl border-slate-200 shadow-sm" asChild>
                            <Link href="/dashboard/super/contabilidad/diario">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Libro Diario
                            </Link>
                        </Button>
                        <Button variant="outline" className="rounded-2xl border-slate-200 shadow-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50/50" asChild>
                            <Link href="/dashboard/super/contabilidad/compras/nuevo">
                                <Plus className="h-4 w-4 mr-2" />
                                Cargar Factura (Asistente)
                            </Link>
                        </Button>
                        <Button className="rounded-2xl shadow-lg shadow-primary/20" asChild>
                            <Link href="/dashboard/super/contabilidad/ventas/nuevo">
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar Venta
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ingresos Mensuales', value: '$2.4M', trend: '+12%', icon: TrendingUp, color: 'emerald' },
                    { label: 'Egresos Mensuales', value: '$1.1M', trend: '-5%', icon: TrendingDown, color: 'rose' },
                    { label: 'Saldo en Caja', value: '$850k', trend: 'Estable', icon: Wallet, color: 'blue' },
                    { label: 'Rentabilidad', value: '54%', trend: '+2%', icon: PieChart, color: 'amber' },
                ].map((stat, i) => (
                    <Card key={i} className="p-6 border-none shadow-sm ring-1 ring-slate-100 hover:ring-primary/20 transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-all`}></div>
                        <div className="relative z-10">
                            <div className={`h-10 w-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 mb-4`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                                <span className={`text-[10px] font-black text-${stat.color}-600`}>{stat.trend}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Accesos Directos
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Ventas y Facturación', desc: 'Registra cobros y emite comprobantes.', href: '/dashboard/super/contabilidad/ventas', icon: CircleDollarSign },
                            { title: 'Compras y Gastos', desc: 'Controla los pagos a proveedores.', href: '/dashboard/super/contabilidad/compras', icon: TrendingDown },
                            { title: 'Reportes Financieros', desc: 'Balances y estado de resultados.', href: '/dashboard/super/contabilidad/reportes', icon: PieChart },
                            { title: 'Plan de Cuentas', desc: 'Configura la estructura contable.', href: '/dashboard/super/contabilidad/cuentas', icon: Sliders },
                            { title: 'Liquidación IVA (F. 2051)', desc: 'Agenda ARCA, CBU y exportación de retenciones.', href: '/dashboard/super/contabilidad/impuestos', icon: Calculator },
                            { title: 'Simplificaciones RT 54', desc: 'Categoría PyME y valuación de bienes de cambio.', href: '/dashboard/super/contabilidad/rt54', icon: BookOpen },
                        ].map((action, i) => (
                            <Link key={i} href={action.href} className="group">
                                <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 hover:ring-primary/40 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                            <action.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{action.title}</h4>
                                            <p className="text-xs text-slate-500">{action.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Mini-Ledger */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Últimos Movimientos</h2>
                    <Card className="p-4 border-none shadow-sm ring-1 ring-slate-100 divide-y divide-slate-50">
                        {[
                            { date: 'Hoy', desc: 'Venta Curso 4x4', amount: '+$45.000', type: 'in' },
                            { date: 'Hoy', desc: 'Pago Hosting Railway', amount: '-$12.500', type: 'out' },
                            { date: 'Ayer', desc: 'Venta Pack Empresas', amount: '+$180.000', type: 'in' },
                            { date: 'Ayer', desc: 'Compra Insumos Oficina', amount: '-$8.200', type: 'out' },
                        ].map((m, i) => (
                            <div key={i} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{m.date}</p>
                                    <p className="text-sm font-bold text-slate-700">{m.desc}</p>
                                </div>
                                <span className={`text-sm font-black ${m.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {m.amount}
                                </span>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full mt-4 text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-widest" asChild>
                            <Link href="/dashboard/super/contabilidad/diario">Ver todo el libro</Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// Mock Sliders icon since it wasn't imported in this snippet
const Sliders = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></svg>
);
