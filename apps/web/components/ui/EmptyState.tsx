'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 animate-in fade-in duration-700">
            <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                <Icon className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-700 max-w-sm mx-auto mb-8 font-medium">
                {description}
            </p>
            {action && (
                <div className="animate-in slide-in-from-bottom-2 duration-1000">
                    {action}
                </div>
            )}
        </div>
    );
}
