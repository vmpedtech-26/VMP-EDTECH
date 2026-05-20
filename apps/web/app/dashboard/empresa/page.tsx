'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Users, BookOpen, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeMetric {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    active_courses: int;
    completed_courses: int;
    credenciales: any[];
}

interface B2BMetrics {
    totalEmployees: number;
    activeCourses: number;
    completedCourses: number;
    expiringCredentials: number;
    employees: EmployeeMetric[];
}

export default function EmpresaDashboard() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [metrics, setMetrics] = useState<B2BMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.rol !== 'SUPERVISOR' && user?.rol !== 'SUPER_ADMIN' && user?.rol !== 'INSTRUCTOR' && !user?.empresaId) {
            router.push('/dashboard');
            return;
        }

        const fetchMetrics = async () => {
            try {
                const res = await api.get('/b2b/dashboard');
                setMetrics(res);
            } catch (error) {
                console.error('Error fetching B2B metrics', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, [isAuthenticated, user, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    if (!metrics) {
        return <div className="p-8 text-center text-gray-500">No se pudieron cargar las métricas de la empresa.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Panel de Empresa</h1>
                <p className="text-sm text-gray-500 mt-1">Supervisa el progreso de tu flota y las credenciales de tus colaboradores.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Colaboradores</p>
                        <h3 className="text-2xl font-bold text-gray-900">{metrics.totalEmployees}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><BookOpen className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Cursos Activos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{metrics.activeCourses}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Cursos Aprobados</p>
                        <h3 className="text-2xl font-bold text-gray-900">{metrics.completedCourses}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Próximos a Vencer</p>
                        <h3 className="text-2xl font-bold text-gray-900">{metrics.expiringCredentials}</h3>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Estado por Colaborador</h2>
                    <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary-dark font-medium px-3 py-2 border rounded-md">
                        <Download className="w-4 h-4" />
                        <span>Exportar Excel</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Colaborador</th>
                                <th className="px-6 py-3">DNI</th>
                                <th className="px-6 py-3 text-center">Cursos Activos</th>
                                <th className="px-6 py-3 text-center">Cursos Aprobados</th>
                                <th className="px-6 py-3">Estado Credenciales</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {metrics.employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{emp.nombre} {emp.apellido}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.dni}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {emp.active_courses}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {emp.completed_courses}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {emp.credenciales.length === 0 ? (
                                            <span className="text-gray-400 text-xs">Sin credenciales</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {emp.credenciales.map((c: any, i) => (
                                                    <span key={i} className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${c.is_expiring ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                        {c.numero} {c.is_expiring && '⚠️'}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {metrics.employees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No hay colaboradores registrados en tu empresa.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
