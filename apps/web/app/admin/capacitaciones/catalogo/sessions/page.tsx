'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function AgendaPage() {
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/capacitaciones/sessions`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setSesiones(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Agenda de Sesiones</div><div className="atlas-page-subtitle">{sesiones.length} sesiones programadas</div></div>
      </div>
      <div className="atlas-card">
        {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : sesiones.length === 0 ? (
          <div className="atlas-empty">
            <span className="material-icons">event</span>
            <div className="atlas-empty__title">Sin sesiones programadas</div>
            <div className="atlas-empty__text">Las sesiones aparecerán aquí cuando sean creadas</div>
          </div>
        ) : (
          <table className="atlas-table">
            <thead><tr><th>Sesión</th><th>Curso</th><th>Fecha</th><th>Modalidad</th><th>Capacidad</th><th>Instructor</th></tr></thead>
            <tbody>
              {sesiones.map(s => (
                <tr key={s.id}>
                  <td style={{fontWeight:500}}>{s.titulo}</td>
                  <td>{s.curso?.nombre}</td>
                  <td style={{fontSize:13}}>{new Date(s.fechaInicio).toLocaleDateString('es-AR', {day:'2-digit',month:'short',year:'numeric'})}</td>
                  <td><span className="atlas-badge atlas-badge--primary">{s.modalidad}</span></td>
                  <td style={{textAlign:'center'}}>{s.capacidad}</td>
                  <td style={{fontSize:13,color:'#64748B'}}>{s.instructor?.nombre || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
