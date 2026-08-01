'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api-client';

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
        // 1. Trigger non-blocking API Auto-Warmup to wake up Render backend container if sleeping
        fetch(`${API_URL}/`, { method: 'GET', mode: 'cors' }).catch(() => {
            // Silence background warmup errors
        });

        // 2. Cargar sesión desde localStorage al iniciar
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
