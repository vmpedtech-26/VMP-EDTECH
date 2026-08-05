'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';

function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function CapacitacionesDashboard() {
  const [pending, setPending] = useState<any>({ pendingEssayGrades: 0, complianceGaps: 0, clientTrainingRequests: 0, total: 0 });
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/capacitaciones/pending-actions`, { headers: h }).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/capacitaciones/overview`, { headers: h }).then(r => r.json()).catch(() => null),
    ]).then(([p, o]) => {
      setPending(p);
      setOverview(o);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="atlas-loading"><div className="atlas-spinner" /></div>;

  return (
    <div>
      <div className="atlas-page-header">
        <div>
          <div className="atlas-page-title">Dashboard de Capacitaciones</div>
          <div className="atlas-page-subtitle">Resumen general y acciones pendientes</div>
        </div>
        <button className="atlas-btn atlas-btn--ghost" onClick={() => window.location.reload()}>
          <span className="material-icons" style={{fontSize:16}}>refresh</span>
          Recargar
        </button>
      </div>

      {/* Pending Actions */}
      {pending.total > 0 && (
        <div className="atlas-card" style={{marginBottom:24, borderLeft:'3px solid #F59E0B'}}>
          <div className="atlas-card__body" style={{padding:'16px 20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <span className="material-icons" style={{color:'#F59E0B',fontSize:20}}>pending_actions</span>
              <strong style={{fontSize:15}}>Tenés {pending.total} acción{pending.total !== 1 ? 'es' : ''} pendiente{pending.total !== 1 ? 's' : ''}</strong>
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:13,color:'#64748B',marginTop:8}}>
              {pending.pendingEssayGrades > 0 && <span>• {pending.pendingEssayGrades} fotos pendientes de evaluación</span>}
              {pending.clientTrainingRequests > 0 && <Link href="/admin/capacitaciones/clientes/solicitudes" style={{color:'#3AAFA9'}}>• {pending.clientTrainingRequests} solicitudes de clientes</Link>}
              {pending.complianceGaps > 0 && <span>• {pending.complianceGaps} capacitaciones en progreso</span>}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      {overview && (
        <div className="atlas-stats-grid">
          {[
            { icon: 'school', label: 'Cursos activos', value: overview.cursos, color: 'primary' },
            { icon: 'business', label: 'Empresas clientes', value: overview.empresas, color: 'info', href: '/admin/capacitaciones/clientes' },
            { icon: 'groups', label: 'Alumnos activos', value: overview.alumnos, color: 'success', href: '/admin/hr/employees' },
            { icon: 'assignment_turned_in', label: 'Inscripciones totales', value: overview.inscripciones, color: 'warning' },
            { icon: 'workspace_premium', label: 'Credenciales emitidas', value: overview.credenciales, color: 'success' },
            { icon: 'trending_up', label: 'Tasa de compleción', value: `${overview.tasaComplecion}%`, color: 'primary' },
          ].map(stat => (
            <div key={stat.label} className="atlas-stat">
              <div className={`atlas-stat__icon atlas-stat__icon--${stat.color}`}>
                <span className="material-icons">{stat.icon}</span>
              </div>
              <div className="atlas-stat__value">{stat.value}</div>
              <div className="atlas-stat__label">{stat.label}</div>
              {stat.href && <Link href={stat.href} className="atlas-stat__action">Ver detalle <span className="material-icons" style={{fontSize:12}}>arrow_forward</span></Link>}
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="atlas-card">
        <div className="atlas-card__header">
          <span className="atlas-card__title">Accesos rápidos</span>
        </div>
        <div className="atlas-card__body" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
          {[
            { href: '/admin/capacitaciones/catalogo', icon: 'school', label: 'Ver catálogo' },
            { href: '/admin/capacitaciones/catalogo/sessions', icon: 'event', label: 'Ver agenda' },
            { href: '/admin/capacitaciones/clientes/solicitudes', icon: 'inbox', label: 'Solicitudes' },
            { href: '/admin/capacitaciones/historico', icon: 'history', label: 'Histórico' },
            { href: '/admin/hr/employees', icon: 'badge', label: 'Personal' },
            { href: '/admin/users', icon: 'people', label: 'Usuarios' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'#F8FAFC',borderRadius:8,color:'#0F172A',textDecoration:'none',fontSize:14,fontWeight:500,transition:'all 0.15s',border:'1px solid #E2E8F0'}}>
              <span className="material-icons" style={{color:'#3AAFA9',fontSize:20}}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
