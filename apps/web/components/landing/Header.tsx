'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, CheckCircle } from 'lucide-react';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Top Banner - ANSV Notice */}
            <div className="bg-[#ED8936] text-white py-3 px-4 text-center text-sm">
                <span className="font-medium">
                    🎓 NUEVA DISPOSICIÓN ANSV 54/2025 VIGENTE | Renovación obligatoria cada 24 meses
                </span>
                <Link href="/blog/nueva-disposicion-ansv-2025" className="ml-2 underline hover:text-gray-100">
                    Más Info →
                </Link>
            </div>

            {/* Main Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <div className="font-heading font-bold text-2xl text-azul-petroleo">
                                VMP <span className="text-amarillo-vial">SERVICIOS</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/cursos" className="text-[#2D3748] hover:text-[#FFD700] font-medium transition-colors border-b-2 border-transparent hover:border-[#FFD700] pb-1">
                                Cursos
                            </Link>
                            <Link href="/blog" className="text-[#2D3748] hover:text-[#FFD700] font-medium transition-colors border-b-2 border-transparent hover:border-[#FFD700] pb-1">
                                Blog
                            </Link>
                            <Link href="/#validar" className="text-[#2D3748] hover:text-[#FFD700] font-medium transition-colors border-b-2 border-transparent hover:border-[#FFD700] pb-1">
                                Validar
                            </Link>
                            <Link href="/#faq" className="text-[#2D3748] hover:text-[#FFD700] font-medium transition-colors border-b-2 border-transparent hover:border-[#FFD700] pb-1">
                                FAQ
                            </Link>
                        </div>

                        {/* CTAs */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="px-5 py-2.5 border-2 border-[#0A192F] text-[#0A192F] rounded-lg font-semibold hover:bg-[#0A192F] hover:text-white transition-all"
                            >
                                Área Alumnos
                            </Link>
                            <Link
                                href="/#cotizar"
                                className="px-5 py-2.5 bg-[#FFD700] text-[#0A192F] rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition-all"
                            >
                                Cotizar
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-[#2D3748] hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col space-y-4">
                                <Link href="/cursos" className="text-[#2D3748] hover:text-[#FFD700] font-medium py-2">
                                    Cursos
                                </Link>
                                <Link href="/blog" className="text-[#2D3748] hover:text-[#FFD700] font-medium py-2">
                                    Blog
                                </Link>
                                <Link href="/#validar" className="text-[#2D3748] hover:text-[#FFD700] font-medium py-2">
                                    Validar
                                </Link>
                                <Link href="/#faq" className="text-[#2D3748] hover:text-[#FFD700] font-medium py-2">
                                    FAQ
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 border-2 border-[#0A192F] text-[#0A192F] rounded-lg font-semibold text-center"
                                >
                                    Área Alumnos
                                </Link>
                                <Link
                                    href="/#cotizar"
                                    className="px-5 py-2.5 bg-[#FFD700] text-[#0A192F] rounded-lg font-semibold text-center"
                                >
                                    Cotizar
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>
            </header>
        </>
    );
}
