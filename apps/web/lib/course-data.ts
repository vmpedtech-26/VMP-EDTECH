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
    priceFrom: number;
    description: string;
    longDescription: string;
    benefits: string[];
    targetAudience: string;
    temario: { title: string; topics: string[] }[];
    requirements: string[];
    certification: string;
    // Campos de ficha técnica extendidos
    objectives?: string;
    scope?: string;
    evaluacionesInfo?: {
        teorico: string;
        practico: string;
        psicosensometrico?: string;
    };
    pdfProgramaUrl?: string;
}

export const courseData: Record<string, CourseDetail> = {
    'conduccion-preventiva': {
        slug: 'conduccion-preventiva',
        title: 'Conducción Preventiva (Inicial)',
        shortTitle: 'Inicial / Preventiva',
        category: 'PREVENTIVO',
        image: '/images/courses/conduccion-preventiva.png',
        duration: '8 horas',
        modality: '100% Online',
        validity: '24 meses',
        minScore: '80%',
        priceFrom: 32000,
        description: 'Técnicas de conducción preventiva y manejo de situaciones de riesgo en ruta para ingreso a yacimientos.',
        longDescription: 'Curso intensivo de inicio para conductores de flota liviana y pesada. El programa tiene como objetivo capacitar y habilitar a los trabajadores para conducir de manera segura en yacimientos petroleros y vías públicas, cumpliendo estrictamente con el marco normativo legal vigente.',
        benefits: [
            'Habilitación oficial por 2 años para ingreso a yacimientos',
            'Cumple estrictamente con la Ley Nacional de Tránsito 24.449 y Ley 26.363',
            'Técnicas de anticipación y percepción de riesgos viales',
            'Mejora en el consumo de combustible por conducción eficiente',
            'Certificación digital verificable con código QR',
            'Acceso a material de estudio las 24hs desde cualquier dispositivo',
        ],
        targetAudience: 'Conductores de vehículos livianos y utilitarios, personal de logística y distribución, personal de empresas contratistas que ingresen a yacimientos petroleros.',
        objectives: 'Habilitar a los trabajadores para ingresar a yacimientos petroleros y mineros, proporcionándoles habilidades teóricas y prácticas para conducir vehículos corporativos de manera segura. Se busca que adquieran conocimientos de la legislación vial vigente, comprendan los sistemas de gestión vehicular y trasladen las conductas seguras a su conducción diaria y personal.',
        scope: 'Válido para todo el personal afectado a tareas de la actividad petrolera e industrial sin distinción de funciones y categorías laborales.',
        temario: [
            {
                title: 'Módulo I - Conducción Defensiva y Marco Legal',
                topics: [
                    'Introducción a la problemática de tránsito vial a nivel mundial y nacional',
                    'Definición del conductor defensivo y principios de anticipación',
                    'Reseña de las leyes nacionales de tránsito y seguridad vial (Ley 24.449, Ley 26.363)',
                    'Requisitos y documentación obligatoria del conductor y el vehículo',
                    'Señalización vial: prioridades de acatamiento y repaso de señales normativas',
                ],
            },
            {
                title: 'Módulo II - Operación Segura y Factores Humanos',
                topics: [
                    'Distancia de detención: tiempo de percepción, reacción y frenado mecánico',
                    'Visibilidad vial y técnicas de conducción nocturna',
                    'Conducción bajo condiciones climáticas adversas (lluvia, ripio, barro)',
                    'Gestión del viaje y el plan de ruta vehicular',
                    'Seguridad activa y pasiva del vehículo (ABS, ESP, cinturón, airbags)',
                    'Factores humanos y distracciones críticas (uso de celular, fatiga, tabaco)',
                ],
            },
            {
                title: 'Módulo III - Práctica Comentada y Psicotécnico',
                topics: [
                    'Examen psicosensométrica obligatorio (pruebas de reacción, coordinación, visión)',
                    'Recorrido de conducción comentada evaluando actitudes y aptitudes defensivas',
                    'Evaluación práctica en yacimiento: maniobras de retroceso y descenso',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir nacional vigente',
            'DNI original',
            'Apto físico / médico básico',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico online autogestionado de 25 preguntas de opción múltiple. Calificación mínima para aprobar: 80 puntos sobre 100.',
            practico: 'Evaluación práctica de manejo en yacimiento con observación directa de maniobras, actitudes y aptitudes viales. Calificación cualitativa orientada a mejoras.',
            psicosensometrico: 'Evaluación psicosensométrica obligatoria: exámenes psicofísicos de tiempos de reacción simple y complejo, agudeza visual, visión nocturna y audición.',
        },
        certification: 'Certificación digital con código QR verificable con validez de 24 meses, habilitando la conducción en yacimientos petroleros y faenas industriales.',
        pdfProgramaUrl: '/programas/conduccion-preventiva.pdf',
    },

    'conduccion-renovacion': {
        slug: 'conduccion-renovacion',
        title: 'Curso Intensivo de Renovación',
        shortTitle: 'Renovación',
        category: 'PREVENTIVO',
        image: '/images/courses/conduccion-preventiva.png', // Usamos la misma base premium
        duration: '6 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '80%',
        priceFrom: 28000,
        description: 'Actualización teórica y re-evaluación práctica/psicotécnica para mantener la habilitación de yacimiento.',
        longDescription: 'Programa diseñado para conductores que ya aprobaron el curso de inicio y requieren renovar su habilitación periódica obligatoria de yacimiento. Enfocado en la actualización legislativa y el fortalecimiento de habilidades de conducción defensiva.',
        benefits: [
            'Renovación inmediata de la habilitación vial de yacimiento por 2 años',
            'Actualización técnica de las nuevas legislaciones de tránsito y seguridad vial',
            'Refuerzo de conductas preventivas frente a derrapes y condiciones adversas',
            'Re-evaluación psicosensométrica completa obligatoria',
            'Certificación verificable por auditorías mediante QR corporativo',
        ],
        targetAudience: 'Conductores de flotas livianas o pesadas que hayan completado y aprobado previamente el Curso Inicial y requieran renovar su credencial.',
        objectives: 'Revisar, actualizar y fortalecer las habilidades de conducción defensiva del personal, garantizando el conocimiento de nuevas normativas y la vigencia del apto psicotécnico obligatorio para operaciones en yacimiento.',
        scope: 'Personal de la actividad petrolera e industrial en la Cuenca Golfo San Jorge y demás yacimientos nacionales que cuente con habilitación inicial vencida o próxima a expirar.',
        temario: [
            {
                title: 'Módulo I - Actualización de Seguridad Vial',
                topics: [
                    'Análisis estadístico de siniestros viales recientes y causas recurrentes',
                    'Nuevas disposiciones de la Ley Nacional de Tránsito y reglamentaciones locales',
                    'Dispositivos tecnológicos de asistencia a la conducción y telemetría de flotas',
                    'Control y prevención de la fatiga en jornadas de turnos petroleros',
                ],
            },
            {
                title: 'Módulo II - Práctica y Técnicas en Yacimiento',
                topics: [
                    'Maniobras complejas off-road en yacimiento',
                    'Uso correcto del sistema de doble tracción y bloqueos en ripio',
                    'Procedimiento de descenso y retroceso seguro en pendientes',
                    'Inspección pre-operacional rápida del vehículo de flota',
                ],
            },
            {
                title: 'Módulo III - Re-evaluación Obligatoria',
                topics: [
                    'Examen teórico virtual de actualización',
                    'Evaluación psicosensométrica de aptitudes motrices y visuales',
                    'Práctica de conducción comentada ante escenarios de tránsito real',
                ],
            },
        ],
        requirements: [
            'Habilitación previa (vencida o por vencer)',
            'Licencia de conducir nacional vigente',
            'DNI original',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico online con 25 preguntas de actualización. Calificación mínima requerida: 80 puntos sobre 100.',
            practico: 'Prueba práctica comentada en campo/yacimiento orientada a la erradicación de vicios de manejo y consolidación de maniobras defensivas.',
            psicosensometrico: 'Evaluación psicotécnica completa (coordinación bimanual, tiempo de reacción y test visual/auditivo) exigida por las operadoras.',
        },
        certification: 'Renovación de certificación digital con código QR con validez nacional por 24 meses.',
        pdfProgramaUrl: '/programas/conduccion-renovacion.pdf',
    },

    'conduccion-invernal': {
        slug: 'conduccion-invernal',
        title: 'Conducción Invernal',
        shortTitle: 'Invernal',
        category: 'CORDILLERANO',
        image: '/images/courses/conduccion-invernal.png',
        duration: '12 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '80%',
        priceFrom: 55000,
        description: 'Técnicas avanzadas para conducción segura en presencia de nieve, hielo y condiciones climáticas extremas.',
        longDescription: 'Curso especializado diseñado para conductores que operan en zonas de alta montaña y regiones patagónicas con climas invernales severos. Cubre preparación técnica del vehículo, colocación de cadenas, derrapes y supervivencia ante climatologías adversas.',
        benefits: [
            'Dominio absoluto de la conducción sobre superficies con nieve y hielo',
            'Práctica intensiva de colocación rápida de diferentes tipos de cadenas',
            'Conocimiento de supervivencia frente al fenómeno de viento blanco',
            'Habilitación profesional obligatoria para temporada de invierno en operadoras',
            'Certificación verificable con código QR',
        ],
        targetAudience: 'Conductores de flotas petroleras, mineras, transporte de pasajeros, técnicos de mantenimiento y personal que opere en zonas cordilleranas o de clima frío extremo.',
        objectives: 'Proporcionar al trabajador conocimientos precisos e instrucciones de seguridad que le permitan conducirse de manera segura ante condiciones climáticas adversas en temporada invernal. Se persigue la toma de decisiones correctas para prevenir siniestros viales y el dominio técnico del vehículo en superficies resbaladizas.',
        scope: 'Aplicable a todo el personal que conduzca vehículos en el ámbito laboral bajo condiciones climáticas extremas o regiones de montaña durante el invierno.',
        temario: [
            {
                title: 'Módulo I - Preparación del Vehículo en Clima Frío',
                topics: [
                    'Fluidos del motor y uso correcto de anticongelantes específicos',
                    'Comportamiento de la batería y sistema eléctrico en temperaturas bajo cero',
                    'Neumáticos de invierno: compuestos, neumáticos con clavos y clavos de sílice',
                    'Sistemas de visibilidad: limpiaparabrisas térmicos y desempañado de cristales',
                ],
            },
            {
                title: 'Módulo II - Dispositivos de Tracción y Cadenas',
                topics: [
                    'Tipos de cadenas de seguridad: eslabones de acero, tela y araña (cadenas rápidas)',
                    'Técnica y colocación rápida y segura de cadenas bajo viento y frío',
                    'Tensión, centrado y mantenimiento post-operación de cadenas',
                    'Límites de velocidad y cuidados al circular con cadenas sobre asfalto seco',
                ],
            },
            {
                title: 'Módulo III - Dinámica de Manejo sobre Hielo y Nieve',
                topics: [
                    'Arranque y tracción sin deslizamiento en rampas congeladas',
                    'Sistemas electrónicos de asistencia: control de tracción (TCS) y estabilidad (ESP)',
                    'Técnicas de frenado con ABS sobre superficies congeladas y distancia de seguridad',
                    'Control y recuperación ante pérdida de adherencia: sobreviraje y subviraje',
                ],
            },
            {
                title: 'Módulo IV - Emergencia y Supervivencia en Montaña',
                topics: [
                    'Fenómeno meteorológico de Viento Blanco y protocolo de atrapamiento en nieve',
                    'Señalización de emergencia, mantenimiento del habitáculo y abrigo reglamentario',
                    'Primeros auxilios básicos ante casos de hipotermia y congelamiento de extremidades',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir nacional vigente',
            'Acceso a internet para módulos teóricos online',
            'Ropa de abrigo reglamentaria para la práctica en campo',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico online de 25 preguntas específicas de seguridad invernal. Calificación mínima para aprobar: 80 puntos sobre 100.',
            practico: 'Práctica de colocación de cadenas sobre neumático real en campo. No posee evaluación cuantitativa (aprobado por cumplimiento de procedimiento).',
        },
        certification: 'Especialización en conducción segura invernal con código QR verificable, válida por 24 meses.',
        pdfProgramaUrl: '/programas/conduccion-invernal.pdf',
    },

    'conduccion-segura': {
        slug: 'conduccion-segura',
        title: 'Conducción Segura e Implementos Técnicos',
        shortTitle: 'Conducción Segura',
        category: 'ESPECIALIZADO',
        image: '/images/courses/carga-pesada.png',
        duration: '8 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '75%',
        priceFrom: 30000,
        description: 'Capacitación en conducción segura y auditoría pre-operacional técnica de implementos del vehículo.',
        longDescription: 'Curso diseñado para capacitar a los conductores en la identificación de riesgos viales, conducción racional de vehículos de flota e inspección pre-operacional detallada de los implementos de seguridad técnica activa y pasiva.',
        benefits: [
            'Conocimiento detallado de los sistemas de seguridad activa y pasiva del vehículo',
            'Habilidad para realizar check-lists pre-operacionales técnicos y auditorías de flota',
            'Reducción drástica de fallos mecánicos por mal uso del equipamiento del vehículo',
            'Cumplimiento de las normativas de seguridad de las operadoras petroleras',
            'Certificación verificable digitalmente mediante código QR',
        ],
        targetAudience: 'Conductores de vehículos corporativos, personal encargado de mantenimiento de flotas, supervisores de seguridad y choferes de transporte de personal.',
        objectives: 'Proporcionar al participante conocimientos sobre seguridad vial activa y pasiva, entrenándolo en la identificación pre-operacional de defectos mecánicos y técnicos para asegurar una operación vehicular libre de siniestros.',
        scope: 'Todo el personal que conduzca vehículos corporativos o de flota dentro y fuera de yacimiento.',
        temario: [
            {
                title: 'Módulo I - Seguridad Vial y Prevención',
                topics: [
                    'Problemática vial en Argentina y estadísticas del sector industrial',
                    'El factor humano: fatiga, velocidad precautoria y límites de velocidad',
                    'Gestión del viaje y planeación de rutas seguras',
                    'Leyes nacionales de tránsito aplicadas al ámbito laboral',
                ],
            },
            {
                title: 'Módulo II - Implementos Técnicos y Asistencia',
                topics: [
                    'Sistemas de seguridad activa: funcionamiento de frenos ABS, control de estabilidad (ESP)',
                    'Seguridad pasiva: cinturón de seguridad, pretensores, airbags e integridad de la cabina',
                    'Uso de tecnologías de asistencia al conductor y alertas de telemetría',
                    'Inspección pre-operacional reglamentaria del vehículo (check-list técnico)',
                ],
            },
            {
                title: 'Módulo III - Práctica de Inspección y Conducción',
                topics: [
                    'Realización práctica de check-list de seguridad pre-viaje',
                    'Ajustes ergonómicos en el habitáculo y posicionamiento correcto de espejos',
                    'Conducción comentada con énfasis en el uso racional de la transmisión y frenos',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir vigente',
            'DNI original',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico en línea de 25 preguntas. Calificación mínima para aprobar: 75 puntos sobre 100.',
            practico: 'Práctica técnica de check-list de vehículo en campo (no evaluativo cuantitativo, aprobado/desaprobado por cumplimiento de ítems).',
        },
        certification: 'Certificación de especialización técnica con código QR válida por 24 meses.',
        pdfProgramaUrl: '/programas/conduccion-segura.pdf',
    },

    'flota-liviana-pesada': {
        slug: 'flota-liviana-pesada',
        title: 'Conducción Flota Liviana / Pesada',
        shortTitle: 'Flota Liviana / Pesada',
        category: 'TRANSPORTE',
        image: '/images/courses/carga-pesada.png',
        duration: '12 horas',
        modality: 'Online/Presencial',
        validity: '24 meses',
        minScore: '75%',
        priceFrom: 45000,
        description: 'Capacitación especializada para conductores de flotas livianas y pesadas de distribución o logística.',
        longDescription: 'Programa diseñado para choferes de camiones, furgones y utilitarios comerciales. Abarca inspección pre-operacional, maniobras de reversa, sujeción de cargas, normativas de transporte pesado y prevención de fatiga en ruta.',
        benefits: [
            'Habilitación profesional para conducción de vehículos de carga liviana y pesada',
            'Técnicas avanzadas de estiba, sujeción de carga y cálculo de centro de gravedad',
            'Optimización de la conducción eficiente para reducción de consumo y mantenimiento',
            'Cumplimiento normativo para transportes nacionales de carga',
            'Certificación verificable con QR digital',
        ],
        targetAudience: 'Choferes de camiones de reparto, utilitarios de distribución, transportistas corporativos y personal de almacenes que conduzca vehículos de carga.',
        objectives: 'Capacitar a los conductores en la operación segura de vehículos comerciales e industriales de transporte de carga, dominando la maniobrabilidad de vehículos pesados, la distribución técnica del peso y la normativa de tránsito profesional.',
        scope: 'Choferes profesionales y operarios de transporte de carga y flotas pesadas corporativas.',
        temario: [
            {
                title: 'Módulo I - El Vehículo Comercial y Check-list',
                topics: [
                    'Clasificación de vehículos comerciales e industriales y licencias específicas',
                    'Sistemas neumáticos de frenos, freno motor y suspensiones pesadas',
                    'Inspección técnica pre-operacional (check-list diario de fluidos, luces y neumáticos)',
                    'Mantenimiento preventivo básico para evitar fallas mecánicas en ruta',
                ],
            },
            {
                title: 'Módulo II - Estiba y Dinámica de Vehículos Pesados',
                topics: [
                    'Distribución de carga, centro de gravedad y fuerzas dinámicas en el camión',
                    'Prevención del vuelco y control del efecto tijera en acoplados/remolques',
                    'Técnicas seguras de sujeción de carga, uso de cintas tensoras y cadenas de estiba',
                    'Maniobrabilidad en espacios reducidos, estacionamiento en muelles y retroceso asistido',
                ],
            },
            {
                title: 'Módulo III - Legislación y Factores Ocupacionales',
                topics: [
                    'Ley Nacional de Tránsito para transporte de cargas y dimensiones de vehículos',
                    'Documentación de transporte obligatoria (cartas de porte, guías de tránsito)',
                    'Tiempos de conducción y descanso obligatorios (control de la fatiga profesional)',
                    'Nociones básicas de transporte de mercancías y cargas peligrosas',
                ],
            },
            {
                title: 'Módulo IV - Emergencia en Ruta y Práctica',
                topics: [
                    'Maniobras evasivas en vehículos pesados ante situaciones de riesgo',
                    'Uso correcto de matafuegos industriales y protocolo ante averías o siniestros',
                    'Evaluación práctica comentada en pista de pruebas con vehículo cargado',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir profesional vigente habilitada',
            'Apto psicofísico profesional vigente',
            'Acceso a internet para módulos teóricos online',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico online con 30 preguntas específicas sobre transporte de cargas. Calificación mínima: 75%.',
            practico: 'Prueba práctica de maniobras en circuito cerrado, evaluando acople, retroceso a muelle y control de dimensiones.',
            psicosensometrico: 'Examen psicosensométrica profesional completo obligatorio (visión, audición, velocidad de reacción).',
        },
        certification: 'Certificación oficial de habilitación para conducción de flotas livianas/pesadas con código QR y validez de 24 meses.',
        pdfProgramaUrl: '/programas/flota-liviana-pesada.pdf',
    },

    'doble-traccion': {
        slug: 'doble-traccion',
        title: 'Conducción Doble Tracción (4x4)',
        shortTitle: 'Doble Tracción 4x4',
        category: 'ESPECIALIZADO',
        image: '/images/courses/conduccion-2-traccion.png',
        duration: '16 horas',
        modality: 'Presencial',
        validity: '24 meses',
        minScore: '80%',
        priceFrom: 68000,
        description: 'Manejo avanzado en terrenos difíciles off-road, técnicas de tracción y recuperación de vehículos.',
        longDescription: 'Curso teórico-práctico de alta exigencia enfocado en la conducción de vehículos 4x4 y doble tracción en terrenos no convencionales (barro, arena, pendientes pronunciadas, vadeo de ríos) y técnicas seguras de autorrescate y recuperación.',
        benefits: [
            'Dominio absoluto de la operación de cajas reductoras y bloqueos de diferencial',
            'Habilidad para resolver situaciones de encajamiento de forma segura y autónoma',
            'Reducción de roturas de transmisión y embragues por mal uso del sistema 4x4',
            'Práctica intensiva 100% real en circuito off-road natural',
            'Certificación verificable y habilitación para operaciones mineras y petroleras',
        ],
        targetAudience: 'Conductores asignados a operaciones en áreas rurales, yacimientos de hidrocarburos, faenas mineras y personal de rescate o emergencias.',
        objectives: 'Entrenar a los conductores en el conocimiento mecánico de los sistemas de doble tracción y en las técnicas de conducción off-road para operar vehículos 4x4 de forma segura y eficiente sobre terrenos de baja adherencia sin dañar el vehículo.',
        scope: 'Personal que requiera operar camionetas 4x4 o vehículos de tracción integral en zonas de difícil acceso geográfico.',
        temario: [
            {
                title: 'Módulo I - Mecánica y Sistemas 4x4',
                topics: [
                    'Sistemas de tracción: 4x2, 4x4 Part-Time, 4x4 Full-Time y tracción integral (AWD)',
                    'Caja de transferencia (reductora / alta-baja) y relaciones de marcha',
                    'Funcionamiento y uso de bloqueos de diferencial central, trasero y delantero',
                    'Neumáticos off-road: dibujos, presiones adecuadas para barro, arena y rocas',
                ],
            },
            {
                title: 'Módulo II - Conducción en Terrenos Complejos',
                topics: [
                    'Dinámica en barro y suelo húmedo: control del deslizamiento e inercia',
                    'Ascenso y descenso seguro de pendientes pronunciadas con baja adherencia',
                    'Técnica de vadeo seguro de ríos y cruce de zanjas',
                    'Manejo sobre suelo suelto (arena y ripio suelto patagónico)',
                ],
            },
            {
                title: 'Módulo III - Recuperación y Autorrescate Técnico',
                topics: [
                    'Uso seguro del malacate (winch): cables de acero vs sintéticos, poleas de reenvío',
                    'Eslingas de rescate dinámicas y estáticas, grilletes y puntos de anclaje certificados',
                    'Peligros y medidas de seguridad críticas en operaciones de tiro y desatasco',
                    'Técnicas de desatasco manual (planchas de desatasco, pala y uso de hi-lift)',
                ],
            },
            {
                title: 'Módulo IV - Práctica Intensiva en Circuito Off-Road',
                topics: [
                    'Circuito dinámico supervisado cruzando zanjas, pendientes y vadeos',
                    'Simulacros reales de atasco y aplicación práctica de técnicas de rescate',
                    'Debriefing y retroalimentación técnica de maniobras por parte de instructores',
                ],
            },
        ],
        requirements: [
            'Licencia de conducir vigente',
            'Apto físico para actividades al aire libre',
            'Calzado de seguridad y ropa resistente para campo',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico presencial u online de 20 preguntas de opción múltiple. Mínimo 80% requerido.',
            practico: 'Prueba práctica de superación de obstáculos en circuito off-road supervisado por instructores senior.',
        },
        certification: 'Certificación digital de Conducción Especializada Doble Tracción 4x4 con código QR y validez de 24 meses.',
        pdfProgramaUrl: '/programas/doble-traccion.pdf',
    },

    'trabajo-en-altura': {
        slug: 'trabajo-en-altura',
        title: 'Trabajo en Altura (Seguridad Industrial)',
        shortTitle: 'Trabajo en Altura',
        category: 'SEGURIDAD INDUSTRIAL',
        image: '/images/courses/curso-altura.png',
        duration: '8 horas',
        modality: 'Presencial',
        validity: '24 meses',
        minScore: '80%',
        priceFrom: 35000,
        description: 'Capacitación en prevención de caídas, uso de arnés, líneas de vida y rescate técnico en altura.',
        longDescription: 'Curso de seguridad ocupacional enfocado en el entrenamiento teórico y práctico para trabajadores que realizan tareas por encima de 1.8 metros, cumpliendo con los estándares de la Ley de Higiene y Seguridad Laboral.',
        benefits: [
            'Habilitación obligatoria para trabajos en altura en refinerías y yacimientos',
            'Dominio en la colocación y mantenimiento preventivo de arneses y anticaídas',
            'Capacidad de rescate de compañeros suspendidos y auto-salvamento básico',
            'Certificación verificable digitalmente con QR ante auditorías de ART y operadoras',
        ],
        targetAudience: 'Operarios de mantenimiento, montadores industriales, electricistas, personal de perforación y supervisores de seguridad de obras.',
        objectives: 'Entrenar a los operarios en las técnicas seguras de prevención de caídas a distinto nivel, el uso correcto y mantenimiento de los equipos anticaídas, y los protocolos de primeros auxilios y rescate ante suspensión.',
        scope: 'Obligatorio para todo personal abocado a tareas viales o industriales situadas por encima de 1.80 metros respecto del nivel del suelo.',
        temario: [
            {
                title: 'Módulo I - Legislación y Física de la Caída',
                topics: [
                    'Leyes nacionales de Higiene y Seguridad Laboral aplicables a la altura',
                    'Física de la caída: fuerza de choque, cálculo de distancia libre de caída (DLC)',
                    'El Síndrome de Arnés (trauma por suspensión): riesgos médicos y plazos de rescate',
                ],
            },
            {
                title: 'Módulo II - Equipamiento de Protección Personal (EPP)',
                topics: [
                    'Clasificación e inspección periódica de arneses de cuerpo completo',
                    'Líneas de anclaje anticaídas con absorbedor de energía y cables de posicionamiento',
                    'Tipos de conectores (mosquetones) y sistemas anticaídas deslizantes (retráctiles)',
                    'Identificación y validación de puntos de anclaje seguros y líneas de vida',
                ],
            },
            {
                title: 'Módulo III - Práctica en Torres de Entrenamiento',
                topics: [
                    'Ascenso, descenso y progresión segura mediante doble cabo de vida en estructuras',
                    'Uso de líneas de vida verticales y horizontales temporales',
                    'Simulación de rescate de un operario suspendido y técnica de auto-salvamento',
                ],
            },
        ],
        requirements: [
            'Apto médico laboral para tareas en altura (neurológico y cardiológico vigente)',
            'Calzado de seguridad con puntera de acero',
        ],
        evaluacionesInfo: {
            teorico: 'Examen teórico escrito u online sobre distancias de caída y uso de EPP. Mínimo para aprobar: 80%.',
            practico: 'Prueba práctica de ascenso y posicionamiento seguro en torre de entrenamiento supervisada.',
        },
        certification: 'Certificación oficial de Trabajo en Altura con validez nacional por 24 meses.',
        pdfProgramaUrl: '/programas/trabajo-en-altura.pdf',
    },
};

export const courseList = Object.values(courseData);
export const courseSlugs = Object.keys(courseData);
