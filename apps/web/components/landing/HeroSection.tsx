'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Award, Smartphone, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const badgeVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-primary-50 to-secondary-50">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(139 92 246 / 0.1) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-emerald/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow" style={{ animationDelay: '4s' }} />

            {/* Animated particles - Reduced for performance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.6, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Badge */}
                        <motion.div
                            variants={badgeVariants}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-6 backdrop-blur-sm"
                        >
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Certificación Profesional Verificable</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6"
                        >
                            <span className="text-slate-900">Capacitación Vial</span>
                            <br />
                            <span className="gradient-text">Profesional</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-2xl text-slate-800 mb-8 leading-relaxed"
                        >
                            Formamos conductores profesionales con los más altos estándares de calidad.
                            Certificaciones con validez y reconocimiento empresarial en toda Argentina.
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 mb-12"
                        >
                            <Link
                                href="/login"
                                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center justify-center group"
                            >
                                Acceso Capacitación
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button
                                onClick={() => setIsVideoOpen(true)}
                                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 hover:border-primary/20 hover:text-primary transition-all duration-300 inline-flex items-center justify-center gap-2.5 group shadow-sm hover:shadow-md"
                            >
                                <svg className="w-5 h-5 fill-current text-primary group-hover:scale-115 transition-transform duration-300" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Ver Video Institucional
                            </button>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {[
                                { icon: CheckCircle, title: '+500 Conductores', subtitle: 'Certificados', color: 'text-success' },
                                { icon: Award, title: 'Certificación', subtitle: 'Nacional', color: 'text-primary' },
                                { icon: Smartphone, title: '100% Online', subtitle: 'o Presencial', color: 'text-secondary' },
                                { icon: Users, title: 'Validación QR', subtitle: 'Instantánea', color: 'text-accent-cyan' }
                            ].map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className="flex flex-col items-center text-center p-4 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                                        whileHover={{ scale: 1.05, y: -4 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className={`h-8 w-8 ${badge.color} mb-2`} />
                                        <p className="text-sm font-semibold text-slate-900">{badge.title}</p>
                                        <p className="text-xs text-slate-800">{badge.subtitle}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    {/* Image/Visual - Reemplazado por Video en bucle interactivo */}
                    <motion.div
                        className="hidden lg:block"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="relative aspect-square rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white bg-slate-950 group cursor-pointer"
                                variants={floatingVariants}
                                animate="animate"
                                onClick={() => setIsVideoOpen(true)}
                            >
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                >
                                    <source 
                                        src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c025f73958742d489dee0ff4c1a7a0ee&profile_id=139&oauth2_token_id=57447761" 
                                        type="video/mp4" 
                                    />
                                    Tu navegador no soporta videos.
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                                
                                {/* Botón interactivo central con pulsos de radar */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="relative flex items-center justify-center">
                                        <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-primary/40 opacity-75"></span>
                                        <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-primary/20 opacity-40"></span>
                                        <div className="relative w-16 h-16 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-110">
                                            <svg className="w-8 h-8 fill-current translate-x-0.5" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Píldora de información inferior */}
                                <div className="absolute bottom-6 left-6 right-6 bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">VMP EN ACCIÓN</p>
                                        <p className="text-xs font-bold text-white">Ver Video Institucional</p>
                                    </div>
                                    <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider">Play</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Video Lightbox Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6"
                        onClick={() => setIsVideoOpen(false)}
                    >
                        {/* Botón Cerrar */}
                        <button 
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 border border-white/10 hover:scale-105"
                            onClick={() => setIsVideoOpen(false)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Contenedor del Iframe con proporciones seguras */}
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-slate-900 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe 
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/5a1b3v-ZqRE?autoplay=1&rel=0" 
                                title="VMP Video Institucional - Capacitación Vial Profesional"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
