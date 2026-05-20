'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function ProfessionalServices() {
  return (
    <section id="servicios-profesionales" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Services Grid - Realistic Corporate Style */}
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
                {/* Image Header */}
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

                {/* Content */}
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
  );
}
