import { supabase } from "../supabase";
import { ExamResult } from "../types";
import { decryptPII } from "../security/encryption";

export const ResultService = {
    async getAllResults() {
        const { data, error } = await supabase
            .from("exam_results")
            .select(`
                *,
                student:profiles (
                    full_name,
                    dni_encrypted,
                    company
                ),
                course:courses (
                    name
                )
            `)
            .order("exam_date", { ascending: false });

        if (error) throw error;

        return data.map(r => ({
            ...r,
            student_name: r.student?.full_name,
            student_dni: r.student?.dni_encrypted ? decryptPII(r.student.dni_encrypted) : "N/A",
            course_name: r.course?.name
        })) as ExamResult[];
    },

    async getResultDetails(resultId: string) {
        // Fetch the exam result with student and course details
        const { data: result, error: rError } = await supabase
            .from("exam_results")
            .select(`
                *,
                student:profiles (
                    full_name,
                    dni_encrypted,
                    company
                ),
                course:courses (*),
                certificate:certificates(id)
            `)
            .eq("id", resultId)
            .single();

        if (rError) throw rError;

        // Fetch user answers Linked to the exam_id
        const { data: answers, error: aError } = await supabase
            .from("user_answers")
            .select(`
                *,
                question:questions (*)
            `)
            .eq("exam_id", result.exam_id);

        if (aError) throw aError;

        // Fetch audit logs for this specific exam submission
        const { data: logs } = await supabase
            .from("audit_logs")
            .select("*")
            .eq("resource_id", result.exam_id)
            .eq("action", "EXAM_SUBMIT");

        return {
            ...result,
            student_name: result.student?.full_name,
            student_dni: result.student?.dni_encrypted ? decryptPII(result.student.dni_encrypted) : "N/A",
            student_company: result.student?.company || "N/A",
            course_details: result.course,
            answers: (answers || []).map(a => ({
                ...a,
                question_text: a.question?.question_text,
                options: a.question?.options,
                correct_answer: a.question?.correct_answer
            })),
            audit_logs: logs
        };
    },

    async getStats() {
        const { data: results, error } = await supabase
            .from("exam_results")
            .select("score, passed");

        if (error) throw error;

        const total = results.length;
        const passed = results.filter(r => r.passed).length;
        const avgScore = total > 0 ? results.reduce((acc, curr) => acc + Number(curr.score), 0) / total : 0;

        return {
            totalExams: total,
            passRate: total > 0 ? (passed / total) * 100 : 0,
            avgScore: Math.round(avgScore)
        };
    }
};
