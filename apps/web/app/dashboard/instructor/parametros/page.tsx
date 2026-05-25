'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Video, Users, CheckCircle2, Globe, Link as LinkIcon, Save, Loader2, Play, StopCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api-client';
import { cursosApi } from '@/lib/api/cursos';
import { Curso } from '@/types/training';
import ProfileSignatureUpload from '@/components/instructor/ProfileSignatureUpload';

export default function ParametrosPage() {
    const [claseUrl, setClaseUrl] = useState('');
    const [selectedCursoId, setSelectedCursoId] = useState('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSessions, setActiveSessions] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await cursosApi.listarCursos();
                setCursos(data);
                // En un sistema real, aquí cargaríamos las sesiones activas
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleActivateClass = async () => {
        if (!claseUrl || !selectedCursoId) {
            alert('Por favor selecciona un curso y pega un enlace válido.');
            return;
        }

        setIsSaving(true);
        try {
            // Buscamos el primer módulo del curso para asignarle el link (Lógica simplificada estilo Blister)
            const cursoDetail = await cursosApi.obtenerCurso(selectedCursoId);
            const firstModuloId = cursoDetail.modulos[0]?.id;

            if (firstModuloId) {
                await api.put(`/cursos/${selectedCursoId}/modulos/${firstModuloId}`, {
                    liveClassUrl: claseUrl
                });
                alert('¡Aula Virtual activada con éxito! Los alumnos ya pueden ver el banner.');
                setActiveSessions([{ id: selectedCursoId, url: claseUrl, nombre: cursoDetail.nombre }]);
            }
        } catch (error) {
            console.error('Error activation class:', error);
            alert('Hubo un error al activar el aula.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async (cursoId: string) => {
        setIsSaving(true);
        try {
            const cursoDetail = await cursosApi.obtenerCurso(cursoId);
            const firstModuloId = cursoDetail.modulos[0]?.id;
            if (firstModuloId) {
                await api.put(`/cursos/${cursoId}/modulos/${firstModuloId}`, {
                    liveClassUrl: null
                });
                setActiveSessions([]);
            }
        } catch (error) {
            console.error('Error deactivating:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Centro de Aula Virtual</h1>
                <p className="text-slate-800 mt-2">Gestiona tus clases en vivo por Google Meet o Microsoft Teams.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Configuration Card */}
                <Card className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <LinkIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold">Activar Clase en Vivo</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Seleccionar Capacitación</label>
                            <select 
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                value={selectedCursoId}
                                onChange={(e) => setSelectedCursoId(e.target.value)}
                            >
                                <option value="">Elegir curso...</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Enlace de la Videollamada</label>
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="https://meet.google.com/..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={claseUrl}
                                    onChange={(e) => setClaseUrl(e.target.value)}
                                />
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                                Tip: Puedes usar links de Google Meet, Microsoft Teams o Zoom. Se recomienda Google Meet para mayor estabilidad en VMP.
                            </p>
                        </div>

                        <Button 
                            className="w-full h-14 rounded-2xl shadow-lg shadow-primary/20" 
                            disabled={isSaving}
                            onClick={handleActivateClass}
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                            Iniciar Sesión en Vivo
                        </Button>
                    </div>
                </Card>

                {/* Status Card */}
                <div className="space-y-6">
                    <Card className="p-8 border-none bg-slate-900 text-white overflow-hidden relative">
                        {/* Status Pattern */}
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Video className="h-24 w-24" />
                        </div>

                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                            Monitor de Aula
                        </h3>

                        {activeSessions.length > 0 ? (
                            <div className="space-y-6">
                                {activeSessions.map((session: any) => (
                                    <div key={session.id} className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <div className="text-xs font-bold text-primary-light uppercase mb-1">Clase Activa en:</div>
                                        <div className="font-bold text-lg mb-4">{session.nombre}</div>
                                        
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10"
                                                onClick={() => window.open(session.url, '_blank')}
                                            >
                                                Ver Aula
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="bg-red-500 hover:bg-red-600 text-white border-0"
                                                onClick={() => handleDeactivate(session.id)}
                                            >
                                                Finalizar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Video className="h-12 w-12 text-white/20 mx-auto mb-4" />
                                <p className="text-white/50 text-sm">No hay sesiones activas en este momento.</p>
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 bg-primary/5 border-primary/20">
                        <h4 className="font-bold text-primary-dark text-sm mb-3">Recomendaciones:</h4>
                        <ul className="space-y-2">
                            {[
                                'Asegúrate de grabar la sesión para subirla después.',
                                'Los alumnos recibirán una alerta al activarse el link.',
                                'Finaliza la sesión al terminar para limpiar el dashboard del alumno.'
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <ProfileSignatureUpload />
                </div>
            </div>
        </div>
    );
}
