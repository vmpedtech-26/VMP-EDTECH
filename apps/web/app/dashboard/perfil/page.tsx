'use client';

import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import ProfileSignatureUpload from '@/components/instructor/ProfileSignatureUpload';

const ROL_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    INSTRUCTOR: 'Instructor',
    EMPRESA: 'Empresa',
    CONTADOR: 'Contador',
    ALUMNO: 'Alumno',
};

export default function PerfilPage() {
    const { user } = useAuth();

    if (!user) return null;

    const puedeFirmar = user.rol === 'INSTRUCTOR' || user.rol === 'SUPER_ADMIN';

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600 mt-2">Tus datos de cuenta en VMP - EDTECH.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <User className="h-7 w-7" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-slate-900">{user.nombre} {user.apellido}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                </div>

                <dl className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 text-sm">
                    <div>
                        <dt className="text-slate-500">DNI</dt>
                        <dd className="font-semibold text-slate-900">{user.dni}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Rol</dt>
                        <dd className="font-semibold text-slate-900">{ROL_LABELS[user.rol] || user.rol}</dd>
                    </div>
                </dl>
            </div>

            {puedeFirmar && <ProfileSignatureUpload />}
        </div>
    );
}
