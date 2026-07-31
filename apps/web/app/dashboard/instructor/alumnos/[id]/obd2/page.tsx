"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function Obd2MetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando fetch a /api/v1/obd2/metrics/${id}
    setTimeout(() => {
      setMetrics([
        {
          id: "session-123",
          fecha: new Date().toISOString(),
          fuerzaFrenado: 0.82,
          aceleracion: 1.15,
          curvasScore: 92,
          esquivoAlce: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/dashboard/instructor/alumnos" className="text-sm text-cyan-600 hover:underline mb-2 inline-block">
            &larr; Volver a Alumnos
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Métricas de Conducción (OBD2)</h1>
          <p className="text-slate-500 mt-1">Evaluación práctica en tiempo real del desempeño del alumno.</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">ID Inscripción</span>
          <span className="text-sm font-mono text-slate-700">{id}</span>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-24 bg-slate-200 rounded"></div>
              <div className="h-24 bg-slate-200 rounded"></div>
              <div className="h-24 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      ) : metrics.length === 0 ? (
        <div className="bg-slate-50 p-12 text-center rounded-xl border border-slate-200">
          <h3 className="text-lg font-medium text-slate-700">No hay métricas registradas</h3>
          <p className="text-slate-500 mt-2">Conecta el dispositivo OBD2 al vehículo y realiza la prueba práctica para comenzar a recibir datos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {metrics.map((session, index) => (
            <div key={session.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-semibold text-lg text-slate-800">
                  Sesión #{metrics.length - index}
                </h3>
                <span className="text-sm text-slate-500">
                  {new Date(session.fecha).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Fuerza de Frenado */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Fuerza de Frenado</span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-indigo-600">{session.fuerzaFrenado}</span>
                    <span className="text-sm font-medium text-indigo-400 ml-1">G</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(session.fuerzaFrenado * 100, 100)}%` }}></div>
                  </div>
                </div>

                {/* Aceleración */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Aceleración</span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-cyan-600">{session.aceleracion}</span>
                    <span className="text-sm font-medium text-cyan-400 ml-1">G</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(session.aceleracion * 50, 100)}%` }}></div>
                  </div>
                </div>

                {/* Score Curvas */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Puntaje Curvas</span>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-emerald-600">{session.curvasScore}</span>
                    <span className="text-sm font-medium text-emerald-400 ml-1">/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${session.curvasScore}%` }}></div>
                  </div>
                </div>

                {/* Esquivo del Alce */}
                <div className={`p-4 rounded-lg border flex flex-col items-center justify-center text-center ${session.esquivoAlce ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <span className={`text-xs uppercase tracking-wider font-bold mb-2 ${session.esquivoAlce ? 'text-emerald-700' : 'text-red-700'}`}>Esquivo del Alce</span>
                  <div className="flex items-center justify-center h-full">
                    {session.esquivoAlce ? (
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase tracking-wide text-sm">Aprobado</span>
                    ) : (
                      <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-bold uppercase tracking-wide text-sm">Fallido</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
