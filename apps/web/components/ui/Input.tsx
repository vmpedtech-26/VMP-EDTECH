import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    /** Usar la paleta azul original en vez del teal del panel interno (páginas públicas: login, registro, validar). */
    legacy?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className, legacy = false, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`w-full px-4 py-3 border rounded-md ${legacy ? 'focus:ring-2 focus:ring-brand-legacy' : 'focus:ring-2 focus:ring-primary'} focus:border-transparent transition-colors ${error ? 'border-red-500' : 'border-gray-300'
                        } ${className || ''}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
