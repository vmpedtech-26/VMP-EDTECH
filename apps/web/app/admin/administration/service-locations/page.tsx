'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function ServiceLocationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`${API}/api/administration/service-locations`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!nombre.trim()) return;
    setSaving(true);
    await fetch(`${API}/api/administration/service-locations`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ nombre }) });
    setNombre('');
    setSaving(false);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`${API}/api/administration/service-locations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  return (
    <div>
      <div className="atlas-page-header"><div><div className="atlas-page-title">Localidades</div><div className="atlas-page-subtitle">Sedes y lugares de servicio</div></div></div>
      <div className="atlas-card" style={{marginBottom:16}}>
        <div className="atlas-card__body" style={{display:'flex',gap:8}}>
          <input className="atlas-input" placeholder="Nombre de la localidad" value={nombre} onChange={e => setNombre(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} style={{maxWidth:320}} />
          <button className="atlas-btn atlas-btn--primary" onClick={add} disabled={saving}>{saving ? 'Guardando...' : 'Agregar'}</button>
        </div>
      </div>
      <div className="atlas-card">
        {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
          <table className="atlas-table">
            <thead><tr><th>Nombre</th><th></th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={2} className="atlas-table--empty">Sin localidades creadas.</td></tr>}
              {items.map(i => (
                <tr key={i.id}>
                  <td style={{fontWeight:500}}>{i.nombre}</td>
                  <td style={{textAlign:'right'}}><button className="atlas-btn atlas-btn--danger atlas-btn--sm" onClick={() => remove(i.id)}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
