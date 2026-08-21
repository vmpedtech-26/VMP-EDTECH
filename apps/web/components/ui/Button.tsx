import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xs';
    asChild?: boolean;
    children?: React.ReactNode;
    className?: string;
    /** Usar la paleta azul original en vez del teal del panel interno (páginas públicas: login, registro, validar). */
    legacy?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    asChild = false,
    legacy = false,
    children,
    ...props
}: ButtonProps) {
    const buttonClasses = cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        legacy
            ? 'focus:outline-none focus:ring-2 focus:ring-brand-legacy focus:ring-offset-2'
            : 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        {
            // Variants (teal, panel interno)
            'bg-gradient-to-r from-primary to-primary-light text-white hover:shadow-lg hover:-translate-y-0.5':
                variant === 'primary' && !legacy,
            'border-2 border-primary text-primary hover:bg-primary hover:text-white':
                variant === 'outline' && !legacy,
            // Variants (azul, páginas públicas)
            'bg-gradient-to-r from-brand-legacy to-brand-legacy-light text-white hover:shadow-lg hover:-translate-y-0.5':
                variant === 'primary' && legacy,
            'border-2 border-brand-legacy text-brand-legacy hover:bg-brand-legacy hover:text-white':
                variant === 'outline' && legacy,
            // Variants (comunes)
            'bg-secondary-light text-gray-900 hover:bg-secondary':
                variant === 'secondary',
            'bg-transparent hover:bg-gray-100 text-gray-600':
                variant === 'ghost',
            // Sizes
            'px-2 py-1 text-[10px]': size === 'xs',
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
        },
        className
    );

    if (asChild) {
        // For Next.js Link compatibility, render children directly with className
        return <span className={buttonClasses}>{children}</span>;
    }

    return (
        <button
            className={buttonClasses}
            {...props}
        >
            {children}
        </button>
    );
}

