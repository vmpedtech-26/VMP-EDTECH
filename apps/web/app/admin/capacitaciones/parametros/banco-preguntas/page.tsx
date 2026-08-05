'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com';
function getToken() { return typeof window !== 'undefined' ? localStorage.getItem('vmp_token') : null; }

export default function BancoPreguntasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    pregunta: '',
    opciones: ['', '', '', ''],
    respuestaCorrecta: 0,
    area: '',
    dificultad: 'MEDIA'
  });

  const load = () => {
    fetch(`${API}/api/banco-preguntas`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const add = async () => {
    if (!formData.pregunta.trim()) return;
    setSaving(true);
    await fetch(`${API}/api/banco-preguntas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(formData)
    });
    setFormData({ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: 0, area: '', dificultad: 'MEDIA' });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`${API}/api/banco-preguntas/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    load();
  };

  const updateOpcion = (index: number, value: string) => {
    const newOpciones = [...formData.opciones];
    newOpciones[index] = value;
    setFormData({ ...formData, opciones: newOpciones });
  };

  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Banco de Preguntas</div><div className="atlas-page-subtitle">Preguntas reutilizables para exámenes</div></div>
        <button className="atlas-btn atlas-btn--primary" onClick={() => setShowForm(!showForm)}>
          <span className="material-icons" style={{fontSize:16}}>{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancelar' : 'Nueva pregunta'}
        </button>
      </div>

      {showForm && (
        <div className="atlas-card" style={{marginBottom: 24}}>
          <div className="atlas-card__header"><span className="atlas-card__title">Agregar Pregunta</span></div>
          <div className="atlas-card__body">
            <div className="atlas-form-group">
              <label className="atlas-label">Pregunta</label>
              <input className="atlas-input" value={formData.pregunta} onChange={e => setFormData({...formData, pregunta: e.target.value})} />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              {formData.opciones.map((op, i) => (
                <div className="atlas-form-group" key={i}>
                  <label className="atlas-label" style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type="radio" name="correcta" checked={formData.respuestaCorrecta === i} onChange={() => setFormData({...formData, respuestaCorrecta: i})} />
                    Opción {i + 1} {formData.respuestaCorrecta === i && '(Correcta)'}
                  </label>
                  <input className="atlas-input" value={op} onChange={e => updateOpcion(i, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 16}}>
              <div className="atlas-form-group" style={{flex: 1}}>
                <label className="atlas-label">Área</label>
                <input className="atlas-input" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
              </div>
              <div className="atlas-form-group" style={{flex: 1}}>
                <label className="atlas-label">Dificultad</label>
                <select className="atlas-input" value={formData.dificultad} onChange={e => setFormData({...formData, dificultad: e.target.value})}>
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>
            <button className="atlas-btn atlas-btn--primary" onClick={add} disabled={saving}>{saving ? 'Guardando...' : 'Guardar pregunta'}</button>
          </div>
        </div>
      )}

      <div className="atlas-card">
        {loading ? <div className="atlas-loading"><div className="atlas-spinner" /></div> : (
          <table className="atlas-table">
            <thead><tr><th>Pregunta</th><th>Área</th><th>Dificultad</th><th></th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={4} className="atlas-table--empty">Sin preguntas creadas.</td></tr>}
              {items.map(i => (
                <tr key={i.id}>
                  <td style={{fontWeight:500}}>{i.pregunta}</td>
                  <td>{i.area}</td>
                  <td><span className={`atlas-badge atlas-badge--${i.dificultad === 'ALTA' ? 'danger' : i.dificultad === 'MEDIA' ? 'warning' : 'success'}`}>{i.dificultad}</span></td>
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
