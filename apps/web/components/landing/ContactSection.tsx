'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Mail, MapPin, CheckCircle, Loader2, MessageSquare } from 'lucide-react';

interface ContactForm {
    nombre: string;
    empresa: string;
    email: string;
    telefono: string;
    mensaje: string;
    curso_interes: string;
}

export default function ContactSection() {
    const [form, setForm] = useState<ContactForm>({
        nombre: '',
        empresa: '',
        email: '',
        telefono: '',
        mensaje: '',
        curso_interes: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error('Failed to send');
            setStatus('sent');
            setForm({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '', curso_interes: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id="contacto" className="py-20 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                        Contacto
                    </span>
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-slate-900 mb-4">
                        Hablemos de tu Proyecto
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Contanos sobre tu flota y te armamos una propuesta a medida
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        className="lg:col-span-2 space-y-8"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl text-white">
                            <h3 className="font-heading font-bold text-2xl mb-6">
                                Información de Contacto
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Teléfono</p>
                                        <a href="tel:+5492995370173" className="text-white/80 hover:text-white transition-colors">
                                            +54 299 537-0173
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <a href="mailto:administracion@vmp-edtech.com" className="text-white/80 hover:text-white transition-colors">
                                            administracion@vmp-edtech.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Ubicación</p>
                                        <p className="text-white/80">Juan B Justo 385 1° Piso, Neuquén Capital</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">WhatsApp</p>
                                        <a
                                            href="https://wa.me/5492995370173?text=Hola%2C%20quiero%20info%20sobre%20capacitaci%C3%B3n%20vial"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            Enviar mensaje →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-5 border border-slate-200 text-center shadow-sm">
                                <p className="text-3xl font-bold text-primary">24hs</p>
                                <p className="text-sm text-slate-600 mt-1">Tiempo de respuesta</p>
                            </div>
                            <div className="bg-white rounded-xl p-5 border border-slate-200 text-center shadow-sm">
                                <p className="text-3xl font-bold text-secondary">+500</p>
                                <p className="text-sm text-slate-600 mt-1">Conductores capacitados</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        className="lg:col-span-3"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <AnimatePresence mode="wait">
                            {status === 'sent' ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">¡Mensaje Enviado!</h3>
                                    <p className="text-slate-600 mb-6 max-w-md">
                                        Recibimos tu consulta. Nuestro equipo se pondrá en contacto con vos dentro de las próximas 24 horas hábiles.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Enviar otra consulta
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-5"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Nombre completo *
                                            </label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                value={form.nombre}
                                                onChange={handleChange}
                                                required
                                                placeholder="Juan Pérez"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="empresa" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Empresa *
                                            </label>
                                            <input
                                                type="text"
                                                id="empresa"
                                                name="empresa"
                                                value={form.empresa}
                                                onChange={handleChange}
                                                required
                                                placeholder="Transporte S.A."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Email corporativo *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="juan@empresa.com"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                id="telefono"
                                                name="telefono"
                                                value={form.telefono}
                                                onChange={handleChange}
                                                placeholder="+54 9 11 1234-5678"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="curso_interes" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Curso de interés
                                        </label>
                                        <select
                                            id="curso_interes"
                                            name="curso_interes"
                                            value={form.curso_interes}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none bg-white"
                                        >
                                            <option value="">Seleccionar curso...</option>
                                            <option value="conduccion_preventiva">Conducción Preventiva</option>
                                            <option value="carga_pesada">Conducción Flota Liviana / Pesada</option>
                                            <option value="conduccion_2_traccion">Conducción Doble Tracción</option>
                                            <option value="varios">Varios cursos</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="mensaje" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Mensaje *
                                        </label>
                                        <textarea
                                            id="mensaje"
                                            name="mensaje"
                                            value={form.mensaje}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            placeholder="Contanos sobre tu flota: cantidad de conductores, tipo de vehículos, modalidad preferida..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none"
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                                            Hubo un error al enviar tu mensaje. Por favor, intentá nuevamente o escribinos directamente a administracion@vmp-edtech.com
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center"
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-5 w-5 mr-2" />
                                                Enviar Consulta
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-slate-500 text-center">
                                        Al enviar este formulario aceptás nuestra política de privacidad. No compartimos tus datos con terceros.
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
