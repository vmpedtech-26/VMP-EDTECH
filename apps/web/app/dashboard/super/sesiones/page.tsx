'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, MapPin, Video, Users, CheckCircle, XCircle, AlertCircle, ChevronRight, X } from 'lucide-react';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { LiveClassHub } from '@/components/dashboard/LiveClassHub';

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
  empresaId?: string;
  empresaNombre?: string;
  instructorId?: string;
  instructorNombre?: string;
  totalAlumnos?: number;
  alumnosPresentes?: number;
}

interface Curso {
  id: string;
  nombre: string;
  modalidad: string;
  estado: string;
}

interface Empresa {
  id: string;
  nombre: string;
}

interface User {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: string;
  empresaId?: string;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PROGRAMADA: { label: 'Programada', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  EN_CURSO: { label: 'En Curso', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FINALIZADA: { label: 'Finalizada', color: 'bg-slate-100 text-slate-600', icon: CheckCircle },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const MODALIDAD_CONFIG: Record<string, { label: string; color: string }> = {
  ONLINE: { label: 'Online', color: 'bg-purple-100 text-purple-700' },
  IN_COMPANY: { label: 'In Company', color: 'bg-amber-100 text-amber-700' },
  HYBRID: { label: 'Híbrido', color: 'bg-teal-100 text-teal-700' },
};

export default function SesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [instructores, setInstructores] = useState<User[]>([]);
  const [allAlumnos, setAllAlumnos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');

  const [form, setForm] = useState({
    cursoId: '',
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    lugar: '',
    plataforma: 'presencial',
    meetLink: '',
    empresaId: '',
    instructorId: '',
    alumnosIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [sesRes, curRes, empRes, instRes, alRes] = await Promise.all([
        api.get('/sesiones'),
        api.get('/cursos'),
        api.get('/empresas'),
        api.get('/users?rol=INSTRUCTOR'),
        api.get('/users?rol=ALUMNO'),
      ]);
      setSesiones(Array.isArray(sesRes) ? sesRes : []);
      // Mostrar solo cursos publicados en la programación de sesiones
      const allCuts = Array.isArray(curRes) ? curRes : [];
      setCursos(allCuts.filter(c => c.estado === 'PUBLICADO'));
      setEmpresas(Array.isArray(empRes) ? empRes : []);
      setInstructores(Array.isArray(instRes) ? instRes : []);
      setAllAlumnos(Array.isArray(alRes) ? alRes : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function crearSesion() {
    if (!form.cursoId || !form.titulo || !form.fechaInicio || !form.fechaFin) return;
    setSaving(true);
    try {
      await api.post('/sesiones', {
        ...form,
        fechaInicio: new Date(form.fechaInicio).toISOString(),
        fechaFin: new Date(form.fechaFin).toISOString(),
      });
      setShowModal(false);
      setForm({ 
        cursoId: '', 
        titulo: '', 
        descripcion: '', 
        fechaInicio: '', 
        fechaFin: '', 
        lugar: '', 
        plataforma: 'presencial', 
        meetLink: '',
        empresaId: '',
        instructorId: '',
        alumnosIds: [],
      });
      toast.success('Sesión programada con éxito');
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Error al crear sesión');
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(id: string, estado: string) {
    try {
      await api.patch(`/sesiones/${id}`, { estado });
      toast.success(`Estado de la sesión actualizado a ${estado}`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar estado');
    }
  }

  const sesionesFiltered = sesiones.filter(s => {
    if (filtroEstado && s.estado !== filtroEstado) return false;
    if (filtroModalidad && s.cursoModalidad !== filtroModalidad) return false;
    return true;
  });

  const stats = {
    programadas: sesiones.filter(s => s.estado === 'PROGRAMADA').length,
    enCurso: sesiones.filter(s => s.estado === 'EN_CURSO').length,
    finalizadas: sesiones.filter(s => s.estado === 'FINALIZADA').length,
    totalAlumnos: sesiones.reduce((acc, s) => acc + (s.totalAlumnos || 0), 0),
  };

  const filteredAlumnos = allAlumnos.filter(a => !form.empresaId || a.empresaId === form.empresaId);
  const sesionEnCurso = sesiones.find(s => s.estado === 'EN_CURSO' && s.meetLink);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Sesiones de Capacitación</h1>
          <p className="text-slate-500 mt-1">Gestión de sesiones Online e In-Company programadas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>
      </div>

      {sesionEnCurso && (
        <LiveClassHub
          platform={sesionEnCurso.plataforma || null}
          url={sesionEnCurso.meetLink || null}
          date={sesionEnCurso.fechaInicio}
          courseName={sesionEnCurso.cursoNombre || sesionEnCurso.titulo}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Programadas', value: stats.programadas, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En Curso', value: stats.enCurso, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Finalizadas', value: stats.finalizadas, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Alumnos Totales', value: stats.totalAlumnos, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-white`}>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los estados</option>
          <option value="PROGRAMADA">Programadas</option>
          <option value="EN_CURSO">En Curso</option>
          <option value="FINALIZADA">Finalizadas</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
        <select
          value={filtroModalidad}
          onChange={e => setFiltroModalidad(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todas las modalidades</option>
          <option value="ONLINE">Online</option>
          <option value="IN_COMPANY">In Company</option>
          <option value="HYBRID">Híbrido</option>
        </select>
      </div>

      {/* Lista de sesiones */}
      {sesionesFiltered.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay sesiones programadas</p>
          <p className="text-slate-400 text-sm mt-1">Creá la primera sesión usando el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sesionesFiltered.map(sesion => {
            const estadoConf = ESTADO_CONFIG[sesion.estado] || ESTADO_CONFIG.PROGRAMADA;
            const modalidadConf = sesion.cursoModalidad ? MODALIDAD_CONFIG[sesion.cursoModalidad] : null;
            const Icon = estadoConf.icon;
            const fechaInicio = new Date(sesion.fechaInicio);
            const fechaFin = new Date(sesion.fechaFin);

            return (
              <div key={sesion.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${estadoConf.color}`}>
                        <Icon className="w-3 h-3" />
                        {estadoConf.label}
                      </span>
                      {modalidadConf && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${modalidadConf.color}`}>
                          {modalidadConf.label}
                        </span>
                      )}
                      {sesion.cursoNombre && (
                        <span className="text-xs text-slate-400 font-medium truncate">| Curso: {sesion.cursoNombre}</span>
                      )}
                      {sesion.empresaNombre && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          🏢 {sesion.empresaNombre}
                        </span>
                      )}
                      {sesion.instructorNombre && (
                        <span className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                          👤 Instructor: {sesion.instructorNombre}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg truncate">{sesion.titulo}</h3>
                    {sesion.descripcion && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{sesion.descripcion}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 flex-wrap text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {fechaInicio.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {fechaInicio.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        {' → '}
                        {fechaFin.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {sesion.lugar && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {sesion.lugar}
                        </span>
                      )}
                      {sesion.plataforma && sesion.plataforma !== 'presencial' && (
                        <span className="flex items-center gap-1.5">
                          <Video className="w-4 h-4" />
                          {sesion.plataforma}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {sesion.alumnosPresentes || 0}/{sesion.totalAlumnos || 0} presentes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sesion.meetLink && (
                      <a
                        href={sesion.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Unirse
                      </a>
                    )}
                    {sesion.estado === 'PROGRAMADA' && (
                      <button
                        onClick={() => cambiarEstado(sesion.id, 'EN_CURSO')}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Iniciar
                      </button>
                    )}
                    {sesion.estado === 'EN_CURSO' && (
                      <button
                        onClick={() => cambiarEstado(sesion.id, 'FINALIZADA')}
                        className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                      >
                        Finalizar
                      </button>
                    )}
                    {sesion.estado !== 'CANCELADA' && sesion.estado !== 'FINALIZADA' && (
                      <button
                        onClick={() => cambiarEstado(sesion.id, 'CANCELADA')}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Sesión */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Nueva Sesión de Capacitación</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Curso *</label>
                <select
                  value={form.cursoId}
                  onChange={e => setForm(f => ({ ...f, cursoId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                >
                  <option value="">Seleccioná un curso</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.modalidad})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Empresa Cliente (Opcional)</label>
                  <select
                    value={form.empresaId}
                    onChange={e => {
                      const empId = e.target.value;
                      setForm(f => ({ ...f, empresaId: empId, alumnosIds: [] }));
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  >
                    <option value="">Todas / Particular</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Instructor a cargo</label>
                  <select
                    value={form.instructorId}
                    onChange={e => setForm(f => ({ ...f, instructorId: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  >
                    <option value="">Usar instructor del curso</option>
                    {instructores.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.nombre} {inst.apellido}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Inscribir Alumnos ({filteredAlumnos.length})</label>
                <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-slate-50">
                  {filteredAlumnos.map(al => {
                    const isChecked = form.alumnosIds.includes(al.id);
                    return (
                      <label key={al.id} className="flex items-center gap-2 text-sm text-slate-750 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setForm(f => {
                              const ids = isChecked 
                                ? f.alumnosIds.filter(id => id !== al.id)
                                : [...f.alumnosIds, al.id];
                              return { ...f, alumnosIds: ids };
                            });
                          }}
                          className="rounded text-primary focus:ring-primary/30"
                        />
                        <span>{al.nombre} {al.apellido} ({al.dni})</span>
                      </label>
                    );
                  })}
                  {filteredAlumnos.length === 0 && (
                    <span className="text-xs text-slate-400 block py-2">No hay alumnos registrados para esta empresa</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Título de la sesión *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Módulo 1 - Introducción presencial"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Fecha y hora inicio *</label>
                  <input
                    type="datetime-local"
                    value={form.fechaInicio}
                    onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Fecha y hora fin *</label>
                  <input
                    type="datetime-local"
                    value={form.fechaFin}
                    onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Plataforma / Tipo</label>
                  <select
                    value={form.plataforma}
                    onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                    <option value="google_meet">Google Meet</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Lugar / Dirección</label>
                  <input
                    type="text"
                    value={form.lugar}
                    onChange={e => setForm(f => ({ ...f, lugar: e.target.value }))}
                    placeholder="Ej: Av. Corrientes 1234"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {form.plataforma !== 'presencial' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">Link de reunión</label>
                  <input
                    type="url"
                    value={form.meetLink}
                    onChange={e => setForm(f => ({ ...f, meetLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={crearSesion}
                disabled={saving || !form.cursoId || !form.titulo || !form.fechaInicio || !form.fechaFin}
                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creando...' : 'Crear Sesión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
