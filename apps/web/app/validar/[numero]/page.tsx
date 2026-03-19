"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
    ShieldCheck, 
    XCircle, 
    CheckCircle2, 
    User, 
    Building2, 
    Calendar, 
    Award, 
    AlertCircle,
    FileCheck,
    ArrowLeft,
    Loader2,
    Binary
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";

interface ValidationResult {
    valid: boolean;
    status: string;
    credential?: {
        numero: string;
        fechaEmision: string;
        fechaVencimiento: string | null;
        alumno: {
            nombre: string;
            apellido: string;
            dni: string;
        };
        curso: {
            nombre: string;
            codigo: string;
            descripcion: string;
        };
        empresa: {
            nombre: string;
            cuit: string;
        } | null;
    };
}

export default function PublicValidationPage() {
    const params = useParams();
    const numero = params.numero as string;
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validate = async () => {
            try {
                // Endpoint público del backend
                const data = await api.get(`/public/validar/${numero}`);
                setResult(data);
            } catch (error) {
                console.error("Error validating credential:", error);
            } finally {
                setLoading(false);
            }
        };

        if (numero) {
            validate();
        }
    }, [numero]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <ShieldCheck className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Sincronizando Registro Técnico VMP...</p>
            </div>
        );
    }

    if (!result || !result.valid || result.status === 'not_found') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
                    <div className="h-2 bg-red-500 w-full" />
                    <CardContent className="p-12 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">ERROR DE VALIDACIÓN</h2>
                            <p className="text-slate-500 text-sm font-medium">Esta credencial no es válida o no existe en nuestro registro oficial.</p>
                        </div>
                        <Button asChild className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold">
                            <Link href="/">Ir al Portal Principal</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { credential } = result;

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full -mr-64 -mt-64 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-success/5 rounded-full -ml-64 -mb-64 blur-[100px]" />
            
            <div className="w-full max-w-4xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Brand Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 px-4 text-center md:text-left">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Binary className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-black tracking-tighter uppercase italic">VMP SERVICIOS</h1>
                            <p className="text-primary font-black text-[10px] tracking-[0.2em] uppercase">Expediente Técnico Digital</p>
                        </div>
                    </div>
                    <div className="px-5 py-2 bg-success/10 border border-success/20 rounded-full flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-success" />
                        <span className="text-success text-[10px] font-black uppercase tracking-widest">Validado Oficialmente</span>
                    </div>
                </div>

                {/* Main Validation Card */}
                <Card className="border-none shadow-3xl rounded-[3.5rem] bg-white overflow-hidden outline outline-white/5 outline-offset-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        
                        {/* Status Sidebar */}
                        <div className="lg:col-span-4 bg-slate-50 p-10 flex flex-col items-center justify-center text-center gap-6 border-r border-slate-100">
                            <div className="relative">
                                <div className="w-32 h-32 bg-success/10 rounded-full flex items-center justify-center animate-pulse-slow">
                                    <CheckCircle2 className="w-16 h-16 text-success" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg">
                                    <FileCheck className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <h3 className="text-success font-black text-2xl tracking-tighter uppercase">ESTADO: OK</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Vigente en Planta</p>
                            </div>

                            <div className="w-full pt-6 border-t border-slate-200">
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">Registro Único VMP</p>
                                <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <span className="text-slate-900 font-mono font-black text-sm">{credential?.numero}</span>
                                </div>
                            </div>
                        </div>

                        {/* Details Area */}
                        <div className="lg:col-span-8 p-10 md:p-14 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                        <User className="w-3.5 h-3.5" />
                                        Titular de Acreditación
                                    </div>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                        {credential?.alumno.nombre} {credential?.alumno.apellido}
                                    </p>
                                    <p className="text-slate-400 font-bold font-mono">DNI: {credential?.alumno.dni}</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                        <Building2 className="w-3.5 h-3.5" />
                                        Empresa Patrocinante
                                    </div>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight leading-7">
                                        {credential?.empresa?.nombre || "Particular"}
                                    </p>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">{credential?.empresa?.cuit || ""}</p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                        <Award className="w-4 h-4" />
                                        Programa de Capacitación Técnica
                                    </div>
                                    <h4 className="text-2xl font-black tracking-tight leading-tight italic">
                                        {credential?.curso.nombre}
                                    </h4>
                                    <div className="flex flex-wrap gap-6 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Emisión</p>
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <Calendar className="w-3.5 h-3.5 text-primary" />
                                                {new Date(credential!.fechaEmision).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Vencimiento</p>
                                            <div className="flex items-center gap-2 font-bold text-sm text-primary">
                                                <Clock className="w-3.5 h-3.5" />
                                                {credential?.fechaVencimiento ? new Date(credential.fechaVencimiento).toLocaleDateString() : "Sin Vencimiento"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-50 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-widest italic">
                                        Este documento digital está protegido por el protocolo de seguridad técnica de VMP Servicios.
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 h-12">
                                    <Link href="/">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Volver al Portal
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Footer Security Note */}
                <div className="mt-8 text-center">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest italic">
                        © 2026 VMP Servicios - Sistema de Validación de Credenciales Técnicas - Mendoza, Argentina
                    </p>
                </div>
            </div>
        </div>
    );
}
