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
  {
    name: 'Oldelval',
    logo: '/images/alianzas/oldelval_v2.png',
  },
  {
    name: 'TGS',
    logo: '/images/alianzas/tgs_v2.png',
  },
];

export function Alianzas() {
  return (
    <section id="alianzas" className="py-16 md:py-20 bg-slate-50 border-t border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold font-heading text-slate-900 mb-3">
            Alianzas Estratégicas
          </h2>
          <p className="text-base text-slate-600 font-medium">
            Colaboramos con empresas líderes para potenciar la capacitación y el desarrollo profesional.
          </p>
        </div>

        {/* Logos Grid - Prominent & Larger Sizing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {ALIANZAS.map((alianza, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative w-full max-w-[240px] h-24 sm:h-28 flex items-center justify-center p-3 rounded-xl bg-white/60 shadow-sm border border-slate-200/60 transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:bg-white"
            >
              <Image
                src={alianza.logo}
                alt={`Logo de ${alianza.name}`}
                fill
                className="object-contain p-2 filter grayscale opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
