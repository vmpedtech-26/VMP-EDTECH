'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Book, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkAssignPage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    
    // Data states
    const [cursos, setCursos] = useState<any[]>([]);
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Selections
    const [selectedCursoId, setSelectedCursoId] = useState<string>('');
    const [selectedEmpleados, setSelectedEmpleados] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            const [cursosRes, b2bRes] = await Promise.all([
                api.get('/b2b/cursos'),
                api.get('/b2b/dashboard')
            ]);
            setCursos(cursosRes);
            setEmpleados(b2bRes.employees);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const toggleEmpleado = (id: string) => {
        setSelectedEmpleados(prev => 
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedEmpleados.length === empleados.length) {
            setSelectedEmpleados([]);
        } else {
            setSelectedEmpleados(empleados.map(e => e.id));
        }
    };

    const handleAssign = async () => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/b2b/asignar-curso', {
                cursoId: selectedCursoId,
                alumnoIds: selectedEmpleados
            });
            toast.success(res.message);
            setStep(3); // Success step
        } catch (error: any) {
            toast.error(error.message || 'Error al asignar cursos');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Asignación Masiva</h1>
                <p className="text-gray-500 mt-2">Inscribe a múltiples conductores en un curso simultáneamente.</p>
            </div>

            {/* Steps indicator */}
            <div className="flex justify-center items-center space-x-4 mb-8">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm p-6 overflow-hidden relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <Book className="w-5 h-5 mr-2 text-primary" />
                                Selecciona el Curso
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cursos.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => setSelectedCursoId(c.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCursoId === c.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}`}
                                    >
                                        <h3 className="font-bold text-gray-900">{c.nombre}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Cód: {c.codigo}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-6">
                                <button 
                                    onClick={() => setStep(2)}
                                    disabled={!selectedCursoId}
                                    className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    <span>Continuar</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-primary" />
                                    Selecciona los Conductores
                                </h2>
                                <button onClick={toggleAll} className="text-sm font-medium text-primary">
                                    {selectedEmpleados.length === empleados.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                                </button>
                            </div>
                            
                            <div className="border rounded-xl overflow-hidden">
                                <div className="max-h-[300px] overflow-y-auto">
                                    {empleados.map(emp => (
                                        <div 
                                            key={emp.id}
                                            onClick={() => toggleEmpleado(emp.id)}
                                            className={`p-3 border-b last:border-0 flex items-center cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmpleados.includes(emp.id) ? 'bg-primary/5' : ''}`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                checked={selectedEmpleados.includes(emp.id)}
                                                readOnly
                                                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary mr-4"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.nombre} {emp.apellido}</p>
                                                <p className="text-xs text-gray-500">DNI: {emp.dni}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {empleados.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">No tienes colaboradores registrados.</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-between pt-6">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex items-center space-x-2 bg-white border text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Volver</span>
                                </button>
                                <button 
                                    onClick={handleAssign}
                                    disabled={selectedEmpleados.length === 0 || isSubmitting}
                                    className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Asignando...' : `Asignar a ${selectedEmpleados.length} conductores`}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center space-y-6 py-10"
                        >
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">¡Asignación Exitosa!</h2>
                                <p className="text-gray-500 mt-2">Los conductores seleccionados ya pueden acceder al curso desde su plataforma.</p>
                            </div>
                            <button 
                                onClick={() => router.push('/dashboard/empresa')}
                                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-colors"
                            >
                                Volver al Panel
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
