'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, HardHat, ClipboardCheck, Users, 
  Zap, Award, BookOpen, Monitor, ArrowRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const edtechServices = [
  {
    title: 'Cursos Interactivos',
    description: 'Capacitaciones teórico-prácticas con videos, quizzes y evaluaciones en tiempo real adaptadas a la industria.',
    icon: BookOpen,
  },
  {
    title: 'Gestión Empresarial',
    description: 'Panel completo para administrar alumnos, asignar cursos y descargar reportes de progreso automáticos.',
    icon: Monitor,
  },
  {
    title: 'Credencial Profesional',
    description: 'Certificaciones oficiales con código QR verificable y validez industrial inmediata en todo el país.',
    icon: Award,
  }
];

const safetyServices = [
  {
    title: 'Asesoramiento Integral',
    description: 'Cumplimiento Ley 19587 y normativas provinciales. Gestión de legajos técnicos y auditorías.',
    icon: ShieldCheck,
    image: '/images/services/safety_neuquen.png'
  },
  {
    title: 'Capacitaciones In-Situ',
    description: 'Formación obligatoria por puesto con certificación. Talleres de primeros auxilios y prevención activa.',
    icon: Users,
    image: '/images/services/training_real.png'
  },
  {
    title: 'Mediciones Técnicas',
    description: 'Protocolos de ruido, iluminación, puesta a tierra y estudios de ergonomía certificados.',
    icon: Zap,
    image: '/images/services/safety_measurements.png'
  },
  {
    title: 'Planes de Emergencia',
    description: 'Diseño de planes de evacuación, roles de emergencia, simulacros y protocolos de contingencia.',
    icon: ClipboardCheck,
    image: '/images/services/support_real.png'
  }
];

export function ProfessionalServices() {
  return (
    <section id="servicios" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header de la Sección */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4"
          >
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Soluciones Integrales</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-6">
            Nuestros <span className="text-primary italic">Servicios</span> Professionales
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-600">
            Combinamos tecnología educativa de vanguardia con consultoría técnica especializada para elevar los estándares de seguridad en su organización.
          </p>
        </div>

        {/* --- CATEGORÍA 1: SEGURIDAD E HIGIENE (INGENIERÍA) --- */}
        <div className="mb-24">
          <div className="flex items-center space-x-4 mb-10">
            <div className="h-px flex-1 bg-slate-200" />
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">Ingeniería en Seguridad e Higiene</h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {safetyServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden">
                  <Image 
                    src={service.image} 
                    alt={service.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/0 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                    <service.icon className="h-5 w-5 text-primary group-hover:text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{service.description}</p>
                  <Link href="#contacto" className="text-xs font-bold text-primary flex items-center hover:translate-x-1 transition-transform">
                    MÁS INFO <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- CATEGORÍA 2: EDTECH & CAPACITACIÓN --- */}
        <div>
          <div className="flex items-center space-x-4 mb-10">
            <div className="h-px flex-1 bg-slate-200" />
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-[0.2em]">Tecnología y Capacitación Vial</h3>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {edtechServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <service.icon className="h-24 w-24 text-slate-900" />
                </div>
                <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-200">
                  <service.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{service.title}</h4>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Badge de Confianza */}
        <div className="mt-20 flex justify-center">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center space-x-4 shadow-xl">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span className="font-medium">Certificaciones con validez nacional y cumplimiento normativo garantizado.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
