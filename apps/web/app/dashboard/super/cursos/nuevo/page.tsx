'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CursoForm } from '@/components/admin/CursoForm';
import { cursosApi } from '@/lib/api/cursos';
import { Curso } from '@/types/training';
import { toast } from 'sonner';

export default function NuevoCursoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Partial<Curso>) => {
        setIsLoading(true);
        try {
            await cursosApi.crearCurso(data);
            toast.success('Curso creado exitosamente');
            router.push('/dashboard/super/cursos');
        } catch (error: any) {
            console.error('Error creating curso:', error);
            toast.error(error.message || 'Error al crear el curso. Por favor reintenta.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CursoForm
            title="Crear Nuevo Curso"
            onSubmit={handleSubmit}
            isLoading={isLoading}
        />
    );
}

