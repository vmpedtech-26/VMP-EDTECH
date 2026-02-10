'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Award, Smartphone, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
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

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
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
                            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Certificación ANSV Oficial</span>
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
                            Formamos conductores profesionales bajo las normativas más exigentes.
                            Certificaciones con validez legal y reconocimiento empresarial en toda Argentina.
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
                            <Link
                                href="/#cursos"
                                className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all duration-300 inline-flex items-center justify-center"
                            >
                                Cotizar Curso Empresarial
                            </Link>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {[
                                { icon: CheckCircle, title: '+500 Conductores', subtitle: 'Certificados', color: 'text-success' },
                                { icon: Award, title: 'Certificación', subtitle: 'ANSV Oficial', color: 'text-primary' },
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

                    {/* Image/Visual */}
                    <motion.div
                        className="hidden lg:block"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <div className="relative">
                            {/* Certification Badge Image */}
                            <motion.div
                                className="relative aspect-square rounded-3xl flex items-center justify-center"
                                variants={floatingVariants}
                                animate="animate"
                            >
                                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-white/80 to-primary-50/80 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-12">
                                    <div className="text-center">
                                        <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-xl">
                                            <Award className="w-24 h-24 text-white" />
                                        </div>
                                        <h3 className="text-3xl font-bold gradient-text mb-2">VMP - EDTECH</h3>
                                        <p className="text-slate-800 text-lg">Certificación Profesional</p>
                                        <div className="mt-6 inline-flex items-center space-x-2 bg-success/10 border border-success/30 rounded-full px-4 py-2">
                                            <CheckCircle className="h-5 w-5 text-success" />
                                            <span className="text-sm font-semibold text-success">Validado ANSV</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating badges with pulse animation */}
                            <motion.div
                                className="absolute -top-4 -right-4 bg-gradient-to-r from-success to-success-light text-white px-6 py-3 rounded-xl shadow-xl font-bold"
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                ✓ Aprobado ANSV
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-accent-amber to-warning text-slate-900 px-6 py-3 rounded-xl shadow-xl font-bold"
                                animate={{
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            >
                                15 años experiencia
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
