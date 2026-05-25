'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Award, BookOpen, Users, CheckCircle2, ArrowRight, Waves, 
    Target, Lightbulb, Phone, Mail, MapPin, Send, Cpu, QrCode, Eye, 
    Search, FileCheck, HelpCircle, Activity 
} from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import FormularioEvaluacion from '@/components/FormularioEvaluacion';
import VMPCredential from '@/components/VMPCredential';

export default function Home() {
    const [cotizacionForm, setCotizacionForm] = useState({
        empresa: '',
        contacto: '',
        email: '',
        telefono: '',
        servicio: '',
        mensaje: '',
    });

    const [certCode, setCertCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationSteps, setValidationSteps] = useState<string[]>([]);
    const [validationResult, setValidationResult] = useState<'success' | 'not_found' | null>(null);

    const handleCotizacion = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Cotización enviada exitosamente. Un especialista de VMP se pondrá en contacto pronto!');
    };

    const handleQuickVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certCode.trim()) return;

        const code = certCode.trim().toUpperCase();
        
        if (code !== 'CERT-DEMO') {
            // Redirección directa al validador oficial
            window.location.href = `/verificar/${code}`;
            return;
        }

        // Simulación interactiva de alta fidelidad para CERT-DEMO
        setIsValidating(true);
        setValidationResult(null);
        setValidationSteps([]);

        const steps = [
            'Conectando al registro central seguro de VMP EdTech...',
            'Validando firmas digitales y DNI del operador...',
            'Confirmando vigencia e historial en base de datos...',
            'Descargando credencial digital oficial de alta resolución...'
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 550));
            setValidationSteps((prev) => [...prev, `> ${steps[i]}`]);
        }

        await new Promise((resolve) => setTimeout(resolve, 350));
        setIsValidating(false);
        setValidationResult('success');
    };

    // Variantes de animación para Scroll-driven entrance (Propuesta C)
    const cardVariants = {
        hidden: { opacity: 0, y: 35 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.15 
            } 
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-vmp-teal/30 selection:text-vmp-navy">
            <Navbar />

            {/* Hero Section */}
            <section id="inicio" className="relative overflow-hidden bg-[#0A0F1D] pt-32 pb-24 px-6">
                {/* Rejilla de Ingeniería e Iluminación Sutil */}
                <div className="absolute inset-0 opacity-[0.06]" style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #4DB8A8 1px, transparent 0)', 
                    backgroundSize: '32px 32px' 
                }} />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-vmp-teal/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Contenido Izquierdo */}
                    <div className="lg:col-span-7 text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full mb-6 shadow-sm"
                        >
                            <span className="w-2 h-2 bg-vmp-teal rounded-full animate-pulse" />
                            <span className="text-xs text-slate-300 font-bold tracking-widest uppercase">
                                Plataforma de Cumplimiento ISO 39001
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] tracking-tight mb-6"
                        >
                            Seguridad Vial & <br />
                            <span className="text-vmp-teal">Capacitación de Precisión</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-xl"
                        >
                            Optimizamos la gestión de riesgos y la competencia operativa de flotas corporativas mediante exámenes proctorizados y credenciales seguras.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <a
                                href="#evaluaciones"
                                className="px-8 py-4 bg-vmp-teal text-white font-bold rounded-xl text-base shadow-lg shadow-vmp-teal/20 hover:bg-vmp-teal-dark transition-all duration-300 flex items-center gap-2 group"
                            >
                                Centro de Evaluaciones
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a
                                href="#cotizacion"
                                className="px-8 py-4 bg-slate-900 text-slate-100 border border-slate-800 font-semibold rounded-xl text-base hover:bg-slate-800 transition-all duration-300"
                            >
                                Consultoría Corporativa
                              </a>
                        </motion.div>
                    </div>

                    {/* Contenido Derecho: Credencial Interactiva VMP */}
                    <div className="lg:col-span-5 flex justify-center lg:justify-end">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative group cursor-default"
                        >
                            <div className="absolute -inset-2 bg-gradient-to-r from-vmp-teal/20 to-vmp-teal-light/10 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500">
                                <VMPCredential 
                                    alumno={{
                                        nombre_completo: "ALEJANDRO MARTÍNEZ",
                                        dni: "38.541.902"
                                    }}
                                    curso={{
                                        nombre: "MANEJO PREVENTIVO FLOTA LIVIANA",
                                        fecha_vencimiento: "2027-05-24"
                                    }}
                                    nota={95}
                                    qrCode="https://vmpservicios.com/verificar/CERT-DEMO"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Estadísticas Integradas en Línea */}
                <div className="max-w-7xl mx-auto mt-20 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#0F172A]/40 backdrop-blur-md border border-slate-800/80 rounded-3xl">
                        {[
                            { label: 'Años de Trayectoria', value: '15+' },
                            { label: 'Empresas Líderes', value: '150+' },
                            { label: 'Operadores Certificados', value: '2,500+' },
                            { label: 'Cumplimiento Auditoría', value: '100%' },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center md:border-r border-slate-800/50 last:border-0 py-4 px-2">
                                <div className="text-3xl font-black text-white mb-2 tracking-tight">{stat.value}</div>
                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ecosistema Tecnológico con Scroll Animation */}
            <section id="nosotros" className="py-24 px-6 bg-slate-50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <span className="px-4 py-2 bg-vmp-teal/10 text-vmp-teal rounded-full text-xs font-bold uppercase tracking-widest">
                            Infraestructura e Integridad
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-vmp-navy mt-6 mb-4 tracking-tight">
                            Capacidades Tecnológicas de Vanguardia
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                            Nuestra plataforma no solo imparte contenidos; garantiza la trazabilidad legal, la autenticidad del aprendizaje y la robustez del cumplimiento internacional.
                        </p>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            {
                                icon: QrCode,
                                title: 'Identidad Digital Segura',
                                desc: 'Cada operador recibe una credencial digital encriptada con un identificador público único enlazado a su hoja de vida operativa.'
                            },
                            {
                                icon: Cpu,
                                title: 'Proctoring Activo',
                                desc: 'El motor LMS de SafeDrive Pro analiza activamente la permanencia en pantalla y cambios de pestañas para auditar la honestidad del examen.'
                            },
                            {
                                icon: FileCheck,
                                title: 'Validación en Tiempo Real',
                                desc: 'Organismos estatales, gerentes de logística y supervisores pueden verificar credenciales de manera pública mediante QR en 1 segundo.'
                            },
                            {
                                icon: Shield,
                                title: 'Garantía ISO 39001',
                                desc: 'Auditorías sistemáticas de conducción preventivas adaptadas a los estándares de cumplimiento vial más exigentes de la industria.'
                            }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx} 
                                variants={cardVariants}
                                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-vmp-teal/10 rounded-xl flex items-center justify-center mb-6">
                                    <item.icon className="w-6 h-6 text-vmp-teal" />
                                </div>
                                <h3 className="text-lg font-bold text-vmp-navy mb-3">{item.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Widget Interactivo de Validación en Vivo */}
            <section className="py-24 px-6 bg-[#0A0F1D] text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ 
                    backgroundImage: 'radial-gradient(circle at 1px 1px, #4DB8A8 1px, transparent 0)', 
                    backgroundSize: '24px 24px' 
                }} />
                <div className="max-w-4xl mx-auto relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <span className="px-4 py-2 bg-vmp-teal/20 text-vmp-teal rounded-full text-xs font-bold uppercase tracking-widest border border-vmp-teal/20">
                            Validación de Datos en Vivo
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-white mt-6 mb-4 tracking-tight">
                            Validador Público de Certificados
                        </h2>
                        <p className="text-slate-400 text-base max-w-xl mx-auto font-medium">
                            Comprueba el estatus operativo de cualquier conductor en nuestra base de datos institucional. Ingresa el código único del certificado.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="bg-[#12192C] rounded-3xl border border-slate-800 p-6 md:p-10 shadow-2xl"
                    >
                        <form onSubmit={handleQuickVerify} className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={certCode}
                                    onChange={(e) => setCertCode(e.target.value)}
                                    placeholder="Ingresa código de credencial (Ej: CERT-DEMO)"
                                    className="w-full pl-12 pr-4 py-4 bg-[#0A0F1D] border-2 border-slate-800 rounded-xl focus:border-vmp-teal focus:ring-0 text-white font-medium placeholder-slate-600 transition-colors"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isValidating}
                                className="px-8 py-4 bg-vmp-teal text-white font-bold rounded-xl hover:bg-vmp-teal-dark transition-all duration-300 disabled:bg-slate-800 flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-vmp-teal/10"
                            >
                                {isValidating ? 'Consultando...' : 'Verificar'}
                            </button>
                        </form>

                        <div className="flex items-center gap-2 mb-4">
                            <HelpCircle className="w-4 h-4 text-vmp-teal" />
                            <span className="text-xs text-slate-400 font-bold">
                                Código de prueba disponible: <button type="button" onClick={() => setCertCode('CERT-DEMO')} className="text-vmp-teal hover:underline font-bold">CERT-DEMO</button>
                            </span>
                        </div>

                        {/* Terminal de Simulación */}
                        <AnimatePresence>
                            {(isValidating || validationSteps.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-[#0A0F1D] border border-slate-800 rounded-2xl p-5 font-mono text-xs text-emerald-400 space-y-2 overflow-hidden shadow-inner"
                                >
                                    {validationSteps.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                    {isValidating && (
                                        <div className="animate-pulse text-slate-500">&gt; Consultando registro descentralizado...</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Resultado de Validación */}
                        <AnimatePresence>
                            {validationResult === 'success' && !isValidating && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col items-center"
                                >
                                    <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full mb-8 font-bold text-sm tracking-wider uppercase">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Registro Oficial Validado
                                    </div>
                                    
                                    <motion.div 
                                        initial={{ scale: 0.95 }}
                                        animate={{ scale: 1 }}
                                        className="shadow-2xl rounded-2xl overflow-hidden border border-vmp-teal/30 scale-90 md:scale-100"
                                    >
                                        <VMPCredential 
                                            alumno={{
                                                nombre_completo: "ALEJANDRO MARTÍNEZ",
                                                dni: "38.541.902"
                                            }}
                                            curso={{
                                                nombre: "MANEJO PREVENTIVO FLOTA LIVIANA",
                                                fecha_vencimiento: "2027-05-24"
                                            }}
                                            nota={95}
                                            qrCode="https://vmpservicios.com/verificar/CERT-DEMO"
                                        />
                                    </motion.div>

                                    <a 
                                        href="/verificar/CERT-DEMO"
                                        className="mt-8 text-sm text-vmp-teal font-bold hover:underline flex items-center gap-1.5"
                                    >
                                        Ver Registro de Auditoría Completo
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Servicios Profesionales Corporativos */}
            <section id="servicios" className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <span className="px-4 py-2 bg-vmp-teal/10 text-vmp-teal rounded-full text-xs font-bold uppercase tracking-widest">
                            Soluciones Operativas
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-vmp-navy mt-6 mb-4 tracking-tight">
                            Especialización para Industrias Exigentes
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                            Soluciones integrales de seguridad vial y analítica para corporaciones de minería, logística, energía y transporte de carga pesada.
                        </p>
                    </motion.div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: Shield,
                                title: 'Implementación ISO 39001',
                                desc: 'Diseño integral, auditoría y certificación de Sistemas de Gestión de Seguridad Vial, reduciendo siniestros y optimizando costes de seguros.',
                                bullets: ['Auditas de Brecha Inicial', 'Estructurador de Políticas', 'Certificación Internacional']
                            },
                            {
                                icon: BookOpen,
                                title: 'Entrenamiento de Alta Competencia',
                                desc: 'Capacitación presencial y digital en conducción técnica preventiva para terrenos hostiles, climas extremos y cargas de alto riesgo.',
                                bullets: ['Manejo Defensivo y 4x4', 'Transporte de Mercancías Peligrosas', 'Certificación Oficial de Operadores']
                            },
                            {
                                icon: Users,
                                title: 'Gestión y Analítica de Flotas',
                                desc: 'Ingeniería de riesgos y análisis de telemetría de comportamiento vial del conductor profesional para la toma de decisiones estratégicas.',
                                bullets: ['Perfiles de Riesgo de Choferes', 'Ingeniería en Ruta y Puntos Negros', 'Monitoreo de Fatiga y Somnolencia']
                            }
                        ].map((servicio, idx) => (
                            <motion.div
                                key={idx}
                                variants={cardVariants}
                                whileHover={{ y: -6 }}
                                className="bg-slate-50 border border-gray-100 rounded-2xl p-8 hover:border-vmp-teal/30 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="w-12 h-12 bg-vmp-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                                        <servicio.icon className="w-6 h-6 text-vmp-teal" />
                                    </div>
                                    <h3 className="text-xl font-bold text-vmp-navy mb-4">{servicio.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">{servicio.desc}</p>
                                </div>
                                <ul className="space-y-3 pt-6 border-t border-gray-200/50">
                                    {servicio.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-xs text-gray-700 font-bold uppercase tracking-wide">
                                            <span className="w-1.5 h-1.5 bg-vmp-teal rounded-full shrink-0" />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Portal de Evaluaciones / SafeDrive Pro LMS */}
            <section id="evaluaciones" className="py-24 px-6 bg-slate-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <span className="px-4 py-2 bg-vmp-teal/10 text-vmp-teal rounded-full text-xs font-bold uppercase tracking-widest">
                            SafeDrive Pro LMS
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-vmp-navy mt-6 mb-4 tracking-tight">
                            Centro de Evaluaciones Digitales
                        </h2>
                        <p className="text-lg text-gray-600 font-medium">
                            Completa tu evaluación técnica oficial para obtener tu credencial digital. Asegúrate de estar en un espacio sin distracciones.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="bg-[#0C1524] rounded-[2.5rem] border border-slate-800/80 p-6 md:p-12 shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center gap-2 mb-8 bg-slate-900/80 px-4 py-2 border border-slate-800 rounded-full w-fit">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                Servidor de Examen Seguro con Proctoring
                            </span>
                        </div>
                        <FormularioEvaluacion />
                    </motion.div>
                </div>
            </section>

            {/* Cotización Corporativa con Scroll Animation */}
            <section id="cotizacion" className="py-24 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
                    >
                        {/* Datos de Contacto */}
                        <motion.div variants={cardVariants} className="lg:col-span-5 animate-none">
                            <span className="px-4 py-2 bg-vmp-teal/10 text-vmp-teal rounded-full text-xs font-bold uppercase tracking-widest">
                                Contacto Directo
                            </span>
                            <h2 className="text-4xl font-black text-vmp-navy mt-6 mb-6 tracking-tight">
                                Consultoría e Ingeniería Vial
                            </h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10">
                                Conversemos sobre cómo estructurar el plan de seguridad, capacitar a tus operadores y digitalizar los controles de tu flota.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { icon: Phone, label: 'Central de Atención', value: '+54 11 4567-8900' },
                                    { icon: Mail, label: 'Correo Institucional', value: 'contacto@vmpservicios.com' },
                                    { icon: MapPin, label: 'Oficina Central', value: 'Buenos Aires, Argentina' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-vmp-teal" />
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{item.label}</div>
                                            <div className="text-sm font-semibold text-vmp-navy">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Formulario */}
                        <motion.div variants={cardVariants} className="lg:col-span-7 bg-slate-50 border border-gray-100 rounded-3xl p-8 md:p-10">
                            <form onSubmit={handleCotizacion} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Empresa / Institución *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium placeholder-gray-400 transition-colors"
                                            placeholder="Nombre de la empresa"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del Contacto *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium placeholder-gray-400 transition-colors"
                                            placeholder="Ej: Juan Pérez"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Corporativo *</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium placeholder-gray-400 transition-colors"
                                            placeholder="contacto@empresa.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teléfono de Enlace *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium placeholder-gray-400 transition-colors"
                                            placeholder="+54 11 1234-5678"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Servicio Requerido *</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium text-gray-700 transition-colors"
                                    >
                                        <option value="">-- Selecciona una opción --</option>
                                        <option>Certificación e Implementación ISO 39001</option>
                                        <option>Entrenamiento y LMS SafeDrive Pro</option>
                                        <option>Gestión Integral de Flota y Riesgos</option>
                                        <option>Otro Requerimiento Técnico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción del Proyecto</label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-vmp-teal focus:ring-0 text-sm font-medium placeholder-gray-400 transition-colors"
                                        placeholder="Cuéntanos más sobre el tamaño de la flota o necesidades operativas..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-vmp-teal text-white font-bold rounded-xl hover:bg-vmp-teal-dark transition-all duration-300 shadow-lg shadow-vmp-teal/10 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Enviar Mensaje Oficial
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0A0F1D] text-slate-300 py-16 px-6 border-t border-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Columna Branding */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <img 
                                    src="/vmp_logotipo_completo_real_4k.svg" 
                                    alt="VMP Logo" 
                                    className="h-9 w-auto invert brightness-200" 
                                />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold uppercase tracking-wider">
                                Soluciones integrales de seguridad vial, cumplimiento normativo y tecnología LMS proctorizada.
                            </p>
                        </div>

                        {/* Servicios */}
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Servicios</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#servicios" className="hover:text-vmp-teal transition-colors">ISO 39001</a></li>
                                <li><a href="#servicios" className="hover:text-vmp-teal transition-colors">Capacitación Técnica</a></li>
                                <li><a href="#servicios" className="hover:text-vmp-teal transition-colors">Gestión de Flotas</a></li>
                                <li><a href="#evaluaciones" className="hover:text-vmp-teal transition-colors">SafeDrive Pro LMS</a></li>
                            </ul>
                        </div>

                        {/* Corporativo */}
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a href="#nosotros" className="hover:text-vmp-teal transition-colors">Tecnología</a></li>
                                <li><a href="#cotizacion" className="hover:text-vmp-teal transition-colors">Contacto</a></li>
                                <li><a href="/admin/cargar-nota" className="hover:text-vmp-teal transition-colors">Panel Admin</a></li>
                            </ul>
                        </div>

                        {/* Contacto */}
                        <div>
                            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>contacto@vmpservicios.com</li>
                                <li>+54 11 4567-8900</li>
                                <li>Buenos Aires, Argentina</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 font-bold uppercase tracking-wider">
                        <p>© 2026 VMP EdTech. Todos los derechos reservados. Seguridad Vial de Alta Precisión.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
