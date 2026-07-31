'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const ALIANZAS = [
  {
    name: 'Consultus',
    logo: '/images/alianzas/consultus_v2.png',
  },
  {
    name: 'Fatri Cleaning Group',
    logo: '/images/alianzas/fatri_v2.png',
  },
  {
    name: 'Biartic',
    logo: '/images/alianzas/biartic_v2.png',
  },
];

export function Alianzas() {
  return (
    <section id="alianzas" className="py-12 bg-slate-50 border-t border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - More compact */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Alianzas Estratégicas
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Colaboramos con empresas líderes para potenciar la capacitación y el desarrollo profesional.
          </p>
        </div>

        {/* Logos Grid - Smaller height (h-16) and compact gap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center justify-items-center">
          {ALIANZAS.map((alianza, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative w-full max-w-[200px] h-16 flex items-center justify-center transition-all duration-300 transform hover:scale-105"
            >
              <Image
                src={alianza.logo}
                alt={`Logo de ${alianza.name}`}
                fill
                className="object-contain filter grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
