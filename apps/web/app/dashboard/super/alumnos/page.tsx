'use client';

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Users,
    Search,
    Filter,
    Mail,
    Fingerprint,
    Phone,
    GraduationCap,
    Trash2,
    Loader2,
    UserCircle,
    Building2,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usersApi, UserAdmin } from '@/lib/api/users';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AlumnosPage() {
    const [usuarios, setUsuarios] = useState<UserAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsuarios = async () => {
        try {
            // Filtrar solo por rol ALUMNO para esta vista
            const data = await usersApi.listarUsuarios({ rol: 'ALUMNO' });
            setUsuarios(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar/desactivar este alumno?')) return;
        try {
            await usersApi.eliminarUsuario(id);
            fetchUsuarios();
        } catch (error: any) {
            alert(error.message || 'Error al eliminar el usuario');
        }
    };

    const filteredUsuarios = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.dni.includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-slate-700 text-sm">Administra los estudiantes registrados en todas las empresas.</p>
                </div>
                <Button className="w-full md:w-auto" asChild>
                    <Link href="/dashboard/super/alumnos/nuevo">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Alumno
                    </Link>
                </Button>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-primary" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI o email..."
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="bg-white border-slate-200">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar por Empresa
                </Button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredUsuarios.map((user) => (
                    <Card key={user.id} className="p-4 border-none shadow-sm ring-1 ring-gray-100 group hover:shadow-md hover:ring-primary/10 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Avatar/Icon */}
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                                <UserCircle className="h-8 w-8" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg">{user.nombre} {user.apellido}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                                        <Fingerprint className="h-3 w-3" />
                                        <span>DNI: {user.dni}</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${user.activo ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {user.activo ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center text-sm text-slate-700 gap-2">
                                        <Mail className="h-3.5 w-3.5 text-slate-600" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    {user.telefono && (
                                        <div className="flex items-center text-sm text-slate-700 gap-2">
                                            <Phone className="h-3.5 w-3.5 text-slate-600" />
                                            <span>{user.telefono}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center text-sm text-slate-700 font-medium gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span>{user.empresa_nombre || 'Sin Empresa'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest font-bold">
                                        Rol: {user.rol}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/dashboard/super/alumnos/${user.id}`}>
                                        Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-300 hover:text-red-500 h-9 w-9 p-0"
                                    onClick={() => handleDelete(user.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredUsuarios.length === 0 && !isLoading && (
                    <EmptyState
                        icon={Users}
                        title="No se encontraron alumnos"
                        description={searchTerm ? `No hay resultados para "${searchTerm}".` : "Aún no hay alumnos registrados en la plataforma."}
                        action={
                            searchTerm ? (
                                <Button variant="outline" onClick={() => setSearchTerm('')}>
                                    Limpiar búsqueda
                                </Button>
                            ) : (
                                <Button asChild>
                                    <Link href="/dashboard/super/alumnos/nuevo">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar mi primer alumno
                                    </Link>
                                </Button>
                            )
                        }
                    />
                )}

                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-6">
                                <Skeleton className="h-14 w-14 rounded-2xl" />
                                <div className="flex-1 grid grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-[120px]" />
                                        <Skeleton className="h-3 w-[60px]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
