'use client';
import { useEffect, useState } from 'react';
import { API_URL as API } from '@/lib/api-client';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }
const ROL_COLORS: Record<string,string> = { SUPER_ADMIN:'danger', INSTRUCTOR:'info', ALUMNO:'primary' };

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/administration/users`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setUsers(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => !search || u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Usuarios</div><div className="atlas-page-subtitle">{users.length} usuarios registrados</div></div>
      </div>
      <div className="atlas-card">
        <div className="atlas-card__header">
          <div className="atlas-search"><span className="material-icons">search</span><input placeholder="Buscar usuario..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        </div>
        <div style={{overflowX:'auto'}}>
          {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
            <table className="atlas-table">
              <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Empresa</th><th>Estado</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={5} className="atlas-table--empty">Sin usuarios.</td></tr>}
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{fontWeight:600}}>{u.nombre}</td>
                    <td style={{fontSize:13,color:'#64748B'}}>{u.email}</td>
                    <td><span className={`atlas-badge atlas-badge--${ROL_COLORS[u.rol] || 'neutral'}`}>{u.rol?.replace('_', ' ')}</span></td>
                    <td style={{fontSize:13}}>{u.empresa || '-'}</td>
                    <td><span className={`atlas-badge atlas-badge--${u.activo ? 'success' : 'neutral'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
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
