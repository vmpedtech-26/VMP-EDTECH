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
                'bg-white rounded-lg shadow-sm p-6 border border-gray-100',
                hover &&
                'transition-all duration-200 hover:shadow-md hover:-translate-y-1',
                props.onClick && 'cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
