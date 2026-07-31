import React from 'react';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
}

export default function SectionHeader({ title, subtitle, centered = false }: SectionHeaderProps) {
    return (
        <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {title}
            </h2>
            {subtitle && (
                <p className={`mt-4 text-lg text-gray-600 ${centered ? 'mx-auto max-w-2xl' : ''}`}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
