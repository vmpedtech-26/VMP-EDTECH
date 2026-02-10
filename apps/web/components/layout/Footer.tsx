import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">V</span>
                            </div>
                            <span className="text-xl font-bold text-white">
                                VMP Servicios
                            </span>
                        </div>
                        <p className="text-sm text-slate-600">
                            Capacitación profesional certificada para empresas exigentes.
                        </p>
                    </div>

                    {/* Enlaces */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Plataforma</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#servicios" className="hover:text-primary transition-colors">
                                    Servicios
                                </Link>
                            </li>
                            <li>
                                <Link href="#credencial" className="hover:text-primary transition-colors">
                                    Credencial Profesional
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-primary transition-colors">
                                    Acceso Alumnos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacidad" className="hover:text-primary transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link href="/terminos" className="hover:text-primary transition-colors">
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link href="/verificar" className="hover:text-primary transition-colors">
                                    Verificar Credencial
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contacto</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-primary" />
                                <a href="mailto:info@vmpservicios.com" className="hover:text-primary transition-colors">
                                    info@vmpservicios.com
                                </a>
                            </li>
                            <li className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-primary" />
                                <a href="tel:+541112345678" className="hover:text-primary transition-colors">
                                    +54 11 1234-5678
                                </a>
                            </li>
                            <li className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                <span>Buenos Aires, Argentina</span>
                            </li>
                        </ul>

                        {/* Redes Sociales */}
                        <div className="flex space-x-3 mt-6">
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-slate-600">
                    <p>
                        © {new Date().getFullYear()} VMP Servicios. Todos los derechos
                        reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
