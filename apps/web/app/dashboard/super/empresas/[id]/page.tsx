'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { EmpresaForm } from '@/components/admin/EmpresaForm';
import { empresasApi, Empresa } from '@/lib/api/empresas';
import { Loader2, ArrowLeft, ShieldCheck, Key, Globe, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function EditarEmpresaPage() {
    const { id } = useParams();
    const router = useRouter();
    const [empresa, setEmpresa] = useState<Empresa | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // SSO form fields
    const [ssoActive, setSsoActive] = useState(false);
    const [ssoDomain, setSsoDomain] = useState('');
    const [ssoProvider, setSsoProvider] = useState('AZURE_AD');
    const [ssoClientId, setSsoClientId] = useState('');
    const [ssoTenantId, setSsoTenantId] = useState('');

    const fetchEmpresa = async () => {
        try {
            const data = await empresasApi.obtenerEmpresa(id as string);
            setEmpresa(data);
            // Populate SSO states if present in returned data
            const anyData = data as any;
            setSsoActive(anyData.ssoActive || false);
            setSsoDomain(anyData.ssoDomain || '');
            setSsoProvider(anyData.ssoProvider || 'AZURE_AD');
            setSsoClientId(anyData.ssoClientId || '');
            setSsoTenantId(anyData.ssoTenantId || '');
        } catch (error) {
            console.error('Error fetching empresa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchEmpresa();
    }, [id]);

    const handleUpdateEmpresa = async (formData: Partial<Empresa>) => {
        setIsSaving(true);
        try {
            await empresasApi.actualizarEmpresa(id as string, formData);
            alert('Empresa actualizada correctamente');
            router.push('/dashboard/super/empresas');
        } catch (error) {
            console.error('Error updating empresa:', error);
            alert('Error al actualizar la empresa: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSSO = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await empresasApi.actualizarEmpresa(id as string, {
                ssoActive,
                ssoDomain: ssoDomain || null,
                ssoProvider,
                ssoClientId: ssoClientId || null,
                ssoTenantId: ssoTenantId || null,
            } as any);
            alert('Configuración de SSO guardada correctamente');
            await fetchEmpresa();
        } catch (error) {
            console.error('Error updating SSO:', error);
            alert('Error al guardar configuración SSO: ' + (error instanceof Error ? error.message : String(error)));
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

    if (!empresa) {
        return <div className="p-8 text-center text-red-500 font-bold">Empresa no encontrada</div>;
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/super/empresas">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Administrar: {empresa.nombre}</h1>
                    <p className="text-slate-600 text-sm">ID: {empresa.id}</p>
                </div>
            </div>

            {/* General Settings */}
            <EmpresaForm
                title={`Datos Generales`}
                initialData={empresa}
                onSubmit={handleUpdateEmpresa}
                isLoading={isSaving}
                onCancel={() => router.push('/dashboard/super/empresas')}
            />

            {/* SSO configuration section */}
            <Card className="max-w-2xl mx-auto p-0 overflow-hidden border-none shadow-2xl mt-8">
                <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        <h2 className="text-xl font-bold">Configuración de SSO (Single Sign-On)</h2>
                    </div>
                </div>

                <form onSubmit={handleSaveSSO} className="p-8 space-y-6 bg-white">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Activar Single Sign-On</h3>
                            <p className="text-xs text-slate-600">Permite que los usuarios de esta empresa ingresen con el proveedor configurado.</p>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 text-primary rounded border-gray-300 outline-none focus:ring-2 focus:ring-primary/20"
                            checked={ssoActive}
                            onChange={(e) => setSsoActive(e.target.checked)}
                        />
                    </div>

                    {ssoActive && (
                        <div className="space-y-6">
                            {/* Domain */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Globe className="h-3 w-3" /> Dominio Correo (ej: empresa.com)
                                </label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="empresa.com"
                                    value={ssoDomain}
                                    onChange={(e) => setSsoDomain(e.target.value)}
                                />
                            </div>

                            {/* Provider */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Key className="h-3 w-3" /> Proveedor SSO
                                </label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700"
                                    value={ssoProvider}
                                    onChange={(e) => setSsoProvider(e.target.value)}
                                >
                                    <option value="AZURE_AD">Microsoft Azure AD (Entra ID)</option>
                                    <option value="GOOGLE">Google Workspace</option>
                                    <option value="OKTA">Okta</option>
                                </select>
                            </div>

                            {/* Client ID */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    Client ID (ID de la Aplicación)
                                </label>
                                <input
                                    required={ssoActive}
                                    type="text"
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    value={ssoClientId}
                                    onChange={(e) => setSsoClientId(e.target.value)}
                                />
                            </div>

                            {/* Tenant ID (only for Azure AD) */}
                            {ssoProvider === 'AZURE_AD' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                        Tenant ID (ID del Directorio)
                                    </label>
                                    <input
                                        required={ssoActive && ssoProvider === 'AZURE_AD'}
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        value={ssoTenantId}
                                        onChange={(e) => setSsoTenantId(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Guardar Configuración SSO'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
