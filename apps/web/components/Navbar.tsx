'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Menu, X } from 'lucide-react';

const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Quiénes Somos', href: '#nosotros' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Cotización', href: '#cotizacion' },
    { label: 'Evaluaciones', href: '#evaluaciones' },
];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100/80 shadow-sm transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <a href="#inicio" className="flex items-center group">
                        <img 
                            src="/vmp_isotipo_real_4k.svg" 
                            alt="VMP Isotipo" 
                            className="h-9 w-auto block md:hidden group-hover:scale-105 transition-transform duration-300" 
                        />
                        <img 
                            src="/vmp_logotipo_completo_real_4k.svg" 
                            alt="VMP Logotipo" 
                            className="h-10 w-auto hidden md:block group-hover:opacity-90 transition-opacity duration-300" 
                        />
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm text-gray-600 hover:text-vmp-teal font-medium tracking-tight transition-colors relative group"
                            >
                                {item.label}
                                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-vmp-teal group-hover:w-full transition-all duration-300" />
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <a
                            href="/admin/cargar-nota"
                            className="text-sm text-gray-500 font-semibold hover:text-vmp-teal transition-all"
                        >
                            Admin
                        </a>
                        <a
                            href="#evaluaciones"
                            className="px-5 py-2 bg-vmp-teal text-white text-sm font-semibold rounded-xl hover:bg-vmp-teal-dark transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-vmp-teal/10"
                        >
                            Centro Evaluaciones
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="lg:hidden mt-4 pb-4 border-t border-gray-100 pt-4"
                        >
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-3 px-4 text-sm text-gray-600 hover:bg-vmp-teal/5 hover:text-vmp-teal font-medium rounded-xl transition-all"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="mt-6 space-y-3 px-4">
                                <a
                                    href="/admin/cargar-nota"
                                    className="block py-2.5 text-center text-sm text-vmp-teal font-semibold border border-vmp-teal/30 rounded-xl hover:bg-vmp-teal/5"
                                >
                                    Panel Admin
                                </a>
                                <a
                                    href="#evaluaciones"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2.5 text-center text-sm bg-vmp-teal text-white font-semibold rounded-xl hover:bg-vmp-teal-dark shadow-md"
                                >
                                    Centro Evaluaciones
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
