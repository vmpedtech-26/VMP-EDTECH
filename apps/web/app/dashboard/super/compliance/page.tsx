'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldAlert, 
  Loader2, 
  FileText, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  CornerDownRight, 
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface DenunciaListItem {
  id: string;
  codigoSeguimiento: string;
  titulo: string;
  categoria: string;
  relacionEmpresa: string;
  esAnonima: boolean;
  estado: string;
  createdAt: string;
}

interface DenunciaDetail {
  id: string;
  codigoSeguimiento: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  relacionEmpresa: string;
  esAnonima: boolean;
  nombreDenunciante: string | null;
  emailDenunciante: string | null;
  telefono: string | null;
  estado: string;
  comentariosOficial: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ComplianceAdminPage() {
  const [reports, setReports] = useState<DenunciaListItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<DenunciaDetail | null>(null);
  
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [filterCategoria, setFilterCategoria] = useState<string>('TODAS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Formulario de edición
  const [editEstado, setEditEstado] = useState('NUEVA');
  const [editComentarios, setEditComentarios] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await api.get('/compliance/admin/reports');
      setReports(data);
    } catch (error) {
      console.error('Error fetching compliance reports:', error);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const loadDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const data = await api.get(`/compliance/admin/reports/${id}`);
      setSelectedReport(data);
      setSelectedReportId(id);
      setEditEstado(data.estado);
      setEditComentarios(data.comentariosOficial || '');
    } catch (error: any) {
      console.error('Error loading report detail:', error);
      setErrorMsg('No se pudo cargar el detalle de la denuncia.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    setIsUpdating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const data = await api.patch(`/compliance/admin/reports/${selectedReportId}`, {
        estado: editEstado,
        comentariosOficial: editComentarios
      });

      setSelectedReport(data);
      setSuccessMsg('Estado y resolución guardados correctamente.');
      
      // Actualizar en el listado local sin refrescar completo
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReportId ? { ...r, estado: editEstado } : r))
      );
    } catch (error: any) {
      console.error('Error updating report:', error);
      setErrorMsg(error.message || 'Error al actualizar el reporte.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'EN_INVESTIGACION':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'RESUELTA':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DESESTIMADA':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'Nueva';
      case 'EN_INVESTIGACION':
        return 'En Investigación';
      case 'RESUELTA':
        return 'Resuelta';
      case 'DESESTIMADA':
        return 'Desestimada';
      default:
        return estado;
    }
  };

  // Filtrado
  const filteredReports = reports.filter((r) => {
    const matchCat = filterCategoria === 'TODAS' || r.categoria === filterCategoria;
    const matchEst = filterEstado === 'TODOS' || r.estado === filterEstado;
    const matchSearch =
      r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.codigoSeguimiento.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchEst && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Canal de Denuncias (Compliance)
          </h1>
          <p className="text-slate-500 mt-1">
            Gestión y seguimiento ético corporativo - Cumplimiento Ley 27.401
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchReports}
            className="rounded-xl flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
          <Link href="/dashboard/super">
            <Button variant="outline" className="rounded-xl flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {selectedReportId && selectedReport ? (
        /* VISTA DETALLE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Información de la Denuncia */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              
              {/* Encabezado Detalle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedReportId(null)}
                    className="p-0 hover:bg-transparent text-slate-500 hover:text-slate-900 mb-2 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al listado
                  </Button>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Código de Seguimiento</p>
                  <h2 className="text-2xl font-bold font-mono text-primary mt-0.5">{selectedReport.codigoSeguimiento}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Estado Actual:</span>
                  <span className={`px-4 py-1.5 rounded-full border text-xs font-bold ${getStatusBadgeClass(selectedReport.estado)}`}>
                    {getStatusLabel(selectedReport.estado)}
                  </span>
                </div>
              </div>

              {/* Contenido / Hechos */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Título del Reporte</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedReport.titulo}</h3>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Descripción Detallada</span>
                  <div className="bg-slate-50 rounded-2xl p-5 mt-2 border border-slate-100 text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedReport.descripcion}
                  </div>
                </div>
              </div>

              {/* Datos del Denunciante / Anonimato */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-5 h-5 text-slate-500" />
                  <h4 className="font-bold text-slate-900">Información del Denunciante</h4>
                </div>
                {selectedReport.esAnonima ? (
                  <p className="text-sm text-slate-500 font-semibold italic flex items-center gap-1">
                    🚫 Denuncia Anónima
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Nombre</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.nombreDenunciante || 'No indicado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Email de Contacto</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.emailDenunciante || 'No indicado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Teléfono</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedReport.telefono || 'No indicado'}</p>
                    </div>
                  </div>
                )}
                <div className="pt-2 text-xs text-slate-400">
                  <strong>Relación con la Empresa:</strong> {selectedReport.relacionEmpresa}
                </div>
              </div>

              {/* Fechas */}
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Registrado el {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
                <span>Última actualización: {new Date(selectedReport.updatedAt).toLocaleString()}</span>
              </div>
            </Card>
          </div>

          {/* Columna Derecha: Formulario de Gestión / Comentarios */}
          <div>
            <Card className="rounded-3xl p-6 border border-slate-100 space-y-6 bg-slate-50 shadow-inner">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Seguimiento y Notas
              </h3>
              
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-semibold">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label htmlFor="edit_estado" className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Actualizar Estado
                  </label>
                  <select
                    id="edit_estado"
                    value={editEstado}
                    onChange={(e) => setEditEstado(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="NUEVA">Nueva</option>
                    <option value="EN_INVESTIGACION">En Investigación</option>
                    <option value="RESUELTA">Resuelta</option>
                    <option value="DESESTIMADA">Desestimada</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit_comentarios" className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                    Resolución / Comentario Público
                  </label>
                  <textarea
                    id="edit_comentarios"
                    rows={6}
                    value={editComentarios}
                    onChange={(e) => setEditComentarios(e.target.value)}
                    placeholder="Escribe el comentario público o resolución que verá el denunciante en el canal de seguimiento..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    * Este comentario es público para el denunciante al ingresar su código de seguimiento.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full rounded-xl py-3 font-semibold shadow-md shadow-primary/10 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>

        </div>
      ) : (
        /* VISTA LISTADO GENERAL */
        <div className="space-y-6">
          
          {/* Barra de Filtros */}
          <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-inner">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código o título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-950 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 flex-1 md:flex-initial">
                <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-950 focus:outline-none"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  <option value="FRAUDE">Fraude / Caja</option>
                  <option value="ACOSO">Acoso</option>
                  <option value="SEGURIDAD">Seguridad</option>
                  <option value="CORRUPCION">Corrupción</option>
                  <option value="OTROS">Otros</option>
                </select>
              </div>
              <div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-950 focus:outline-none"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="NUEVA">Nuevas</option>
                  <option value="EN_INVESTIGACION">En Investigación</option>
                  <option value="RESUELTA">Resueltas</option>
                  <option value="DESESTIMADA">Desestimadas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Denuncias */}
          {isLoadingList ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No se encontraron denuncias</h3>
              <p className="text-sm text-slate-500 mt-1">Intenta ajustando los criterios de búsqueda o filtros.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Código</th>
                      <th className="py-4 px-6">Título</th>
                      <th className="py-4 px-6">Categoría</th>
                      <th className="py-4 px-6">Relación</th>
                      <th className="py-4 px-6">Tipo</th>
                      <th className="py-4 px-6">Estado</th>
                      <th className="py-4 px-6">Fecha</th>
                      <th className="py-4 px-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">{r.codigoSeguimiento}</td>
                        <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">{r.titulo}</td>
                        <td className="py-4 px-6 font-medium text-slate-500">{r.categoria}</td>
                        <td className="py-4 px-6 text-slate-500 text-xs">{r.relacionEmpresa}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.esAnonima ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-700'
                          }`}>
                            {r.esAnonima ? 'Anónima' : 'Nominativa'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeClass(r.estado)}`}>
                            {getStatusLabel(r.estado)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-xs">
                          {new Date(r.createdAt).toLocaleDateString('es-AR')}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => loadDetail(r.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-primary flex items-center gap-1 ml-auto"
                          >
                            <span>Gestionar</span>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
