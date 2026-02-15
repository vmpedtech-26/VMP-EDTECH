import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-xl">
                                <GraduationCap className="h-5 w-5 text-white" />
                            </div>
                            <div className="font-heading font-bold text-xl">
                                <span className="text-white">VMP</span>
                                <span className="text-primary mx-1">-</span>
                                <span className="gradient-text">EDTECH</span>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            Capacitación Vial Profesional
                            <br />
                            Certificaciones Argentina
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
                                <Link href="/cursos/carga-pesada" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    Conducción Flota Liviana / Pesada
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos/conduccion-2-traccion" className="text-slate-300 hover:text-primary text-sm transition-colors">
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
                                <a href="tel:+5491112345678" className="text-slate-300 hover:text-primary text-sm transition-colors">
                                    +54 9 11 1234-5678
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">
                                    Buenos Aires, Argentina
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700 pt-8">
                    <div className="text-center text-slate-400 text-sm">
                        <p className="mb-2">
                            © 2025 VMP - EDTECH | Vialidad y Manejo Profesional | CUIT 20-12345678-9
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
