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
                        <Link href="/" className="flex items-center space-x-3 group">
                            <Image
                                src="/images/vmp-isotipo.png"
                                alt="VMP"
                                width={44}
                                height={44}
                                className="group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="font-heading font-bold text-2xl">
                                <span className="text-slate-900">VMP</span>
                                <span className="text-primary mx-1">-</span>
                                <span className="gradient-text">EDTECH</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
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
