'use client';

import React, { useState } from 'react';
import {
    X,
    Upload,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Download,
    Sparkles,
    Loader2,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api/users';

interface ModalCargaMasivaProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    empresaId?: string;
}

interface AlumnoParsed {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    valido: boolean;
    motivoError?: string;
}

export function ModalCargaMasiva({
    isOpen,
    onClose,
    onSuccess,
    empresaId
}: ModalCargaMasivaProps) {
    const [activeTab, setActiveTab] = useState<'excel' | 'texto'>('excel');
    const [rawText, setRawText] = useState('');
    const [parsedAlumnos, setParsedAlumnos] = useState<AlumnoParsed[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    // Procesar texto pegado (formato CSV / TSV / separado por comas o tabulaciones)
    const handleParseText = (text: string) => {
        setRawText(text);
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        
        const rows: AlumnoParsed[] = lines.map((line) => {
            // Separa por coma, punto y coma o tabulación
            const parts = line.split(/[,;\t]/).map(p => p.trim());
            const dni = parts[0] ? parts[0].replace(/\D/g, '') : '';
            const nombre = parts[1] || '';
            const apellido = parts[2] || '';
            const email = parts[3] || `${dni || 'alumno'}@vmp-edtech.com`;

            let valido = true;
            let motivoError = '';

            if (!dni || dni.length < 7) {
                valido = false;
                motivoError = 'DNI inválido (mín. 7 dígitos)';
            } else if (!nombre || !apellido) {
                valido = false;
                motivoError = 'Falta Nombre o Apellido';
            }

            return { dni, nombre, apellido, email, valido, motivoError };
        });

        setParsedAlumnos(rows);
    };

    // Procesar archivo Excel / CSV cargado
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                handleParseText(content);
            }
        };
        reader.readAsText(file);
    };

    // Descargar plantilla CSV de muestra
    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,DNI,Nombre,Apellido,Email\n38123456,Gabriel,Escobar,gabriel.escobar@empresa.com\n35987654,Rosario,Araujo,rosario.araujo@empresa.com\n40112233,Silvina,Del Pino,silvina.delpino@empresa.com";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_nomina_alumnos_vmp.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Confirmar e importar lista de alumnos
    const handleImportar = async () => {
        const validos = parsedAlumnos.filter(a => a.valido);
        if (validos.length === 0) {
            setStatusMessage('No hay registros válidos para importar.');
            return;
        }

        setIsProcessing(true);
        setStatusMessage(null);

        try {
            const payload = validos.map(a => ({
                dni: a.dni,
                nombre: a.nombre,
                apellido: a.apellido,
                email: a.email,
                empresaId: empresaId || undefined,
            }));

            const result = await usersApi.crearMasivo(payload);
            setStatusMessage(`¡Éxito! Se importaron ${result.creados} alumnos correctamente.`);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1200);
        } catch (error: any) {
            console.error('Error importando alumnos:', error);
            setStatusMessage(error.message || 'Ocurrió un error durante la importación masiva.');
        } finally {
            setIsProcessing(false);
        }
    };

    const validosCount = parsedAlumnos.filter(a => a.valido).length;
    const invalidosCount = parsedAlumnos.filter(a => !a.valido).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-primary/20 rounded-xl text-primary-light">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Carga Masiva de Alumnos</h2>
                            <p className="text-xs text-gray-300">Importa nóminas completas de conductores mediante Excel o Pegado Rápido.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs selection */}
                <div className="flex border-b border-gray-200 bg-gray-50 px-6 pt-3 space-x-4">
                    <button
                        onClick={() => setActiveTab('excel')}
                        className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'excel'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Subir Archivo Excel / CSV</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('texto')}
                        className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                            activeTab === 'texto'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Copiar y Pegar Nómina</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {activeTab === 'excel' ? (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-8 text-center bg-gray-50/50 transition-colors relative group">
                                <input
                                    type="file"
                                    accept=".csv, .txt, .tsv, .xlsx"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                />
                                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-gray-900 font-bold text-base mb-1">
                                    Haz clic o arrastra tu archivo Excel / CSV
                                </h3>
                                <p className="text-gray-500 text-xs max-w-sm mx-auto">
                                    Soporta columnas: DNI, Nombre, Apellido, Email.
                                </p>
                            </div>

                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center space-x-2 text-blue-800 text-xs font-medium">
                                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span>¿No tienes la plantilla? Descarga nuestro formato estándar optimizado.</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="bg-white text-blue-700 border-blue-200 hover:bg-blue-100 shrink-0 text-xs"
                                >
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Descargar CSV
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-700">
                                Pega aquí las filas de tu Excel (separadas por comas, tabulaciones o punto y coma):
                            </label>
                            <textarea
                                rows={6}
                                placeholder="Ejemplo:&#10;38123456, Gabriel, Escobar, gabriel@empresa.com&#10;35987654, Rosario, Araujo, rosario@empresa.com"
                                value={rawText}
                                onChange={(e) => handleParseText(e.target.value)}
                                className="w-full p-4 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                            <p className="text-xs text-gray-400">
                                Formato: DNI, Nombre, Apellido, Email
                            </p>
                        </div>
                    )}

                    {/* Preview Table */}
                    {parsedAlumnos.length > 0 && (
                        <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                                    <span>Previsualización de Alumnos ({parsedAlumnos.length})</span>
                                </h4>
                                <div className="flex space-x-3 text-xs font-medium">
                                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                        {validosCount} Válidos
                                    </span>
                                    {invalidosCount > 0 && (
                                        <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center">
                                            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                                            {invalidosCount} Incompletos
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2">DNI</th>
                                            <th className="px-3 py-2">Nombre</th>
                                            <th className="px-3 py-2">Apellido</th>
                                            <th className="px-3 py-2">Email</th>
                                            <th className="px-3 py-2 text-right">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {parsedAlumnos.map((row, idx) => (
                                            <tr key={idx} className={row.valido ? 'hover:bg-gray-50' : 'bg-amber-50/40'}>
                                                <td className="px-3 py-2 font-mono font-medium text-gray-900">{row.dni || '-'}</td>
                                                <td className="px-3 py-2">{row.nombre || '-'}</td>
                                                <td className="px-3 py-2">{row.apellido || '-'}</td>
                                                <td className="px-3 py-2 text-gray-500">{row.email || '-'}</td>
                                                <td className="px-3 py-2 text-right">
                                                    {row.valido ? (
                                                        <span className="text-emerald-600 font-medium">Válido</span>
                                                    ) : (
                                                        <span className="text-amber-600 font-medium">{row.motivoError}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {statusMessage && (
                        <div className="p-4 rounded-xl text-xs font-semibold bg-gray-100 border border-gray-200 text-gray-800">
                            {statusMessage}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="bg-white border-gray-200 text-gray-700"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleImportar}
                        disabled={isProcessing || validosCount === 0}
                        className="bg-primary hover:bg-primary-dark text-white px-6"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            `Importar ${validosCount} Alumnos`
                        )}
                    </Button>
                </div>

            </div>
        </div>
    );
}
