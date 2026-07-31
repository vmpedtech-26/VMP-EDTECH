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
    Sliders
} from 'lucide-react';
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
    const { logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const items = menuItems[userRole];

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
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900">VMP</div>
                                <div className="text-xs text-gray-500">
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
