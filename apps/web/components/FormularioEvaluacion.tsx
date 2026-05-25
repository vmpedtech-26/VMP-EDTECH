'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, Shield, Clock } from 'lucide-react';
import { supabase, type CategoriaCurso, type ExamenPlantilla, type Pregunta } from '@/lib/supabase';
import { evaluacionFormSchema, type EvaluacionFormData } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface FormularioEvaluacionProps {
    onExamenCompleto?: (certificadoId: string) => void;
}

export default function FormularioEvaluacion({ onExamenCompleto }: FormularioEvaluacionProps) {
    const [categorias, setCategorias] = useState<CategoriaCurso[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaCurso | null>(null);
    const [examenActual, setExamenActual] = useState<ExamenPlantilla | null>(null);
    const [loading, setLoading] = useState(false);
    const [paso, setPaso] = useState<'formulario' | 'examen' | 'resultado'>('formulario');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<EvaluacionFormData>({
        resolver: zodResolver(evaluacionFormSchema),
    });

    const categoriaIdWatch = watch('categoria_id');

    // Cargar categorías al montar el componente
    useEffect(() => {
        const cargarCategorias = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('categorias_curso')
                    .select('*')
                    .order('nombre_curso');

                if (error) throw error;
                setCategorias(data || []);
            } catch (error) {
                console.error('Error cargando categorías:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarCategorias();
    }, []);

    // COMPORTAMIENTO DINÁMICO: Autocompletar campos al seleccionar categoría
    useEffect(() => {
        if (categoriaIdWatch) {
            const categoria = categorias.find((c) => c.id === categoriaIdWatch);
            setCategoriaSeleccionada(categoria || null);
        } else {
            setCategoriaSeleccionada(null);
        }
    }, [categoriaIdWatch, categorias]);

    // Manejar envío del formulario inicial
    const onSubmit = async (data: EvaluacionFormData) => {
        setLoading(true);
        try {
            // Cargar el examen asociado a la categoría
            const { data: examenData, error } = await supabase
                .from('examenes_plantilla')
                .select('*')
                .eq('categoria_id', data.categoria_id)
                .single();

            if (error) throw error;

            setExamenActual(examenData);
            setPaso('examen');
        } catch (error) {
            console.error('Error cargando examen:', error);
            alert('No se pudo cargar el examen. Por favor intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-0">
            {paso === 'formulario' && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-10 shadow-lg text-slate-800"
                >
                    <div className="flex items-center gap-3 mb-6 bg-cyan-50/50 px-4 py-2 border border-cyan-500/10 rounded-xl w-fit">
                        <span className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">
                            Evaluación Oficial de Operadores
                        </span>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Selector de Categoría */}
                        <div>
                            <label htmlFor="categoria_id" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Categoría del Curso Requerida *
                            </label>
                            <select
                                id="categoria_id"
                                {...register('categoria_id')}
                                className={cn(
                                    'w-full px-4 py-3.5 bg-slate-50 border text-sm font-semibold text-slate-800 rounded-xl focus:border-cyan-650 focus:bg-white focus:ring-0 transition-all outline-none',
                                    errors.categoria_id ? 'border-red-500' : 'border-slate-200'
                                )}
                                disabled={loading}
                            >
                                <option value="" className="bg-white text-slate-500">-- Seleccione una categoría --</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id} value={cat.id} className="bg-white text-slate-800">
                                        {cat.nombre_curso}
                                    </option>
                                ))}
                            </select>
                            {errors.categoria_id && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errors.categoria_id.message}
                                </p>
                            )}
                        </div>

                        {/* Auto-completado: Vigencia y Nota Mínima */}
                        {categoriaSeleccionada && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="grid grid-cols-2 gap-4 p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10"
                            >
                                <div>
                                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Vigencia Operativa</p>
                                    <p className="text-xl font-black text-cyan-700 mt-1">
                                        {categoriaSeleccionada.vigencia_meses} meses
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Exigencia Aprobación</p>
                                    <p className="text-xl font-black text-cyan-700 mt-1">
                                        {categoriaSeleccionada.nota_minima_aprobacion}%
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Datos del Alumno */}
                        <div>
                            <label htmlFor="alumno_nombre" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Nombre Completo del Alumno *
                            </label>
                            <input
                                type="text"
                                id="alumno_nombre"
                                {...register('alumno_nombre')}
                                className={cn(
                                    'w-full px-4 py-3.5 bg-slate-50 border text-sm font-semibold text-slate-800 rounded-xl focus:border-cyan-650 focus:bg-white focus:ring-0 transition-all outline-none',
                                    errors.alumno_nombre ? 'border-red-500' : 'border-slate-200'
                                )}
                                placeholder="Ej: Juan Pérez Rodríguez"
                            />
                            {errors.alumno_nombre && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errors.alumno_nombre.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="alumno_email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Correo Electrónico del Alumno *
                            </label>
                            <input
                                type="email"
                                id="alumno_email"
                                {...register('alumno_email')}
                                className={cn(
                                    'w-full px-4 py-3.5 bg-slate-50 border text-sm font-semibold text-slate-800 rounded-xl focus:border-cyan-650 focus:bg-white focus:ring-0 transition-all outline-none',
                                    errors.alumno_email ? 'border-red-500' : 'border-slate-200'
                                )}
                                placeholder="alumno@ejemplo.com"
                            />
                            {errors.alumno_email && (
                                <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {errors.alumno_email.message}
                                </p>
                            )}
                        </div>

                        {/* Botón de Envío */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !categoriaSeleccionada}
                            className={cn(
                                'w-full py-4 px-6 font-black text-sm uppercase tracking-wider bg-cyan-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-600/10 border-0',
                                'hover:bg-cyan-750 active:scale-98',
                                'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none',
                                'flex items-center justify-center gap-2'
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Iniciando Examen...
                                </>
                            ) : (
                                <>
                                    Iniciar Evaluación Técnica
                                    <CheckCircle2 className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Descripción de la categoría */}
                    {categoriaSeleccionada?.descripcion && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-xs leading-relaxed font-semibold"
                        >
                            <strong className="text-slate-800">Detalles del Proceso:</strong> {categoriaSeleccionada.descripcion}
                        </motion.div>
                    )}
                </motion.div>
            )}

            {paso === 'examen' && examenActual && (
                <ExamenEnVivo
                    examen={examenActual}
                    categoriaSeleccionada={categoriaSeleccionada!}
                    onExamenFinalizado={(certificadoId) => {
                        setPaso('resultado');
                        onExamenCompleto?.(certificadoId);
                    }}
                />
            )}
        </div>
    );
}

