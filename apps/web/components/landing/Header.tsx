'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white py-3 px-4 text-center text-sm">
                <span className="font-medium">
                    🎓 Capacitación Vial Profesional | Certificaciones con validez nacional
                </span>
            </div>

            {/* Main Header */}
            <header className="glass sticky top-0 z-50 border-b border-slate-200">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <Image
                                    src="/images/vmp_official.png"
                                    alt="VMP Logo Oficial"
                                    width={140}
                                    height={50}
                                    className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
                                    priority
                                />
                            </div>
                            <div className="flex items-center border-l-2 border-slate-200 pl-3 ml-1">
                                <span className="font-heading font-black text-xl leading-none text-slate-900 tracking-tighter">
                                    EDTECH
                                </span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/#seguridad-higiene" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Seguridad e Higiene
                            </Link>
                            <Link href="/#servicios-profesionales" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Servicios
                            </Link>
                            <Link href="/cursos" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Cursos
                            </Link>
                            <Link href="/blog" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Blog
                            </Link>
                            <Link href="/#validar" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Validar
                            </Link>
                            <Link href="/#faq" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                FAQ
                            </Link>
                            <Link href="/#alianzas" className="text-slate-800 hover:text-primary font-medium transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                                Alianzas
                            </Link>
                        </div>

                        {/* CTAs */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="px-6 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary-50 transition-all duration-300"
                            >
                                Área Alumnos
                            </Link>
                            <Link
                                href="/#contacto"
                                className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
                            >
                                Contacto
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-slate-200 animate-slideDown">
                            <div className="flex flex-col space-y-4">
                                <Link href="/cursos" className="text-slate-800 hover:text-primary font-medium py-2 transition-colors">
                                    Cursos
                                </Link>
                                <Link href="/blog" className="text-slate-800 hover:text-primary font-medium py-2 transition-colors">
                                    Blog
                                </Link>
                                <Link href="/#validar" className="text-slate-800 hover:text-primary font-medium py-2 transition-colors">
                                    Validar
                                </Link>
                                <Link href="/#faq" className="text-slate-800 hover:text-primary font-medium py-2 transition-colors">
                                    FAQ
                                </Link>
                                <Link href="/#alianzas" className="text-slate-800 hover:text-primary font-medium py-2 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                    Alianzas
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-6 py-2.5 border-2 border-primary text-primary rounded-xl font-semibold text-center hover:bg-primary-50 transition-all"
                                >
                                    Área Alumnos
                                </Link>
                                <Link
                                    href="/#contacto"
                                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-center hover:scale-105 transition-all"
                                >
                                    Contacto
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
        </>
    );
}
