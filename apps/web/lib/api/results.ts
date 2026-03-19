import { api } from '../api-client';

export interface ExamResultDetail {
    id: string;
    student_id: string;
    course_id: string;
    score: number;
    passed: boolean;
    answers?: any[];
    questions_count?: number;
    correct_count?: number;
    exam_date: string;
    student?: {
        full_name: string;
        company: string;
        dni_encrypted: string;
    };
    course?: {
        name: string;
    };
    certificate?: { id: string }[];
}

export const resultsApi = {
    async getResultDetails(resultId: string): Promise<ExamResultDetail> {
        return api.get(`/examenes/resultados/${resultId}`);
    },

    async downloadCertificate(certificateId: string): Promise<Blob> {
        return api.getBlob(`/credenciales/${certificateId}/pdf`);
    }
};
