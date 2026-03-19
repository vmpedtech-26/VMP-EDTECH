"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    BookOpen,
    CheckCircle,
    Award,
    Download,
    Search,
    Plus,
    FileText,
    Settings,
    Eye,
    Trash2,
    Activity,
    TrendingUp,
    ShieldCheck,
    BarChart3,
    Layers,
    Loader2,
    Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ExamResult, Question, QuestionAnalytic } from "@/lib/types";
import { QuestionModal } from "@/components/dashboard/instructor/QuestionModal";
import { QuestionService } from "@/lib/services/question-service";
import { ResultService } from "@/lib/services/result-service";
import { QuestionAnalyticsService } from "@/lib/services/question-analytics-service";
import { ExamBuilder } from "@/components/dashboard/instructor/ExamBuilder";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Skeleton, TableRowSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { motion, AnimatePresence } from "framer-motion";

export default function InstructorDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "results" | "questions" | "analytics" | "builder">("overview");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [results, setResults] = useState<ExamResult[]>([]);
    const [analytics, setAnalytics] = useState<QuestionAnalytic[]>([]);
    const [stats, setStats] = useState({
        totalExams: 0,
        passRate: 0,
        avgScore: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab === "results") setActiveTab("results");
        else if (tab === "questions") setActiveTab("questions");
        else if (tab === "analytics") setActiveTab("analytics");
        else if (tab === "builder") setActiveTab("builder");
        else setActiveTab("overview");

        loadAllData();
    }, [searchParams]);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [qData, rData, sData, aData] = await Promise.all([
                QuestionService.getAllQuestions(),
                ResultService.getAllResults(),
                ResultService.getStats(),
                QuestionAnalyticsService.getQuestionAnalytics()
            ]);
            setQuestions(qData);
            setResults(rData);
            setStats(sData);
            setAnalytics(aData);
        } catch (error) {
            console.error("Error loading instructor data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch('/api/instructor/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: null })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_VMP_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleSaveQuestion = async (questionData: Partial<Question>) => {
        try {
            if (editingQuestion) {
                await QuestionService.updateQuestion(editingQuestion.id, questionData);
            } else {
                await QuestionService.createQuestion(questionData);
            }
            loadAllData();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving question:", error);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (confirm("¿Eliminar este reactivo?")) {
            await QuestionService.deleteQuestion(id);
            loadAllData();
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 bg-vmp-teal-deep min-h-screen text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">Consola de Instructor</h2>
                    <p className="text-vmp-mint/60 font-medium text-sm md:text-base">Métricas técnicas y gestión de certificaciones.</p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-vmp-teal/20 border border-vmp-teal/30 rounded-2xl">
                    <ShieldCheck className="w-5 h-5 text-vmp-mint" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-vmp-mint">VMP Secure Access</span>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-black/20 backdrop-blur-xl rounded-2xl w-full md:w-fit border border-white/5 overflow-x-auto no-scrollbar">
                {[
                    { id: "overview", label: "Vista General", icon: Activity },
                    { id: "results", label: "Resultados", icon: Award },
                    { id: "questions", label: "Banco", icon: BookOpen },
                    { id: "analytics", label: "Analítica", icon: BarChart3 },
                    { id: "builder", label: "Constructor", icon: Layers },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            router.push(`/dashboard/instructor?tab=${tab.id}`);
                        }}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-black uppercase tracking-tighter transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-vmp-teal text-white shadow-lg shadow-vmp-teal/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(isLoading ? Array(4).fill(null) : [
                                { label: "Evaluaciones", value: stats.totalExams, icon: FileText, change: "+5% hoy" },
                                { label: "Aprobación", value: `${Math.round(stats.passRate)}%`, icon: CheckCircle, change: "Meta: 85%" },
                                { label: "Promedio", value: `${stats.avgScore}%`, icon: TrendingUp, change: "Estable" },
                                { label: "Reactivos", value: questions.length, icon: BookOpen, change: "Actualizado" },
                            ]).map((s, idx) => (
                                <Card key={idx} className="bg-white/5 border-white/10 text-white group hover:border-vmp-mint/30 transition-all rounded-[1.5rem] md:rounded-[2rem]">
                                    <CardContent className="pt-6">
                                        {!s ? (
                                            <div className="space-y-4">
                                                <div className="flex justify-between"><Skeleton className="h-10 w-10 rounded-2xl" /><Skeleton className="h-3 w-16" /></div>
                                                <Skeleton className="h-10 w-24" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="p-3 bg-white/5 rounded-2xl text-vmp-mint group-hover:scale-110 transition-transform"><s.icon className="w-5 h-5" /></div>
                                                    <span className="text-vmp-mint text-[9px] font-black uppercase tracking-widest">{s.change}</span>
                                                </div>
                                                <div className="text-3xl md:text-4xl font-black tracking-tighter">{s.value}</div>
                                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">{s.label}</p>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Recent Results Preview */}
                        <div className="space-y-6">
                            <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase flex items-center gap-3 font-outfit">
                                <Activity className="w-5 h-5 text-vmp-mint" />
                                Últimas Evaluaciones
                            </h3>
                            {isLoading ? (
                                <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
                                    {Array(5).fill(null).map((_, i) => <TableRowSkeleton key={i} />)}
                                </div>
                            ) : results.length > 0 ? (
                                <ResponsiveTable
                                    data={results.slice(0, 5)}
                                    keyExtractor={(r) => r.id}
                                    columns={[
                                        {
                                            header: "Alumno", accessor: (r) => (
                                                <div className="flex flex-col">
                                                    <span>{r.student_name}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-tighter font-black">DNI: {r.student_dni}</span>
                                                </div>
                                            ), mobileLabel: "Alumno / DNI"
                                        },
                                        { header: "Curso", accessor: "course_name" },
                                        { header: "Score", accessor: (r) => <span className="text-lg">{Math.round(r.score)}%</span>, className: "text-center" },
                                        {
                                            header: "Estado", accessor: (r) => (
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    r.passed ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {r.passed ? "Aprobado" : "No Aprobado"}
                                                </span>
                                            )
                                        },
                                        {
                                            header: "Acción",
                                            accessor: (r) => (
                                                <Button 
                                                    variant="ghost" 
                                                    onClick={() => router.push(`/dashboard/instructor/audit/${r.id}`)}
                                                    className="text-vmp-mint font-black text-[10px] uppercase hover:bg-vmp-mint/10 rounded-xl"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Auditar
                                                </Button>
                                            ),
                                            className: "text-right"
                                        }
                                    ]}
                                />
                            ) : (
                                <EmptyState
                                    title="Sin Evaluaciones"
                                    description="Aún no se han registrado intentos de examen por parte de los alumnos."
                                    icon={<Inbox className="w-12 h-12" />}
                                />
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "results" && (
                    <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="Buscar alumno o curso..." className="h-12 pl-12 bg-black/20 border-white/5 text-white rounded-xl focus:ring-vmp-teal" />
                            </div>
                            <Button onClick={handleExport} disabled={isExporting} className="h-12 bg-vmp-mint text-vmp-teal-deep hover:bg-white font-black rounded-xl px-8 flex gap-2 shadow-xl shadow-vmp-mint/10">
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                EXPORTAR REPORTE MAESTRO
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
                                {Array(8).fill(null).map((_, i) => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : results.length > 0 ? (
                            <ResponsiveTable
                                data={results}
                                keyExtractor={(r) => r.id}
                                columns={[
                                    { header: "Fecha", accessor: (r) => new Date(r.exam_date).toLocaleDateString(), className: "text-gray-500 text-xs font-mono" },
                                    { header: "Alumno", accessor: (r) => <div className="flex flex-col"><span>{r.student_name}</span><span className="text-[10px] text-gray-500">DNI: {r.student_dni}</span></div> },
                                    { header: "Curso", accessor: "course_name" },
                                    {
                                        header: "Calificación", accessor: (r) => (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                                                    <div className={cn("h-full", r.passed ? "bg-vmp-mint" : "bg-red-500")} style={{ width: `${r.score}%` }} />
                                                </div>
                                                <span className="font-black text-lg">{Math.round(r.score)}%</span>
                                            </div>
                                        )
                                    },
                                    { header: "Estado", accessor: (r) => <span className={cn("text-[10px] font-black uppercase", r.passed ? "text-green-500" : "text-red-500")}>{r.passed ? "Aprobado" : "Fallido"}</span> },
                                    { 
                                        header: "Acción", 
                                        accessor: (r) => (
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => router.push(`/dashboard/instructor/audit/${r.id}`)}
                                                className="text-vmp-mint font-black text-[10px] uppercase hover:bg-vmp-mint/10 rounded-xl"
                                            >
                                                Auditar
                                            </Button>
                                        ), 
                                        className: "text-right" 
                                    }
                                ]}
                            />
                        ) : (
                            <EmptyState title="No hay resultados" description="No hay registros que coincidan con los criterios de búsqueda." />
                        )}
                    </motion.div>
                )}

                {activeTab === "questions" && (
                    <motion.div key="questions" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                        <div className="flex justify-between items-center bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Batería Técnica</h3>
                                <p className="text-gray-500 text-xs font-medium">Gestión de reactivos acreditados.</p>
                            </div>
                            <Button onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }} className="bg-vmp-teal hover:bg-vmp-accent text-white font-black rounded-xl h-12 md:h-14 px-4 md:px-8 shadow-2xl gap-3">
                                <Plus className="w-5 h-5" /> <span className="hidden md:inline">NUEVO REACTIVO</span>
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array(6).fill(null).map((_, i) => <CardSkeleton key={i} />)}
                            </div>
                        ) : questions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {questions.map(q => (
                                    <Card key={q.id} className="bg-white/[0.03] border-white/10 p-6 md:p-8 rounded-[2rem] hover:border-vmp-teal transition-all group flex flex-col h-full shadow-xl">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-vmp-mint/10 text-vmp-mint border-vmp-mint/20')}>
                                                {q.difficulty}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(q); setIsModalOpen(true); }} className="h-8 w-8 text-gray-500 hover:text-white"><Settings className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)} className="h-8 w-8 text-gray-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                        <h4 className="font-black text-lg mb-6 line-clamp-3 leading-tight">{q.question_text}</h4>
                                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-end">
                                            <div className="flex flex-col"><span className="text-[10px] font-black text-gray-500 uppercase">Tópico</span><span className="text-vmp-mint font-bold text-[10px] uppercase truncate">{q.topic || "Gral"}</span></div>
                                            <div className="flex flex-col text-right"><span className="text-[10px] font-black text-gray-500 uppercase">Opciones</span><span className="text-white font-bold">{q.options.length}</span></div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="Sin Reactivos"
                                description="El banco de preguntas está vacío. Comience agregando una nueva pregunta técnica."
                                actionLabel="Agregar Primer Reactivo"
                                onAction={() => setIsModalOpen(true)}
                            />
                        )}
                    </motion.div>
                )}

                {activeTab === "analytics" && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Dificultad Real (AI Powered)</h3>
                        {isLoading ? (
                            <div className="bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden">
                                {Array(6).fill(null).map((_, i) => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : analytics.length > 0 ? (
                            <ResponsiveTable
                                data={analytics}
                                keyExtractor={(a) => a.question_id}
                                columns={[
                                    { header: "Reactivo Técnico", accessor: (a) => <span className="line-clamp-2">{a.question_text}</span>, mobileLabel: "Contenido" },
                                    {
                                        header: "Tasa Error", accessor: (a) => (
                                            <div className="flex items-center gap-3">
                                                <span className={cn("text-lg font-black", a.error_rate > 70 ? "text-red-500" : a.error_rate > 40 ? "text-orange-500" : "text-vmp-mint")}>{a.error_rate}%</span>
                                                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                                                    <div className={cn("h-full", a.error_rate > 70 ? "bg-red-500" : a.error_rate > 40 ? "bg-orange-500" : "bg-vmp-mint")} style={{ width: `${a.error_rate}%` }} />
                                                </div>
                                            </div>
                                        )
                                    },
                                    { header: "Intentos", accessor: "total_attempts", className: "text-center md:text-left" },
                                    {
                                        header: "Nivel", accessor: (a) => (
                                            <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase border", a.difficulty_level === 'Crítica' ? 'bg-red-500/10 text-red-500 border-red-500/20' : a.difficulty_level === 'Moderada' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-vmp-mint/10 text-vmp-mint border-vmp-mint/20')}>
                                                {a.difficulty_level}
                                            </span>
                                        )
                                    }
                                ]}
                            />
                        ) : (
                            <EmptyState title="Sin Datos Analíticos" description="Se requiere un mínimo de intentos de examen para generar métricas de dificultad real." />
                        )}
                    </motion.div>
                )}

                {activeTab === "builder" && (
                    <motion.div key="builder" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">{Array(4).fill(null).map((_, i) => <TableRowSkeleton key={i} />)}</div>
                                <div className="space-y-4"><Skeleton className="h-[500px] w-full rounded-[2.5rem]" /></div>
                            </div>
                        ) : (
                            <ExamBuilder availableQuestions={questions} />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <QuestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveQuestion} initialData={editingQuestion} />
        </div>
    );
}
