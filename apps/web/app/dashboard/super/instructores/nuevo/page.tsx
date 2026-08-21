'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsuarioForm } from '@/components/admin/UsuarioForm';
import { usersApi } from '@/lib/api/users';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NuevoInstructorPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await usersApi.crearUsuario(data);
            router.push('/dashboard/super/instructores');
        } catch (error: any) {
            console.error('Error creating user:', error);
            alert(error.message || 'Error al registrar el instructor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/super/instructores">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Instructor</h1>
            </div>

            <UsuarioForm
                defaultRol="INSTRUCTOR"
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onCancel={() => router.push('/dashboard/super/instructores')}
                title="Datos del Instructor"
                isSuperAdminView={true}
            />
        </div>
    );
}
