'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmpresaForm } from '@/components/admin/EmpresaForm';
import { empresasApi } from '@/lib/api/empresas';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NuevaEmpresaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            // Normalizar CUIT quitando caracteres no numéricos antes de enviar
            const cleanData = {
                ...data,
                cuit: data.cuit.replace(/\D/g, '')
            };
            await empresasApi.crearEmpresa(cleanData);
            router.push('/dashboard/super/empresas');
        } catch (error: any) {
            console.error('Error creating empresa:', error);
            const detailMessage = error.response?.data?.detail;
            const message = typeof detailMessage === 'string' 
                ? detailMessage 
                : (Array.isArray(detailMessage) ? detailMessage.map((e: any) => e.msg).join(', ') : 'Error al registrar la empresa');
            alert(`No se pudo registrar la empresa: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/super/empresas">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Empresa</h1>
            </div>

            <EmpresaForm
                onSubmit={handleSubmit}
                isLoading={isLoading}
                onCancel={() => router.push('/dashboard/super/empresas')}
            />
        </div>
    );
}
