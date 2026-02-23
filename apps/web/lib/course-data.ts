

export interface CourseDetail {
    slug: string;
    title: string;
    shortTitle: string;
    category: string;

    image: string;
    duration: string;
    modality: string;
    validity: string;
    minScore: string;

    description: string;
    longDescription: string;
    benefits: string[];
    targetAudience: string;
    temario: { title: string; topics: string[] }[];
    requirements: string[];
    certification: string;
}

export const courseData: Record<string, CourseDetail> = {
    'conduccion-preventiva': {
        slug: 'conduccion-preventiva',
        title: 'Conducción Preventiva',
        shortTitle: 'Preventiva',
        category: 'Preventivo',

        image: '/images/courses/conduccion-preventiva.png',
        duration: '8 horas',
        modality: '100% Online',
        validity: '12 meses',
        minScore: '70%',

        description: 'Técnicas de conducción preventiva y manejo de situaciones de riesgo en ruta.',
        longDescription: 'Curso integral diseñado para formar conductores capaces de anticipar y prevenir situaciones de riesgo en la vía pública. Combina fundamentos teóricos de seguridad vial con técnicas prácticas de conducción defensiva, preparando al conductor para tomar decisiones seguras en todo tipo de escenarios.',
        benefits: [
            'Reducción de siniestros viales en flotas corporativas',
            'Técnicas de anticipación y percepción de riesgos',
            'Mejora en el consumo de combustible por conducción eficiente',
            'Certificación digital verificable con código QR',
            'Acceso a material de estudio las 24hs desde cualquier dispositivo',
            'Exámenes online con resultados inmediatos',
        ],
        targetAudience: 'Conductores de vehículos livianos y utilitarios, personal de logística y distribución, conductores de flotas corporativas.',
        temario: [
            {
                title: 'Módulo 1 - Fundamentos de Seguridad Vial',
                topics: [
                    'Factores de riesgo en la conducción',
                    'Triángulo de seguridad: conductor, vehículo y entorno',
                    'Estadísticas y causas principales de siniestros',
                    'Marco normativo vigente',
                ],
            },
            {
                title: 'Módulo 2 - Técnicas de Conducción Preventiva',
                topics: [
                    'Distancia de seguimiento y frenado',
                    'Técnica de visión periférica y scanning',
                    'Manejo en condiciones climáticas adversas',
                    'Conducción nocturna segura',
                ],
            },
            {
                title: 'Módulo 3 - Emergencias y Respuesta',
                topics: [
                    'Maniobras de emergencia y evasión',
                    'Protocolo de actuación ante siniestros',
                    'Primeros auxilios básicos para conductores',
                    'Uso correcto de elementos de seguridad',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir vigente',
            'Acceso a internet y dispositivo con navegador web',
        ],
        certification: 'Certificación digital con código QR verificable, válida por 12 meses. Incluye nombre completo, DNI, fecha de emisión y vencimiento.',
    },

    'flota-liviana-pesada': {
        slug: 'flota-liviana-pesada',
        title: 'Conducción Flota Liviana / Pesada',
        shortTitle: 'Flota Liviana / Pesada',
        category: 'Transporte',

        image: '/images/courses/carga-pesada.png',
        duration: '12 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '75%',

        description: 'Capacitación especializada para conductores de flotas livianas y pesadas según normativas vigentes.',
        longDescription: 'Programa de capacitación diseñado específicamente para conductores de vehículos de flota liviana y pesada. Abarca desde la inspección pre-operacional del vehículo hasta técnicas avanzadas de maniobra con carga, pasando por normativas de tránsito pesado y gestión de documentación de transporte.',
        benefits: [
            'Habilitación para conducción de vehículos de carga',
            'Técnicas de maniobra y estacionamiento con carga',
            'Reducción de costos por mantenimiento preventivo',
            'Certificación con validez de 24 meses',
            'Modalidad mixta: teoría online + práctica presencial',
            'Seguimiento personalizado del progreso del alumno',
        ],
        targetAudience: 'Conductores de camiones, utilitarios y vehículos de carga, choferes de flotas de distribución, personal de transporte de empresas.',
        temario: [
            {
                title: 'Módulo 1 - El Vehículo de Carga',
                topics: [
                    'Tipos de vehículos y categorías de licencia',
                    'Inspección pre-operacional (check-list diario)',
                    'Sistemas de frenos, suspensión y dirección',
                    'Mantenimiento preventivo y correctivo',
                ],
            },
            {
                title: 'Módulo 2 - Operación y Maniobra',
                topics: [
                    'Técnicas de carga y descarga segura',
                    'Distribución de peso y centro de gravedad',
                    'Maniobras en espacios reducidos',
                    'Conducción en rutas y autopistas',
                ],
            },
            {
                title: 'Módulo 3 - Normativa y Documentación',
                topics: [
                    'Legislación de transporte de carga vigente',
                    'Documentación obligatoria del vehículo y conductor',
                    'Tiempos de conducción y descanso',
                    'Cargas peligrosas: nociones generales',
                ],
            },
            {
                title: 'Módulo 4 - Seguridad y Emergencias',
                topics: [
                    'Prevención de vuelcos y derrapes',
                    'Conducción defensiva con carga',
                    'Protocolos de emergencia en ruta',
                    'Primeros auxilios y uso de matafuegos',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir profesional vigente',
            'Apto médico para conducción de vehículos pesados',
            'Acceso a internet para módulos teóricos online',
        ],
        certification: 'Certificación digital con código QR verificable, válida por 24 meses. Habilitación para conducción de vehículos de flota liviana y pesada.',
    },

    'doble-traccion': {
        slug: 'doble-traccion',
        title: 'Conducción Doble Tracción',
        shortTitle: 'Doble Tracción',
        category: 'Especializado',

        image: '/images/courses/conduccion-2-traccion.png',
        duration: '16 horas',
        modality: 'Presencial',
        validity: '36 meses',
        minScore: '80%',

        description: 'Manejo avanzado en terrenos difíciles, técnicas de tracción y recuperación de vehículos.',
        longDescription: 'Curso especializado de alta exigencia enfocado en la conducción de vehículos 4x4 y doble tracción en terrenos no convencionales. Incluye práctica intensiva en campo con diferentes tipos de terreno: barro, arena, pendientes pronunciadas, vadeo de ríos y recuperación de vehículos. Ideal para operaciones en minería, petróleo, agroindustria y zonas rurales.',
        benefits: [
            'Dominio de técnicas off-road en terrenos extremos',
            'Capacidad de recuperación de vehículos varados',
            'Reducción de daños mecánicos por mal uso del 4x4',
            'Certificación especializada con validez de 36 meses',
            'Práctica intensiva en campo real',
            'Instrucción personalizada con ratio instructor:alumno reducido',
        ],
        targetAudience: 'Conductores de vehículos 4x4 en operaciones mineras, petroleras, agroindustriales, personal de emergencias y rescate, conductores de flotas rurales.',
        temario: [
            {
                title: 'Módulo 1 - Mecánica de Doble Tracción',
                topics: [
                    'Sistemas de tracción: 4x2, 4x4, AWD',
                    'Diferencial, bloqueo y reducción',
                    'Tipos de neumáticos para terreno off-road',
                    'Inspección y preparación del vehículo',
                ],
            },
            {
                title: 'Módulo 2 - Técnicas de Conducción Off-Road',
                topics: [
                    'Conducción en barro y suelo mojado',
                    'Ascenso y descenso de pendientes pronunciadas',
                    'Vadeo de cursos de agua',
                    'Conducción en arena y terreno suelto',
                ],
            },
            {
                title: 'Módulo 3 - Recuperación de Vehículos',
                topics: [
                    'Uso de winch y elementos de recuperación',
                    'Técnicas de auto-rescate',
                    'Puntos de anclaje y enganche seguros',
                    'Protocolos de seguridad en recuperación',
                ],
            },
            {
                title: 'Módulo 4 - Práctica en Campo',
                topics: [
                    'Circuito off-road supervisado',
                    'Ejercicios prácticos de recuperación',
                    'Evaluación práctica final',
                    'Debriefing y correcciones técnicas',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir vigente',
            'Experiencia previa en conducción (recomendado)',
            'Apto físico para actividades al aire libre',
            'Vestimenta adecuada para campo (botas, protección solar)',
        ],
        certification: 'Certificación digital con código QR verificable, válida por 36 meses. Habilitación para conducción de vehículos doble tracción en terrenos no convencionales.',
    },
};

export const courseList = Object.values(courseData);
export const courseSlugs = Object.keys(courseData);
