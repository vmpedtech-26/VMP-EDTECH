'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';



interface ResetPasswordPageProps {
    params: {
        token: string;
    };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validatePassword = () => {
        if (newPassword.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        if (newPassword !== confirmPassword) {
            return 'Las contraseñas no coinciden';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validatePassword();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/reset-password', {
                token: params.token,
                new_password: newPassword,
            });

            setIsSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (newPassword.length === 0) return null;
        if (newPassword.length < 6) return { label: 'Débil', color: 'bg-red-500', width: '33%' };
        if (newPassword.length < 10) return { label: 'Media', color: 'bg-yellow-500', width: '66%' };
        return { label: 'Fuerte', color: 'bg-green-500', width: '100%' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        VMP - EDTECH
                    </h1>
                    <p className="text-slate-800 font-medium">Capacitación Profesional</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                                    <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    Restablecer Contraseña
                                </h2>
                                <p className="text-slate-600 text-sm">
                                    Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password */}
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                        <input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {passwordStrength && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-slate-800">Fortaleza:</span>
                                                <span className={`font-semibold ${passwordStrength.label === 'Débil' ? 'text-red-600' :
                                                    passwordStrength.label === 'Media' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                                                    style={{ width: passwordStrength.width }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite tu contraseña"
                                            className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-slate-900"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Match Indicator */}
                                    {confirmPassword && (
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            {newPassword === confirmPassword ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    <span className="text-green-600">Las contraseñas coinciden</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                                    <span className="text-red-600">Las contraseñas no coinciden</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-red-800">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Restableciendo...
                                        </span>
                                    ) : (
                                        'Restablecer Contraseña'
                                    )}
                                </button>
                            </form>

                            {/* Security Tips */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm font-semibold text-blue-900 mb-2">
                                    💡 Consejos de seguridad:
                                </p>
                                <ul className="text-xs text-blue-800 space-y-1">
                                    <li>• Usa al menos 8 caracteres</li>
                                    <li>• Combina letras, números y símbolos</li>
                                    <li>• No uses información personal</li>
                                    <li>• No reutilices contraseñas de otras cuentas</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¡Contraseña Actualizada!
                                </h2>
                                <p className="text-slate-800 mb-6">
                                    Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-800">
                                        Serás redirigido al inicio de sesión en unos segundos...
                                    </p>
                                </div>

                                <Link
                                    href="/login"
                                    className="inline-block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all shadow-md active:scale-[0.98]"
                                >
                                    Ir al Inicio de Sesión
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    ¿Necesitas ayuda? Contacta a{' '}
                    <a href="mailto:soporte@vmp-edtech.com.ar" className="text-primary hover:underline font-semibold">
                        soporte@vmp-edtech.com.ar
                    </a>
                </p>
            </div>
        </div>
    );
}
