import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0A192F] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <div className="font-heading font-bold text-2xl mb-4">
                            VMP <span className="text-[#FFD700]">SERVICIOS</span>
                        </div>
                        <p className="text-[#CBD5E0] text-sm leading-relaxed mb-4">
                            Capacitación Vial Profesional
                            <br />
                            Certificaciones ANSV Argentina
                        </p>
                        <div className="flex space-x-3">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#0A192F] transition-all">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#0A192F] transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#0A192F] transition-all">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#FFD700] flex items-center justify-center hover:bg-[#FFD700] hover:text-[#0A192F] transition-all">
                                <Youtube className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Cursos Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4">CURSOS</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/cursos/manejo-defensivo" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Manejo Defensivo
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos/carga-pesada" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Carga Pesada
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos/4x4-profesional" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    4x4 Profesional
                                </Link>
                            </li>
                            <li>
                                <Link href="/cursos" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Todos los Cursos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Recursos Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4">RECURSOS</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/blog" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/validar" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Validador de Certificaciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/terminos" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacidad" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto Column */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-4">CONTACTO</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <Mail className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                                <a href="mailto:info@vmpservicios.com" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    info@vmpservicios.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                                <a href="tel:+5491112345678" className="text-[#CBD5E0] hover:text-[#FFD700] text-sm transition-colors">
                                    +54 9 11 1234-5678
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
                                <span className="text-[#CBD5E0] text-sm">
                                    Buenos Aires, Argentina
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-700 pt-8">
                    <div className="text-center text-[#718096] text-sm">
                        <p className="mb-2">
                            © 2025 VMP - Vialidad y Manejo Profesional | CUIT 20-12345678-9
                        </p>
                        <p className="text-xs">
                            Instructor Certificado ANSV - Matrícula 12345/2025
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
