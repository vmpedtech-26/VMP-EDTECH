"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, CheckCircle, Award, Activity, TrendingUp, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { EnrollmentService } from "@/lib/services/enrollment-service";
import { CourseEnrollment } from "@/lib/types";

export default function DashboardPage() {
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
    const [stats, setStats] = useState({
        assigned: 0,
        completed: 0,
        average: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const [enrollmentData, resultsData] = await Promise.all([
                EnrollmentService.getStudentEnrollments(session.user.id),
                supabase.from("exam_results").select("score, passed").eq("student_id", session.user.id)
            ]);

            setEnrollments(enrollmentData);

            const results = resultsData.data || [];
            const completed = results.filter(r => r.passed).length;
            const avg = results.length > 0 ? results.reduce((acc, curr) => acc + Number(curr.score), 0) / results.length : 0;

            setStats({
                assigned: enrollmentData.length,
                completed,
                average: Math.round(avg)
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-vmp-mint animate-spin" />
                <p className="text-vmp-mint font-black tracking-widest text-xs uppercase animate-pulse">Sincronizando Expediente Técnico...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 p-8">
            {/* Hero Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-vmp-teal-deep border-vmp-teal/20 text-white overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vmp-mint/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-vmp-mint/10 transition-all duration-500"></div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-vmp-mint uppercase tracking-[0.2em] opacity-70">Programas Asignados</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black tracking-tighter">{stats.assigned}</span>
                            <span className="text-vmp-mint font-bold text-sm mb-2 flex items-center gap-1">
                                <Activity className="w-4 h-4" /> Activo
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Cursos Completados</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black tracking-tighter text-vmp-teal-deep">{stats.completed}</span>
                            <span className="text-green-500 font-bold text-sm mb-2 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> OK
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative group">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Promedio Técnico</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="flex items-end gap-3">
                            <span className="text-5xl font-black tracking-tighter text-vmp-teal-deep">{stats.average > 0 ? stats.average : "-"}{stats.average > 0 && "%"}</span>
                            <span className="text-vmp-teal font-bold text-sm mb-2 flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" /> Global
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Learning Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-vmp-teal-deep tracking-tighter uppercase">Capacitaciones Activas</h3>
                    <Button variant="ghost" className="text-vmp-teal font-black text-xs uppercase tracking-widest hover:bg-vmp-teal/5 italic opacity-50">Acceso a Sala Virtual</Button>
                </div>

                {/* Workflow Reminder - Blister style */}
                <Card className="bg-vmp-teal/5 border-vmp-teal/20 p-6 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-inner shadow-vmp-teal/5">
                    <div className="flex-shrink-0 p-4 bg-vmp-teal/10 rounded-2xl">
                        <Calendar className="w-12 h-12 text-vmp-teal" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-vmp-teal-deep uppercase tracking-tighter mb-2">Proceso de Certificación VMP</h4>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-3xl">
                             Recuerde que primero debe asistir a la **Reunión Técnica vía Meet o Teams** programada por su instructor. Una vez finalizada la etapa teórica, su panel se habilitará para iniciar el **Examen Final**. 
                             Si no ha recibido el enlace de la reunión, contacte con soporte técnico inmediato.
                        </p>
                    </div>
                </Card>

                {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {enrollments.map((enrollment, idx) => (
                            <motion.div
                                key={enrollment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="overflow-hidden border-none shadow-2xl rounded-[2.5rem] bg-white group hover:shadow-vmp-teal/10 transition-all duration-500">
                                    <div className="flex flex-col md:flex-row h-full">
                                        <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden">
                                            <Image
                                                src={enrollment.course?.thumbnail_url || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"}
                                                alt={enrollment.course?.name || "Thumbnail"}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-vmp-teal-deep/60 to-transparent" />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                                    {enrollment.status === 'completed' ? 'COMPLETADO' : 'EN PROGRESO'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-black text-2xl text-vmp-teal-deep mb-2 tracking-tight group-hover:text-vmp-teal transition-colors">{enrollment.course?.name}</h4>
                                                <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">{enrollment.course?.description}</p>

                                                <div className="flex items-center gap-6 mb-8 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-vmp-teal" /> {enrollment.course?.duration_minutes} min</span>
                                                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-vmp-teal" /> {enrollment.progress_percent}% progreso</span>
                                                </div>
                                            </div>

                                            <Button asChild className="w-full h-14 bg-vmp-teal hover:bg-vmp-accent text-white font-black rounded-2xl shadow-lg shadow-vmp-teal/20 gap-3 group/btn">
                                                <Link href={`/dashboard/exam/${enrollment.course_id}`}>
                                                    <PlayCircle className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                    {enrollment.status === 'completed' ? 'REPETIR EVALUACIÓN' : 'INICIAR EVALUACIÓN'}
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity className="w-10 h-10 text-gray-300" />
                        </div>
                        <h4 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Sin Capacitaciones Activas</h4>
                        <p className="text-gray-400 font-medium mt-2">Contacte con su instructor VMP para asignar nuevos programas técnicos.</p>
                    </div>
                )}
            </div>

            {/* Bottom Section - Certificates Quick Access */}
            <div className="bg-vmp-teal-deep rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-vmp-mint/10 rounded-full -mb-32 -mr-32 blur-[100px]"></div>
                <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-vmp-mint/20 border border-vmp-mint/30 rounded-full">
                            <Award className="w-4 h-4 text-vmp-mint" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-vmp-mint">Credenciales Certificadas</span>
                        </div>
                        <h3 className="text-3xl font-black tracking-tighter">¿Necesitas tus certificados?</h3>
                        <p className="text-vmp-mint/70 font-medium max-w-md">Descarga tus acreditaciones firmadas electrónicamente y valídalas en tiempo real a través de nuestro portal seguro.</p>
                    </div>
                    <Button asChild className="h-16 px-10 bg-vmp-mint hover:bg-white text-vmp-teal-deep font-black rounded-2xl shadow-xl shadow-vmp-mint/10 transition-all active:scale-95 text-lg">
                        <Link href="/dashboard/certificates">
                            VER MIS CERTIFICADOS
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
