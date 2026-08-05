'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/capacitaciones/clientes/customers`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setClientes(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = clientes.filter(c => !search || c.nombre?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Clientes</div><div className="atlas-page-subtitle">{clientes.length} empresas registradas</div></div>
        <div style={{display:'flex',gap:8}}>
          <Link href="/admin/capacitaciones/clientes/solicitudes" className="atlas-btn atlas-btn--ghost">
            <span className="material-icons" style={{fontSize:16}}>inbox</span>Solicitudes
          </Link>
        </div>
      </div>
      <div className="atlas-card">
        <div className="atlas-card__header">
          <div className="atlas-search"><span className="material-icons">search</span><input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead><tr><th>Empresa</th><th>CUIT</th><th>Email</th><th>Alumnos</th><th>Solicitudes pend.</th><th></th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="atlas-table--empty">Sin clientes registrados.</td></tr>}
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight:600}}>{c.nombre}</td>
                    <td style={{color:'#64748B',fontSize:13}}>{c.cuit}</td>
                    <td style={{fontSize:13}}>{c.email}</td>
                    <td><span className="atlas-badge atlas-badge--primary">{c.totalAlumnos}</span></td>
                    <td>{c.solicitudesPendientes > 0 ? <span className="atlas-badge atlas-badge--warning">{c.solicitudesPendientes} pendientes</span> : <span className="atlas-badge atlas-badge--neutral">0</span>}</td>
                    <td><Link href={`/admin/hr/employees?empresaId=${c.id}`} className="atlas-btn atlas-btn--ghost atlas-btn--sm">Ver personal</Link></td>
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
