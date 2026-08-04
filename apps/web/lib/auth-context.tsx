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
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem('vmp_token', token);
        localStorage.setItem('vmp_user', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('vmp_token');
        localStorage.removeItem('vmp_user');
        // Delete cookie
        document.cookie = 'vmp_token=; path=/; max-age=0';
        setUser(null);
        router.push('/login');
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
