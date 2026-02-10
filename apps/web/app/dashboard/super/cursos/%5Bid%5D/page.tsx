'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CursoForm } from '@/components/admin/CursoForm';
import { cursosApi } from '@/lib/api/cursos';
import { CursoDetail, Curso } from '@/types/training';
import { Loader2 } from 'lucide-react';
import { GestorModulos } from '@/components/admin/GestorModulos';

export default function EditarCursoPage() {
    const { id } = useParams();
    const router = useRouter();
    const [curso, setCurso] = useState<CursoDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchCurso = async () => {
        try {
            const data = await cursosApi.obtenerCurso(id as string);
            setCurso(data);
        } catch (error) {
            console.error('Error fetching curso:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCurso();
    }, [id]);

    const handleUpdateCurso = async (data: Partial<Curso>) => {
        setIsSaving(true);
        try {
            await cursosApi.actualizarCurso(id as string, data);
            await fetchCurso();
            alert('Curso actualizado correctamente');
        } catch (error) {
            console.error('Error updating curso:', error);
            alert('Error al actualizar el curso');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!curso) {
        return <div>Curso no encontrado</div>;
    }

    return (
        <div className="space-y-12 pb-20">
            <CursoForm
                title={`Editar: ${curso.nombre}`}
                initialData={curso}
                onSubmit={handleUpdateCurso}
                isLoading={isSaving}
            />

            <div className="max-w-4xl mx-auto">
                <GestorModulos
                    cursoId={id as string}
                    modulos={curso.modulos}
                    onUpdate={fetchCurso}
                />
            </div>
        </div>
    );
}
