'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">V</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            VMP Servicios
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="#servicios"
                            className="text-slate-700 hover:text-primary transition-colors"
                        >
                            Servicios
                        </Link>
                        <Link
                            href="#credencial"
                            className="text-slate-700 hover:text-primary transition-colors text-sm font-medium"
                        >
                            Credencial
                        </Link>
                        <Link
                            href="#beneficios"
                            className="text-slate-700 hover:text-primary transition-colors"
                        >
                            Beneficios
                        </Link>
                        <Link
                            href="#testimonios"
                            className="text-slate-700 hover:text-primary transition-colors"
                        >
                            Testimonios
                        </Link>
                        <Link
                            href="/login"
                            className="bg-primary/5 text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm font-semibold border border-primary/20"
                        >
                            Capacitación
                        </Link>
                        <Button size="sm" asChild>
                            <Link href="#contacto">Cotizar</Link>
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 rounded-md text-slate-700"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            href="#servicios"
                            className="block py-2 text-slate-700 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Servicios
                        </Link>
                        <Link
                            href="#credencial"
                            className="block py-2 text-slate-700 hover:text-primary font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Credencial Profesional
                        </Link>
                        <Link
                            href="#beneficios"
                            className="block py-2 text-slate-700 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Beneficios
                        </Link>
                        <Link
                            href="#testimonios"
                            className="block py-2 text-slate-700 hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Testimonios
                        </Link>
                        <Link
                            href="/login"
                            className="block py-2 text-primary font-semibold"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Capacitación
                        </Link>
                        <Button size="sm" className="w-full" asChild>
                            <Link href="#contacto">Cotizar Curso</Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
