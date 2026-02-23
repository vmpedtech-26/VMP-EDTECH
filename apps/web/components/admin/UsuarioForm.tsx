'use client';

import React, { useEffect, useState } from 'react';
import {
    User,
    Mail,
    Fingerprint,
    Phone,
    Building2,
    ShieldCheck,
    Key,
    Save,
    Loader2,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { empresasApi, Empresa } from '@/lib/api/empresas';

interface UsuarioFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    title?: string;
    isSuperAdminView?: boolean;
}

export function UsuarioForm({ initialData, onSubmit, onCancel, isLoading, title, isSuperAdminView = true }: UsuarioFormProps) {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        apellido: initialData?.apellido || '',
        email: initialData?.email || '',
        dni: initialData?.dni || '',
        telefono: initialData?.telefono || '',
        rol: initialData?.rol || 'ALUMNO',
        empresaId: initialData?.empresaId || '',
        password: '',
        activo: initialData?.activo !== undefined ? initialData.activo : true
    });

    useEffect(() => {
        if (isSuperAdminView) {
            const fetchEmpresas = async () => {
                try {
                    const data = await empresasApi.listarEmpresas();
                    setEmpresas(data);
                } catch (error) {
                    console.error('Error fetching empresas:', error);
                }
            };
            fetchEmpresas();
        }
    }, [isSuperAdminView]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Si no es edición, el password es obligatorio
        if (!initialData && !formData.password) {
            alert('La contraseña es obligatoria para nuevos usuarios');
            return;
        }
        try {
            await onSubmit(formData);
            toast.success(initialData ? 'Usuario actualizado' : 'Usuario creado', {
                description: `El usuario ${formData.nombre} ${formData.apellido} ha sido guardado correctamente.`
            });
        } catch (error: any) {
            toast.error('Error al guardar', {
                description: error.message || 'No se pudo guardar la información del usuario.'
            });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-primary p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <User className="h-6 w-6" />
                    <h2 className="text-xl font-bold">{title || 'Datos del Usuario'}</h2>
                </div>
                {onCancel && (
                    <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            Nombre
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Ej: Juan"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>

                    {/* Apellido */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            Apellido
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Ej: Pérez"
                            value={formData.apellido}
                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-300" /> Email
                        </label>
                        <input
                            required
                            type="email"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="juan@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* DNI */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="h-3 w-3 text-gray-300" /> DNI (Sin puntos)
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="12345678"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-300" /> Teléfono
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="+54 9 11 ..."
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Key className="h-3 w-3 text-gray-300" /> {initialData ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <input
                            required={!initialData}
                            type="password"
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="********"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                    {/* Rol (Solo Super Admin) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-gray-300" /> Rol de Usuario
                        </label>
                        <select
                            disabled={!isSuperAdminView}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-slate-700"
                            value={formData.rol}
                            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        >
                            <option value="ALUMNO">Alumno</option>
                            <option value="INSTRUCTOR">Instructor (Administrador de Empresa)</option>
                            <option value="SUPER_ADMIN">Super Administrador (Cuidado)</option>
                        </select>
                    </div>

                    {/* Empresa */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-gray-300" /> Empresa Asignada
                        </label>
                        <select
                            disabled={!isSuperAdminView}
                            required={formData.rol !== 'SUPER_ADMIN'}
                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium text-slate-700"
                            value={formData.empresaId}
                            onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                        >
                            <option value="">Seleccionar Empresa...</option>
                            {empresas.map(e => (
                                <option key={e.id} value={e.id}>{e.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="activo"
                            className="h-4 w-4 text-primary rounded border-gray-300"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        />
                        <label htmlFor="activo" className="text-sm font-medium text-slate-700">Usuario Activo</label>
                    </div>

                    <div className="flex items-center gap-3">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={isLoading} className="px-8">
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    {initialData ? 'Actualizar Usuario' : 'Crear Usuario'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
