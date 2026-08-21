'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    UserCog,
    Sliders,
    Calculator,
    FileText,
    TrendingUp,
    ShoppingBag,
    PieChart,
    BarChart3,
    ShieldCheck,
    Building2,
    GraduationCap,
    FileSpreadsheet,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
    userRole: 'ALUMNO' | 'SUPER_ADMIN' | 'INSTRUCTOR' | 'EMPRESA' | 'CONTADOR';
}

const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: '👑 Super Admin & Contabilidad (RT54)',
    EMPRESA: '🏢 Empresa B2B (Flotas)',
    INSTRUCTOR: '👨‍🏫 Panel Instructor',
    CONTADOR: '📊 Contador',
    ALUMNO: '🎓 Portal Alumno',
};

interface MenuItem {
    icon: any;
    label: string;
    href?: string;
    submenu?: MenuItem[];
}

const menuItems: Record<string, MenuItem[]> = {
    ALUMNO: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: BookOpen, label: 'Mis Cursos', href: '/dashboard/cursos' },
        { icon: BookOpen, label: 'Explorar Cursos', href: '/dashboard/explorar' },
        { icon: Award, label: 'Mis Credenciales', href: '/dashboard/credenciales' },
        { icon: Settings, label: 'Mi Perfil', href: '/dashboard/perfil' },
    ],
    SUPER_ADMIN: [
        { icon: LayoutDashboard, label: 'Panel General', href: '/dashboard/super' },
        {
            icon: Calculator,
            label: 'Sistema Contable (RT54)',
            submenu: [
                { icon: FileText, label: 'Resumen Contable', href: '/dashboard/super/contabilidad' },
                { icon: BookOpen, label: 'Libro Diario', href: '/dashboard/super/contabilidad/diario' },
                { icon: TrendingUp, label: 'Ventas y Facturación', href: '/dashboard/super/contabilidad/ventas' },
                { icon: ShoppingBag, label: 'Compras y Gastos', href: '/dashboard/super/contabilidad/compras' },
                { icon: PieChart, label: 'Plan de Cuentas', href: '/dashboard/super/contabilidad/cuentas' },
                { icon: BarChart3, label: 'Reportes Financieros', href: '/dashboard/super/contabilidad/reportes' },
                { icon: ShieldCheck, label: 'Balance RT54 (FACPCE)', href: '/dashboard/super/contabilidad/rt54' },
            ]
        },
        { icon: Building2, label: 'Empresas B2B', href: '/dashboard/super/empresas' },
        { icon: Users, label: 'Alumnos y Nómina', href: '/dashboard/super/alumnos' },
        { icon: GraduationCap, label: 'Gestión LMS Cursos', href: '/dashboard/super/cursos' },
        { icon: Award, label: 'Credenciales & QR', href: '/dashboard/super/credenciales' },
        { icon: FileSpreadsheet, label: 'Cotizaciones B2B', href: '/dashboard/super/cotizaciones' },
        { icon: FileText, label: 'Presupuestos HSE', href: '/dashboard/super/presupuestos' },
        { icon: Settings, label: 'Centro de Control', href: '/dashboard/super/control' },
        { icon: BarChart3, label: 'Métricas & KPIs', href: '/dashboard/super/metrics' },
        { icon: ShieldCheck, label: 'Compliance & Ética', href: '/dashboard/super/compliance' },
        { icon: Lock, label: 'Seguridad & Logs', href: '/dashboard/super/seguridad' },
        { icon: Settings, label: 'Configuración Sistema', href: '/dashboard/super/sistema' },
        { icon: UserCog, label: 'Mi Perfil', href: '/dashboard/perfil' },
    ],
    EMPRESA: [
        { icon: LayoutDashboard, label: 'Panel Empresa', href: '/dashboard/empresa' },
        { icon: Users, label: 'Colaboradores', href: '/dashboard/empresa/colaboradores' },
        { icon: GraduationCap, label: 'Asignar Cursos', href: '/dashboard/empresa/asignar' },
    ],
    CONTADOR: [
        { icon: FileText, label: 'Resumen Contable', href: '/dashboard/super/contabilidad' },
        { icon: BookOpen, label: 'Libro Diario', href: '/dashboard/super/contabilidad/diario' },
        { icon: TrendingUp, label: 'Ventas y Facturación', href: '/dashboard/super/contabilidad/ventas' },
        { icon: ShoppingBag, label: 'Compras y Gastos', href: '/dashboard/super/contabilidad/compras' },
        { icon: PieChart, label: 'Plan de Cuentas', href: '/dashboard/super/contabilidad/cuentas' },
        { icon: BarChart3, label: 'Reportes Financieros', href: '/dashboard/super/contabilidad/reportes' },
        { icon: ShieldCheck, label: 'Balance RT54', href: '/dashboard/super/contabilidad/rt54' },
    ],
    INSTRUCTOR: [
        { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard/instructor' },
        {
            icon: BookOpen,
            label: 'Capacitaciones',
            submenu: [
                { icon: ClipboardCheck, label: 'Evaluaciones', href: '/dashboard/instructor/evaluaciones' },
                { icon: Users, label: 'Participantes', href: '/dashboard/instructor/participantes' },
                { icon: GraduationCap, label: 'Mis Alumnos', href: '/dashboard/instructor/alumnos' },
                { icon: Sliders, label: 'Parámetros', href: '/dashboard/instructor/parametros' },
            ]
        },
        { icon: UserCog, label: 'Mi Perfil', href: '/dashboard/perfil' },
    ],
};

function NavItem({ item, pathname, onNavigate, level = 0 }: {
    item: MenuItem;
    pathname: string;
    onNavigate: () => void;
    level?: number;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = item.href === pathname;

    if (hasSubmenu) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-white/75 hover:bg-white/5 hover:text-white/90"
                >
                    <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                    </div>
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>
                {isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                        {item.submenu!.map((subItem) => (
                            <NavItem
                                key={subItem.href || subItem.label}
                                item={subItem}
                                pathname={pathname}
                                onNavigate={onNavigate}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href!}
            onClick={onNavigate}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-l-2 transition-colors ${level > 0 ? 'pl-8' : ''
                } ${isActive
                    ? 'bg-primary/15 border-primary text-primary font-semibold'
                    : 'border-transparent text-white/75 hover:bg-white/5 hover:text-white/90'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
        </Link>
    );
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const items = menuItems[userRole] || menuItems.SUPER_ADMIN;

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-sidebar-dark transform transition-transform duration-200 lg:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Role Selector */}
                    <div className="p-5 border-b border-white/10 space-y-3">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-white leading-none">VMP - EDTECH</div>
                                <div className="text-[11px] text-white/50 font-semibold mt-1">
                                    Plataforma Integral
                                </div>
                            </div>
                        </Link>

                        {/* Rol de la sesión actual (informativo, no editable: lo determina el backend) */}
                        <div className="pt-1">
                            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                                Modo de Sistema
                            </label>
                            <div className="w-full bg-white/5 text-white font-medium text-xs rounded-lg px-2.5 py-2 border border-white/10">
                                {ROLE_LABELS[userRole] || userRole}
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {items.map((item) => (
                            <NavItem
                                key={item.href || item.label}
                                item={item}
                                pathname={pathname}
                                onNavigate={() => setMobileMenuOpen(false)}
                            />
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 px-4 py-3 text-white/50 hover:bg-red-500/10 hover:text-red-400 rounded-lg w-full transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
