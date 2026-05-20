'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Users, UserPlus, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Employee {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    email?: string;
    credenciales: any[];
}

export default function ColaboradoresPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '', email: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchEmployees();
    }, [isAuthenticated]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/b2b/dashboard');
            setEmployees(res.employees);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTempPassword(null);
        try {
            const res = await api.post('/b2b/empleados', formData);
            toast.success(res.message || 'Empleado creado correctamente');
            setTempPassword(res.temp_password);
            fetchEmployees();
            setFormData({ nombre: '', apellido: '', dni: '', email: '' });
        } catch (error: any) {
            toast.error(error.message || 'Error al crear empleado');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Mi Flota</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestiona los conductores de tu empresa y dálos de alta.</p>
                </div>
                <button 
                    onClick={() => { setIsModalOpen(true); setTempPassword(null); }}
                    className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Invitar Conductor</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">DNI</th>
                                <th className="px-6 py-3">Credenciales</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{emp.nombre} {emp.apellido}</td>
                                    <td className="px-6 py-4 text-gray-500">{emp.dni}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {emp.credenciales?.length || 0} credenciales
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-red-600 hover:text-red-800 font-medium text-xs">Desvincular</button>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        Aún no tienes conductores. ¡Invita a tu primer colaborador!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Invitar Conductor */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Agregar Conductor</h2>
                            <p className="text-sm text-gray-500 mt-1">El conductor quedará vinculado automáticamente a tu empresa.</p>
                        </div>
                        
                        <div className="p-6">
                            {tempPassword ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                    <h3 className="text-green-800 font-bold text-lg">¡Cuenta Creada!</h3>
                                    <p className="text-sm text-green-700 mt-2">Comunícale al conductor que ya puede iniciar sesión con su email y esta contraseña temporal:</p>
                                    <div className="mt-4 bg-white border border-green-300 p-3 rounded font-mono text-xl font-bold text-gray-900 tracking-wider">
                                        {tempPassword}
                                    </div>
                                    <button 
                                        onClick={() => setIsModalOpen(false)}
                                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                                    >
                                        Entendido, cerrar
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateEmployee} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                                value={formData.nombre}
                                                onChange={e => setFormData({...formData, nombre: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                            <input 
                                                required
                                                type="text" 
                                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                                value={formData.apellido}
                                                onChange={e => setFormData({...formData, apellido: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                            value={formData.dni}
                                            onChange={e => setFormData({...formData, dni: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input 
                                            required
                                            type="email" 
                                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div className="flex space-x-3 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Creando...' : 'Crear Conductor'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
