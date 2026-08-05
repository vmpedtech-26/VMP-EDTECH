'use client';
import Link from 'next/link';

const SECTIONS = [
  { icon: 'account_tree', label: 'Sectores', desc: 'Gestionar sectores de la organización', href: '/admin/administration/sectors' },
  { icon: 'work', label: 'Puestos', desc: 'Puestos y posiciones laborales', href: '/admin/administration/job-positions' },
  { icon: 'location_on', label: 'Localidades', desc: 'Sedes y lugares de servicio', href: '/admin/administration/service-locations' },
  { icon: 'map', label: 'Áreas operativas', desc: 'Zonas y áreas de operación', href: '/admin/administration/operational-areas' },
  { icon: 'quiz', label: 'Banco de preguntas', desc: 'Preguntas reutilizables para exámenes', href: '/admin/capacitaciones/parametros/banco-preguntas' },
  { icon: 'assignment', label: 'Plantillas de evaluación', desc: 'Plantillas para exámenes y evaluaciones', href: '/admin/capacitaciones/parametros/plantillas-evaluacion' },
];

export default function ParametrosPage() {
  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Parámetros</div><div className="atlas-page-subtitle">Configuración general del sistema</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
        {SECTIONS.map(s => (
          <Link key={s.href} href={s.href} style={{textDecoration:'none'}}>
            <div className="atlas-card" style={{padding:20,cursor:'pointer',transition:'box-shadow 0.15s'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{width:40,height:40,background:'rgba(58,175,169,0.1)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span className="material-icons" style={{color:'#3AAFA9',fontSize:20}}>{s.icon}</span>
                </div>
                <div style={{fontWeight:600,fontSize:15,color:'#0F172A'}}>{s.label}</div>
              </div>
              <div style={{fontSize:13,color:'#64748B'}}>{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
