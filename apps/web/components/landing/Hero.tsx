import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShieldCheck } from 'lucide-react';

export function Hero() {
    return (
        <section id="inicio" className="relative bg-[#0a1628] pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-slate-800">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="w-12 h-[3px] bg-amber-400 mb-8" />

                <p className="text-teal-400 text-sm font-bold uppercase tracking-[0.2em] mb-5">
                    Capacitación Vial Profesional
                </p>

                <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl leading-[1.03] tracking-tight text-white mb-7">
                    Certificaciones con
                    <br />
                    validez <span className="text-teal-400">real</span>.
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mb-10">
                    Formación teórico-práctica para operadores y flotas, con credenciales
                    verificables y conformidad normativa vigente — sin atajos.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <Button size="lg" asChild>
                        <Link href="#contacto">Solicitar Capacitación</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="#cursos">Ver Programas</Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    Credenciales verificables por QR · Conforme Ley 19587
                </div>
            </div>
        </section>
    );
}
