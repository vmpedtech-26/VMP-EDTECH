"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
    CheckCircle, 
    XCircle, 
    FileText, 
    Download, 
    User, 
    Calendar, 
    ChevronLeft,
    Loader2,
    ShieldCheck,
    Award,
    Clock,
    Printer,
    Table
} from "lucide-react";
import { resultsApi, ExamResultDetail } from "@/lib/api/results";

export default function AuditResultPage() {
    const params = useParams();
    const router = useRouter();
    const resultId = params.id as string;
    const [auditData, setAuditData] = useState<ExamResultDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const data = await resultsApi.getResultDetails(resultId);
                setAuditData(data);
            } catch (error) {
                console.error("Error fetching audit data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (resultId) {
            fetchAudit();
        }
    }, [resultId]);

    const handleDownloadCertificate = async () => {
        const certificateId = auditData?.certificate?.[0]?.id;
        if (!certificateId) {
            alert("Certificado no emitido aún.");
            return;
        }

        setDownloading(true);
        try {
            const blob = await resultsApi.downloadCertificate(certificateId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `VMP-Cert-${auditData?.student?.dni_encrypted || 'estudiante'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading certificate:", error);
            alert("No se pudo descargar el certificado.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Evidencia Técnica...</p>
            </div>
        );
    }

    if (!auditData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
                <XCircle className="w-16 h-16 text-red-400" />
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Resultado no encontrado</h3>
                    <p className="text-slate-500 max-w-sm mt-2">No se ha podido localizar el registro técnico para esta evaluación.</p>
                </div>
                <Button onClick={() => router.back()} variant="outline">Regresar al Panel</Button>
            </div>
        );
    }

    const isPassed = auditData.passed;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 hover:bg-slate-100/50 rounded-xl"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Volver al Registro</span>
                </Button>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir Auditoría
                    </Button>
                    {isPassed && (
                        <Button 
                            onClick={handleDownloadCertificate}
                            disabled={downloading}
                            className="bg-success hover:bg-success-dark text-white rounded-xl shadow-lg shadow-success/10"
                        >
                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
                            Descargar Certificado
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Student & Info - Blister Design */}
                <div className="space-y-8">
                    <Card className="overflow-hidden border-none shadow-xl rounded-3xl bg-slate-900 text-white">
                        <div className={`h-2 w-full ${isPassed ? 'bg-success' : 'bg-red-500'}`} />
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <ShieldCheck className={`w-8 h-8 ${isPassed ? 'text-success' : 'text-red-400'}`} />
                                </div>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase bg-white/5 border border-white/10 ${isPassed ? 'text-success' : 'text-red-400'}`}>
                                    {isPassed ? 'Certificado OK' : 'No Calificado'}
                                </span>
                            </div>
                            <CardTitle className="text-2xl font-black tracking-tight">{auditData.student?.full_name}</CardTitle>
                            <div className="flex items-center gap-2 text-white/50 text-sm font-medium mt-1">
                                <Table className="w-4 h-4" />
                                <span>{auditData.student?.dni_encrypted}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/40 font-bold uppercase tracking-widest">Empresa</span>
                                    <span className="font-bold text-white/80">{auditData.student?.company}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/40 font-bold uppercase tracking-widest">Fecha Examen</span>
                                    <span className="font-bold text-white/80">{new Date(auditData.exam_date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-center py-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Calificación Técnica</p>
                                <div className={`text-6xl font-black tracking-tighter ${isPassed ? 'text-success' : 'text-red-400'}`}>
                                    {Math.round(auditData.score)}<span className="text-2xl opacity-50">%</span>
                                </div>
                                <p className="text-xs font-bold text-white/50">{auditData.passed ? 'APROBADO CON ÉXITO' : 'FALLIDO - REQUIERE RE-ENTRENAMIENTO'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl rounded-3xl bg-white p-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Estándar Aplicado</h4>
                        <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold">
                                {auditData.course?.name.charAt(0)}
                            </div>
                            <div>
                                <h5 className="font-bold text-slate-900 leading-tight">{auditData.course?.name}</h5>
                                <p className="text-[10px] text-slate-500 uppercase font-black mt-1">ID: VMP-EN-{resultId.slice(0,8)}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Detailed Responses & Evidence */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-4 border-b border-slate-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Registro de Auditoría</CardTitle>
                                    <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1 italic">Hoja de respuestas técnica para verificación</CardDescription>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-black">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-success/5 text-success rounded-full border border-success/10">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {auditData.correct_count} Correctas
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 rounded-full border border-red-100">
                                        <XCircle className="w-3.5 h-3.5" />
                                        {(auditData.questions_count || 0) - (auditData.correct_count || 0)} Incidencias
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 overflow-hidden">
                                {auditData.answers && auditData.answers.length > 0 ? (
                                    auditData.answers.map((answer, index) => (
                                        <div key={index} className="p-8 hover:bg-slate-50/50 transition-all group border-l-[6px] border-transparent hover:border-primary/20">
                                            <div className="flex gap-6">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-400 font-black text-xs flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <p className="font-bold text-slate-900 leading-relaxed text-lg tracking-tight">
                                                        {answer.question_text || `Pregunta técnica #${index + 1}`}
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${answer.is_correct ? 'bg-success/5 border-success/10' : 'bg-red-50 border-red-100'}`}>
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Respuesta de Alumno</p>
                                                                <p className={`font-bold text-sm ${answer.is_correct ? 'text-success' : 'text-red-500'}`}>
                                                                    {answer.selected_option || 'No respondida'}
                                                                </p>
                                                            </div>
                                                            {answer.is_correct ? <CheckCircle className="w-5 h-5 text-success" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 italic">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Estándar Correcto</p>
                                                                <p className="font-bold text-sm text-slate-600">
                                                                    {answer.correct_option}
                                                                </p>
                                                            </div>
                                                            <ShieldCheck className="w-5 h-5 text-slate-300" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-16 text-center space-y-4">
                                        <Table className="w-12 h-12 text-slate-200 mx-auto" />
                                        <div className="space-y-1">
                                            <p className="font-black text-slate-400 uppercase text-xs">Sin detalles de respuestas</p>
                                            <p className="text-xs text-slate-400 italic">Este examen antiguo solo conserva la calificación final.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
