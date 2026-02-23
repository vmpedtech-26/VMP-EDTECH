'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
    Award,
    Plus,
    Download,
    Search,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    FileText,
    User,
    BookOpen,
    Sparkles,
} from 'lucide-react';
import { credencialesApi, CredencialListItem } from '@/lib/api/credenciales';
import { usersApi, UserAdmin } from '@/lib/api/users';
import { cursosApi } from '@/lib/api/cursos';
import { useAuth } from '@/lib/auth-context';

interface Curso {
    id: string;
    nombre: string;
    codigo: string;
}

export default function InstructorCredencialesPage() {
    const { user } = useAuth();
    const [credenciales, setCredenciales] = useState<CredencialListItem[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [selectedFilterCurso, setSelectedFilterCurso] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);

    const fetchCredenciales = useCallback(async () => {
        try {
            const data = await credencialesApi.listar();
            setCredenciales(data);
        } catch (error) {
            console.error('Error fetchCredenciales:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cursosData = await cursosApi.listarCursos();
                setCursos(cursosData);
                await fetchCredenciales();
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, [fetchCredenciales]);

    const vigentesCount = credenciales.filter(c => {
        if (!c.fechaVencimiento) return true;
        return new Date(c.fechaVencimiento) > new Date();
    }).length;

    const filteredCredenciales = credenciales.filter(c => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            c.alumnoNombre.toLowerCase().includes(term) ||
            c.alumnoApellido.toLowerCase().includes(term) ||
            c.alumnoDni.includes(term) ||
            c.cursoNombre.toLowerCase().includes(term) ||
            c.numero.toLowerCase().includes(term)
        );

        const matchesCurso = !selectedFilterCurso || c.cursoNombre === cursos.find(cur => cur.id === selectedFilterCurso)?.nombre;

        return matchesSearch && matchesCurso;
    });

    const handleDownloadBatch = async () => {
        if (!selectedFilterCurso) return;
        setIsDownloadingBatch(true);
        try {
            const res = await credencialesApi.descargarLote(selectedFilterCurso);
            window.open(res.pdfUrl, '_blank');
        } catch (error: any) {
            console.error('Error downloading batch:', error);
            alert(error.message || 'Error al generar el lote de credenciales');
        } finally {
            setIsDownloadingBatch(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-80" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
                </div>
                <Skeleton className="h-96 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Credenciales</h1>
                    <p className="text-slate-600 mt-1">Gestiona y emite certificaciones profesionales para tus alumnos</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="gap-2 shadow-lg shadow-primary/25">
                    <Plus className="h-4 w-4" />
                    Generar Credencial
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="p-6" hover={false}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-primary/10">
                            <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Emitidas</p>
                            <p className="text-3xl font-bold text-slate-900">{credenciales.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6" hover={false}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Vigentes</p>
                            <p className="text-3xl font-bold text-green-600">{vigentesCount}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6" hover={false}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-100">
                            <AlertCircle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Vencidas</p>
                            <p className="text-3xl font-bold text-amber-600">{credenciales.length - vigentesCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por alumno, DNI, curso o número..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="min-w-[200px] flex-1">
                        <select
                            value={selectedFilterCurso}
                            onChange={(e) => setSelectedFilterCurso(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Todos los cursos</option>
                            {cursos.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {selectedFilterCurso && (
                        <Button
                            variant="outline"
                            className="gap-2 border-primary text-primary hover:bg-primary/5"
                            onClick={handleDownloadBatch}
                            disabled={isDownloadingBatch}
                        >
                            {isDownloadingBatch ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Descargar Lote
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            {filteredCredenciales.length > 0 ? (
                <Card className="overflow-hidden" hover={false}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Número</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Alumno</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Curso</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Emisión</th>
                                    <th className="text-left py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Estado</th>
                                    <th className="text-right py-4 px-6 font-semibold text-slate-500 uppercase text-xs tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCredenciales.map((c) => {
                                    const isVigente = !c.fechaVencimiento || new Date(c.fechaVencimiento) > new Date();
                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-mono font-bold text-primary text-xs bg-primary/5 px-2 py-1 rounded-lg">
                                                    {c.numero}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{c.alumnoNombre} {c.alumnoApellido}</p>
                                                    <p className="text-xs text-slate-500">DNI: {c.alumnoDni}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-slate-700 font-medium">{c.cursoNombre}</p>
                                                <p className="text-xs text-slate-400">{c.cursoCodigo}</p>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">
                                                {new Date(c.fechaEmision).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isVigente
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isVigente ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    {isVigente ? 'Vigente' : 'Vencida'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <a
                                                    href={c.pdfUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    PDF
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card className="p-16 text-center" hover={false}>
                    <Award className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">
                        {searchTerm ? 'Sin resultados' : 'Sin credenciales emitidas'}
                    </h3>
                    <p className="text-slate-500 mt-2 max-w-md mx-auto">
                        {searchTerm
                            ? 'No se encontraron credenciales con los criterios de búsqueda.'
                            : 'Genera la primera credencial para tus alumnos usando el botón de arriba.'
                        }
                    </p>
                </Card>
            )}

            {/* Modal */}
            {showModal && (
                <GenerarCredencialModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchCredenciales();
                    }}
                />
            )}
        </div>
    );
}


// ============= MODAL =============

function GenerarCredencialModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [alumnos, setAlumnos] = useState<UserAdmin[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [selectedCurso, setSelectedCurso] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [alumnoSearch, setAlumnoSearch] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [alumnosData, cursosData] = await Promise.all([
                    usersApi.listarUsuarios({ rol: 'ALUMNO' }),
                    cursosApi.listarCursos(),
                ]);
                setAlumnos(alumnosData);
                setCursos(cursosData);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const filteredAlumnos = alumnos.filter(a => {
        const term = alumnoSearch.toLowerCase();
        return (
            a.nombre.toLowerCase().includes(term) ||
            a.apellido.toLowerCase().includes(term) ||
            a.dni.includes(term)
        );
    });

    const handleGenerar = async () => {
        if (!selectedAlumno || !selectedCurso) return;
        setIsGenerating(true);
        setResult(null);

        try {
            const res = await credencialesApi.generar(selectedAlumno, selectedCurso);
            setResult({ success: true, message: res.message });
            setTimeout(() => onSuccess(), 1500);
        } catch (error: any) {
            setResult({ success: false, message: error.message || 'Error al generar credencial' });
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedAlumnoData = alumnos.find(a => a.id === selectedAlumno);
    const selectedCursoData = cursos.find(c => c.id === selectedCurso);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Generar Credencial</h2>
                            <p className="text-sm text-slate-500">Emitir certificación profesional</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {isLoadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Alumno Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    Alumno
                                </label>
                                <input
                                    type="text"
                                    placeholder="Buscar alumno por nombre o DNI..."
                                    value={alumnoSearch}
                                    onChange={(e) => setAlumnoSearch(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                <select
                                    value={selectedAlumno}
                                    onChange={(e) => setSelectedAlumno(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Seleccionar alumno...</option>
                                    {filteredAlumnos.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.nombre} {a.apellido} — DNI {a.dni}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Curso Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-slate-400" />
                                    Curso
                                </label>
                                <select
                                    value={selectedCurso}
                                    onChange={(e) => setSelectedCurso(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Seleccionar curso...</option>
                                    {cursos.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre} ({c.codigo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Preview */}
                            {selectedAlumnoData && selectedCursoData && (
                                <Card className="p-4 bg-slate-50 border-dashed" hover={false}>
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="text-sm space-y-1">
                                            <p className="font-semibold text-slate-900">
                                                {selectedAlumnoData.nombre} {selectedAlumnoData.apellido}
                                            </p>
                                            <p className="text-slate-500">DNI: {selectedAlumnoData.dni}</p>
                                            <p className="text-slate-500">Curso: {selectedCursoData.nombre}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Result */}
                            {result && (
                                <div className={`p-4 rounded-2xl flex items-center gap-3 ${result.success
                                    ? 'bg-green-50 text-green-800 border border-green-200'
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                    }`}>
                                    {result.success ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    )}
                                    <p className="text-sm font-medium">{result.message}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleGenerar}
                        disabled={!selectedAlumno || !selectedCurso || isGenerating}
                        className="flex-1 gap-2 shadow-lg shadow-primary/25"
                    >
                        {isGenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Award className="h-4 w-4" />
                        )}
                        {isGenerating ? 'Generando...' : 'Generar Credencial'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
