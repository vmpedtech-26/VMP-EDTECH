'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const ALIANZAS = [
  {
    name: 'Consultus',
    logo: '/images/alianzas/consultus.png',
  },
  {
    name: 'Fatri Cleaning Group',
    logo: '/images/alianzas/fatri.png',
  },
  {
    name: 'Biartic',
    logo: '/images/alianzas/biartic.png',
  },
];

export function Alianzas() {
  return (
    <section id="alianzas" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Alianzas Estratégicas
          </h2>
          <p className="text-xl text-slate-600">
            Colaboramos con empresas líderes para potenciar la capacitación y el desarrollo profesional.
          </p>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center justify-items-center">
          {ALIANZAS.map((alianza, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative w-full max-w-[280px] h-32 flex items-center justify-center transition-all duration-500 transform hover:scale-110"
            >
              <Image
                src={alianza.logo}
                alt={`Logo de ${alianza.name}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
