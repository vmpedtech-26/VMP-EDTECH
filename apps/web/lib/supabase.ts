// Mock de base de datos para la simulación interactiva de la Landing Page
export interface CategoriaCurso {
    id: string;
    nombre_curso: string;
    vigencia_meses: number;
    nota_minima_aprobacion: number;
    descripcion: string;
}

export interface Pregunta {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
}

export interface ExamenPlantilla {
    id: string;
    categoria_id: string;
    titulo_examen: string;
    tiempo_limite_minutos: number;
    preguntas: Pregunta[];
}

const mockCategorias: CategoriaCurso[] = [
    {
        id: 'cat-1',
        nombre_curso: 'Manejo Preventivo Flota Liviana',
        vigencia_meses: 12,
        nota_minima_aprobacion: 80,
        descripcion: 'Certificación teórica oficial de conducción preventiva en vehículos ligeros (camionetas, SUV, utilitarios) bajo los lineamientos de la norma ISO 39001.'
    },
    {
        id: 'cat-2',
        nombre_curso: 'Manejo Defensivo y 4x4 en Terrenos Hostiles',
        vigencia_meses: 12,
        nota_minima_aprobacion: 85,
        descripcion: 'Formación avanzada y especializada para conducción todo terreno (4x4) y de tracción doble en operaciones mineras, petroleras y climas de alta montaña.'
    },
    {
        id: 'cat-3',
        nombre_curso: 'Transporte de Mercancías Peligrosas',
        vigencia_meses: 24,
        nota_minima_aprobacion: 90,
        descripcion: 'Formación regulatoria crítica para conductores de vehículos de gran porte cargados con sustancias químicas, combustibles o residuos inflamables.'
    }
];

const mockExamenes: Record<string, ExamenPlantilla> = {
    'cat-1': {
        id: 'ex-1',
        categoria_id: 'cat-1',
        titulo_examen: 'Examen de Conducción Preventiva - Flota Liviana',
        tiempo_limite_minutos: 10,
        preguntas: [
            {
                id: 'q1',
                question_text: '¿Cuál es la distancia mínima de seguridad recomendada al conducir en ruta con pavimento seco?',
                options: [
                    'La regla de los 2 segundos respecto al vehículo que antecede.',
                    'Una distancia fija de 10 metros en todo momento.',
                    'Media distancia de frenado total.',
                    'No hay distancia estipulada si se cuenta con frenos ABS.'
                ],
                correct_answer: 'La regla de los 2 segundos respecto al vehículo que antecede.'
            },
            {
                id: 'q2',
                question_text: 'Bajo condiciones de lluvia intensa o calzada húmeda, ¿cómo debe modificarse la distancia de seguridad?',
                options: [
                    'Debe mantenerse igual ya que los neumáticos modernos drenan perfectamente.',
                    'Debe incrementarse al doble (regla de los 4 segundos).',
                    'Debe reducirse a la mitad para evitar el spray del camión delantero.',
                    'Debe mantenerse igual pero encendiendo las luces antiniebla traseras.'
                ],
                correct_answer: 'Debe incrementarse al doble (regla de los 4 segundos).'
            },
            {
                id: 'q3',
                question_text: '¿Cuál es el factor principal que genera el fenómeno del "aquaplaning"?',
                options: [
                    'El exceso de velocidad combinado con acumulación de agua y desgaste del dibujo del neumático.',
                    'Frenar bruscamente con la dirección recta.',
                    'Conducir con baja presión de inflado en las ruedas traseras.',
                    'Tener pastillas de freno húmedas durante un descenso.'
                ],
                correct_answer: 'El exceso de velocidad combinado con acumulación de agua y desgaste del dibujo del neumático.'
            }
        ]
    },
    'cat-2': {
        id: 'ex-2',
        categoria_id: 'cat-2',
        titulo_examen: 'Examen de Operación 4x4 y Terrenos de Alta Montaña',
        tiempo_limite_minutos: 15,
        preguntas: [
            {
                id: 'q2-1',
                question_text: 'Al descender una pendiente pronunciada y resbaladiza en un vehículo 4x4, ¿qué técnica es la correcta?',
                options: [
                    'Colocar punto muerto (neutro) y regular la velocidad enteramente con el freno de pie.',
                    'Enganchar marcha baja (4Lo), primera velocidad y descender usando el freno motor sin pisar el embrague.',
                    'Mantener el embrague presionado a fondo y dar toques leves al acelerador.',
                    'Bajar en 4Hi a alta velocidad para evitar el derrape.'
                ],
                correct_answer: 'Enganchar marcha baja (4Lo), primera velocidad y descender usando el freno motor sin pisar el embrague.'
            },
            {
                id: 'q2-2',
                question_text: '¿Para qué sirve el bloqueo del diferencial central en una camioneta 4WD?',
                options: [
                    'Para obligar a que ambos ejes (delantero y trasero) giren exactamente a la misma velocidad, mejorando la tracción en barro o nieve.',
                    'Para aumentar la potencia del motor un 50% de forma instantánea.',
                    'Para desconectar la dirección hidráulica y ahorrar combustible.',
                    'Para bloquear las ruedas individualmente al tomar curvas cerradas.'
                ],
                correct_answer: 'Para obligar a que ambos ejes (delantero y trasero) giren exactamente a la misma velocidad, mejorando la tracción en barro o nieve.'
            }
        ]
    },
    'cat-3': {
        id: 'ex-3',
        categoria_id: 'cat-3',
        titulo_examen: 'Examen Oficial de Mercancías Peligrosas',
        tiempo_limite_minutos: 20,
        preguntas: [
            {
                id: 'q3-1',
                question_text: '¿Qué representa el número de panel naranja superior ubicado en la parte trasera de un camión cisterna?',
                options: [
                    'El número de identificación del tipo de peligro de la sustancia (código de peligro).',
                    'El peso neto total autorizado en toneladas.',
                    'El código de las Naciones Unidas (ONU) para esa sustancia química.',
                    'La velocidad máxima permitida para ese camión.'
                ],
                correct_answer: 'El número de identificación del tipo de peligro de la sustancia (código de peligro).'
            }
        ]
    }
};

// Cliente Mockeado de Supabase para evitar errores de compilación e implementar lógica interactiva viva en el cliente
export const supabase = {
    auth: {
        getUser: async () => ({
            data: {
                user: {
                    id: 'usr-demo-123',
                    email: 'demo@vmpservicios.com',
                }
            }
        })
    },
    from: (tableName: string) => {
        return {
            select: (query?: string) => {
                return {
                    order: (fieldName: string) => {
                        return Promise.resolve({ data: mockCategorias, error: null });
                    },
                    eq: (fieldName: string, value: any) => {
                        return {
                            single: () => {
                                if (tableName === 'examenes_plantilla') {
                                    const exam = mockExamenes[value] || mockExamenes['cat-1'];
                                    return Promise.resolve({ data: exam, error: null });
                                }
                                return Promise.resolve({ data: null, error: new Error('Not found') });
                            }
                        };
                    }
                };
            },
            insert: (payload: any) => {
                return {
                    select: () => {
                        return {
                            single: () => {
                                // Devolver un mock de datos guardados exitosamente
                                const responsePayload = {
                                    id: `id-gen-${Date.now()}`,
                                    ...payload
                                };
                                return Promise.resolve({ data: responsePayload, error: null });
                            }
                        };
                    }
                };
            }
        };
    }
};
