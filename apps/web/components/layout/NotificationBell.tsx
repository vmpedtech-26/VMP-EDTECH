'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { notificacionesApi, NotificacionItem } from '@/lib/api/notificaciones';

export function NotificationBell() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificacionItem[]>([]);
    const [unread, setUnread] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchNotificaciones = () => {
        notificacionesApi.listar()
            .then((data) => {
                setItems(data.items);
                setUnread(data.unread);
            })
            .catch(() => { /* silencioso: no bloquea el resto del panel */ });
    };

    useEffect(() => {
        fetchNotificaciones();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setOpen((prev) => {
            if (!prev) fetchNotificaciones();
            return !prev;
        });
    };

    const handleNotifClick = async (n: NotificacionItem) => {
        if (!n.leida) {
            setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, leida: true } : i)));
            setUnread((prev) => Math.max(0, prev - 1));
            notificacionesApi.marcarLeida(n.id).catch(() => {});
        }
        if (n.url) {
            setOpen(false);
            router.push(n.url);
        }
    };

    const handleMarcarTodas = async () => {
        setIsLoading(true);
        try {
            await notificacionesApi.marcarTodasLeidas();
            setItems((prev) => prev.map((i) => ({ ...i, leida: true })));
            setUnread(0);
        } catch {
            // sin feedback bloqueante: el usuario puede reintentar
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 transition-colors"
                aria-label="Notificaciones"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-xl ring-1 ring-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-900">Notificaciones</span>
                        {unread > 0 && (
                            <button
                                onClick={handleMarcarTodas}
                                disabled={isLoading}
                                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {items.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-400">
                                Sin notificaciones
                            </div>
                        ) : (
                            items.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotifClick(n)}
                                    className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${!n.leida ? 'bg-primary/5' : ''}`}
                                >
                                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${!n.leida ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                        <Info className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm ${!n.leida ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                            {n.titulo}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
