'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, HardHat, ClipboardCheck, Users, 
  Zap, ArrowRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const SERVICES = [
  {
    title: 'Gestión Integral y Consultoría',
    image: '/images/services/consulting_es.png',
    description: 'Programas de higiene y seguridad, manuales de procedimientos y planes de contingencia.',
    items: [
      'Programas de Higiene y Seguridad',
      'Manuales de Procedimientos',
      'Planes de Contingencia y Evacuación',
      'Gestión de Legajos Técnicos'
    ]
  },
  {
    title: 'Análisis de Riesgos y Auditorías',
    image: '/images/services/risk_es.png',
    description: 'Identificación y evaluación de riesgos físicos, químicos y biológicos en el entorno laboral.',
    items: [
      'Riesgos Físicos y Químicos',
      'Auditorías Integrales de Seguridad',
      'Mediciones Ambientales (Ruido/Luz)',
      'Estudios Ergonómicos de Puestos'
    ]
  },
  {
    title: 'Capacitación y Prevención',
    image: '/images/services/training_es.png',
    description: 'Formación del personal en prácticas seguras, protección contra incendios y primeros auxilios.',
    items: [
      'Prácticas Seguras de Trabajo',
      'Protección contra Incendios',
      'Uso de EPP y Primeros Auxilios',
      'Talleres de Evacuación'
    ]
  },
  {
    title: 'Servicios Específicos y Soporte',
    image: '/images/services/support_es.png',
    description: 'Seguridad en construcción, protección estructural y supervisión de contratistas.',
    items: [
      'Seguridad en la Construcción',
      'Protección Activa y Pasiva',
      'Supervisión de Contratistas',
      'Gestión de Personal Tercerizado'
    ]
  }
];

const safetyServices = [
  {
    title: 'Asesoramiento Integral',
    description: 'Cumplimiento Ley 19587 y normativas provinciales. Gestión de legajos técnicos y auditorías de planta.',
    tag: 'GESTIÓN & COMPLIANCE',
    badge: 'Ley 19.587',
    image: '/images/services/safety_neuquen.png'
  },
  {
    title: 'Capacitaciones In-Situ',
    description: 'Formación obligatoria por puesto con certificación. Talleres prácticos de primeros auxilios y prevención activa.',
    tag: 'FORMACIÓN PROFESIONAL',
    badge: 'Con Certificación',
    image: '/images/services/training_real.png'
  },
  {
    title: 'Mediciones Técnicas',
    description: 'Protocolos homologados de ruido, iluminación, puesta a tierra y estudios de ergonomía certificados.',
    tag: 'EQUIPOS HOMOLOGADOS',
    badge: 'Protocolos SRT',
    image: '/images/services/safety_measurements.png'
  },
  {
    title: 'Planes de Emergencia',
    description: 'Diseño de planes de evacuación, simulacros integrales, roles de emergencia y protocolos ante contingencias.',
    tag: 'PLANIFICACIÓN ACTIVA',
    badge: 'Defensa Civil',
    image: '/images/services/support_real.png'
  }
];

const getServiceIcon = (index: number) => {
  switch (index) {
    case 0: return <ShieldCheck className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
    case 1: return <HardHat className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
    case 2: return <Zap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
    case 3: return <ClipboardCheck className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />;
    default: return <ShieldCheck className="h-6 w-6 text-primary" />;
  }
};

export function ProfessionalServices() {
  return (
    <>
      {/* Soluciones Corporativas Section */}
      <section id="servicios-profesionales" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">
                Soluciones Corporativas
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
                Servicios de Consultoría y Gestión Integral
              </h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Brindamos soporte técnico y normativo de nivel experto para proteger el activo más valioso de su organización: su gente.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICES.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col h-full">
                  <div className="relative h-56 sm:h-64 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                        {service.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                      {service.description}
                    </p>

                    <ul className="space-y-3 mt-auto">
                      {service.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 text-sm font-semibold">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios Técnicos Section */}
      <section id="servicios" className="py-28 bg-slate-50/40 relative overflow-hidden border-t border-slate-100">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-primary/10 rounded-full blur-3xl opacity-30 -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl opacity-20 translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        {/* Engineering technical grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5 mb-4 shadow-sm backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Servicios Técnicos Oficiales</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-6 tracking-tight">
              Consultoría en <span className="text-primary italic relative inline-block">
                Seguridad e Higiene
                <span className="absolute bottom-1 left-0 w-full h-2.5 bg-primary/15 -z-10 rounded-sm" />
              </span>
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-slate-600 leading-relaxed font-medium">
              Consultoría técnica especializada para elevar los estándares de seguridad en su organización y garantizar el cumplimiento normativo.
            </p>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safetyServices.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(58,175,169,0.06)] border border-slate-100/85 hover:border-primary/20 transition-all duration-500 flex flex-col h-full hover:-translate-y-2"
                >
                  {/* Image container */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {/* Badge normativo flotante */}
                    <div className="absolute top-4 left-4 z-20 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white/10 shadow-sm">
                      {service.badge}
                    </div>

                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Vector Icon float card */}
                    <div className="absolute bottom-0 right-6 translate-y-1/2 w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center group-hover:scale-110 transition-all duration-300 z-20">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        {getServiceIcon(index)}
                      </div>
                    </div>
                  </div>

                  {/* Card Content container */}
                  <div className="p-6 pt-8 flex flex-col flex-1">
                    {/* Tiny upper tag */}
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase mb-1.5 block">
                      {service.tag}
                    </span>
                    
                    <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h4>
                    
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 font-medium">
                      {service.description}
                    </p>

                    {/* Footer Button action block */}
                    <Link 
                      href="#contacto" 
                      className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center group/btn text-xs font-bold text-slate-500 hover:text-primary transition-colors duration-300"
                    >
                      <span>MÁS INFORMACIÓN</span>
                      <div className="w-8 h-8 rounded-full bg-slate-50 group-hover/btn:bg-primary text-slate-500 group-hover/btn:text-white flex items-center justify-center transition-all duration-300">
                        <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
