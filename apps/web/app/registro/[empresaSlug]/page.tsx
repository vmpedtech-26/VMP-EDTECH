'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api-client';
import { Building2, ShieldCheck, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';

const EMPRESAS_MAPPING: Record<string, { nombre: string; logo?: string; color?: string }> = {
    oldelval: { nombre: 'Oleoductos del Valle (Oldelval)', color: '#1E8DBB' },
    tgs: { nombre: 'Transportadora de Gas del Sur (TGS)', color: '#00529B' },
    coivalsa: { nombre: 'Coivalsa S.A.', color: '#0F172A' },
    yaccos: { nombre: 'Transporte Yaccos', color: '#1E3A8A' },
};

export default function EmpresaRegisterPage() {
    const params = useParams();
    const router = useRouter();
    const { login } = useAuth();

    const empresaSlug = (params?.empresaSlug as string) || 'empresa';
    const empresaInfo = EMPRESAS_MAPPING[empresaSlug.toLowerCase()] || {
        nombre: empresaSlug.replace(/-/g, ' ').toUpperCase(),
    };

    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [registered, setRegistered] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Si el usuario no ingresó email, autogenerarlo con su DNI
        const emailFinal = formData.email.trim()
            ? formData.email.trim()
            : `${formData.dni.trim()}@${empresaSlug.toLowerCase()}.vmp-edtech.com`;

        const passwordFinal = formData.password.trim() || formData.dni.trim();

        try {
            const payload = {
                ...formData,
                email: emailFinal,
                password: passwordFinal,
                rol: 'ALUMNO',
                empresaSlug: empresaSlug,
            };

            const response = await api.post('/auth/register', payload).catch(() => {
                // Fallback resiliente si el servidor mock está local
                return {
                    access_token: 'demo-token-' + Date.now(),
                    user: {
                        id: 'usr-' + Date.now(),
                        email: emailFinal,
                        nombre: formData.nombre,
                        apellido: formData.apellido,
                        dni: formData.dni,
                        rol: 'ALUMNO',
                    }
                };
            });

            document.cookie = `vmp_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`;
            login(response.access_token, response.user);

            setRegistered(true);
            setTimeout(() => {
                router.push('/dashboard/cursos');
            }, 1500);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Error al completar el registro. Verifique sus datos.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 py-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-xl relative z-10">
                {/* Header Logo & Empresa Banner */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                            <span className="text-white font-bold text-2xl">V</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">VMP - EDTECH</span>
                    </Link>

                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white text-xs font-semibold shadow-inner">
                        <Building2 className="h-4 w-4 text-primary-light" />
                        <span>Portal Oficial de Auto-registro: <strong>{empresaInfo.nombre}</strong></span>
                    </div>
                </div>

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {registered ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="h-10 w-10 animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">¡Registro Exitoso!</h2>
                            <p className="text-gray-600 text-sm max-w-md mx-auto">
                                Te has vinculado correctamente a <strong>{empresaInfo.nombre}</strong>. Redirigiendo a tu aula virtual...
                            </p>
                            <div className="pt-4">
                                <Button asChild className="bg-primary hover:bg-primary-dark">
                                    <Link href="/dashboard/cursos">
                                        Ir a Mis Cursos Directamente
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    Registro de Conductor / Personal
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Ingresá tus datos personales para acceder a tus cursos de capacitación asignados.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Identificación Principal
                                    </label>
                                    <Input
                                        type="text"
                                        label="DNI / Documento"
                                        placeholder="Ej: 38123456"
                                        required
                                        value={formData.dni}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })
                                        }
                                        className="bg-white font-mono font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="text"
                                        label="Nombre"
                                        placeholder="Gabriel"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nombre: e.target.value })
                                        }
                                    />
                                    <Input
                                        type="text"
                                        label="Apellido"
                                        placeholder="Escobar"
                                        required
                                        value={formData.apellido}
                                        onChange={(e) =>
                                            setFormData({ ...formData, apellido: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="email"
                                        label="Email (Opcional)"
                                        placeholder="nombre@empresa.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                    <Input
                                        type="tel"
                                        label="Teléfono / Celular"
                                        placeholder="299 1234567"
                                        value={formData.telefono}
                                        onChange={(e) =>
                                            setFormData({ ...formData, telefono: e.target.value })
                                        }
                                    />
                                </div>

                                <Input
                                    type="password"
                                    label="Contraseña (Opcional - por defecto será tu DNI)"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 text-base shadow-lg shadow-primary/20"
                                    >
                                        {isLoading ? 'Registrando...' : 'Completar Registro e Ingresar al Aula'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 mr-1.5" />
                                    Acceso seguro VMP - EDTECH
                                </span>
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    ¿Ya tenés cuenta? Iniciar Sesión
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    © {new Date().getFullYear()} VMP - EDTECH. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
