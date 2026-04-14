'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, HardHat, ClipboardCheck, Users, 
  Zap, ArrowRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const safetyServices = [
  {
    title: 'Asesoramiento Integral',
    description: 'Cumplimiento Ley 19587 y normativas provinciales. Gestión de legajos técnicos y auditorías.',
    iconImage: '/images/icons/consulting.png',
    image: '/images/services/safety_neuquen.png'
  },
  {
    title: 'Capacitaciones In-Situ',
    description: 'Formación obligatoria por puesto con certificación. Talleres de primeros auxilios y prevención activa.',
    iconImage: '/images/icons/training.png',
    image: '/images/services/training_real.png'
  },
  {
    title: 'Mediciones Técnicas',
    description: 'Protocolos de ruido, iluminación, puesta a tierra y estudios de ergonomía certificados.',
    iconImage: '/images/icons/measurements.png',
    image: '/images/services/safety_measurements.png'
  },
  {
    title: 'Planes de Emergencia',
    description: 'Diseño de planes de evacuación, roles de emergencia, simulacros y protocolos de contingencia.',
    iconImage: '/images/icons/planning.png',
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
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Servicios Técnicos</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-6">
            <span className="text-primary italic">Seguridad e Higiene</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-slate-600">
            Consultoría técnica especializada para elevar los estándares de seguridad en su organización y garantizar el cumplimiento normativo.
          </p>
        </div>

        {/* --- SERVICIOS DE INGENIERÍA --- */}
        <div className="mb-12">
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
                  <div className="w-12 h-12 rounded-full overflow-hidden mb-4 ring-2 ring-primary/20 shadow-sm transition-all group-hover:scale-110">
                    <img 
                      src={service.iconImage} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
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



      </div>
    </section>
  );
}
