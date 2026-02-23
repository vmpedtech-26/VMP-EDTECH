'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Send } from 'lucide-react';
import { submitContactForm } from '@/lib/api';


export function ContactForm() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        empresa: '',
        telefono: '',
        mensaje: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            await submitContactForm(formData);

            setSubmitStatus('success');
            setFormData({
                nombre: '',
                email: '',
                empresa: '',
                telefono: '',
                mensaje: '',
            });
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <section id="contacto" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Solicita una Demo
                        </h2>
                        <p className="text-xl text-slate-800">
                            Déjanos tus datos y te contactaremos para mostrarte la plataforma
                        </p>
                    </div>

                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="block text-sm font-semibold text-slate-900 mb-2"
                                >
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-slate-900 mb-2"
                                >
                                    Email Corporativo *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="juan@empresa.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="empresa"
                                    className="block text-sm font-semibold text-slate-900 mb-2"
                                >
                                    Empresa *
                                </label>
                                <input
                                    type="text"
                                    id="empresa"
                                    required
                                    value={formData.empresa}
                                    onChange={(e) =>
                                        setFormData({ ...formData, empresa: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Mi Empresa SA"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="telefono"
                                    className="block text-sm font-semibold text-slate-900 mb-2"
                                >
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    value={formData.telefono}
                                    onChange={(e) =>
                                        setFormData({ ...formData, telefono: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="+54 9 11 1234-5678"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="mensaje"
                                    className="block text-sm font-semibold text-slate-900 mb-2"
                                >
                                    Mensaje *
                                </label>
                                <textarea
                                    id="mensaje"
                                    required
                                    rows={4}
                                    value={formData.mensaje}
                                    onChange={(e) =>
                                        setFormData({ ...formData, mensaje: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                    placeholder="Cuéntanos sobre tus necesidades de capacitación..."
                                />
                            </div>

                            {submitStatus === 'success' && (
                                <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-md">
                                    ¡Gracias! Te contactaremos pronto.
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                                    Hubo un error. Por favor intenta nuevamente.
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Enviando...'
                                ) : (
                                    <>
                                        Enviar Solicitud
                                        <Send className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </section>
    );
}
