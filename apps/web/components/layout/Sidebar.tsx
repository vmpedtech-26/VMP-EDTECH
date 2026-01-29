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
    X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    userRole: 'ALUMNO' | 'SUPER_ADMIN' | 'INSTRUCTOR';
}

const menuItems = {
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
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: Users, label: 'Mis Alumnos', href: '/dashboard/instructor/alumnos' },
        { icon: BookOpen, label: 'Gestión de Cursos', href: '/dashboard/instructor/cursos' },
        { icon: Award, label: 'Credenciales Emitidas', href: '/dashboard/instructor/credenciales' },
        { icon: LayoutDashboard, label: 'Revisión de Tareas', href: '/dashboard/instructor/tareas' },
        { icon: Settings, label: 'Mi Empresa', href: '/dashboard/instructor/config' },
    ],
};

export function Sidebar({ userRole }: SidebarProps) {
    const pathname = usePathname();
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
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full transition-colors">
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
