import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-background-light to-white py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        <div className="inline-block">
                            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                                Plataforma de Capacitación Profesional
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                            Capacitación Profesional{' '}
                            <span className="text-primary">Certificada</span>
                        </h1>

                        <p className="text-xl text-slate-800 leading-relaxed font-medium">
                            Formación teórico-práctica con certificaciones oficiales de validez industrial.
                            Digitaliza la capacitación de tu personal con nuestra plataforma inteligente.
                        </p>

                        {/* Features */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                <span className="text-slate-700">
                                    Certificaciones verificables por QR
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                <span className="text-slate-700">
                                    Cursos teóricos + prácticos interactivos
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                                <span className="text-slate-700">
                                    Seguimiento por instructores capacitados
                                </span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" asChild>
                                <Link href="#contacto">
                                    Solicitar Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="#servicios">Ver Cursos</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Image/Visual */}
                    <div className="relative lg:h-[600px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary-light/20 rounded-2xl blur-3xl"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
                            {/* Placeholder for hero image */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-lg flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-lg">
                                        <svg
                                            className="w-12 h-12 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-slate-800 font-semibold">
                                        Sistema de Capacitación
                                        <br />
                                        VMP - EDTECH
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">500+</div>
                                    <div className="text-sm text-slate-800">Alumnos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">98%</div>
                                    <div className="text-sm text-slate-800">Aprobación</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">50+</div>
                                    <div className="text-sm text-slate-800">Empresas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
