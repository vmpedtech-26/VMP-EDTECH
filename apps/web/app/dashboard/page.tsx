'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { BookOpen, Award, TrendingUp, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { inscripcionesApi } from '@/lib/api/inscripciones';
import { examenesApi } from '@/lib/api/examenes';
import { MisCursosResponse, Credencial } from '@/types/training';
import { CardCredencial } from '@/components/dashboard/CardCredencial';
import { PhotoCaptureModal } from '@/components/dashboard/PhotoCaptureModal';
import { fotosCredencialApi, FotoCredencial } from '@/lib/api/fotos-credencial';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<MisCursosResponse | null>(null);
    const [credenciales, setCredenciales] = useState<Credencial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [foto, setFoto] = useState<FotoCredencial | null | undefined>(undefined);

    useEffect(() => {
        // Autoredirección según el rol del usuario a su panel de gestión correspondiente
        if (user) {
            if (user.rol === 'SUPER_ADMIN') {
                router.replace('/dashboard/super');
                return;
            }
            if (user.rol === 'EMPRESA') {
                router.replace('/dashboard/empresa');
                return;
            }
            if (user.rol === 'INSTRUCTOR') {
                router.replace('/dashboard/instructor');
                return;
            }
            if (user.rol === 'CONTADOR') {
                router.replace('/dashboard/super/contabilidad');
                return;
            }
            // ALUMNO: sigue de largo y ve su propio dashboard (fetchData abajo)
        } else {
            router.replace('/auth/login');
            return;
        }

        const alumnoId = user.id;
        const fetchData = async () => {
            try {
                const [cursosRes, credRes, fotoRes] = await Promise.all([
                    inscripcionesApi.misCursos(),
                    examenesApi.misCredenciales(),
                    fotosCredencialApi.miFoto(alumnoId),
                ]);
                setData(cursosRes);
                setCredenciales(credRes);
                setFoto(fotoRes);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, router]);

    const requiereFoto = foto === null || foto?.estado === 'RECHAZADA';

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="space-y-3">
                    <div className="h-8 w-64 bg-slate-200 rounded-lg" />
                    <div className="h-4 w-96 bg-slate-100 rounded-lg" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg" />
                            <div className="space-y-2 flex-1">
                                <div className="h-6 w-16 bg-slate-200 rounded" />
                                <div className="h-3 w-24 bg-slate-100 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Course List Skeleton */}
                <div className="space-y-4">
                    <div className="h-7 w-48 bg-slate-200 rounded-lg mb-4" />
                    {[1, 2].map((i) => (
                        <div key={i} className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                            <div className="h-5 w-3/4 bg-slate-200 rounded" />
                            <div className="h-4 w-1/2 bg-slate-100 rounded" />
                            <div className="w-full bg-slate-100 h-2 rounded-full mt-4" />
                        </div>
                    ))}
                </div>
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
        <>
            {requiereFoto && user && (
                <PhotoCaptureModal
                    alumnoId={user.id}
                    feedback={foto?.estado === 'RECHAZADA' ? foto.feedback : null}
                    onUploaded={async () => setFoto(await fotosCredencialApi.miFoto(user.id))}
                />
            )}
            <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Bienvenido de vuelta, <span className="font-semibold">{user?.nombre || 'Estudiante'}</span>!
                    Aquí está tu progreso de capacitación.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.cursosActivos}
                            </div>
                            <div className="text-sm text-gray-600">Cursos Activos</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-success/10 rounded-lg">
                            <Award className="h-6 w-6 text-success" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.credencialesObtenidas}
                            </div>
                            <div className="text-sm text-gray-600">Credenciales</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-warning/10 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-warning" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.cursosCompletados}
                            </div>
                            <div className="text-sm text-gray-600">Completados</div>
                        </div>
                    </div>
                </Card>

                <Card hover={false}>
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-secondary/10 rounded-lg">
                            <Clock className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.horasAcumuladas}h
                            </div>
                            <div className="text-sm text-gray-600">Total Horas</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Cursos Activos */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Mis Cursos Activos</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/cursos">Ver Todos</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {cursosActivos.map((curso) => (
                        <Card key={curso.id}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {curso.nombre}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span>Progreso: {curso.progreso}%</span>
                                        <span>•</span>
                                        <span>Próximo: {curso.proximaActividad}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-500"
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
                    <h2 className="text-2xl font-bold text-gray-900">
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
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                                Aún no tienes credenciales generadas.
                                <br /> Completa un curso para obtener la tuya.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </>
    );
}
