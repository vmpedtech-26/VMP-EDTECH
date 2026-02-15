'use client';

import { useState, useEffect } from 'react';
import { Calculator, ArrowRight, CheckCircle, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitCotizacion, ApiError } from '@/lib/api';

// Validation schema
const quoteFormSchema = z.object({
    empresa: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres'),
    cuit: z.string().optional(),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(8, 'Teléfono inválido'),
    comentarios: z.string().optional(),
    acceptMarketing: z.boolean().refine(val => val === true, 'Debes aceptar recibir información'),
    acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos')
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

export default function Quoter() {
    const [quantity, setQuantity] = useState(50);
    const [course, setCourse] = useState('defensivo');
    const [modality, setModality] = useState('online');
    const [showForm, setShowForm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [animatedPrice, setAnimatedPrice] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<QuoteFormData>({
        resolver: zodResolver(quoteFormSchema)
    });

    const calculatePrice = () => {
        const basePrices: Record<string, number> = {
            'defensivo': 4000,
            'carga_pesada': 4500,
            '4x4': 6800,
            'completo': 13000
        };

        const basePrice = basePrices[course];

        // Volume discounts
        let discount = 0;
        if (quantity >= 200) discount = 0.50;
        else if (quantity >= 51) discount = 0.30;
        else if (quantity >= 11) discount = 0.15;

        // Modality factor
        const modalityFactors: Record<string, number> = {
            'online': 1.0,
            'presencial': 1.8,
            'mixto': 1.4
        };

        const finalPrice = quantity * basePrice * (1 - discount) * modalityFactors[modality];
        return Math.round(finalPrice);
    };

    const totalPrice = calculatePrice();
    const pricePerStudent = Math.round(totalPrice / quantity);
    const discount = quantity >= 200 ? 50 : quantity >= 51 ? 30 : quantity >= 11 ? 15 : 0;

    // Animated price counter
    useEffect(() => {
        const duration = 500;
        const steps = 30;
        const increment = totalPrice / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= totalPrice) {
                setAnimatedPrice(totalPrice);
                clearInterval(timer);
            } else {
                setAnimatedPrice(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [totalPrice]);

    const onSubmit = async (data: QuoteFormData) => {
        try {
            // Submit to backend API
            const result = await submitCotizacion({
                ...data,
                quantity,
                course,
                modality,
                totalPrice,
                pricePerStudent,
                discount
            });

            console.log('Cotización enviada exitosamente:', result);

            setShowForm(false);
            setShowSuccessModal(true);
            reset();
        } catch (error) {
            console.error('Error al enviar cotización:', error);

            if (error instanceof ApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Ocurrió un error inesperado. Por favor intenta nuevamente.');
            }

            setShowErrorModal(true);
        }
    };

    // Discount markers for slider
    const discountMarkers = [
        { value: 11, label: '15%', color: '#48BB78' },
        { value: 51, label: '30%', color: '#F6AD55' },
        { value: 200, label: '50%', color: '#FFD700' }
    ];

    return (
        <section id="cotizar" className="py-20 bg-gradient-to-br from-[#0A192F] to-[#1E3A5F] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.1) 35px, rgba(255,215,0,0.1) 70px)`
                }} />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center space-x-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
                        <Calculator className="h-5 w-5 text-[#FFD700]" />
                        <span className="text-sm font-semibold text-[#FFD700]">Lead Magnet</span>
                    </div>
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                        Cotizador Empresarial Instantáneo
                    </h2>
                    <p className="text-xl text-gray-300">
                        Obtené un presupuesto personalizado en 30 segundos
                    </p>
                </motion.div>

                {/* Quoter Card */}
                <motion.div
                    className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <AnimatePresence mode="wait">
                        {!showForm ? (
                            <motion.div
                                key="quoter"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Step 1: Quantity */}
                                <div className="mb-8">
                                    <label className="block text-lg font-bold text-[#0A192F] mb-4">
                                        PASO 1: ¿Cuántos conductores necesitas capacitar?
                                    </label>
                                    <div className="relative mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1 relative">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="500"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FFD700]"
                                                />
                                                {/* Discount markers */}
                                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2">
                                                    {discountMarkers.map((marker) => (
                                                        <div
                                                            key={marker.value}
                                                            className="flex flex-col items-center"
                                                            style={{ marginLeft: `${(marker.value / 500) * 100}%` }}
                                                        >
                                                            <div
                                                                className="text-xs font-bold px-2 py-1 rounded"
                                                                style={{
                                                                    backgroundColor: quantity >= marker.value ? marker.color : '#E2E8F0',
                                                                    color: quantity >= marker.value ? 'white' : '#718096'
                                                                }}
                                                            >
                                                                {marker.label}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                                className="w-24 px-4 py-2 border-2 border-gray-300 rounded-lg text-center font-bold text-xl focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Course */}
                                <div className="mb-8 mt-12">
                                    <label className="block text-lg font-bold text-[#0A192F] mb-4">
                                        PASO 2: Selecciona el curso
                                    </label>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'defensivo', label: 'Manejo Defensivo' },
                                            { id: 'carga_pesada', label: 'Carga Pesada' },
                                            { id: '4x4', label: '4x4 Profesional' },
                                            { id: 'completo', label: 'Paquete Completo (-15%)' }
                                        ].map(option => (
                                            <motion.label
                                                key={option.id}
                                                className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                                                style={{
                                                    borderColor: course === option.id ? '#FFD700' : '#E2E8F0',
                                                    backgroundColor: course === option.id ? '#FFFBEB' : 'white'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="course"
                                                    value={option.id}
                                                    checked={course === option.id}
                                                    onChange={(e) => setCourse(e.target.value)}
                                                    className="w-5 h-5 text-[#FFD700] focus:ring-[#FFD700]"
                                                />
                                                <span className="ml-3 font-semibold text-[#0A192F]">
                                                    {option.label}
                                                </span>
                                            </motion.label>
                                        ))}
                                    </div>
                                </div>

                                {/* Step 3: Modality */}
                                <div className="mb-8">
                                    <label className="block text-lg font-bold text-[#0A192F] mb-4">
                                        PASO 3: Modalidad
                                    </label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'online', label: '100% Online' },
                                            { id: 'presencial', label: 'Presencial' },
                                            { id: 'mixto', label: 'Mixto' }
                                        ].map(option => (
                                            <motion.button
                                                key={option.id}
                                                onClick={() => setModality(option.id)}
                                                className={`p-4 rounded-lg font-semibold transition-all ${modality === option.id
                                                    ? 'bg-[#FFD700] text-[#0A192F] shadow-lg'
                                                    : 'bg-slate-100 text-[#2D3748] hover:bg-gray-200'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {option.label}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Estimation Panel */}
                                <motion.div
                                    className="bg-[#F7FAFC] border-l-4 border-[#FFD700] rounded-lg p-6 mb-8"
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <h3 className="font-heading font-bold text-2xl text-[#0A192F] mb-4">
                                        ESTIMACIÓN TOTAL:
                                    </h3>
                                    <motion.p
                                        className="font-heading font-bold text-5xl text-[#0A192F] mb-2"
                                        key={animatedPrice}
                                    >
                                        ${animatedPrice.toLocaleString('es-AR')} ARS
                                    </motion.p>
                                    <p className="text-[#4A5568] mb-4">
                                        Precio por alumno: ${pricePerStudent.toLocaleString('es-AR')}
                                    </p>
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {discount > 0 && (
                                                <motion.div
                                                    className="flex items-center text-[#48BB78]"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                >
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    <span className="font-semibold">Descuento aplicado: {discount}%</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className="flex items-center text-[#48BB78]">
                                            <CheckCircle className="h-5 w-5 mr-2" />
                                            <span className="font-semibold">Certificación incluida</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* CTA */}
                                <motion.button
                                    onClick={() => setShowForm(true)}
                                    className="btn-primary w-full flex items-center justify-center group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Solicitar Presupuesto Detallado
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </motion.div>
                        ) : (
                            /* Lead Form */
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h3 className="font-heading font-bold text-2xl text-[#0A192F] mb-6">
                                    Completa tus datos para recibir la cotización oficial
                                </h3>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Empresa */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                            Empresa *
                                        </label>
                                        <input
                                            {...register('empresa')}
                                            type="text"
                                            className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${errors.empresa
                                                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                : 'border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20'
                                                }`}
                                        />
                                        {errors.empresa && (
                                            <motion.p
                                                className="text-red-500 text-sm mt-1 flex items-center"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.empresa.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* CUIT */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                                CUIT
                                            </label>
                                            <input
                                                {...register('cuit')}
                                                type="text"
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 outline-none"
                                            />
                                        </div>

                                        {/* Nombre */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                                Nombre *
                                            </label>
                                            <input
                                                {...register('nombre')}
                                                type="text"
                                                className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${errors.nombre
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                    : 'border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20'
                                                    }`}
                                            />
                                            {errors.nombre && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-1 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.nombre.message}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                                Email *
                                            </label>
                                            <input
                                                {...register('email')}
                                                type="email"
                                                className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${errors.email
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                    : 'border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20'
                                                    }`}
                                            />
                                            {errors.email && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-1 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.email.message}
                                                </motion.p>
                                            )}
                                        </div>

                                        {/* Teléfono */}
                                        <div>
                                            <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                                Teléfono *
                                            </label>
                                            <input
                                                {...register('telefono')}
                                                type="tel"
                                                className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${errors.telefono
                                                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                                                    : 'border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20'
                                                    }`}
                                            />
                                            {errors.telefono && (
                                                <motion.p
                                                    className="text-red-500 text-sm mt-1 flex items-center"
                                                    initial={{ opacity: 0, y: -5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <AlertCircle className="h-4 w-4 mr-1" />
                                                    {errors.telefono.message}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Comentarios */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#2D3748] mb-2">
                                            Comentarios
                                        </label>
                                        <textarea
                                            {...register('comentarios')}
                                            rows={3}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 outline-none"
                                        />
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="space-y-2">
                                        <label className="flex items-start">
                                            <input
                                                {...register('acceptMarketing')}
                                                type="checkbox"
                                                className="mt-1 mr-2 accent-[#FFD700]"
                                            />
                                            <span className="text-sm text-[#4A5568]">
                                                Acepto recibir información comercial *
                                            </span>
                                        </label>
                                        {errors.acceptMarketing && (
                                            <motion.p
                                                className="text-red-500 text-sm flex items-center ml-6"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.acceptMarketing.message}
                                            </motion.p>
                                        )}

                                        <label className="flex items-start">
                                            <input
                                                {...register('acceptTerms')}
                                                type="checkbox"
                                                className="mt-1 mr-2 accent-[#FFD700]"
                                            />
                                            <span className="text-sm text-[#4A5568]">
                                                He leído los términos y condiciones *
                                            </span>
                                        </label>
                                        {errors.acceptTerms && (
                                            <motion.p
                                                className="text-red-500 text-sm flex items-center ml-6"
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.acceptTerms.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                                    </motion.button>

                                    {/* Back Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="w-full py-3 text-[#4A5568] hover:text-[#0A192F] font-semibold transition-colors"
                                    >
                                        ← Volver al cotizador
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <motion.div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-[#48BB78] rounded-full mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <Check className="h-8 w-8 text-white" />
                                </motion.div>
                                <h3 className="font-heading font-bold text-2xl text-[#0A192F] mb-2">
                                    ¡Cotización Enviada!
                                </h3>
                                <p className="text-[#4A5568] mb-6">
                                    Recibirás tu presupuesto detallado en las próximas 24 horas. Revisa tu email.
                                </p>
                                <motion.button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="btn-primary w-full"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Entendido
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Modal */}
            <AnimatePresence>
                {showErrorModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowErrorModal(false)}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <motion.div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                >
                                    <AlertCircle className="h-8 w-8 text-white" />
                                </motion.div>
                                <h3 className="font-heading font-bold text-2xl text-[#0A192F] mb-2">
                                    Error al Enviar
                                </h3>
                                <p className="text-[#4A5568] mb-6">
                                    {errorMessage}
                                </p>
                                <div className="space-y-3">
                                    <motion.button
                                        onClick={() => setShowErrorModal(false)}
                                        className="btn-primary w-full"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Intentar Nuevamente
                                    </motion.button>
                                    <button
                                        onClick={() => {
                                            setShowErrorModal(false);
                                            setShowForm(false);
                                        }}
                                        className="w-full py-3 text-[#4A5568] hover:text-[#0A192F] font-semibold transition-colors"
                                    >
                                        Volver al Cotizador
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
