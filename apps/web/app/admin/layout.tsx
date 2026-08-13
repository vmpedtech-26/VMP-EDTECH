'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import './admin.css';

const NAV_ITEMS = [
  { 
    icon: 'school', 
    label: 'Capacitaciones LMS', 
    href: '/admin/capacitaciones',
    children: [
      { icon: 'home', label: 'Inicio', href: '/admin/capacitaciones' },
      { icon: 'event', label: 'Agenda & Sesiones', href: '/admin/capacitaciones/catalogo/sessions' },
      { icon: 'inbox', label: 'Solicitudes', href: '/admin/capacitaciones/clientes/solicitudes' },
      { icon: 'handshake', label: 'Clientes B2B', href: '/admin/capacitaciones/clientes' },
      { icon: 'tune', label: 'Parámetros LMS', href: '/admin/parameters' },
      { icon: 'history', label: 'Histórico', href: '/admin/capacitaciones/historico' },
    ]
  },
  {
    icon: 'calculate',
    label: 'Sistema Contable (RT54)',
    href: '/dashboard/super/contabilidad',
    children: [
      { icon: 'assessment', label: 'Resumen Contable', href: '/dashboard/super/contabilidad' },
      { icon: 'book', label: 'Libro Diario', href: '/dashboard/super/contabilidad/diario' },
      { icon: 'trending_up', label: 'Ventas y Facturación', href: '/dashboard/super/contabilidad/ventas' },
      { icon: 'shopping_bag', label: 'Compras y Gastos', href: '/dashboard/super/contabilidad/compras' },
      { icon: 'pie_chart', label: 'Plan de Cuentas', href: '/dashboard/super/contabilidad/cuentas' },
      { icon: 'bar_chart', label: 'Reportes Financieros', href: '/dashboard/super/contabilidad/reportes' },
      { icon: 'verified_user', label: 'Balance RT54', href: '/dashboard/super/contabilidad/rt54' },
    ]
  },
  { icon: 'business', label: 'Empresas B2B', href: '/dashboard/super/empresas', children: [] },
  { icon: 'people', label: 'Alumnos y Nómina', href: '/dashboard/super/alumnos', children: [] },
  { icon: 'workspace_premium', label: 'Credenciales & QR', href: '/dashboard/super/credenciales', children: [] },
  { icon: 'request_quote', label: 'Cotizaciones B2B', href: '/dashboard/super/cotizaciones', children: [] },
  { icon: 'directions_car', label: 'Telemetría OBD2', href: '/dashboard/super/control', children: [] },
  { icon: 'insights', label: 'Métricas & KPIs', href: '/dashboard/super/metrics', children: [] },
  { icon: 'gavel', label: 'Compliance & Ética', href: '/dashboard/super/compliance', children: [] },
  { icon: 'security', label: 'Seguridad & Logs', href: '/dashboard/super/seguridad', children: [] },
  { icon: 'groups', label: 'Personal (HR)', href: '/admin/hr/employees', children: [] },
  { icon: 'tune', label: 'Parámetros', href: '/admin/parameters', pinned: true, children: [] },
  { icon: 'shield', label: 'Administración System', href: '/admin/administration', pinned: true, children: [] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ items: [], unread: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('vmp_token');
    const userData = localStorage.getItem('vmp_user');
    if (!token) { router.push('/auth/login'); return; }
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // Este panel expone contabilidad, HR y administración del sistema completos,
      // sin filtrado por sección: solo SUPER_ADMIN puede acceder.
      if (parsedUser.rol !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } else {
      router.push('/auth/login');
      return;
    }

    // Load notifications
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://vmp-edtech-6wgw.onrender.com'}/api/notifications?limit=12`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => setNotifications(d)).catch(() => {});
    
    // Dark mode
    const saved = localStorage.getItem('vmp_dark_mode');
    if (saved === 'true') { setDarkMode(true); document.documentElement.classList.add('dark'); }
  }, []);

  useEffect(() => {
    // Find active section for subnav
    const section = NAV_ITEMS.find(n => pathname.startsWith(n.href) && n.children && n.children.length > 0);
    setActiveSection(section || null);
  }, [pathname]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('vmp_dark_mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  const logout = () => {
    localStorage.removeItem('vmp_token');
    localStorage.removeItem('vmp_user');
    router.push('/auth/login');
  };

  const displayName = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`atlas-shell ${darkMode ? 'dark' : ''}`}>
      {/* Material Icons */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      
      {/* SIDEBAR */}
      <aside className={`atlas-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-mark">V</div>
            {sidebarOpen && <span className="sidebar__logo-text">VMP - EDTECH</span>}
          </div>
          <button className="sidebar__toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="material-icons">{sidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>
        </div>
        
        <nav className="sidebar__nav">
          {NAV_ITEMS.filter(n => !n.pinned).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__item ${pathname.startsWith(item.href) ? 'is-active' : ''}`}
            >
              <span className="material-icons sidebar__icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar__label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="sidebar__pinned">
          {NAV_ITEMS.filter(n => n.pinned).map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__item ${pathname.startsWith(item.href) ? 'is-active' : ''}`}
            >
              <span className="material-icons sidebar__icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar__label">{item.label}</span>}
            </Link>
          ))}
          <button className="sidebar__item sidebar__logout" onClick={logout}>
            <span className="material-icons sidebar__icon">logout</span>
            {sidebarOpen && <span className="sidebar__label">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="atlas-main">
        {/* TOPBAR */}
        <header className="atlas-topbar">
          <div className="topbar__left">
            {activeSection && (
              <span className="topbar__section">{activeSection.label}</span>
            )}
          </div>
          <div className="topbar__right">
            {/* Notifications */}
            <div className="topbar__notif-wrapper">
              <button className="topbar__icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <span className="material-icons">notifications</span>
                {notifications.unread > 0 && (
                  <span className="notif-badge">{notifications.unread}</span>
                )}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notificaciones</span>
                    <span className="notif-unread">{notifications.unread} sin leer</span>
                  </div>
                  {notifications.items.length === 0 && (
                    <div className="notif-empty">Sin notificaciones</div>
                  )}
                  {(notifications.items as any[]).map((n: any) => (
                    <div key={n.id} className={`notif-item ${n.leida ? '' : 'unread'}`}>
                      <span className="material-icons notif-item__icon">info</span>
                      <div>
                        <div className="notif-item__title">{n.titulo}</div>
                        <div className="notif-item__msg">{n.mensaje}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Dark mode */}
            <button className="topbar__icon-btn" onClick={toggleDark}>
              <span className="material-icons">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            {/* Avatar */}
            <div className="topbar__avatar">
              <div className="avatar-circle">{initial}</div>
              <div className="avatar-info">
                <span className="avatar-name">{displayName}</span>
                <span className="avatar-role">{user?.rol?.replace('_', ' ') || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* SUBNAV */}
        {activeSection && activeSection.children && activeSection.children.length > 0 && (
          <nav className="atlas-subnav">
            {activeSection.children.map((item: any) => (
              <Link
                key={item.href}
                href={item.href}
                className={`subnav__item ${pathname === item.href || (item.href !== '/admin/capacitaciones' && pathname.startsWith(item.href)) ? 'is-active' : ''}`}
              >
                <span className="material-icons subnav__icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        )}

        {/* PAGE CONTENT */}
        <main className="atlas-content">
          {children}
        </main>
      </div>
    </div>
  );
}
