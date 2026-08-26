'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { API_URL as API } from '@/lib/api-client';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

function EmployeesContent() {
  const searchParams = useSearchParams();
  const empresaId = searchParams.get('empresaId');
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = empresaId ? `${API}/api/hr/employees?empresaId=${empresaId}` : `${API}/api/hr/employees`;
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, [empresaId]);

  const filtered = items.filter(i => !search || `${i.nombre} ${i.apellido} ${i.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Personal</div><div className="atlas-page-subtitle">{items.length} personas registradas</div></div>
      </div>
      <div className="atlas-card">
        <div className="atlas-card__header">
          <div className="atlas-search"><span className="material-icons">search</span><input placeholder="Buscar persona..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead><tr><th>Nombre</th><th>Email</th><th>DNI</th><th>Empresa</th><th>Inscripciones</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="atlas-table--empty">Sin personal registrado.</td></tr>}
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{fontWeight:600}}>{u.nombre} {u.apellido}</td>
                    <td style={{fontSize:13,color:'#64748B'}}>{u.email}</td>
                    <td style={{fontSize:13}}>{u.dni}</td>
                    <td>{u.empresa?.nombre || '-'}</td>
                    <td><span className="atlas-badge atlas-badge--primary">{u.totalInscripciones}</span></td>
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

export default function EmployeesPage() {
  return <Suspense><EmployeesContent /></Suspense>;
}
