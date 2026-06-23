'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Video, Users, CheckSquare, Square, Save, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api-client';

interface Sesion {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  lugar?: string;
  plataforma?: string;
  meetLink?: string;
  estado: string;
  cursoNombre?: string;
  cursoModalidad?: string;
}

interface AsistenciaAlumno {
  alumnoId: string;
  nombre: string;
  apellido: string;
  dni: string;
  presente: boolean;
  notas?: string;
}

const ESTADO_BADGE: Record<string, string> = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  EN_CURSO: 'bg-green-100 text-green-800',
  FINALIZADA: 'bg-slate-100 text-slate-600',
  CANCELADA: 'bg-red-100 text-red-700',
};

export default function InstructorSesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<string | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaAlumno[]>([]);
  const [loadingSesiones, setLoadingSesiones] = useState(true);
  const [loadingAsistencia, setLoadingAsistencia] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetchSesiones();
  }, []);

  async function fetchSesiones() {
    try {
      // Cargar todas las sesiones del instructor
      const todas = await api.get('/sesiones');
      setSesiones(Array.isArray(todas) ? todas : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSesiones(false);
    }
  }

  async function fetchAsistencia(sesionId: string) {
    setLoadingAsistencia(true);
    try {
      const data = await api.get(`/sesiones/${sesionId}`);
      setAsistencias(data.asistencias || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAsistencia(false);
    }
  }

  function selectSesion(id: string) {
    setSesionSeleccionada(id);
    setGuardado(false);
    fetchAsistencia(id);
  }

  function togglePresente(alumnoId: string) {
    setAsistencias(prev =>
      prev.map(a => a.alumnoId === alumnoId ? { ...a, presente: !a.presente } : a)
    );
    setGuardado(false);
  }

  function toggleTodos() {
    const todosPresentes = asistencias.every(a => a.presente);
    setAsistencias(prev => prev.map(a => ({ ...a, presente: !todosPresentes })));
    setGuardado(false);
  }

  async function guardarAsistencia() {
    if (!sesionSeleccionada) return;
    setGuardando(true);
    try {
      await api.post(`/sesiones/${sesionSeleccionada}/asistencia`, {
        asistencias: asistencias.map(a => ({
          alumnoId: a.alumnoId,
          presente: a.presente,
          notas: a.notas,
        })),
      });
      setGuardado(true);
      fetchSesiones(); // Refresh stats
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  }

  const sesionActual = sesiones.find(s => s.id === sesionSeleccionada);
  const presentesCount = asistencias.filter(a => a.presente).length;

  if (loadingSesiones) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Mis Sesiones</h1>
        <p className="text-slate-500 mt-1">Gestioná la asistencia de tus capacitaciones programadas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Lista de sesiones */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Sesiones Asignadas</h2>
          {sesiones.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-medium">No tenés sesiones asignadas</p>
            </div>
          ) : (
            sesiones.map(sesion => {
              const fecha = new Date(sesion.fechaInicio);
              const isSelected = sesion.id === sesionSeleccionada;
              return (
                <button
                  key={sesion.id}
                  onClick={() => selectSesion(sesion.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-primary/5 border-primary/30 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ESTADO_BADGE[sesion.estado] || 'bg-slate-100 text-slate-600'}`}>
                          {sesion.estado}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 truncate text-sm">{sesion.titulo}</p>
                      {sesion.cursoNombre && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{sesion.cursoNombre}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                        {' · '}
                        {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-primary' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Panel de asistencia */}
        <div className="lg:col-span-3">
          {!sesionSeleccionada ? (
            <div className="flex items-center justify-center h-full min-h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">Seleccioná una sesión para gestionar la asistencia</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Header del panel */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="font-bold text-slate-900">{sesionActual?.titulo}</h3>
                <p className="text-sm text-slate-500">{sesionActual?.cursoNombre}</p>
                <div className="flex gap-4 mt-3 text-sm text-slate-600">
                  {sesionActual?.lugar && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {sesionActual.lugar}
                    </span>
                  )}
                  {sesionActual?.plataforma && sesionActual.plataforma !== 'presencial' && (
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-slate-400" />
                      {sesionActual.plataforma}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats de asistencia */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-primary">{presentesCount}</span>
                  <span className="text-slate-500 text-sm">/ {asistencias.length} alumnos presentes</span>
                </div>
                {asistencias.length > 0 && (
                  <button
                    onClick={toggleTodos}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    {asistencias.every(a => a.presente) ? 'Desmarcar todos' : 'Marcar todos'}
                  </button>
                )}
              </div>

              {/* Lista de alumnos */}
              {loadingAsistencia ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : asistencias.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No hay alumnos inscriptos en este curso
                </div>
              ) : (
                <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                  {asistencias.map(alumno => (
                    <div
                      key={alumno.alumnoId}
                      className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${alumno.presente ? 'bg-green-50/40' : ''}`}
                      onClick={() => togglePresente(alumno.alumnoId)}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                        alumno.presente
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300'
                      }`}>
                        {alumno.presente && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{alumno.nombre} {alumno.apellido}</p>
                        <p className="text-xs text-slate-400">DNI: {alumno.dni}</p>
                      </div>
                      {alumno.presente && (
                        <span className="text-xs text-green-600 font-semibold">✓ Presente</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Botón guardar */}
              {asistencias.length > 0 && (
                <div className="p-4 border-t border-slate-100">
                  <button
                    onClick={guardarAsistencia}
                    disabled={guardando}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold transition-all ${
                      guardado
                        ? 'bg-green-600 text-white'
                        : 'bg-primary text-white hover:bg-primary/90'
                    } disabled:opacity-50`}
                  >
                    <Save className="w-4 h-4" />
                    {guardando ? 'Guardando...' : guardado ? '✓ Asistencia guardada' : 'Guardar Asistencia'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
