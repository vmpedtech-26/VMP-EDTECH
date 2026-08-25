'use client';

import React, { useEffect, useState } from 'react';
import { LucideIcon, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

interface CatalogItem {
    id: string;
    nombre: string;
    [key: string]: any;
}

interface ExtraField {
    key: string;
    label: string;
    placeholder?: string;
}

interface CatalogManagerProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    itemLabel: string;
    fetchItems: () => Promise<CatalogItem[]>;
    createItem: (nombre: string, extra?: Record<string, string>) => Promise<any>;
    deleteItem: (id: string) => Promise<any>;
    extraField?: ExtraField;
    renderSecondary?: (item: CatalogItem) => React.ReactNode;
}

export function CatalogManager({
    title,
    subtitle,
    icon: Icon,
    itemLabel,
    fetchItems,
    createItem,
    deleteItem,
    extraField,
    renderSecondary,
}: CatalogManagerProps) {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [nombre, setNombre] = useState('');
    const [extraValue, setExtraValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await fetchItems();
            setItems(data);
        } catch (error) {
            console.error(`Error fetching ${itemLabel}:`, error);
            toast.error(`No se pudo cargar ${itemLabel}. Verificá tu conexión.`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async () => {
        if (!nombre.trim()) return;
        setIsSaving(true);
        try {
            const extra = extraField ? { [extraField.key]: extraValue } : undefined;
            await createItem(nombre.trim(), extra);
            setNombre('');
            setExtraValue('');
            toast.success('Creado correctamente');
            load();
        } catch (error) {
            toast.error('No se pudo crear. Intentá nuevamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este elemento?')) return;
        setDeletingId(id);
        try {
            await deleteItem(id);
            toast.success('Eliminado correctamente');
            setItems((prev) => prev.filter((i) => i.id !== id));
        } catch (error) {
            toast.error('No se pudo eliminar.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    {title}
                </h1>
                <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            </div>

            <Card className="p-6 border-none shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        placeholder={`Nombre ${itemLabel}`}
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {extraField && (
                        <input
                            type="text"
                            placeholder={extraField.placeholder || extraField.label}
                            value={extraValue}
                            onChange={(e) => setExtraValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="md:w-56 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    )}
                    <Button onClick={handleCreate} disabled={isSaving || !nombre.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isSaving ? 'Guardando...' : 'Agregar'}
                    </Button>
                </div>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={Icon}
                        title={`Sin ${itemLabel} creados`}
                        description={`Todavía no agregaste ningún elemento a ${itemLabel}.`}
                    />
                ) : (
                    <div className="divide-y divide-slate-50">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{item.nombre}</p>
                                    {renderSecondary && (
                                        <p className="text-xs text-slate-500 mt-0.5">{renderSecondary(item)}</p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="xs"
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    aria-label={`Eliminar ${itemLabel.toLowerCase()}: ${item.nombre}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
