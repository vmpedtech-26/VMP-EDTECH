'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { usersApi, UserAdmin } from '@/lib/api/users';
import { Loader2, User, Mail, Phone, Shield, Building, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PerfilPage() {
    const { user, login } = useAuth();
    const [fullUser, setFullUser] = useState<UserAdmin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        telefono: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.id) return;
            try {
                const data = await usersApi.obtenerUsuario(user.id);
                setFullUser(data);
                setFormData({
                    nombre: data.nombre || '',
                    apellido: data.apellido || '',
                    telefono: data.telefono || '',
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('No se pudo cargar la información del perfil');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setIsSaving(true);
        try {
            const updated = await usersApi.actualizarUsuario(user.id, formData);

            // Update auth context if name changed
            const token = localStorage.getItem('vmp_token');
            if (token) {
                login(token, {
                    ...user,
                    nombre: updated.nombre,
                    apellido: updated.apellido,
                });
            }

            setFullUser(updated);
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="glass-card p-6 rounded-2xl">
                <h1 className="text-3xl font-heading font-bold text-slate-900">Mi Perfil</h1>
                <p className="text-slate-800 mt-2">
                    Gestiona tu información personal y configuración de la cuenta.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column: Avatar & Basic Info */}
                    <Card className="md:col-span-1">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white mb-4">
                                <User className="h-12 w-12" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {fullUser?.nombre} {fullUser?.apellido}
                            </h2>
                            <p className="text-sm text-slate-800 font-medium badge-primary mt-1">
                                {fullUser?.rol}
                            </p>

                            <div className="w-full mt-6 space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex items-center text-sm text-slate-800">
                                    <Mail className="h-4 w-4 mr-3 text-primary" />
                                    <span className="truncate">{fullUser?.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-800">
                                    <Shield className="h-4 w-4 mr-3 text-primary" />
                                    <span>DNI: {fullUser?.dni}</span>
                                </div>
                                {fullUser?.empresa_nombre && (
                                    <div className="flex items-center text-sm text-slate-800">
                                        <Building className="h-4 w-4 mr-3 text-primary" />
                                        <span>{fullUser.empresa_nombre}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-slate-800">
                                    <Calendar className="h-4 w-4 mr-3 text-primary" />
                                    <span>Desde: {new Date(fullUser?.createdAt || '').toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Column: Edit Form */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <User className="h-5 w-5 mr-2 text-primary" />
                                Datos Personales
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Nombre</label>
                                    <Input
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Tu nombre"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-900">Apellido</label>
                                    <Input
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        placeholder="Tu apellido"
                                        required
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm font-medium text-slate-900">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            placeholder="Tu número de teléfono"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
