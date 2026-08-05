'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function CatalogoCursos() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/cursos`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => { setCursos(Array.isArray(d) ? d : d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = cursos.filter(c => !search || c.nombre?.toLowerCase().includes(search.toLowerCase()) || c.codigo?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="atlas-page-header">
        <div>
          <div className="atlas-page-title">Catálogo de Capacitaciones</div>
          <div className="atlas-page-subtitle">{cursos.length} cursos disponibles</div>
        </div>
        <Link href="/admin/administration/courses" className="atlas-btn atlas-btn--primary">
          <span className="material-icons" style={{fontSize:16}}>add</span>
          Nuevo curso
        </Link>
      </div>

      <div className="atlas-card">
        <div className="atlas-card__header">
          <div className="atlas-search">
            <span className="material-icons">search</span>
            <input placeholder="Buscar curso..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead>
                <tr><th>Código</th><th>Nombre</th><th>Duración</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="atlas-table--empty">Sin cursos cargados aún.</td></tr>}
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><code style={{fontSize:12,background:'#F1F5F9',padding:'2px 6px',borderRadius:4}}>{c.codigo}</code></td>
                    <td style={{fontWeight:500}}>{c.nombre}</td>
                    <td>{c.duracionHoras}h</td>
                    <td>{c.vigenciaMeses ? `${c.vigenciaMeses} meses` : 'Sin vencimiento'}</td>
                    <td><span className={`atlas-badge atlas-badge--${c.activo ? 'success' : 'neutral'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td>
                      <Link href={`/admin/administration/courses?id=${c.id}`} className="atlas-btn atlas-btn--ghost atlas-btn--sm">Ver</Link>
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
