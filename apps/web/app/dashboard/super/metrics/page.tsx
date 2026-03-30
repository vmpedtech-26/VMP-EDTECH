'use client';

import { useEffect, useState } from 'react';
import {
    TrendingUp,
    Users,
    Building2,
    GraduationCap,
    Award,
    FileText,
    Loader2,
    Calendar,
    BarChart3
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
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

interface CourseMetrics {
    id: string;
    nombre: string;
    codigo: string;
    total_enrollments: number;
    total_credentials: number;
    completed_enrollments: number;
    completion_rate: number;
}

export default function MetricsPage() {
    const [overview, setOverview] = useState<OverviewMetrics | null>(null);
    const [courses, setCourses] = useState<CourseMetrics[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch overview metrics
            const overviewData = await api.get('/metrics/overview');
            setOverview(overviewData);

            // Fetch course metrics
            try {
                const coursesData = await api.get('/metrics/courses');
                setCourses(coursesData.courses);
            } catch (courseErr) {
                console.warn('Could not fetch course metrics:', courseErr);
            }

        } catch (err: any) {
            setError(err.message || 'Error al cargar métricas');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6 border-red-200 bg-red-50">
                <p className="text-red-800">{error}</p>
            </Card>
        );
    }

    if (!overview) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Dashboard de Métricas
                </h1>
                <p className="text-slate-700 mt-1">
                    Visualiza el rendimiento y estadísticas de la plataforma
                </p>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-6 border-none shadow-sm ring-1 ring-blue-100 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-700 uppercase">Usuarios</p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">{overview.totals.users}</p>
                        </div>
                        <Users className="h-10 w-10 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-purple-100 bg-purple-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-purple-700 uppercase">Empresas</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{overview.totals.companies}</p>
                        </div>
                        <Building2 className="h-10 w-10 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-green-100 bg-green-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-green-700 uppercase">Cursos</p>
                            <p className="text-3xl font-bold text-green-900 mt-1">{overview.totals.courses}</p>
                        </div>
                        <GraduationCap className="h-10 w-10 text-green-600" />
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-orange-100 bg-orange-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-orange-700 uppercase">Inscripciones</p>
                            <p className="text-3xl font-bold text-orange-900 mt-1">{overview.totals.enrollments}</p>
                        </div>
                        <FileText className="h-10 w-10 text-orange-600" />
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-yellow-100 bg-yellow-50/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-yellow-700 uppercase">Credenciales</p>
                            <p className="text-3xl font-bold text-yellow-900 mt-1">{overview.totals.credentials}</p>
                        </div>
                        <Award className="h-10 w-10 text-yellow-600" />
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-700 uppercase">Cotizaciones</p>
                            <p className="text-3xl font-bold text-slate-900 mt-1">{overview.totals.quotes}</p>
                        </div>
                        <BarChart3 className="h-10 w-10 text-slate-800" />
                    </div>
                </Card>
            </div>

            {/* Métricas de Conversión */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Conversión de Cotizaciones
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Pendientes</span>
                            <span className="text-2xl font-bold text-yellow-700">{overview.quotes.pending}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Contactados</span>
                            <span className="text-2xl font-bold text-blue-700">{overview.quotes.contacted}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Convertidos</span>
                            <span className="text-2xl font-bold text-green-700">{overview.quotes.converted}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Rechazados</span>
                            <span className="text-2xl font-bold text-red-700">{overview.quotes.rejected}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">Tasa de Conversión</span>
                                <span className="text-3xl font-bold text-primary">{overview.quotes.conversion_rate}%</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Estado de Inscripciones
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Activas</span>
                            <span className="text-2xl font-bold text-blue-700">{overview.enrollments.active}</span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700">Completadas</span>
                            <span className="text-2xl font-bold text-green-700">{overview.enrollments.completed}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">Tasa de Completitud</span>
                                <span className="text-3xl font-bold text-primary">{overview.enrollments.completion_rate}%</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="pt-4">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-primary to-primary-light h-4 rounded-full transition-all"
                                    style={{ width: `${overview.enrollments.completion_rate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Estadísticas por Curso */}
            {courses.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Estadísticas por Curso
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Curso</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Código</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Inscripciones</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Completadas</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Credenciales</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">% Completitud</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-sm font-medium text-slate-900">{course.nombre}</td>
                                        <td className="py-3 px-4 text-sm text-slate-800 text-center">{course.codigo}</td>
                                        <td className="py-3 px-4 text-sm text-slate-900 text-center font-semibold">{course.total_enrollments}</td>
                                        <td className="py-3 px-4 text-sm text-green-700 text-center font-semibold">{course.completed_enrollments}</td>
                                        <td className="py-3 px-4 text-sm text-blue-700 text-center font-semibold">{course.total_credentials}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${course.completion_rate >= 75 ? 'bg-green-100 text-green-800' :
                                                course.completion_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {course.completion_rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
