"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResultService } from "@/lib/services/result-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    ChevronLeft, 
    Download, 
    CheckCircle, 
    XCircle, 
    User, 
    Building2, 
    CreditCard, 
    Calendar,
    Clock,
    Target,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AuditPage() {
    const { id } = useParams();
    const router = useRouter();
    const [auditData, setAuditData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadAuditData();
    }, [id]);

    const loadAuditData = async () => {
        try {
            const data = await ResultService.getResultDetails(id as string);
            setAuditData(data);
        } catch (error) {
            console.error("Error loading audit data:", error);
        } finally {
            setLoading(false);
        }
    };

    const [downloading, setDownloading] = useState(false);

    const handleDownloadCertificate = async () => {
        const certificateId = auditData.certificate?.[0]?.id || auditData.certificate?.id;
        if (!certificateId) {
            alert("No hay certificado generado para este examen.");
            return;
        }

        setDownloading(true);
        try {
            const response = await fetch('/api/certificate/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateId })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Certificado_VMP_${auditData.student_dni}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert("Error al generar el PDF.");
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Error de conexión al generar el certificado.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-vmp-teal-deep text-white gap-4">
                <Loader2 className="w-12 h-12 text-vmp-mint animate-spin" />
                <p className="text-vmp-mint font-black tracking-widest text-xs uppercase">Generando Hoja de Respuestas...</p>
            </div>
        );
    }

    if (!auditData) return <div>Error al cargar la auditoría.</div>;

    const hasCertificate = !!(auditData.certificate?.[0]?.id || auditData.certificate?.id);

    return (
        <div className="p-4 md:p-8 space-y-8 bg-vmp-teal-deep min-h-screen text-white animate-in fade-in duration-700">
            {/* ... Navigation Header ... */}
            <div className="flex justify-between items-center">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-tighter gap-2"
                >
                    <ChevronLeft className="w-5 h-5" /> Volver al Dashboard
                </Button>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-vmp-teal/20 border border-vmp-teal/30 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-vmp-mint" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-vmp-mint">Auditoría HSEQ Certificada</span>
                </div>
            </div>

            {/* Profile & Evaluation Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Data Card */}
                <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <CardTitle className="text-xs font-black text-vmp-mint uppercase tracking-[0.2em]">Datos del Evaluado</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Nombre Completo
                            </span>
                            <p className="text-xl font-black tracking-tighter">{auditData.student_name}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <CreditCard className="w-3 h-3" /> DNI / Identificación
                            </span>
                            <p className="text-xl font-black tracking-tighter">{auditData.student_dni}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Empresa / Organización
                            </span>
                            <p className="text-xl font-black tracking-tighter">{auditData.student_company}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Card */}
                <Card className={cn(
                    "rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden",
                    auditData.passed ? "bg-vmp-teal text-white" : "bg-red-900/50 text-white"
                )}>
                    <CardContent className="pt-10 flex flex-col items-center text-center">
                        <div className="p-4 bg-white/10 rounded-full mb-4">
                            {auditData.passed ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter uppercase mb-2">
                            {auditData.passed ? "Aprobado" : "No Aprobado"}
                        </h3>
                        <div className="text-5xl font-black tracking-tighter mb-4">{Math.round(auditData.score)}%</div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Resultados de Certificación</p>
                    </CardContent>
                </Card>
            </div>

            {/* Evaluation Details Table */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Curso", value: auditData.course_name, icon: Target },
                    { label: "Fecha", value: new Date(auditData.exam_date).toLocaleDateString(), icon: Calendar },
                    { label: "Duración", value: `${auditData.course_details?.duration_minutes || "—"} min`, icon: Clock },
                    { label: "Vigencia", value: `${auditData.course_details?.validity_months || "—"} meses`, icon: Calendar },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 flex items-center gap-4">
                        <div className="p-3 bg-vmp-teal/20 rounded-xl text-vmp-mint">
                            <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">{item.label}</span>
                            <span className="font-bold">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Question List (Hoja de Respuestas) */}
            <div className="space-y-6">
                <h3 className="text-2xl font-black tracking-tighter uppercase font-outfit">Hoja de Respuestas</h3>
                <div className="grid grid-cols-1 gap-4 pb-20">
                    {auditData.answers.map((answer: any, idx: number) => (
                        <Card key={idx} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-black/20 rounded-2xl flex items-center justify-center text-vmp-mint font-black border border-white/5">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-grow space-y-6">
                                        <h4 className="text-xl font-bold leading-tight">{answer.question_text}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                            {answer.options.map((option: string, oIdx: number) => {
                                                const isSelected = answer.selected_answer === option;
                                                const isCorrect = answer.correct_answer === option;
                                                
                                                return (
                                                    <div 
                                                        key={oIdx}
                                                        className={cn(
                                                            "px-6 py-4 rounded-xl text-sm font-medium border flex justify-between items-center transition-all",
                                                            isCorrect 
                                                                ? "bg-vmp-mint/20 border-vmp-mint/40 text-vmp-mint font-bold" 
                                                                : isSelected && !isCorrect
                                                                    ? "bg-red-500/10 border-red-500/40 text-red-400"
                                                                    : "bg-black/10 border-white/5 text-gray-400"
                                                        )}
                                                    >
                                                        {option}
                                                        {isCorrect && <CheckCircle className="w-4 h-4" />}
                                                        {isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button 
                    disabled={downloading || !hasCertificate}
                    className="h-16 px-10 bg-vmp-mint hover:bg-white text-vmp-teal-deep font-black rounded-2xl shadow-2xl shadow-vmp-mint/20 transition-all active:scale-95 text-lg gap-4 group"
                    onClick={handleDownloadCertificate}
                >
                    {downloading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Download className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                    )}
                    {hasCertificate ? "DESCARGAR CERTIFICADO PDF" : "SIN CERTIFICADO GENERADO"}
                </Button>
            </div>
        </div>
    );
}
