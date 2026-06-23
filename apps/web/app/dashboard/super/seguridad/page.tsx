'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  UserX, 
  Lock, 
  RefreshCw, 
  ArrowLeft, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal, 
  Database, 
  Server, 
  Activity, 
  Sliders, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  FileText,
  Eye,
  FileCheck2
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { toast } from 'sonner';

interface SecurityMetrics {
  auth_success: number;
  auth_failure: number;
  access_denied: number;
  rate_limit_exceeded: number;
  sso_config_change: number;
  total_events: number;
}

interface SecurityLog {
  id: string;
  action: string;
  details: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  requestId: string | null;
  createdAt: string;
}

export default function SecurityDashboardPage() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  const fetchSecurityData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const data = await api.get('/admin/security/metrics');
      if (data) {
        setMetrics(data.metrics);
        setLogs(data.recent_logs || []);
      }
    } catch (err: any) {
      console.error('Error fetching security metrics:', err);
      setError(err.message || 'Error al conectar con la API de Ciberseguridad.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Request-ID copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'AUTH_SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'AUTH_FAILURE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACCESS_DENIED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'RATE_LIMIT_EXCEEDED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'SSO_CONFIG_CHANGE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'USER_ROLE_CHANGE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Filter logs locally
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      (log.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.ipAddress?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.details?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  // Paginate logs
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  // NICE Framework interactive assessment details
  const niceCategories = [
    {
      title: 'Oversight & Govern (Gobernanza)',
      color: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50/50 border-purple-100',
      badgeColor: 'bg-purple-100 text-purple-800',
      roles: ['Privacy Compliance', 'Audit', 'Security Policy', 'Legal Advice'],
      status: 'Cumplido',
      description: 'Políticas de privacidad y gobernanza corporativa.',
      details: 'Autenticación basada en roles estrictos en base de datos. Canal ético de denuncias (Ley 27.401) implementado y logueo inmutable de cambios de roles y SSO de empresas.',
      statusIcon: ShieldCheck
    },
    {
      title: 'Securely Provision (Diseño/Despliegue)',
      color: 'from-sky-400 to-blue-600',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50/50 border-sky-100',
      badgeColor: 'bg-sky-100 text-sky-800',
      roles: ['Secure Systems Development', 'Cybersecurity Architecture', 'Testing'],
      status: 'Óptimo',
      description: 'Ingeniería de software segura en el ciclo de vida.',
      details: 'Mitigación nativa de inyecciones SQL mediante consultas parametrizadas de Prisma ORM. Validación de esquemas estrictos con Pydantic en backend y TypeScript en frontend.',
      statusIcon: ShieldCheck
    },
    {
      title: 'Operate & Maintain (Operación)',
      color: 'from-blue-600 to-slate-800',
      textColor: 'text-slate-800',
      bgColor: 'bg-slate-50 border-slate-200',
      badgeColor: 'bg-slate-200 text-slate-800',
      roles: ['Database Administration', 'Network Operations', 'Security Analysis'],
      status: 'Activo',
      description: 'Gestión segura y monitoreo de la infraestructura.',
      details: 'Trazabilidad mediante inyección de Request-ID en la cabecera de todas las solicitudes de la API. Monitoreo de logs en Railway y control optimizado de pool de base de datos.',
      statusIcon: Activity
    },
    {
      title: 'Protect & Defend (Ciberdefensa)',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-800',
      bgColor: 'bg-amber-50/40 border-amber-100',
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['Incident Response', 'Defensive Cybersecurity', 'Vulnerability Analysis'],
      status: 'Activo / Defensa',
      description: 'Mitigación activa de ataques externos y abusos.',
      details: 'Rate limiting dinámico por dirección IP en endpoints críticos (Auth y Registro) usando slowapi. Detección automática y registro de ataques de fuerza bruta en los accesos.',
      statusIcon: ShieldAlert
    },
    {
      title: 'Investigate (Investigación)',
      color: 'from-yellow-700 to-amber-900',
      textColor: 'text-amber-900',
      bgColor: 'bg-yellow-50/30 border-yellow-150',
      badgeColor: 'bg-yellow-100 text-yellow-900',
      roles: ['Digital Evidence Analysis', 'Cybercrime Investigation'],
      status: 'Listo / Auditado',
      description: 'Auditoría forense y rastreo de incidentes.',
      details: 'Registro centralizado de evidencias forenses conteniendo IP origen, email del atacante, Request-ID y marcas de tiempo precisas para trazabilidad ante requerimientos legales.',
      statusIcon: FileCheck2
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="w-9 h-9 text-indigo-600 animate-pulse" />
            Centro de Operaciones de Seguridad (SOC)
          </h1>
          <p className="text-slate-500 mt-1">
            Análisis de arquitectura bajo el marco NICE Cybersecurity Framework y monitoreo de amenazas en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchSecurityData(false)}
            disabled={isRefreshing}
            className="rounded-xl flex items-center gap-2 border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href="/dashboard/super">
            <Button variant="outline" className="rounded-xl flex items-center gap-2 border-slate-200">
              <ArrowLeft className="w-4 h-4" />
              Panel de Control
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-white/40 rounded-3xl border border-slate-100">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Cargando métricas de ciberseguridad corporativa...</p>
        </div>
      ) : error ? (
        <Card className="p-6 border-red-200 bg-red-50 text-red-800 rounded-3xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-bold">Error de conexión con el módulo SOC</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => fetchSecurityData(true)} className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-xl">
            Reintentar Conexión
          </Button>
        </Card>
      ) : (
        <>
          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eventos de Seguridad (7d)</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics?.total_events || 0}</p>
                <span className="text-[10px] text-slate-400 block mt-1">Logs activos consolidados</span>
              </div>
              <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-100">
                <Terminal className="h-6 w-6" />
              </div>
            </Card>

            <Card className="p-6 border-none shadow-sm ring-1 ring-amber-100 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Logins Fallidos (7d)</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{metrics?.auth_failure || 0}</p>
                <span className="text-[10px] text-amber-500 block mt-1">Posibles intentos de fuerza bruta</span>
              </div>
              <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100">
                <UserX className="h-6 w-6" />
              </div>
            </Card>

            <Card className="p-6 border-none shadow-sm ring-1 ring-rose-100 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Bloqueos Rate Limit (7d)</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-1">{metrics?.rate_limit_exceeded || 0}</p>
                <span className="text-[10px] text-rose-500 block mt-1">IPs suspendidas por exceso de tráfico</span>
              </div>
              <div className="h-12 w-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100">
                <Lock className="h-6 w-6" />
              </div>
            </Card>

            <Card className="p-6 border-none shadow-sm ring-1 ring-blue-100 bg-white/80 backdrop-blur-md rounded-3xl flex items-center justify-between hover:shadow-md transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Cambios de SSO y Roles</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">{metrics?.sso_config_change || 0}</p>
                <span className="text-[10px] text-blue-400 block mt-1">Modificaciones en políticas corporativas</span>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                <Sliders className="h-6 w-6" />
              </div>
            </Card>
          </div>

          {/* NICE FRAMEWORK ARCHITECTURE ASSESSMENT */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-indigo-600" />
                Arquitectura de Seguridad VMP (Mapeo NICE Framework)
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Evaluación activa de la infraestructura de VMP frente a los roles claves del marco nacional de ciberseguridad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {niceCategories.map((cat, idx) => {
                const Icon = cat.statusIcon;
                return (
                  <Card key={idx} className={`p-5 rounded-3xl border ${cat.bgColor} flex flex-col justify-between hover:shadow-md transition-all duration-300`}>
                    <div className="space-y-4">
                      {/* Badge / Indicator */}
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${cat.badgeColor}`}>
                          {cat.status}
                        </span>
                        <Icon className={`h-5.5 w-5.5 ${idx === 3 && (metrics?.rate_limit_exceeded || 0) > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                      </div>
                      
                      {/* Title */}
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{cat.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{cat.description}</p>
                      </div>

                      {/* Framework Roles */}
                      <div className="border-t border-slate-100 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Roles Involucrados:</span>
                        <div className="flex flex-wrap gap-1">
                          {cat.roles.map((role, rIdx) => (
                            <span key={rIdx} className="text-[9px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* VMP Architecture Implementation details */}
                    <div className="mt-4 pt-3 border-t border-slate-150 text-[11px] text-slate-800 leading-normal">
                      <strong className="text-slate-900 block mb-1">Implementación VMP:</strong>
                      {cat.details}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* INCIDENT LOGS SOC CONSOLE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Terminal className="h-6 w-6 text-slate-700" />
                  Consola de Incidentes de Seguridad Activa
                </h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Logs en tiempo real de accesos sospechosos y acciones bloqueadas con trazabilidad X-Request-ID.
                </p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-150">
                {filteredLogs.length} incidentes filtrados
              </span>
            </div>

            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100 bg-white" hover={false}>
              {/* Search & Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por dirección IP, correo electrónico o detalles..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="w-full md:w-64 flex items-center gap-2">
                  <Filter className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                  <select
                    value={filterAction}
                    onChange={(e) => {
                      setFilterAction(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-800"
                  >
                    <option value="ALL">Todas las alertas</option>
                    <option value="AUTH_FAILURE">Inicios de sesión fallidos (Fuerza Bruta)</option>
                    <option value="ACCESS_DENIED">Accesos denegados (Privilegios)</option>
                    <option value="RATE_LIMIT_EXCEEDED">Bloqueos de Rate Limit</option>
                    <option value="SSO_CONFIG_CHANGE">Cambios en SSO / Roles</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-bold text-lg">Sin alertas activas</p>
                    <p className="text-slate-500 text-sm mt-1">No se encontraron anomalías con los criterios de búsqueda actuales.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="p-4">Fecha y Hora</th>
                        <th className="p-4">Origen IP</th>
                        <th className="p-4">Acción Alerta</th>
                        <th className="p-4">Detalle del Suceso</th>
                        <th className="p-4">Usuario Afectado</th>
                        <th className="p-4">Request ID (Forense)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm text-slate-700 bg-white">
                      {currentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap text-xs font-medium text-slate-500">
                            {new Date(log.createdAt).toLocaleString('es-AR', {
                              dateStyle: 'short',
                              timeStyle: 'medium'
                            })}
                          </td>
                          <td className="p-4 whitespace-nowrap text-xs font-mono text-slate-900 font-semibold">
                            {log.ipAddress || 'N/A'}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getActionBadgeClass(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-medium text-slate-900 max-w-xs truncate" title={log.details || ''}>
                            {log.details || 'N/A'}
                          </td>
                          <td className="p-4 font-semibold text-slate-900">
                            {log.userEmail || <span className="text-slate-400 italic">No identificado / Público</span>}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {log.requestId ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200 max-w-[130px] truncate" title={log.requestId}>
                                  {log.requestId}
                                </span>
                                <button
                                  onClick={() => handleCopy(log.requestId || '', log.id)}
                                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                  {copiedId === log.id ? <Check className="h-3.5 w-3.5 text-emerald-500 font-bold" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table Pagination */}
              {filteredLogs.length > logsPerPage && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="rounded-xl"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="rounded-xl"
                    >
                      Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
