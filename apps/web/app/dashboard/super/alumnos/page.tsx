'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
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
    ShieldCheck,
    Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usersApi, UserAdmin } from '@/lib/api/users';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AlumnosPage() {
    const [usuarios, setUsuarios] = useState<UserAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmpresa, setSelectedEmpresa] = useState('ALL');
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        setDeletingId(id);
        try {
            await usersApi.eliminarUsuario(id);
            toast.success('Alumno eliminado correctamente');
            fetchUsuarios();
        } catch (error) {
            toast.error('Error al eliminar el usuario: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setDeletingId(null);
        }
    };

    const uniqueEmpresas = useMemo(() => {
        return Array.from(new Set(usuarios.map(u => u.empresa_nombre).filter(Boolean))) as string[];
    }, [usuarios]);

    const filteredUsuarios = useMemo(() => {
        return usuarios.filter(u =>
            (selectedEmpresa === 'ALL' || u.empresa_nombre === selectedEmpresa) &&
            (
                u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.dni.includes(searchTerm) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [usuarios, selectedEmpresa, searchTerm]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Reporte de Alumnos - VMP EDTECH', 14, 15);
        doc.setFontSize(10);
        doc.text(`Total de registros: ${filteredUsuarios.length}`, 14, 22);

        const tableData = filteredUsuarios.map(u => [
            `${u.nombre} ${u.apellido}`,
            u.dni,
            u.email,
            u.empresa_nombre || 'Sin Empresa',
            u.activo ? 'Activo' : 'Inactivo'
        ]);

        autoTable(doc, {
            head: [['Alumno', 'DNI', 'Email', 'Empresa', 'Estado']],
            body: tableData,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }, // primary blue
        });

        doc.save('alumnos_vmp.pdf');
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Alumnos</h1>
                    <p className="text-slate-700 text-sm">Administra los estudiantes registrados en todas las empresas.</p>
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <Button variant="outline" onClick={handleExportPDF} className="bg-white hover:bg-slate-50 flex-1 md:flex-none">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                    <Button className="flex-1 md:flex-none" asChild>
                        <Link href="/dashboard/super/alumnos/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Alumno
                        </Link>
                    </Button>
                </div>
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
                <div className="relative min-w-[200px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                        <Filter className="h-4 w-4" />
                    </div>
                    <select
                        value={selectedEmpresa}
                        onChange={(e) => setSelectedEmpresa(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border-none rounded-xl shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="ALL">Todas las Empresas</option>
                        {uniqueEmpresas.map(emp => (
                            <option key={emp} value={emp}>{emp}</option>
                        ))}
                    </select>
                </div>
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
                                        Rol: {user.rol} {user.puesto && <span className="text-primary ml-2">• {user.puesto}</span>}
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
                                    className="text-gray-300 hover:text-red-500 h-9 w-9 p-0 disabled:opacity-50"
                                    onClick={() => handleDelete(user.id)}
                                    disabled={deletingId === user.id}
                                >
                                    {deletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
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
