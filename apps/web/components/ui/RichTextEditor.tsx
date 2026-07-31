'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
    Bold, Italic, List, ListOrdered, Heading1, Heading2,
    Quote, Link as LinkIcon, Code, Eye, FileCode, CheckCircle,
    Undo, Redo, RemoveFormatting
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Escribe y diseña el contenido del módulo aquí...',
    minHeight = '320px'
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<'visual' | 'code' | 'preview'>('visual');
    const [htmlCode, setHtmlCode] = useState(value || '');

    // Sync contentEditable with incoming value when mode changes or initializes
    useEffect(() => {
        setHtmlCode(value || '');
        if (editorRef.current && mode === 'visual') {
            if (editorRef.current.innerHTML !== (value || '')) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value, mode]);

    const handleInput = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            setHtmlCode(content);
            onChange(content);
        }
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setHtmlCode(newContent);
        onChange(newContent);
    };

    const execCmd = (command: string, valueArgument: string | undefined = undefined) => {
        if (mode !== 'visual') return;
        document.execCommand(command, false, valueArgument);
        handleInput();
        if (editorRef.current) editorRef.current.focus();
    };

    const addLink = () => {
        const url = prompt('Ingrese la URL del enlace:', 'https://');
        if (url) {
            execCmd('createLink', url);
        }
    };

    const addHeading = (level: string) => {
        execCmd('formatBlock', `<${level}>`);
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            {/* Toolbar Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-gray-50 border-b border-gray-200">
                {/* Tool buttons for Visual mode */}
                {mode === 'visual' ? (
                    <div className="flex flex-wrap items-center gap-1">
                        <button
                            type="button"
                            onClick={() => execCmd('bold')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Negrita (Ctrl+B)"
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCmd('italic')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Cursiva (Ctrl+I)"
                        >
                            <Italic className="h-4 w-4" />
                        </button>

                        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => addHeading('h2')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black font-bold text-xs flex items-center gap-0.5"
                            title="Título Principal (H2)"
                        >
                            <Heading1 className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => addHeading('h3')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black font-bold text-xs flex items-center gap-0.5"
                            title="Subtítulo (H3)"
                        >
                            <Heading2 className="h-4 w-4" />
                        </button>

                        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => execCmd('insertUnorderedList')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Lista con viñetas"
                        >
                            <List className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCmd('insertOrderedList')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Lista numerada"
                        >
                            <ListOrdered className="h-4 w-4" />
                        </button>

                        <div className="h-4 w-[1px] bg-gray-300 mx-1" />

                        <button
                            type="button"
                            onClick={() => execCmd('formatBlock', '<blockquote>')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Cita destacada"
                        >
                            <Quote className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={addLink}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Insertar enlace"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => execCmd('removeFormat')}
                            className="p-1.5 hover:bg-gray-200 rounded text-gray-700 hover:text-black transition-colors"
                            title="Limpiar formato"
                        >
                            <RemoveFormatting className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-xs font-semibold text-gray-500 px-2">
                        {mode === 'code' ? 'Modo Código HTML' : 'Vista Previa del Alumno'}
                    </div>
                )}

                {/* View Switchers */}
                <div className="flex items-center bg-gray-200 p-0.5 rounded-lg text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setMode('visual')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                            mode === 'visual'
                                ? 'bg-white text-primary shadow-sm font-bold'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Visual
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('code')}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            mode === 'code'
                                ? 'bg-white text-primary shadow-sm font-bold'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <FileCode className="h-3 w-3" /> HTML
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            mode === 'preview'
                                ? 'bg-white text-primary shadow-sm font-bold'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Eye className="h-3 w-3" /> Vista Previa
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div style={{ minHeight }} className="p-4 relative">
                {mode === 'visual' && (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onBlur={handleInput}
                        style={{ minHeight: `calc(${minHeight} - 2rem)` }}
                        className="outline-none prose max-w-none text-gray-800 focus:outline-none"
                    />
                )}

                {mode === 'code' && (
                    <textarea
                        value={htmlCode}
                        onChange={handleCodeChange}
                        style={{ minHeight: `calc(${minHeight} - 2rem)` }}
                        className="w-full h-full font-mono text-xs p-3 bg-gray-90 text-gray-100 rounded-lg outline-none resize-y"
                        placeholder="<p>Escribe HTML directamente...</p>"
                    />
                )}

                {mode === 'preview' && (
                    <div
                        style={{ minHeight: `calc(${minHeight} - 2rem)` }}
                        className="prose max-w-none p-4 bg-gray-50 border border-gray-100 rounded-xl"
                        dangerouslySetInnerHTML={{ __html: htmlCode || '<p class="text-gray-400 italic">Sin contenido aún</p>' }}
                    />
                )}
            </div>
        </div>
    );
}