// Componente de Examen En Vivo
interface ExamenEnVivoProps {
    examen: ExamenPlantilla;
    categoriaSeleccionada: CategoriaCurso;
    onExamenFinalizado: (certificadoId: string) => void;
}

function ExamenEnVivo({ examen, categoriaSeleccionada, onExamenFinalizado }: ExamenEnVivoProps) {
    const [preguntaActual, setPreguntaActual] = useState(0);
    const [respuestas, setRespuestas] = useState<Record<string, string>>({});
    const [tiempoRestante, setTiempoRestante] = useState(examen.tiempo_limite_minutos * 60);
    const [proctoringData, setProctoringData] = useState({
        tab_switches: [] as { timestamp: number }[],
        start_time: Date.now(),
        end_time: 0,
    });
    const [submitting, setSubmitting] = useState(false);

    const preguntas = examen.preguntas;
    const pregunta = preguntas[preguntaActual]!;

    // Timer del examen
    useEffect(() => {
        if (tiempoRestante <= 0) {
            handleSubmitExamen();
            return;
        }

        const timer = setInterval(() => {
            setTiempoRestante((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [tiempoRestante]);

    // Proctoring: Detectar cambios de pestaña
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setProctoringData((prev) => ({
                    ...prev,
                    tab_switches: [...prev.tab_switches, { timestamp: Date.now() }],
                }));

                if (proctoringData.tab_switches.length >= 2) {
                    alert('⚠️ Advertencia de Proctoring: Se ha registrado una salida de pantalla. Esto quedará anexado al certificado.');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [proctoringData.tab_switches.length]);

    const handleRespuesta = (respuesta: string) => {
        setRespuestas((prev) => ({
            ...prev,
            [pregunta.id]: respuesta,
        }));
    };

    const handleSiguiente = () => {
        if (preguntaActual < preguntas.length - 1) {
            setPreguntaActual((prev) => prev + 1);
        }
    };

    const handleSubmitExamen = async () => {
        setSubmitting(true);
        proctoringData.end_time = Date.now();

        try {
            // Calcular nota
            let correctas = 0;
            preguntas.forEach((p: Pregunta) => {
                if (respuestas[p.id] === p.correct_answer) {
                    correctas++;
                }
            });

            const notaObtenida = (correctas / preguntas.length) * 100;
            const aprobado = notaObtenida >= categoriaSeleccionada.nota_minima_aprobacion;

            // Guardar intento en la base de datos
            const { data: intentoData, error: intentoError } = await supabase
                .from('intentos_examen')
                .insert({
                    alumno_id: (await supabase.auth.getUser()).data.user?.id,
                    examen_id: examen.id,
                    respuestas,
                    nota_obtenida: notaObtenida,
                    aprobado,
                    proctoring_data: proctoringData,
                })
                .select()
                .single();

            if (intentoError) throw intentoError;

            // Si aprobó, generar certificado
            if (aprobado) {
                const codigoVerificacion = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const fechaEmision = new Date();
                const fechaVencimiento = new Date();
                fechaVencimiento.setMonth(fechaVencimiento.getMonth() + categoriaSeleccionada.vigencia_meses);

                const { data: certData, error: certError } = await supabase
                    .from('certificaciones_emitidas')
                    .insert({
                        alumno_id: (await supabase.auth.getUser()).data.user?.id,
                        categoria_id: categoriaSeleccionada.id,
                        codigo_verificacion: codigoVerificacion,
                        nota_obtenida: notaObtenida,
                        fecha_emision: fechaEmision.toISOString().split('T')[0],
                        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                        estado: 'valido',
                    })
                    .select()
                    .single();

                if (certError) throw certError;

                alert(`¡Felicitaciones! Has aprobado el examen con ${notaObtenida.toFixed(1)}%`);
                onExamenFinalizado(certData.id);
            } else {
                alert(`Evaluación completada. Nota obtenida: ${notaObtenida.toFixed(1)}%. No has alcanzado el ${categoriaSeleccionada.nota_minima_aprobacion}% mínimo requerido.`);
            }
        } catch (error) {
            console.error('Error enviando examen:', error);
            alert('Hubo un error al enviar el examen');
        } finally {
            setSubmitting(false);
        }
    };

    const formatTiempo = (segundos: number) => {
        const mins = Math.floor(segundos / 60);
        const secs = Math.floor(segundos % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200/80 p-6 md:p-10 rounded-[2rem] shadow-xl text-slate-800 relative overflow-hidden"
        >
            {/* Encabezado Seguro y Proctoring */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-100 pb-6 mb-8">
                <div className="md:col-span-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{examen.titulo_examen}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">
                        Pregunta actual: <span className="text-cyan-600 font-black">{preguntaActual + 1}</span> de <span className="text-slate-850 font-black">{preguntas.length}</span>
                    </p>
                </div>
                
                {/* Status Telemetria */}
                <div className="md:col-span-3 flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
                    <span className={cn(
                        "w-2.5 h-2.5 rounded-full animate-pulse shrink-0",
                        proctoringData.tab_switches.length > 0 ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                    <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider leading-none">Canal Proctoring</p>
                        <p className="text-xs font-bold text-slate-800 mt-1 leading-none">
                            {proctoringData.tab_switches.length > 0 
                                ? `Alertas: ${proctoringData.tab_switches.length}` 
                                : "Monitoreo Activo"}
                        </p>
                    </div>
                </div>

                {/* Reloj Temporizador */}
                <div className="md:col-span-3">
                    <div className={cn(
                        "px-4 py-2.5 rounded-xl font-mono text-base font-bold flex items-center justify-between border transition-colors",
                        tiempoRestante < 60 
                            ? "bg-red-50/80 border-red-200 text-red-650" 
                            : "bg-cyan-50/80 border-cyan-200 text-cyan-700"
                    )}>
                        <span className="text-[10px] font-sans uppercase tracking-widest font-black text-slate-500 leading-none">Tiempo:</span>
                        <span className="leading-none">⏱️ {formatTiempo(tiempoRestante)}</span>
                    </div>
                </div>
            </div>

            {/* Tracker Visual de Preguntas (Grid Interactive) */}
            <div className="flex flex-wrap gap-2 mb-8 justify-start">
                {preguntas.map((p: Pregunta, idx: number) => {
                    const isCurrent = idx === preguntaActual;
                    const isAnswered = respuestas[p.id] !== undefined;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPreguntaActual(idx)}
                            className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border-2 transition-all duration-300",
                                isCurrent 
                                    ? "border-cyan-600 bg-cyan-600 text-white shadow-lg shadow-cyan-600/10" 
                                    : isAnswered 
                                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" 
                                        : "border-slate-200 bg-slate-50 text-slate-450 hover:border-slate-350 hover:text-slate-800"
                            )}
                        >
                            {idx + 1}
                        </button>
                    );
                })}
            </div>

            {/* Pregunta Activa */}
            <div className="mb-8">
                <h4 className="text-lg font-black text-slate-900 mb-6 leading-relaxed">
                    {pregunta.question_text}
                </h4>

                <div className="space-y-3.5">
                    {pregunta.options.map((opcion: string, idx: number) => {
                        const letras = ['A', 'B', 'C', 'D'];
                        const letra = letras[idx] || '';
                        const isSelected = respuestas[pregunta.id] === opcion;
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleRespuesta(opcion)}
                                className={cn(
                                    'w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 group',
                                    isSelected
                                        ? 'border-cyan-600 bg-cyan-50/50 text-cyan-800 font-bold'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-650 hover:border-cyan-500/30 hover:bg-white hover:text-slate-800'
                                )}
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors duration-300",
                                    isSelected
                                        ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/15"
                                        : "bg-slate-200 text-slate-555 group-hover:bg-slate-300 group-hover:text-slate-700"
                                )}>
                                    {letra}
                                </div>
                                <span className="text-sm font-semibold">{opcion}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Controles de Navegacion */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {Object.keys(respuestas).length} / {preguntas.length} respondidas
                </div>

                {preguntaActual < preguntas.length - 1 ? (
                    <button
                        onClick={handleSiguiente}
                        disabled={!respuestas[pregunta.id]}
                        className={cn(
                            'px-6 py-3 bg-cyan-600 hover:bg-cyan-750 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed border-0'
                        )}
                    >
                        Siguiente →
                    </button>
                ) : (
                    <button
                        onClick={handleSubmitExamen}
                        disabled={submitting || Object.keys(respuestas).length < preguntas.length}
                        className={cn(
                            'px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed border-0',
                            'flex items-center gap-2'
                        )}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Finalizar Examen'
                        )}
                    </button>
                )}
            </div>

            {/* Proctoring Warning Alerta */}
            {proctoringData.tab_switches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3.5"
                >
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-xs font-bold text-amber-600 uppercase tracking-widest leading-none">Desvío de Pantalla Registrado</h5>
                        <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">
                            Se registraron {proctoringData.tab_switches.length} salida(s) de foco de la pestaña activa de evaluación. Estos eventos se guardaron en los registros de auditoría y afectarán la legitimidad final del certificado emitido.
                        </p>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
