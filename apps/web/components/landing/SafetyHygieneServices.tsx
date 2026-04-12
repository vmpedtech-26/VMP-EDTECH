'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShieldCheck, HardHat, ClipboardCheck, Users, Zap, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    title: 'Asesoramiento Integral',
    description: 'Garantizamos el cumplimiento de la Ley 19587 y normativas provinciales. Elaboración de legajos técnicos completos.',
    icon: ShieldCheck,
    image: '/images/services/safety_neuquen.png'
  },
  {
    title: 'Capacitaciones Certificadas',
    description: 'Formación obligatoria por puesto de trabajo con certificación nacional. Talleres de primeros auxilios y prevención.',
    icon: Users,
    image: '/images/services/training_real.png'
  },
  {
    title: 'Mediciones Técnicas',
    description: 'Protocolos de ruido (Res. 85/12), iluminación (Res. 84/12), puesta a tierra y estudios de ergonomía.',
    icon: Zap,
    image: '/images/services/safety_measurements.png'
  },
  {
    title: 'Planes de Emergencia',
    description: 'Diseño de planes de evacuación, roles de emergencia, simulacros y protocolos ante contingencias.',
    icon: ClipboardCheck,
    image: '/images/services/support_real.png'
  }
];

const reasons = [
  { title: 'Presencia Local', desc: 'Respuesta rápida en Neuquén y Río Negro.' },
  { title: 'Conocimiento Regional', desc: 'Expertos en normativas de la zona.' },
  { title: 'Atención Personalizada', desc: 'Adaptado a su flujo de caja.' },
  { title: 'Precios Competitivos', desc: 'Costos locales, calidad nacional.' }
];

const packages = [
  { name: 'BÁSICO', range: '1-10 empleados', features: ['Legajo técnico', 'Capacitaciones anuales', 'Soporte técnico'] },
  { name: 'ESTÁNDAR', range: '11-50 empleados', features: ['Todo el Básico', 'Mediciones técnicas', 'Gestión de ART'] },
  { name: 'PREMIUM', range: '50+ empleados', features: ['Outsourcing completo', 'Visitas periódicas', 'Auditorías internas'] }
];

export function SafetyHygieneServices() {
  return (
    <section id="seguridad-higiene" className="py-24 bg-white relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 transform translate-x-1/2" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4"
          >
            <HardHat className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Servicios de Ingeniería</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-heading font-black text-slate-900 mb-6"
          >
            Seguridad e <span className="text-primary italic">Higiene</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-slate-600"
          >
            Gestión integral y asesoramiento especializado para empresas de Neuquén y Río Negro. Garantizamos entornos de trabajo seguros y cumplimiento normativo.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500"
            >
              <div className="aspect-[16/9] relative">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center space-x-3">
                  <div className="bg-primary p-3 rounded-2xl shadow-lg">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white">{service.title}</h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-slate-600 leading-relaxed mb-6">
                  {service.description}
                </p>
                <Link href="#contacto" className="inline-flex items-center text-primary font-bold hover:translate-x-2 transition-transform">
                  Solicitar cotización <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why VMP Section */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mb-24">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <MapPin className="h-64 w-64 text-white" />
          </div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-heading font-black mb-6">¿Por qué elegir <span className="text-primary italic">VMP</span>?</h3>
              <p className="text-slate-400 text-lg mb-8">Nuestra experiencia regional nos permite entender los desafíos específicos de la industria en la Patagonia.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {reasons.map((reason, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="font-bold text-white">{reason.title}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{reason.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {packages.map((pkg, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-primary font-heading">{pkg.name}</h4>
                    <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-slate-300">{pkg.range}</span>
                  </div>
                  <ul className="grid grid-cols-2 gap-2">
                    {pkg.features.map((feat, j) => (
                      <li key={j} className="text-sm text-slate-300 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
