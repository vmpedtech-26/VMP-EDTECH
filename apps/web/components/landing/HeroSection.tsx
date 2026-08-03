'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Award, Smartphone, Users } from 'lucide-react';
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
        <section className="relative min-h-[90vh] flex items-center bg-[#0A192F] overflow-hidden">
            {/* Background 4K Real Image */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="/images/hero_vmp_4k_real.jpg"
                    alt="Capacitación y Seguridad Vial VMP"
                    fill
                    sizes="100vw"
                    quality={95}
                    className="object-cover object-center"
                    priority
                />
            </div>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 z-0 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.1) 35px, rgba(255,215,0,0.1) 70px)`
                }} />
            </div>

            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#FFD700] rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
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
                        className="text-white"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Badge */}
                        <motion.div
                            variants={badgeVariants}
                            className="inline-flex items-center space-x-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm"
                        >
                            <Award className="h-5 w-5 text-[#FFD700]" />
                            <span className="text-sm font-semibold text-[#FFD700]">Certificación ANSV Oficial</span>
                        </motion.div>

                        {/* Headline */}
                        <motion.h1
                            variants={itemVariants}
                            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl leading-tight mb-6"
                        >
                            <span className="text-white">Capacitación Vial</span>
                            <br />
                            <span className="gradient-text">Profesional</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={itemVariants}
                            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
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
                                href="/#cotizar"
                                className="btn-primary inline-flex items-center justify-center group"
                            >
                                Cotizar Curso Empresarial
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/#cursos"
                                className="btn-secondary inline-flex items-center justify-center"
                            >
                                Ver Catálogo de Cursos
                            </Link>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {[
                                { icon: CheckCircle, title: '+500 Conductores', subtitle: 'Certificados' },
                                { icon: Award, title: 'Certificación', subtitle: 'ANSV Oficial' },
                                { icon: Smartphone, title: '100% Online', subtitle: 'o Presencial' },
                                { icon: Users, title: 'Validación QR', subtitle: 'Instantánea' }
                            ].map((badge, index) => {
                                const Icon = badge.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        className="flex flex-col items-center text-center"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icon className="h-8 w-8 text-[#FFD700] mb-2" />
                                        <p className="text-sm font-semibold">{badge.title}</p>
                                        <p className="text-xs text-gray-400">{badge.subtitle}</p>
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
                                className="relative aspect-square rounded-2xl flex items-center justify-center"
                                variants={floatingVariants}
                                animate="animate"
                            >
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <Image
                                        src="/images/hero-certification.png"
                                        alt="Certificación Profesional VMP Servicios"
                                        width={500}
                                        height={500}
                                        className="drop-shadow-2xl"
                                        priority
                                    />
                                </div>
                            </motion.div>

                            {/* Floating badges with pulse animation */}
                            <motion.div
                                className="absolute -top-4 -right-4 bg-[#48BB78] text-white px-6 py-3 rounded-lg shadow-xl font-bold"
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
                                className="absolute -bottom-4 -left-4 bg-[#FFD700] text-[#0A192F] px-6 py-3 rounded-lg shadow-xl font-bold"
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
