'use client';

import { motion } from 'framer-motion';
import { 
    ShieldCheck, Target, Globe, Gem, CheckCircle2, 
    Briefcase, GraduationCap, Building2, HardHat, Car,
    ClipboardCheck, Factory
} from 'lucide-react';

export default function AboutUs() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <section id="sobre-nosotros" className="relative py-24 md:py-32 overflow-hidden bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-5%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute top-[30%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20 md:space-y-32">
                
                {/* 1. Sobre la Empresa */}
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={fadeIn.transition}
                        className="inline-flex items-center space-x-2 bg-white border border-primary/20 rounded-full px-5 py-2.5 mb-6 shadow-sm"
                    >
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sobre la Empresa</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={fadeIn.initial}
                        whileInView={fadeIn.whileInView}
                        viewport={fadeIn.viewport}
                        transition={{ ...fadeIn.transition, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold font-heading text-slate-900 tracking-tight mb-8"
                    >
                        VMP-EDTECH <span className="gradient-text">Educación con Tecnología</span>
                    </motion.h2>

                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                        <motion.p initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.2 }}>
                            Somos una organización especializada en consultoría, capacitación y servicios técnicos en <strong>Seguridad, Ambiente, Calidad y Salud Ocupacional</strong>, orientada a empresas que operan en entornos productivos de alta exigencia.
                        </motion.p>
                        <motion.p initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.3 }}>
                            La prevención constituye el pilar fundamental de nuestra gestión. Nuestro enfoque consiste en trabajar de manera conjunta con nuestros clientes para fortalecer sus procesos productivos, mejorar la seguridad operativa y promover una cultura organizacional basada en la protección de las personas, los bienes y el ambiente.
                        </motion.p>
                        <motion.p initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.4 }}>
                            Desde el inicio de nuestras actividades en noviembre de 2013, hemos desarrollado soluciones técnicas aplicadas a diversos sectores productivos. El equipo técnico cuenta con <strong>más de veinte años de experiencia</strong> en la industria energética e industrial, participando en la implementación de sistemas de gestión, auditorías técnicas, capacitación de personal y optimización de procesos operativos.
                        </motion.p>
                    </div>
                </div>

                {/* 2. Misión y Visión */}
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
                        <p className="text-slate-600 leading-relaxed">
                            Colaborar de manera efectiva con las organizaciones en la mejora continua de sus procesos productivos, promoviendo una cultura sólida de calidad, ambiente, seguridad y salud ocupacional, orientada a la protección de las personas, los bienes y el entorno donde se desarrollan las actividades.
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
                            Consolidarnos como una organización referente en la prestación de servicios técnicos de seguridad industrial, ambiente y formación operativa, alcanzando estándares de excelencia reconocidos por nuestros clientes.
                        </p>
                    </motion.div>
                </div>

                {/* 3. Propuesta de Valor */}
                <motion.div 
                    initial={fadeIn.initial}
                    whileInView={fadeIn.whileInView}
                    viewport={fadeIn.viewport}
                    transition={fadeIn.transition}
                    className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-2">
                                <Gem className="w-4 h-4" />
                                Propuesta de Valor
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900">Transformamos la seguridad en una herramienta estratégica</h3>
                            <p className="text-slate-600 text-lg">
                                Las organizaciones industriales no contratan servicios de seguridad e higiene únicamente por cumplimiento normativo. Lo que realmente buscan es reducir riesgos operativos, evitar interrupciones productivas y asegurar la continuidad de sus operaciones.
                            </p>
                            <p className="text-slate-600 font-medium italic">
                                Nuestro enfoque combina experiencia técnica, presencia en campo y formación aplicada.
                            </p>
                        </div>
                        <div className="flex-1 w-full bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-6 text-lg">VMP-EDTECH orienta sus servicios a proporcionar:</h4>
                            <ul className="space-y-4">
                                {[
                                    "Reducción del riesgo operativo",
                                    "Protección legal empresarial",
                                    "Optimización de procesos productivos",
                                    "Fortalecimiento de la cultura de seguridad en campo",
                                    "Información técnica para la toma de decisiones operativas"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* 4, 5, 6, 7, 8 Servicios y Programas Grid */}
                <div>
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Nuestros Servicios y Programas</h3>
                        <p className="text-lg text-slate-600">Diseñados para generar competencias reales en el personal operativo, combinando contenidos teóricos con ejercicios prácticos aplicados a situaciones reales de trabajo.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* 4. Servicios Profesionales */}
                        <motion.div 
                            initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.1 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-primary/30 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Servicios Profesionales</h4>
                            <ul className="space-y-3 text-slate-600 text-sm">
                                <li>• Consultoría en Calidad, Ambiente, Seguridad y Salud Ocupacional.</li>
                                <li>• Implementación en Sistemas Integrados de Gestión (ISO 9001, 14001, 45001).</li>
                                <li>• Diagnósticos organizacionales y cumplimiento normativo.</li>
                                <li>• Auditorías de Seguridad, Ambiente y Calidad.</li>
                                <li>• Capacitación técnica y formación operativa.</li>
                                <li>• Inspección de redes contra incendio.</li>
                                <li>• Formación de brigadas y simulacros.</li>
                                <li>• Comercialización de equipamientos.</li>
                            </ul>
                        </motion.div>

                        {/* 5. Capacitación Técnica Especializada */}
                        <motion.div 
                            initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.2 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-primary/30 transition-all group"
                        >
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Capacitación Técnica Especializada</h4>
                            <ul className="space-y-3 text-slate-600 text-sm">
                                <li>• Permisos de trabajo y control operacional.</li>
                                <li>• Bloqueo y etiquetado de energías (LOTO).</li>
                                <li>• Administración de peligros y riesgos.</li>
                                <li>• Prevención de lesiones en manos.</li>
                                <li>• Prevención ante gas sulfhídrico.</li>
                                <li>• Trabajo seguro en espacios confinados.</li>
                                <li>• Observaciones preventivas (STOP).</li>
                                <li>• Riesgos en trabajos en altura.</li>
                            </ul>
                        </motion.div>

                        {/* 6. Formación para Operadores */}
                        <motion.div 
                            initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.3 }}
                            className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-primary/30 transition-all group lg:row-span-2 flex flex-col"
                        >
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <HardHat className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">Operadores de Equipos Industriales y Maquinaria Pesada</h4>
                            <p className="text-xs text-slate-500 mb-4 block">Incluyen contenidos técnicos, análisis de riesgos y legislación vigente:</p>
                            <ul className="space-y-3 text-slate-600 text-sm mb-6">
                                <li>• Izaje de cargas – Eslingador / Señalero (Rigger).</li>
                                <li>• Operación segura de hidrogrúas.</li>
                                <li>• Operación de autoelevadores.</li>
                                <li>• Operación de puente grúa.</li>
                                <li>• Operación de manipuladores telescópicos.</li>
                                <li>• Operación de plataformas aéreas de elevación.</li>
                            </ul>
                            
                            {/* 7. Programas de Conducción Segura */}
                            <div className="mt-auto pt-8 border-t border-slate-100">
                                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center mb-4">
                                    <Car className="w-5 h-5" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 mb-4">Programas de Conducción Segura</h4>
                                <ul className="space-y-3 text-slate-600 text-sm">
                                    <li>• Conducción defensiva (vehículos livianos).</li>
                                    <li>• Conducción segura (vehículos pesados).</li>
                                    <li>• Vehículos doble tracción (4x4).</li>
                                    <li>• Conducción invernal y clima adverso.</li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* 8. Auditorías */}
                        <motion.div 
                            initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.4 }}
                            className="bg-slate-900 border-slate-800 text-white p-8 rounded-3xl shadow-lg transition-all group md:col-span-2 lg:col-span-2"
                        >
                            <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center mb-6">
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold mb-4">Auditorías y Evaluaciones Técnicas</h4>
                            <p className="text-sm text-slate-300 mb-6 font-medium">Las auditorías en calidad, ambiente y seguridad permiten evaluar el grado de cumplimiento de los sistemas de gestión y detectar oportunidades de mejora en las operaciones.</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Evaluación de emisiones y efluentes.</li>
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Integridad de ductos, tanques y procesos.</li>
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Evaluación de gestión de emergencias.</li>
                                </ul>
                                <ul className="space-y-3 text-slate-300 text-sm">
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Verificación de cumplimiento legal.</li>
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Control de programas de capacitación.</li>
                                    <li className="flex gap-2"><div className="mt-1"><CheckCircle2 className="w-4 h-4 text-secondary"/></div> Análisis de no conformidades (incidentes).</li>
                                </ul>
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* 9 & 10. Fortalezas y Sectores */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* 9. Fortalezas (2 cols width on lg) */}
                    <motion.div 
                        initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.1 }}
                        className="lg:col-span-2 bg-white border border-secondary/20 rounded-3xl p-8 md:p-12 shadow-xl shadow-secondary/5"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheck className="w-8 h-8 text-secondary" />
                            <h3 className="text-2xl font-bold text-slate-900">Fortalezas Organizacionales</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {[
                                "Más de dos décadas de experiencia en seguridad industrial y gestión de calidad.",
                                "Conocimiento profundo de la industria del petróleo y gas.",
                                "Equipo técnico multidisciplinario con habilitación profesional.",
                                "Capacidad de adaptación a distintos sectores productivos.",
                                "Presencia técnica en campo y enfoque práctico en las soluciones.",
                                "Estrategias de optimización de costos sin comprometer la seguridad."
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl">
                                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 10. Sectores (1 col width on lg) */}
                    <motion.div 
                        initial={fadeIn.initial} whileInView={fadeIn.whileInView} viewport={fadeIn.viewport} transition={{ ...fadeIn.transition, delay: 0.3 }}
                        className="bg-primary/5 rounded-3xl p-8 md:p-10 border border-primary/10 flex flex-col"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Factory className="w-7 h-7 text-primary" />
                            <h3 className="text-xl font-bold text-slate-900">Sectores Atendidos</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "Industria del petróleo y gas",
                                "Minería",
                                "Energía",
                                "Agroindustria",
                                "Petroquímica",
                                "Servicios industriales",
                                "Pymes en crecimiento"
                            ].map((sector, i) => (
                                <span key={i} className="inline-block bg-white border border-primary/20 text-slate-700 text-sm px-4 py-2.5 rounded-xl shadow-sm font-medium hover:border-primary/50 transition-colors">
                                    {sector}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
