'use client';

import { motion } from 'framer-motion';
import { 
    ShieldCheck, Target, Award, Users, CheckCircle2, 
    MonitorPlay, Briefcase, GraduationCap, Globe,
    BarChart3, BadgeCheck, Zap
} from 'lucide-react';

export default function AboutUs() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section id="quienes-somos" className="relative py-24 md:py-32 overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
                
                {/* Header & Intro */}
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={fadeIn.transition}
                        className="inline-flex items-center space-x-2 bg-white border border-primary/20 rounded-full px-5 py-2.5 mb-6 shadow-sm"
                    >
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Quiénes Somos</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight mb-8"
                    >
                        Transformando la <span className="gradient-text">Cultura Vial</span>
                    </motion.h2>

                    <motion.p
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.2 }}
                        className="text-xl text-slate-600 leading-relaxed"
                    >
                        <strong>VMP-EDTECH</strong> desarrolla soluciones integrales de formación profesional orientadas a mejorar la seguridad, productividad y cumplimiento normativo de empresas que operan con vehículos.
                    </motion.p>
                </div>

                {/* Misión & Visión */}
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-start"
                    >
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                            <Target className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Misión</h3>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            Impulsar una nueva generación de conductores profesionales, integrando tecnología educativa, formación técnica y certificación verificable para elevar los estándares de seguridad vial y desempeño operativo en empresas de toda Argentina.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Nuestro compromiso es reducir incidentes, optimizar la gestión de flotas y garantizar competencias profesionales verificables mediante programas de capacitación innovadores y medibles.
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-slate-900 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-900/20 border border-slate-800 flex flex-col items-start text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-[80px] rounded-full" />
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10 backdrop-blur-sm">
                            <Globe className="w-7 h-7 text-secondary" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Visión</h3>
                        <p className="text-slate-300 leading-relaxed relative z-10">
                            Convertirnos en la plataforma líder en capacitación vial profesional y certificación digital en Latinoamérica, integrando tecnología, formación especializada y estándares internacionales para transformar la forma en que las organizaciones capacitan a sus conductores.
                        </p>
                    </motion.div>
                </div>

                {/* Servicios */}
                <div className="space-y-12">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-slate-900 mb-4">Sus principales servicios incluyen:</h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* 1 */}
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={{ ...fadeIn.transition, delay: 0.1 }}
                            className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:border-primary/30 transition-colors flex flex-col"
                        >
                            <GraduationCap className="w-10 h-10 text-primary mb-6" />
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Capacitación profesional para conductores</h4>
                            <p className="text-slate-500 text-sm mb-4">Programas formativos diseñados bajo estándares técnicos y normativos vigentes:</p>
                            <ul className="space-y-2 text-slate-600 text-sm mt-auto">
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> Conducción preventiva</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> Flota liviana y pesada</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> 4x4 y terrenos complejos</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> Seguridad vial industrial</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> Gestión de riesgos</li>
                            </ul>
                        </motion.div>
                        {/* 2 */}
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={{ ...fadeIn.transition, delay: 0.2 }}
                            className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:border-primary/30 transition-colors flex flex-col"
                        >
                            <BadgeCheck className="w-10 h-10 text-primary mb-6" />
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Certificación profesional verificable</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Cada participante obtiene una credencial digital segura con validación QR, permitiendo a las empresas verificar instantáneamente la autenticidad y vigencia de las certificaciones.
                            </p>
                        </motion.div>
                        {/* 3 */}
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={{ ...fadeIn.transition, delay: 0.3 }}
                            className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:border-primary/30 transition-colors flex flex-col"
                        >
                            <MonitorPlay className="w-10 h-10 text-primary mb-6" />
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Plataforma de capacitación tecnológica</h4>
                            <p className="text-slate-500 text-sm mb-4">La empresa integra tecnología educativa (EdTech) para digitalizar la formación, facilitando:</p>
                            <ul className="space-y-2 text-slate-600 text-sm mt-auto">
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> acceso desde cualquier lugar</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> seguimiento del progreso</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> emisión automática</li>
                                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5"/> métricas en tiempo real</li>
                            </ul>
                        </motion.div>
                        {/* 4 */}
                        <motion.div 
                            initial={fadeIn.initial}
                            whileInView={fadeIn.whileInView}
                            viewport={fadeIn.viewport}
                            transition={{ ...fadeIn.transition, delay: 0.4 }}
                            className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:border-primary/30 transition-colors flex flex-col"
                        >
                            <Briefcase className="w-10 h-10 text-primary mb-6" />
                            <h4 className="text-lg font-bold text-slate-900 mb-3">Soluciones corporativas para empresas</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Los programas están diseñados para organizaciones que gestionan grandes equipos de conductores, permitiendo capacitar desde pequeños grupos hasta grandes flotas con eficiencia y control.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Propuesta de Valor & Impacto */}
                <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                    <motion.div
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.1 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="w-8 h-8 text-secondary" />
                            <h3 className="text-2xl font-bold text-slate-900">Propuesta de Valor</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            VMP-EDTECH se diferencia por combinar formación técnica con tecnología educativa, creando un ecosistema completo de capacitación profesional.
                        </p>
                        <h4 className="font-semibold text-slate-900 mb-4">Principales ventajas:</h4>
                        <ul className="space-y-3">
                            {[
                                "Certificaciones con validez y reconocimiento empresarial",
                                "Credenciales digitales verificables mediante QR",
                                "Plataforma educativa moderna y escalable",
                                "Programas diseñados por instructores con amplia experiencia profesional",
                                "Capacitación online, presencial o blended",
                                "Reportes y métricas de desempeño para empresas"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-slate-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-6 text-slate-600 font-medium italic">
                            Estas soluciones permiten a las organizaciones mejorar la seguridad operativa, cumplir normativas y profesionalizar a sus conductores.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.3 }}
                        className="bg-slate-50 rounded-2xl p-8 border border-slate-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="w-8 h-8 text-primary" />
                            <h3 className="text-2xl font-bold text-slate-900">Impacto en las Empresas</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Las organizaciones que implementan programas de VMP-EDTECH logran:
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Mayor profesionalización de conductores",
                                "Reducción de incidentes operativos",
                                "Cumplimiento de normativas de seguridad",
                                "Mejor control de certificaciones",
                                "Digitalización de procesos de capacitación"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                                    <span className="text-slate-700 font-medium capitalize first-letter:uppercase lowercase">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
                
            </div>
        </section>
    );
}
