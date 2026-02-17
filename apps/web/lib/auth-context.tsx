'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'ALUMNO' | 'INSTRUCTOR' | 'SUPER_ADMIN';
    dni: string;
    empresaId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
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
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('vmp_token', token);
        localStorage.setItem('vmp_user', JSON.stringify(userData));
        setUser(userData);

        if (userData.rol === 'INSTRUCTOR') {
            router.push('/dashboard/instructor');
        } else if (userData.rol === 'SUPER_ADMIN') {
            router.push('/dashboard/super');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('vmp_token');
        localStorage.removeItem('vmp_user');

        // Comprehensive cookie clearing
        document.cookie = 'vmp_token=; path=/; max-age=0';
        document.cookie = 'vmp_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        setUser(null);

        // Try router first, fallback to window.location for hard reset
        router.push('/login');
        setTimeout(() => {
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }, 100);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
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
