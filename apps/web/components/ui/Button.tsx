import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'xs';
    asChild?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    asChild = false,
    children,
    ...props
}: ButtonProps) {
    const buttonClasses = cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
            // Variants
            'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:scale-105':
                variant === 'primary',
            'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200':
                variant === 'secondary',
            'border-2 border-primary text-primary hover:bg-primary hover:text-white':
                variant === 'outline',
            'bg-transparent hover:bg-slate-100 text-slate-800':
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

