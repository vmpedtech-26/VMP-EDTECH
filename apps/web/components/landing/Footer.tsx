import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <Image
                                src="/images/vmp_official.png"
                                alt="VMP - EDTECH"
                                width={120}
                                height={40}
                                className="h-auto w-auto max-h-12 brightness-0 invert"
                            />
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            Capacitación Vial Profesional
                        </p>
                        <div className="flex space-x-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary/50 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Cursos Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4 text-white">CURSOS</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/cursos/conduccion-preventiva" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Conducción Preventiva
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos/flota-liviana-pesada" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Conducción Flota Liviana / Pesada
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos/doble-traccion" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Conducción Doble Tracción
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Todos los Cursos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Recursos Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4 text-white">RECURSOS</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/blog" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/validar" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Validador de Certificaciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/terminos" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacidad" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4 text-white">CONTACTO</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@vmp-edtech.com" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    info@vmp-edtech.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <a href="tel:+5492996731487" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    +54 9 299 673-1487
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">
                                    Juan B. Justo 385, Piso 1, Neuquén (8300), Argentina
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700 pt-8">
                    <div className="text-center text-slate-400 text-sm">
                        <p className="mb-2">
                            © 2026 VMP - EDTECH | Vialidad y Manejo Profesional | CUIT 30-71936908-8
                        </p>
                        <p className="text-xs">
                            Instructor Certificado - Matrícula 12345/2025
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
