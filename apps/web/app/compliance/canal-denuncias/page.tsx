'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Send, 
  Search, 
  CheckCircle2, 
  Copy, 
  AlertTriangle, 
  FileText, 
  UserX, 
  Info, 
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api-client';

export default function CanalDenunciasPage() {
  const [activeTab, setActiveTab] = useState<'crear' | 'consultar'>('crear');
  
  // Estados para creación
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('FRAUDE');
  const [relacionEmpresa, setRelacionEmpresa] = useState('ANONIMO');
  const [esAnonima, setEsAnonima] = useState(true);
  const [nombreDenunciante, setNombreDenunciante] = useState('');
  const [emailDenunciante, setEmailDenunciante] = useState('');
  const [telefono, setTelefono] = useState('');
  
  const [crearError, setCrearError] = useState<string | null>(null);
  const [crearSuccessData, setCrearSuccessData] = useState<{ codigoSeguimiento: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Estados para consulta
  const [codigoBuscar, setCodigoBuscar] = useState('');
  const [consultaError, setConsultaError] = useState<string | null>(null);
  const [consultaResult, setConsultaResult] = useState<{
    codigoSeguimiento: string;
    categoria: string;
    estado: string;
    comentariosOficial: string | null;
    createdAt: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrearError(null);
    setCrearSuccessData(null);
    setIsSubmitting(true);

    if (!titulo.trim() || !descripcion.trim()) {
      setCrearError('El título y la descripción son campos obligatorios.');
      setIsSubmitting(false);
      return;
    }

    if (!esAnonima && !nombreDenunciante.trim() && !emailDenunciante.trim()) {
      setCrearError('Si tu reporte no es anónimo, por favor proporciona al menos un nombre o email de contacto.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/compliance/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descripcion,
          categoria,
          relacionEmpresa,
          esAnonima,
          nombreDenunciante: esAnonima ? null : nombreDenunciante,
          emailDenunciante: esAnonima ? null : emailDenunciante,
          telefono: esAnonima ? null : telefono
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al registrar el reporte.');
      }

      const data = await response.json();
      setCrearSuccessData(data);
      // Reset form
      setTitulo('');
      setDescripcion('');
      setNombreDenunciante('');
      setEmailDenunciante('');
      setTelefono('');
    } catch (err: any) {
      setCrearError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultaError(null);
    setConsultaResult(null);
    setIsSearching(true);

    if (!codigoBuscar.trim()) {
      setConsultaError('Ingresa un código de seguimiento válido.');
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/compliance/report/${codigoBuscar.trim().toUpperCase()}`);
      if (!response.ok) {
        throw new Error('No se encontró ninguna denuncia asociada a ese código. Verifica que esté bien escrito.');
      }

      const data = await response.json();
      setConsultaResult(data);
    } catch (err: any) {
      setConsultaError(err.message || 'Error al consultar el reporte.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_INVESTIGACION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESUELTA':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DESESTIMADA':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'NUEVA':
        return 'Reportada (Nueva)';
      case 'EN_INVESTIGACION':
        return 'En Investigación Preliminar';
      case 'RESUELTA':
        return 'Resuelta / Concluida';
      case 'DESESTIMADA':
        return 'Desestimada';
      default:
        return estado;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-teal-500/10 rounded-2xl mb-4 border border-teal-500/20">
            <ShieldAlert className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent sm:text-5xl">
            Canal de Integridad y Cumplimiento
          </h1>
          <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">
            Canal confidencial y seguro para reportar irregularidades, fraudes o comportamientos contrarios a la ética (Ley N° 27.401).
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-slate-800 mb-8 bg-slate-950/40 p-1 rounded-lg backdrop-blur-md">
          <button
            onClick={() => {
              setActiveTab('crear');
              setConsultaResult(null);
              setConsultaError(null);
            }}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
              activeTab === 'crear'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Crear Nuevo Reporte
          </button>
          <button
            onClick={() => {
              setActiveTab('consultar');
              setCrearSuccessData(null);
              setCrearError(null);
            }}
            className={`flex-1 py-3 text-center font-medium rounded-md transition-all ${
              activeTab === 'consultar'
                ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Seguimiento de Reporte
          </button>
        </div>

        {/* Contenedor Principal */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {activeTab === 'crear' ? (
            <div>
              {crearSuccessData ? (
                /* Éxito Creación */
                <div className="space-y-6 text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">¡Reporte Enviado con Éxito!</h2>
                  
                  <p className="text-slate-300 max-w-md mx-auto">
                    Tu denuncia ha sido registrada de forma segura. Guarda el siguiente código para poder realizar consultas futuras de forma anónima:
                  </p>

                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-6 max-w-lg mx-auto flex items-center justify-between gap-4 shadow-inner">
                    <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Código de Seguimiento</p>
                      <p className="text-2xl font-mono font-bold text-teal-400 select-all tracking-wider">
                        {crearSuccessData.codigoSeguimiento}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(crearSuccessData.codigoSeguimiento)}
                      className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 max-w-lg mx-auto flex gap-3 text-left">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-yellow-200">Aviso Crítico de Privacidad</h4>
                      <p className="text-xs text-yellow-100/80 mt-1">
                        Por razones de seguridad y anonimato absoluto, VMP no almacena cookies ni vínculos con tu perfil personal. Si pierdes este código, **no habrá forma de recuperar el acceso** ni ver los comentarios del Oficial de Cumplimiento.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => setCrearSuccessData(null)}
                      className="bg-teal-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
                    >
                      Realizar Otro Reporte
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulario de Registro */
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="border-b border-slate-800 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-6 h-6 text-teal-400" />
                      Formulario de Denuncia
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Completa los detalles de tu reporte con la mayor precisión posible.
                    </p>
                  </div>

                  {crearError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{crearError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categoría */}
                    <div>
                      <label htmlFor="categoria" className="block text-sm font-medium text-slate-300 mb-2">
                        Categoría del Reporte
                      </label>
                      <select
                        id="categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="FRAUDE">Fraude Financiero / Desvío de Fondos</option>
                        <option value="ACOSO">Acoso o Discriminación Laboral</option>
                        <option value="SEGURIDAD">Incumplimiento de Normas de Seguridad</option>
                        <option value="CORRUPCION">Sobornos / Conflicto de Intereses</option>
                        <option value="OTROS">Otro Incumplimiento Ético</option>
                      </select>
                    </div>

                    {/* Relación con VMP */}
                    <div>
                      <label htmlFor="relacion" className="block text-sm font-medium text-slate-300 mb-2">
                        Tu Relación con la Empresa
                      </label>
                      <select
                        id="relacion"
                        value={relacionEmpresa}
                        onChange={(e) => setRelacionEmpresa(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="ANONIMO">Prefiero no especificar</option>
                        <option value="EMPLEADO">Empleado / Colaborador</option>
                        <option value="PROVEEDOR">Proveedor / Contratista</option>
                        <option value="CLIENTE">Cliente / Alumno</option>
                        <option value="EXTERNO">Tercero Externo</option>
                      </select>
                    </div>
                  </div>

                  {/* Switch Anonimato */}
                  <div className="bg-slate-900/50 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-teal-400" />
                        ¿Deseas realizar esta denuncia de forma anónima?
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Si decides identificarte, solo el Oficial de Cumplimiento tendrá acceso a tus datos para contactarte.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${esAnonima ? 'text-teal-400 font-bold' : 'text-slate-400'}`}>
                        {esAnonima ? 'Sí, Anónima' : 'No, Nominativa'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEsAnonima(!esAnonima)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          esAnonima ? 'bg-teal-500' : 'bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            esAnonima ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Campos Nominativos */}
                  {!esAnonima && (
                    <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4 animate-fadeIn">
                      <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">Datos del Denunciante</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="nombre" className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre Completo</label>
                          <input
                            type="text"
                            id="nombre"
                            value={nombreDenunciante}
                            onChange={(e) => setNombreDenunciante(e.target.value)}
                            placeholder="Ej: Pedro Perez"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase mb-1">Correo Electrónico</label>
                          <input
                            type="email"
                            id="email"
                            value={emailDenunciante}
                            onChange={(e) => setEmailDenunciante(e.target.value)}
                            placeholder="pedro@ejemplo.com"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="telefono" className="block text-xs font-semibold text-slate-400 uppercase mb-1">Teléfono (Opcional)</label>
                          <input
                            type="text"
                            id="telefono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            placeholder="+54 9 11 ..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Título de la denuncia */}
                  <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-slate-300 mb-2">
                      Título Resumido del Reporte
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Irregularidad detectada en el manejo de caja menor"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-slate-300 mb-2">
                      Descripción Detallada de los Hechos
                    </label>
                    <textarea
                      id="descripcion"
                      rows={5}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Por favor, describe los hechos con fecha, lugar, personas involucradas y cualquier otro dato relevante..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>Cargando...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar Reporte de Forma Segura</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Seguimiento / Consulta */
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6 text-teal-400" />
                  Estado de tu Denuncia
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Ingresa tu código de seguimiento para comprobar el estado y las respuestas de tu reporte.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={codigoBuscar}
                    onChange={(e) => setCodigoBuscar(e.target.value)}
                    placeholder="VMP-COMP-XXXXXX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="bg-teal-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-teal-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? 'Buscando...' : 'Consultar'}
                </button>
              </form>

              {consultaError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{consultaError}</span>
                </div>
              )}

              {/* Resultado Consulta */}
              {consultaResult && (
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
                  
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Código de Consulta</p>
                      <h3 className="text-xl font-bold font-mono text-teal-400 mt-0.5">{consultaResult.codigoSeguimiento}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 mr-1 font-semibold">Estado:</span>
                      <span className={`px-4 py-1.5 rounded-full border text-xs font-bold ${getStatusBadgeClass(consultaResult.estado)}`}>
                        {getStatusLabel(consultaResult.estado)}
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Categoría del Reporte</p>
                      <p className="text-base font-semibold text-slate-200">{consultaResult.categoria}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Fecha de Registro</p>
                      <p className="text-base font-semibold text-slate-200">
                        {new Date(consultaResult.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Notas del Oficial */}
                  <div>
                    <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3">
                      Resolución / Respuesta del Oficial de Cumplimiento
                    </h4>
                    {consultaResult.comentariosOficial ? (
                      <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 text-slate-200">
                        <p className="whitespace-pre-line leading-relaxed">{consultaResult.comentariosOficial}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex items-start gap-3 text-slate-400">
                        <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          El Oficial de Cumplimiento ha recibido tu reporte y se encuentra en etapa de evaluación. El estado se actualizará a medida que progrese la investigación.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info Ley 27.401 */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-2">
          <p>Este canal de integridad opera en conformidad con la Ley de Responsabilidad Penal de las Personas Jurídicas N° 27.401.</p>
          <p>
            VMP - EDTECH garantiza el anonimato absoluto mediante inmutabilidad criptográfica de base de datos.
          </p>
          <div className="pt-2">
            <Link href="/" className="text-teal-400 hover:text-teal-300 hover:underline">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
