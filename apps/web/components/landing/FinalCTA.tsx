import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
    return (
        <section className="py-20 bg-gradient-to-r from-[#FFD700] to-[#FFA500]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#0A192F] mb-4">
                    Comenzá a Capacitar tu Flota Hoy Mismo
                </h2>
                <p className="text-xl text-[#1A202C] opacity-85 mb-8">
                    Contactanos y te armamos un plan a medida para tu flota
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <Link
                        href="/#contacto"
                        className="inline-flex items-center justify-center px-8 py-4 bg-[#0A192F] text-white rounded-lg font-bold text-lg hover:scale-105 hover:shadow-2xl transition-all group"
                    >
                        Consultar Ahora
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/contacto"
                        className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-[#0A192F] text-[#0A192F] rounded-lg font-bold text-lg hover:bg-[#0A192F] hover:text-white transition-all"
                    >
                        Hablar con Asesor
                    </Link>
                </div>

                <div className="flex flex-wrap justify-center gap-8 text-sm text-[#1A202C]">
                    <div className="flex items-center">
                        <span className="font-semibold">✓ Sin compromiso</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold">✓ Respuesta en 24hs</span>
                    </div>
                    <div className="flex items-center">
                        <span className="font-semibold">✓ Soporte dedicado</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
