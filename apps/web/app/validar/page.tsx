'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ValidarPage() {
    const [codigo, setCodigo] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (codigo.trim()) {
            router.push(`/validar/${codigo.trim()}`);
        }
    };

    return (
        <main className="min-h-screen bg-background-light flex flex-col">
            <Header />

            <div className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Validador de Certificaciones
                        </h1>
                        <p className="text-slate-800">
                            Ingresá el código de la credencial para verificar su validez y autenticidad en nuestra base de datos oficial.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="codigo" className="block text-sm font-medium text-slate-700 mb-2">
                                    Código de Credencial
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <input
                                        type="text"
                                        id="codigo"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm uppercase"
                                        placeholder="Ej: VMP-2026-XXXXX"
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full">
                                Verificar Ahora
                            </Button>
                        </form>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-700">
                        <p>Los códigos de credencial se encuentran al frente de su carnet o certificado digital.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
