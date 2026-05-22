'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    BookOpen,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cursosApi } from '@/lib/api/cursos';
import { Curso } from '@/types/training';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';

export default function SuperCursosPage() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        setIsLoading(true);
        try {
            const data = await cursosApi.listarCursos();
            setCursos(data);
        } catch (error) {
            console.error('Error fetching cursos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este curso?')) return;
        setDeletingId(id);
        try {
            await cursosApi.eliminarCurso(id);
            toast.success('Curso eliminado correctamente');
            fetchCursos();
        } catch (error) {
            toast.error('Error al eliminar curso: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setDeletingId(null);
        }
    };

    const filteredCursos = useMemo(() => {
        return cursos.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cursos, searchTerm]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Catálogo de Cursos - VMP EDTECH', 14, 15);
        doc.setFontSize(10);
        doc.text(`Total de cursos: ${filteredCursos.length}`, 14, 22);

        const tableData = filteredCursos.map(c => [
            c.codigo,
            c.nombre,
            `${c.duracionHoras} horas`,
            c.activo ? 'Activo' : 'Inactivo'
        ]);

        autoTable(doc, {
            head: [['Código', 'Nombre', 'Duración', 'Estado']],
            body: tableData,
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save('cursos_vmp.pdf');
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-4 w-[350px]" />
                    </div>
                    <Skeleton className="h-11 w-[150px] rounded-xl" />
                </div>
                <Skeleton className="h-14 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[60px]" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <Skeleton className="h-9 flex-1" />
                                <Skeleton className="h-9 w-9" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Cursos</h1>
                    <p className="text-slate-700">Administra el catálogo global de capacitaciones</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={handleExportPDF} className="bg-white hover:bg-slate-50 flex-1 md:flex-none">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                    </Button>
                    <Button asChild className="shadow-lg shadow-primary/20 flex-1 md:flex-none">
                        <Link href="/dashboard/super/cursos/nuevo">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Curso
                        </Link>
                    </Button>
                </div>
            </div>

            <Card className="p-4 border-none shadow-sm ring-1 ring-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCursos.map((curso) => (
                    <Card key={curso.id} className="group hover:shadow-xl transition-all duration-300 border-none ring-1 ring-gray-100 overflow-hidden">
                        <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${curso.activo ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                    {curso.activo ? 'Activo' : 'Inactivo'}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">
                                    {curso.codigo}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                    {curso.nombre}
                                </h3>
                                <p className="text-sm text-slate-700 line-clamp-2 mt-1">
                                    {curso.descripcion}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs font-medium text-slate-700 pt-2">
                                <span className="flex items-center">
                                    <Eye className="h-3 w-3 mr-1" />
                                    6 modulos
                                </span>
                                <span>•</span>
                                <span>{curso.duracionHoras} horas</span>
                            </div>

                            <div className="pt-4 flex items-center gap-2 border-t border-gray-50">
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <Link href={`/dashboard/super/cursos/${curso.id}`}>
                                        <Edit2 className="h-3.5 w-3.5 mr-2" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 disabled:opacity-50"
                                    onClick={() => handleDelete(curso.id)}
                                    disabled={deletingId === curso.id}
                                >
                                    {deletingId === curso.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredCursos.length === 0 && (
                    <div className="col-span-full">
                        <EmptyState
                            icon={BookOpen}
                            title="No se encontraron cursos"
                            description={searchTerm ? `No hay resultados para "${searchTerm}". Intenta con otros términos.` : "Aún no hay cursos registrados en el catálogo global."}
                            action={
                                searchTerm ? (
                                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                                        Limpiar búsqueda
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <Link href="/dashboard/super/cursos/nuevo">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear mi primer curso
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
