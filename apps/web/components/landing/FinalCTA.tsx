import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-24 relative overflow-hidden bg-[#0A192F] border-t border-slate-800">
            {/* Background 4K Real Image: Driver Perspective Highway Dusk */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/contacto_vmp_4k_real.jpg"
                    alt="Capacitación Profesional en Conducción Defensiva VMP"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center"
                    priority
                />
                {/* Organic Dark Overlay for High Legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A192F]/92 via-[#0A192F]/88 to-[#0A192F]/95 backdrop-blur-[2px]" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                    Comenzá a Capacitar tu Flota <span className="gradient-text">Hoy Mismo</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                    Obtené un presupuesto personalizado en menos de 1 minuto
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                        href="/#cotizar"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#FFD700] text-[#0A192F] rounded-lg font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all group"
                    >
                        Cotizar Ahora
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/contacto"
                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-lg font-bold text-lg hover:bg-white hover:text-[#0A192F] transition-all"
                    >
                        Hablar con Asesor
                    </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-300">
                    <div className="flex items-center">
                        <span className="font-semibold text-emerald-400">✓ Sin compromiso</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold text-emerald-400">✓ Respuesta en 24hs</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold text-emerald-400">✓ Soporte dedicado</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
