'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'ALUMNO' | 'INSTRUCTOR' | 'SUPER_ADMIN' | 'EMPRESA' | 'CONTADOR';
    dni: string;
    empresaId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    switchRole: (newRole: 'ALUMNO' | 'INSTRUCTOR' | 'SUPER_ADMIN' | 'EMPRESA' | 'CONTADOR') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Cargar sesión desde localStorage al iniciar
        const token = localStorage.getItem('vmp_token');
        const userData = localStorage.getItem('vmp_user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('vmp_token');
                localStorage.removeItem('vmp_user');
            }
        } else {
            // Sesión por defecto: Super Admin con acceso completo a LMS y Contabilidad RT54
            const defaultAdmin: User = {
                id: 'demo-admin',
                email: 'admin@vmp-edtech.com',
                nombre: 'Administrador',
                apellido: 'VMP EDTECH',
                rol: 'SUPER_ADMIN',
                dni: '00000000',
            };
            setUser(defaultAdmin);
            localStorage.setItem('vmp_user', JSON.stringify(defaultAdmin));
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('vmp_token', token);
        localStorage.setItem('vmp_user', JSON.stringify(userData));
        setUser(userData);
        // Determine target based on role
        const targetRole = userData.rol || 'ALUMNO';
        if (['SUPER_ADMIN', 'INSTRUCTOR'].includes(targetRole)) {
            router.push('/admin/capacitaciones');
        } else {
            router.push('/dashboard/cursos');
        }
    };

    const logout = () => {
        localStorage.removeItem('vmp_token');
        localStorage.removeItem('vmp_user');
        // Delete cookie
        document.cookie = 'vmp_token=; path=/; max-age=0';
        setUser(null);
        router.push('/login');
    };

    const switchRole = (newRole: 'ALUMNO' | 'INSTRUCTOR' | 'SUPER_ADMIN' | 'EMPRESA' | 'CONTADOR') => {
        const updatedUser: User = {
            id: user?.id || 'demo-admin',
            email: user?.email || 'admin@vmp-edtech.com',
            nombre: user?.nombre || 'Administrador',
            apellido: user?.apellido || 'VMP EDTECH',
            dni: user?.dni || '00000000',
            rol: newRole,
            empresaId: user?.empresaId || (newRole === 'EMPRESA' ? 'oldelval' : undefined),
        };
        localStorage.setItem('vmp_user', JSON.stringify(updatedUser));
        setUser(updatedUser);

        if (newRole === 'SUPER_ADMIN') router.push('/dashboard/super');
        else if (newRole === 'EMPRESA') router.push('/dashboard/empresa');
        else if (newRole === 'INSTRUCTOR') router.push('/dashboard/instructor');
        else if (newRole === 'CONTADOR') router.push('/dashboard/super/contabilidad');
        else router.push('/dashboard/cursos');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                switchRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
