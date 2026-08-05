'use client';
import Link from 'next/link';

const SECTIONS = [
  { icon: 'people', label: 'Usuarios', desc: 'Gestión de usuarios y accesos', href: '/admin/users' },
  { icon: 'palette', label: 'Apariencia', desc: 'Logo, colores y branding', href: '/admin/administration/appearance' },
  { icon: 'account_tree', label: 'Sectores', desc: 'Estructura organizacional', href: '/admin/administration/sectors' },
  { icon: 'work', label: 'Puestos', desc: 'Roles y posiciones laborales', href: '/admin/administration/job-positions' },
  { icon: 'location_on', label: 'Localidades', desc: 'Sedes y centros de servicio', href: '/admin/administration/service-locations' },
  { icon: 'map', label: 'Áreas operativas', desc: 'Zonas operativas del negocio', href: '/admin/administration/operational-areas' },
];

export default function AdministracionPage() {
  return (
    <div>
      <div className="atlas-page-header">
        <div><div className="atlas-page-title">Administración</div><div className="atlas-page-subtitle">Configuración y gestión del sistema</div></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
        {SECTIONS.map(s => (
          <Link key={s.href} href={s.href} style={{textDecoration:'none'}}>
            <div className="atlas-card" style={{padding:20,cursor:'pointer'}}>
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
