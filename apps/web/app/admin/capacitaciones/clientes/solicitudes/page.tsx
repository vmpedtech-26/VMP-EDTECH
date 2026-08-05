'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }
const ESTADO_COLORS: Record<string,string> = { PENDIENTE:'warning', APROBADA:'success', RECHAZADA:'danger', EN_CURSO:'info', COMPLETADA:'primary' };

export default function SolicitudesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API}/api/capacitaciones/training-requests`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const updateEstado = async (id: string, estado: string) => {
    await fetch(`${API}/api/capacitaciones/training-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ estado })
    });
    load();
  };

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Solicitudes de Capacitación</div><div className="atlas-page-subtitle">{items.length} solicitudes</div></div>
      </div>
      <div className="atlas-card">
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead><tr><th>Empresa</th><th>Curso</th><th>Solicitante</th><th>Personas</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={7} className="atlas-table--empty">Sin solicitudes pendientes.</td></tr>}
                {items.map(s => (
                  <tr key={s.id}>
                    <td style={{fontWeight:600}}>{s.empresa?.nombre}</td>
                    <td>{s.curso?.nombre}</td>
                    <td style={{fontSize:13}}>{s.solicitante?.nombre}<br/><span style={{color:'#94A3B8'}}>{s.solicitante?.email}</span></td>
                    <td style={{textAlign:'center'}}>{s.cantidadPersonas}</td>
                    <td><span className={`atlas-badge atlas-badge--${ESTADO_COLORS[s.estado] || 'neutral'}`}>{s.estado}</span></td>
                    <td style={{fontSize:13,color:'#64748B'}}>{new Date(s.createdAt).toLocaleDateString('es-AR')}</td>
                    <td style={{display:'flex',gap:4}}>
                      {s.estado === 'PENDIENTE' && <>
                        <button className="atlas-btn atlas-btn--primary atlas-btn--sm" onClick={() => updateEstado(s.id,'APROBADA')}>Aprobar</button>
                        <button className="atlas-btn atlas-btn--danger atlas-btn--sm" onClick={() => updateEstado(s.id,'RECHAZADA')}>Rechazar</button>
                      </>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
