'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        dni: '',
        telefono: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/register', formData);

            // Set cookie for Next.js middleware
            document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

            // Also save to localStorage for the auth context
            login(response.access_token, response.user);

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'Error al registrarse. Verifique los datos ingresados.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">V</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">VMP - EDTECH</span>
                </Link>

                {/* Register Card */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Crear Cuenta
                    </h1>
                    <p className="text-slate-800 mb-6">
                        Completá tus datos para empezar tu capacitación
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="Nombre"
                                placeholder="Juan"
                                required
                                value={formData.nombre}
                                onChange={(e) =>
                                    setFormData({ ...formData, nombre: e.target.value })
                                }
                            />
                            <Input
                                type="text"
                                label="Apellido"
                                placeholder="Pérez"
                                required
                                value={formData.apellido}
                                onChange={(e) =>
                                    setFormData({ ...formData, apellido: e.target.value })
                                }
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="DNI"
                                placeholder="12.345.678"
                                required
                                value={formData.dni}
                                onChange={(e) =>
                                    setFormData({ ...formData, dni: e.target.value })
                                }
                            />
                            <Input
                                type="tel"
                                label="Teléfono"
                                placeholder="11 1234 5678"
                                value={formData.telefono}
                                onChange={(e) =>
                                    setFormData({ ...formData, telefono: e.target.value })
                                }
                            />
                        </div>

                        <Input
                            type="email"
                            label="Email"
                            placeholder="tu@email.com"
                            required
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <Input
                            type="password"
                            label="Contraseña"
                            placeholder="••••••••"
                            required
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

                        <div className="pt-2 text-xs text-slate-700">
                            Al registrarte, aceptás nuestros <Link href="/terminos" className="text-primary hover:underline">Términos y Condiciones</Link> y nuestra <Link href="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.
                        </div>

                        <Button type="submit" size="lg" className="w-full pt-4" disabled={isLoading}>
                            {isLoading ? 'Creando cuenta...' : 'Registrarme'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-800">
                        ¿Ya tenés cuenta?{' '}
                        <Link href="/login" className="text-primary font-semibold hover:underline">
                            Iniciá sesión aquí
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
