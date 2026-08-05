'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }
const ESTADO_COLORS: Record<string,string> = { COMPLETADO:'success', APROBADO:'success', REPROBADO:'danger', EN_PROGRESO:'info', NO_INICIADO:'neutral' };

export default function HistoricoPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/capacitaciones/history?limit=100`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Histórico de Capacitaciones</div><div className="atlas-page-subtitle">{items.length} registros</div></div>
      </div>
      <div className="atlas-card">
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead><tr><th>Alumno</th><th>Curso</th><th>Estado</th><th>Progreso</th><th>Fin</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={5} className="atlas-table--empty">Sin registros históricos aún.</td></tr>}
                {items.map(i => (
                  <tr key={i.id}>
                    <td style={{fontWeight:500}}>{i.alumno?.nombre}<br/><span style={{fontSize:12,color:'#94A3B8'}}>{i.alumno?.email}</span></td>
                    <td>{i.curso?.nombre}</td>
                    <td><span className={`atlas-badge atlas-badge--${ESTADO_COLORS[i.estado] || 'neutral'}`}>{i.estado}</span></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:80,height:6,background:'#E2E8F0',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${i.progreso}%`,height:'100%',background:'#3AAFA9',borderRadius:3}} />
                        </div>
                        <span style={{fontSize:12,color:'#64748B'}}>{i.progreso}%</span>
                      </div>
                    </td>
                    <td style={{fontSize:13,color:'#64748B'}}>{i.finDate ? new Date(i.finDate).toLocaleDateString('es-AR') : '-'}</td>
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
