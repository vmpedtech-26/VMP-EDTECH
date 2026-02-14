'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Settings,
    Database,
    Shield,
    Server,
    Globe,
    Cpu,
    HardDrive,
    Activity,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';

export default function SistemaPage() {
    const systemInfo = [
        { label: 'Versión API', value: '0.1.0-beta', icon: Server, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Base de Datos', value: 'PostgreSQL (Railway)', icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Frontend', value: 'Next.js (Vercel)', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Estado', value: 'Operativo', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const services = [
        { name: 'API Backend', url: 'https://api.vmp-edtech.com', status: 'online' },
        { name: 'Frontend Web', url: 'https://www.vmp-edtech.com', status: 'online' },
        { name: 'Base de Datos', url: 'Railway PostgreSQL', status: 'online' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sistema</h1>
                <p className="text-slate-700 mt-1">Información del sistema y estado de los servicios</p>
            </div>

            {/* System Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {systemInfo.map((info) => {
                    const Icon = info.icon;
                    return (
                        <Card key={info.label} className="p-6 border-none shadow-sm ring-1 ring-gray-100" hover={false}>
                            <div className="flex items-center gap-4">
                                <div className={`${info.bg} ${info.color} p-3 rounded-2xl`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{info.label}</p>
                                    <p className="text-lg font-bold text-slate-900">{info.value}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Services Status */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Estado de Servicios</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50" hover={false}>
                        {services.map((service) => (
                            <div key={service.name} className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="font-bold text-slate-900">{service.name}</p>
                                        <p className="text-xs text-slate-500">{service.url}</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </span>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Enlaces Rápidos</h2>
                    <Card className="border-none shadow-sm ring-1 ring-gray-100 divide-y divide-gray-50" hover={false}>
                        <a href="https://api.vmp-edtech.com/docs" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Server className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">API Docs (Swagger)</p>
                                    <p className="text-xs text-slate-500">Documentación interactiva de la API</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                        <a href="https://github.com/vmpedtech-26/VMP-EDTECH" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                    <Cpu className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Repositorio GitHub</p>
                                    <p className="text-xs text-slate-500">Código fuente del proyecto</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                        <a href="https://railway.com" target="_blank" rel="noopener noreferrer" className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <HardDrive className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Railway Dashboard</p>
                                    <p className="text-xs text-slate-500">Hosting y base de datos</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                    </Card>
                </div>
            </div>

            {/* Security */}
            <Card className="p-6 border-none shadow-sm ring-1 ring-emerald-100 bg-emerald-50/30" hover={false}>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-emerald-900">Seguridad del Sistema</h4>
                        <p className="text-xs text-emerald-700 mt-1">CORS configurado • JWT Auth activo • Rate limiting habilitado • HTTPS forzado</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
