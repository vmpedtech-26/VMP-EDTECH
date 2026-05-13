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
    CircleDollarSign
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
    userRole: 'ALUMNO' | 'SUPER_ADMIN' | 'INSTRUCTOR';
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
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/super' },
        { icon: Users, label: 'Empresas', href: '/dashboard/super/empresas' },
        { icon: Users, label: 'Alumnos', href: '/dashboard/super/alumnos' },
        { icon: BookOpen, label: 'Cursos Globales', href: '/dashboard/super/cursos' },
        { icon: Award, label: 'Todas las Credenciales', href: '/dashboard/super/credenciales' },
        { icon: Sliders, label: 'Centro de Control', href: '/dashboard/super/control' },
        {
            icon: CircleDollarSign,
            label: 'Contabilidad',
            submenu: [
                { icon: CircleDollarSign, label: 'Ventas', href: '/dashboard/super/contabilidad/ventas' },
                { icon: CircleDollarSign, label: 'Compras', href: '/dashboard/super/contabilidad/compras' },
                { icon: LayoutDashboard, label: 'Libro Diario', href: '/dashboard/super/contabilidad/diario' },
                { icon: Sliders, label: 'Reportes', href: '/dashboard/super/contabilidad/reportes' },
            ]
        },
        { icon: Settings, label: 'Sistema', href: '/dashboard/super/sistema' },
    ],
    INSTRUCTOR: [
        { icon: LayoutDashboard, label: 'Inicio', href: '/dashboard/instructor' },
        {
            icon: BookOpen,
            label: 'Capacitaciones',
            submenu: [
                { icon: ClipboardCheck, label: 'Evaluaciones', href: '/dashboard/instructor/evaluaciones' },
                { icon: Users, label: 'Participantes', href: '/dashboard/instructor/participantes' },
                { icon: Award, label: 'Credenciales', href: '/dashboard/instructor/credenciales' },
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
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 ${level === 0 ? 'text-slate-800 hover:bg-slate-100' : 'text-slate-800 hover:bg-slate-50'
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
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${level > 0 ? 'pl-8' : ''
                } ${isActive
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'text-slate-800 hover:bg-slate-100'
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
    const items = menuItems[userRole];

    return (
        <>
            {/* Mobile menu button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-xl shadow-lg"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X className="h-6 w-6 text-slate-800" /> : <Menu className="h-6 w-6 text-slate-800" />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 lg:transform-none ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Area - Premium Brand Style */}
                    <div className="p-8 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent">
                        <Link href="/" className="flex flex-col items-center group">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                                <Image
                                    src="/images/vmp-isotipo.png"
                                    alt="VMP Logo"
                                    width={56}
                                    height={56}
                                    className="relative z-10 drop-shadow-sm group-hover:rotate-6 transition-all duration-300"
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-heading font-black tracking-tighter text-slate-900 flex items-center justify-center gap-1">
                                    VMP <span className="text-primary">EDTECH</span>
                                </div>
                                <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white uppercase tracking-[0.1em] shadow-sm">
                                    {userRole === 'ALUMNO' && 'Alumno'}
                                    {userRole === 'SUPER_ADMIN' && 'Super Admin'}
                                    {userRole === 'INSTRUCTOR' && 'Instructor'}
                                </div>
                            </div>
                        </Link>
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
                    <div className="p-4 border-t border-slate-200">
                        <button
                            onClick={logout}
                            className="flex items-center space-x-3 px-4 py-3 text-slate-800 hover:bg-slate-100 rounded-xl w-full transition-all duration-300"
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
