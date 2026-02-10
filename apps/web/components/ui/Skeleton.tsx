'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
            {...props}
        />
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) {
    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-10 w-[150px]" />
            </div>
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    {Array.from({ length: cols }).map((_, i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 border-b border-gray-50 flex gap-4 items-center">
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton key={j} className="h-6 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
