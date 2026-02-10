import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import SectionHeader from '@/components/ui/SectionHeader';
import { blogPosts } from '@/lib/blog-data';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';

export const metadata = {
    title: 'Blog de Seguridad Vial | VMP Servicios',
    description: 'Información de alto valor sobre seguridad vial, normativas ANSV y consejos para conductores profesionales en Argentina y Latam.',
};

export default function BlogPage() {
    return (
        <main className="min-h-screen bg-background-light">
            <Header />

            {/* Hero Section */}
            <div className="pt-24 pb-16 bg-[#0A192F] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 bg-[#FFD700] text-[#0A192F] rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                            Conocimiento que Salva Vidas
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog de Seguridad Vial y Logística</h1>
                        <p className="text-xl text-gray-300">
                            Noticias, normativas y guías técnicas para el transporte profesional en Argentina y Latinoamérica.
                        </p>
                    </div>
                </div>
            </div>

            <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <article key={post.slug} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow border border-slate-100">
                            <div className="relative h-48 w-full">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-[#FFD700] text-[#0A192F] px-3 py-1 rounded-full text-xs font-bold">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex items-center text-xs text-slate-700 mb-4 space-x-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {post.date}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {post.readTime}
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>

                                <p className="text-slate-800 mb-6 text-sm line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div className="text-xs font-medium text-slate-700">
                                        Por {post.author}
                                    </div>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-primary font-semibold text-sm flex items-center group"
                                    >
                                        Leer más
                                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Newsletter / CTA Section */}
                <section className="mt-20 bg-primary/10 rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Mantené tu flota informada</h2>
                    <p className="text-lg text-slate-800 mb-8 max-w-2xl mx-auto">
                        Recibí las actualizaciones de la ANSV y consejos de seguridad vial directamente en tu email corporativo.
                    </p>
                    <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="tu@email-corporativo.com"
                            className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <button type="submit" className="btn-primary">
                            Suscribirse
                        </button>
                    </form>
                    <p className="text-xs text-slate-700 mt-4">
                        Solo enviamos información relevante una vez al mes. Sin spam.
                    </p>
                </section>
            </div>

            <Footer />
        </main>
    );
}
