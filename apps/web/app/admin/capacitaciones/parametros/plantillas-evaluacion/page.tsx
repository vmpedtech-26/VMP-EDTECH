'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function PlantillasEvaluacionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch(`${API}/api/plantillas-evaluacion`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Plantillas de Evaluación</div><div className="atlas-page-subtitle">Plantillas para exámenes y evaluaciones</div></div>
      </div>
      <div className="atlas-card">
        {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
          <table className="atlas-table">
            <thead><tr><th>Nombre</th><th>Descripción</th><th>Nota Mínima</th><th>Tiempo Límite</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={4} className="atlas-table--empty">Sin plantillas creadas.</td></tr>}
              {items.map(i => (
                <tr key={i.id}>
                  <td style={{fontWeight:500}}>{i.nombre}</td>
                  <td>{i.descripcion}</td>
                  <td>{i.notaMinima} / 100</td>
                  <td>{i.tiempoLimite ? `${i.tiempoLimite} min` : 'Sin límite'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
