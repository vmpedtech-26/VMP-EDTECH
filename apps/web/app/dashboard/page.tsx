'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BookOpen, Award, TrendingUp, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { examenesApi } from '@/lib/api/examenes';
import { MisCursosResponse, Credencial } from '@/types/training';
import { CardCredencial } from '@/components/dashboard/CardCredencial';

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<MisCursosResponse | null>(null);
    const [credenciales, setCredenciales] = useState<Credencial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cursosRes, credRes] = await Promise.all([
                    inscripcionesApi.misCursos(),
                    examenesApi.misCredenciales(),
                ]);
                setData(cursosRes);
                setCredenciales(credRes);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    const stats = data?.stats || {
        cursosActivos: 0,
        cursosCompletados: 0,
        credencialesObtenidas: 0,
        horasAcumuladas: 0,
    };

    const cursosActivos = data?.cursos || [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="glass-card p-6 rounded-2xl">
                <h1 className="text-3xl font-heading font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-800 mt-2">
                    Bienvenido de vuelta, <span className="font-semibold gradient-text">{user?.nombre || 'Estudiante'}</span>!
                    Aquí está tu progreso de capacitación.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-primary to-primary-light rounded-xl">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold gradient-text">
                                {stats.cursosActivos}
                            </div>
                            <div className="text-sm text-slate-800">Cursos Activos</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-success to-success-light rounded-xl">
                            <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-success">
                                {stats.credencialesObtenidas}
                            </div>
                            <div className="text-sm text-slate-800">Credenciales</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-accent-amber to-warning rounded-xl">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-accent-amber">
                                {stats.cursosCompletados}
                            </div>
                            <div className="text-sm text-slate-800">Completados</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-secondary to-secondary-light rounded-xl">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-secondary">
                                {stats.horasAcumuladas}h
                            </div>
                            <div className="text-sm text-slate-800">Total Horas</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cursos Activos */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-slate-900">Mis Cursos Activos</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/cursos">Ver Todos</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {cursosActivos.map((curso) => (
                        <Card key={curso.id}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {curso.nombre}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-slate-800">
                                        <span>Progreso: {curso.progreso}%</span>
                                        <span>•</span>
                                        <span>Próximo: {curso.proximaActividad}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5">
                                        <div
                                            className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${curso.progreso}%` }}
                                        />
                                    </div>
                                </div>

                                <Button size="sm" asChild>
                                    <Link href={`/dashboard/cursos/${curso.id}`}>
                                        Continuar
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Credenciales Recientes */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-slate-900">
                        Credenciales Recientes
                    </h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/credenciales">Ver Todas</Link>
                    </Button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {credenciales.length > 0 ? (
                        credenciales.slice(0, 3).map((cre) => (
                            <CardCredencial key={cre.id} credencial={cre} />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center glass-card rounded-2xl border-2 border-dashed border-slate-200">
                            <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-800">
                                Aún no tienes credenciales generadas.
                                <br /> Completa un curso para obtener la tuya.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
