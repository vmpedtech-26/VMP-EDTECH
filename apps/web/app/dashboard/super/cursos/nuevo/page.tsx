'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CursoForm } from '@/components/admin/CursoForm';
import { cursosApi } from '@/lib/api/cursos';
import { Curso } from '@/types/training';

export default function NuevoCursoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: Partial<Curso>) => {
        setIsLoading(true);
        try {
            await cursosApi.crearCurso(data);
            router.push('/dashboard/super/cursos');
        } catch (error) {
            console.error('Error creating curso:', error);
            alert('Error al crear el curso. Verifica que el código no esté duplicado.');
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
