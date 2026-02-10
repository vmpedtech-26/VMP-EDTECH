import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { blogPosts } from '@/lib/blog-data';
import { Calendar, Clock, ArrowLeft, Share2, User, Tag } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) return { title: 'Post no encontrado' };

    return {
        title: `${post.title} | Blog VMP`,
        description: post.excerpt,
    };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <Header />

            {/* Post Header */}
            <div className="pt-24 pb-12 bg-background-light">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-slate-700 hover:text-primary mb-8 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al blog
                    </Link>

                    <div className="flex items-center space-x-2 mb-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {post.category}
                        </span>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center text-slate-700 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.readTime} de lectura
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-200">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <User className="h-6 w-6 text-slate-700" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">{post.author}</div>
                                <div className="text-xs text-slate-700">{post.date}</div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button className="p-2 rounded-full bg-slate-100 text-slate-800 hover:bg-gray-200 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative h-[300px] md:h-[500px] w-full mb-12 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div
                    className="prose prose-lg max-w-none prose-slate prose-headings:text-[#0A192F] prose-headings:font-bold prose-strong:text-slate-900 prose-blockquote:border-l-[#FFD700] prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-lg"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Etiquetas</h3>
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">
                                <Tag className="h-3 w-3 mr-2" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Author Bio Simple */}
                <div className="mt-16 p-8 bg-slate-50 rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 border border-slate-100">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        <User className="h-10 w-10 text-slate-600" />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold text-slate-900 mb-2">Escrito por {post.author}</h4>
                        <p className="text-slate-800">
                            Especialista en seguridad vial con más de 15 años de experiencia capacitando a flotas corporativas en Argentina y el Cono Sur. Colaborador habitual de VMP Servicios.
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommended Posts */}
            <section className="py-16 bg-background-light border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">Artículos relacionados</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts
                            .filter(p => p.slug !== post.slug)
                            .slice(0, 3)
                            .map((p) => (
                                <article key={p.slug} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="relative h-40 w-full">
                                        <Image src={p.image} alt={p.title} fill className="object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-2">
                                            <Link href={`/blog/${p.slug}`} className="hover:text-primary">
                                                {p.title}
                                            </Link>
                                        </h3>
                                        <div className="text-xs text-slate-700 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {p.date}
                                        </div>
                                    </div>
                                </article>
                            ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
