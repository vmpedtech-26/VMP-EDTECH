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
    Cpu,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
    userRole: 'ALUMNO' | 'SUPER_ADMIN' | 'INSTRUCTOR' | 'EMPRESA' | 'CONTADOR';
}

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
        { icon: Cpu, label: 'Telemetría OBD2', href: '/dashboard/super/control' },
        { icon: BarChart3, label: 'Métricas & KPIs', href: '/dashboard/super/metrics' },
        { icon: ShieldCheck, label: 'Compliance & Ética', href: '/dashboard/super/compliance' },
        { icon: Lock, label: 'Seguridad & Logs', href: '/dashboard/super/seguridad' },
        { icon: Settings, label: 'Configuración Sistema', href: '/dashboard/super/sistema' },
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
                { icon: Sliders, label: 'Parámetros', href: '/dashboard/instructor/parametros' },
            ]
        },
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
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${level === 0 ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-600 hover:bg-gray-50'
                        }`}
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
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${level > 0 ? 'pl-8' : ''
                } ${isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
        </Link>
    );
}

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
    const { logout, switchRole } = useAuth();
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
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo & Role Selector */}
                    <div className="p-5 border-b border-gray-200 space-y-3">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900 leading-none">VMP EDTECH</div>
                                <div className="text-[11px] text-gray-500 font-semibold mt-1">
                                    Plataforma Integral
                                </div>
                            </div>
                        </Link>

                        {/* Dropdown Selector de Vista / Perfil */}
                        <div className="pt-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Modo de Sistema
                            </label>
                            <select
                                value={userRole}
                                onChange={(e) => switchRole(e.target.value as any)}
                                className="w-full bg-slate-900 text-white font-medium text-xs rounded-lg px-2.5 py-2 border border-slate-800 outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm"
                            >
                                <option value="SUPER_ADMIN">👑 Super Admin & Contabilidad (RT54)</option>
                                <option value="EMPRESA">🏢 Empresa B2B (Flotas)</option>
                                <option value="INSTRUCTOR">👨‍🏫 Panel Instructor</option>
                                <option value="ALUMNO">🎓 Portal Alumno</option>
                            </select>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
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
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full transition-colors"
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
