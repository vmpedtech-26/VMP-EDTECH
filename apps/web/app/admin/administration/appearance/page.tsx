'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function AppearancePage() {
  const [data, setData] = useState<any>({ nombre:'', brandTag:'', tagline:'', tema:'light', colorPrimario:'#3AAFA9' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/administration/appearance`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(setData).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch(`${API}/api/administration/appearance`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(data) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="atlas-page-header"><div><div className="atlas-page-title">Apariencia</div><div className="atlas-page-subtitle">Branding y configuración visual</div></div></div>
      <div className="atlas-card" style={{maxWidth:520}}>
        <div className="atlas-card__header"><span className="atlas-card__title">Identidad de marca</span></div>
        <div className="atlas-card__body">
          {[['nombre','Nombre de la organización','VMP - EDTECH'],['brandTag','Tag/Sigla','VMP'],['tagline','Eslogan','Capacitaciones Profesionales']].map(([key,label,ph]) => (
            <div className="atlas-form-group" key={key}>
              <label className="atlas-label">{label}</label>
              <input className="atlas-input" placeholder={ph} value={data[key] || ''} onChange={e => setData({...data,[key]:e.target.value})} />
            </div>
          ))}
          <div className="atlas-form-group">
            <label className="atlas-label">Tema</label>
            <select className="atlas-input" value={data.tema || 'light'} onChange={e => setData({...data, tema:e.target.value})}>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div className="atlas-form-group">
            <label className="atlas-label">Color primario</label>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="color" value={data.colorPrimario || '#3AAFA9'} onChange={e => setData({...data,colorPrimario:e.target.value})} style={{width:40,height:38,border:'1px solid #E2E8F0',borderRadius:6,cursor:'pointer',padding:2}} />
              <input className="atlas-input" value={data.colorPrimario || '#3AAFA9'} onChange={e => setData({...data,colorPrimario:e.target.value})} style={{width:120}} />
            </div>
          </div>
          <button className="atlas-btn atlas-btn--primary" onClick={save} disabled={saving} style={{marginTop:8}}>
            {saved ? <><span className="material-icons" style={{fontSize:16}}>check</span>Guardado</> : saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
