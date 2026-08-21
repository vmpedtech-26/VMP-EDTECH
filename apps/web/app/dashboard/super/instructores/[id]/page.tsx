'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UsuarioForm } from '@/components/admin/UsuarioForm';
import { usersApi, UserAdmin } from '@/lib/api/users';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function EditarInstructorPage() {
    const { id } = useParams();
    const router = useRouter();
    const [usuario, setUsuario] = useState<UserAdmin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const found = await usersApi.obtenerUsuario(id as string);
                setUsuario(found);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchUsuario();
    }, [id]);

    const handleSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            await usersApi.actualizarUsuario(id as string, data);
            router.push('/dashboard/super/instructores');
        } catch (error: any) {
            console.error('Error updating user:', error);
            alert(error.message || 'Error al actualizar el instructor');
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

    if (!usuario) return <div>Instructor no encontrado</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/super/instructores">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-slate-900">Editar Instructor: {usuario.nombre}</h1>
            </div>

            <UsuarioForm
                initialData={usuario}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                onCancel={() => router.push('/dashboard/super/instructores')}
                title="Actualizar Información"
                isSuperAdminView={true}
            />
        </div>
    );
}
