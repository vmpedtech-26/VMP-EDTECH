import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className, hover = true, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'glass-card rounded-2xl p-6 border border-white/50',
                hover &&
                'transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                props.onClick && 'cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
