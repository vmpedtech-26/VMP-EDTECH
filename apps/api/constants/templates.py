# Evaluation Templates for VMP - EDTECH (Argentina 2026)
# Based on CNRT, SRT, and Law 24.449 standards.

EVALUATION_TEMPLATES = {
    "LNH_CARGAS_GENERALES": {
        "titulo": "LNH - Cargas Generales (Mercosur 2026)",
        "preguntas": [
            {
                "pregunta": "¿Cuál es el peso máximo permitido para una unidad simple de 2 ejes?",
                "opciones": ["10.000 kg", "17.000 kg", "15.000 kg", "12.000 kg"],
                "respuestaCorrecta": 1,
                "explicacion": "Según la Ley de Tránsito, el límite para el eje tándem o doble de un camión convencional es de 17 toneladas."
            },
            {
                "pregunta": "Documentación obligatoria para Cargas Generales en Argentina:",
                "opciones": ["Solo DNI", "RUTA y Certificación CNRT vigente", "Seguro de vida", "Certificado de origen"],
                "respuestaCorrecta": 1,
                "explicacion": "El RUTA y la LNH son mandatorios para el transporte interjurisdiccional."
            }
        ]
    },
    "LNH_PASAJEROS": {
        "titulo": "LNH - Transporte de Pasajeros",
        "preguntas": [
            {
                "pregunta": "¿Cuál es la velocidad máxima para un ómnibus en autopistas argentinas?",
                "opciones": ["80 km/h", "90 km/h", "100 km/h", "110 km/h"],
                "respuestaCorrecta": 1,
                "explicacion": "La Ley 24.449 establece un límite de 90 km/h para transporte de pasajeros."
            }
        ]
    },
    "MANEJO_DEFENSIVO_ALTA_MONTANA": {
        "titulo": "Conducción en Alta Montaña (Paso Libertadores)",
        "preguntas": [
            {
                "pregunta": "¿Qué precaución es vital al circular con nieve?",
                "opciones": ["Frenar fuerte en curvas", "Usar marchas bajas para retención", "Usar solo el freno de pie", "Mantener la misma velocidad que en llano"],
                "respuestaCorrecta": 1,
                "explicacion": "La retención con motor evita el bloqueo de ruedas y deslizamientos."
            }
        ]
    },
    "SEGURIDAD_VACA_MUERTA": {
        "titulo": "Seguridad en Yacimientos (Vaca Muerta 2026)",
        "preguntas": [
            {
                "pregunta": "EPP obligatorio para ingreso a locación petrolera:",
                "opciones": ["Bermudas y sandalias", "Casco, calzado dieléctrico, ropa ignífuga y antiparras", "Solo chaleco reflectivo", "Ropa de algodón deportiva"],
                "respuestaCorrecta": 1,
                "explicacion": "Los estándares de operadoras como YPF exigen protección completa certificada."
            }
        ]
    },
    "RIESGOS_ELECTRICOS_AEA": {
        "titulo": "Prevención de Riesgos Eléctricos (Norma AEA)",
        "preguntas": [
            {
                "pregunta": "¿Qué indica el color verde/amarillo en un conductor eléctrico?",
                "opciones": ["Fase", "Neutro", "Puesta a tierra", "Retorno"],
                "respuestaCorrecta": 2,
                "explicacion": "Es el estándar de seguridad para identificar la conexión a tierra."
            }
        ]
    },
    "PRIMEROS_AUXILIOS_DEA": {
        "titulo": "Primeros Auxilios Avanzados y uso de DEA",
        "preguntas": [
            {
                "pregunta": "¿Cuál es la función principal de un DEA?",
                "opciones": ["Medir la presión", "Dar oxígeno", "Analizar el ritmo cardíaco y dar descarga si es necesario", "Inyectar adrenalina"],
                "respuestaCorrecta": 2,
                "explicacion": "El DEA es automático y guía al rescatista para revertir una arritmia mortal."
            }
        ]
    },
    "AUTOELEVADORES_SRT960": {
        "titulo": "Autoelevadores (Res. SRT 960/15)",
        "preguntas": [
            {
                "pregunta": "¿Cada cuánto debe renovarse la credencial de operador según SRT 960?",
                "opciones": ["Anualmente", "Cada 5 años", "Nunca", "Cada 10 años"],
                "respuestaCorrecta": 0,
                "explicacion": "La capacitación y aptitud médica deben ser anuales."
            }
        ]
    },
    "TRABAJO_EN_ALTURA": {
        "titulo": "Trabajo en Altura y Protección Anticaídas",
        "preguntas": [
            {
                "pregunta": "¿A qué altura es obligatorio usar arnés de seguridad?",
                "opciones": ["1 metro", "1.5 metros", "2 metros", "5 metros"],
                "respuestaCorrecta": 2,
                "explicacion": "A partir de 2 metros se considera riesgo de caída a distinto nivel."
            }
        ]
    },
    "ERGONOMIA_SRT886": {
        "titulo": "Ergonomía en el Trabajo (Res. SRT 886/15)",
        "preguntas": [
            {
                "pregunta": "Peso máximo recomendado para levantamiento manual de carga (hombres):",
                "opciones": ["10 kg", "25 kg", "50 kg", "100 kg"],
                "respuestaCorrecta": 1,
                "explicacion": "Los parámetros ergonómicos sugieren 25kg como límite para evitar lesiones lumbares."
            }
        ]
    },
    "MERCANCIAS_PELIGROSAS": {
        "titulo": "Mercancías Peligrosas (Res. 195/97)",
        "preguntas": [
            {
                "pregunta": "¿Qué significa una placa con un fondo rojo y el dibujo de una llama?",
                "opciones": ["Sustancia Corrosiva", "Líquido Inflamable", "Gas Tóxico", "Explosivo"],
                "respuestaCorrecta": 1,
                "explicacion": "El color rojo identifica productos inflamables en el sistema de transporte."
            }
        ]
    },
    "ESPACIOS_CONFINADOS": {
        "titulo": "Seguridad en Espacios Confinados",
        "preguntas": [
            {
                "pregunta": "¿Qué debe medirse ANTES de ingresar a un espacio confinado?",
                "opciones": ["Solo la temperatura", "Niveles de oxígeno y gases tóxicos/explosivos", "La profundidad", "La humedad"],
                "respuestaCorrecta": 1,
                "explicacion": "La atmósfera puede estar viciada o ser explosiva, requiriendo monitoreo constante."
            }
        ]
    },
    "INCENDIO_EXTINTORES": {
        "titulo": "Incendio y Uso de Extintores",
        "preguntas": [
            {
                "pregunta": "¿Qué tipo de matafuego se usa para fuegos eléctricos (Clase C)?",
                "opciones": ["Agua", "Polvo Químico Seco (ABC) o CO2", "Espuma química", "Hierba húmeda"],
                "respuestaCorrecta": 1,
                "explicacion": "El agente extintor no debe ser conductor de electricidad."
            }
        ]
    },
    "FLOTAS_LIVIANAS": {
        "titulo": "Manejo de Flotas Livianas Urbanas",
        "preguntas": [
            {
                "pregunta": "¿Cuál es la velocidad máxima permitida en una avenida?",
                "opciones": ["40 km/h", "60 km/h", "80 km/h", "20 km/h"],
                "respuestaCorrecta": 1,
                "explicacion": "En Argentina, las avenidas tienen un límite general de 60 km/h salvo señalización."
            }
        ]
    },
    "VEHICULOS_EMERGENCIA": {
        "titulo": "Conducción de Vehículos de Emergencia",
        "preguntas": [
            {
                "pregunta": "Uso de sirenas y balizas azules/rojas:",
                "opciones": ["Se pueden usar siempre", "Solo en servicio de urgencia manifiesta", "Para pasar semáforos en rojo", "Cuando hay mucho tráfico"],
                "respuestaCorrecta": 1,
                "explicacion": "El uso está restringido a misiones oficiales críticas."
            }
        ]
    },
    "PSICOLOGIA_FATIGA": {
        "titulo": "Psicología del Conductor y Fatiga",
        "preguntas": [
            {
                "pregunta": "Signo temprano de fatiga al volante:",
                "opciones": ["Hambre", "Bostezo frecuente y dificultad para mantener el carril", "Alegría", "Sed"],
                "respuestaCorrecta": 1,
                "explicacion": "La fatiga es la principal causa de accidentes en rutas nacionales."
            }
        ]
    },
    "ESTIBA_SUJECION": {
        "titulo": "Estiba y Sujeción de Cargas",
        "preguntas": [
            {
                "pregunta": "Principal riesgo de una carga suelta:",
                "opciones": ["Ruidos", "Vuelco o desplazamiento brusco del vehículo", "Multas de broma", "Desgaste de frenos"],
                "respuestaCorrecta": 1,
                "explicacion": "La fuerza centrífuga puede desplazar la carga y provocar un vuelco fatal."
            }
        ]
    },
    "MANTENIMIENTO_PREVENTIVO": {
        "titulo": "Mantenimiento Preventivo de Flotas",
        "preguntas": [
            {
                "pregunta": "¿Qué indica el testigo de aceite en el tablero?",
                "opciones": ["Falta combustible", "Baja presión de aceite o falta de lubricación", "Luces encendidas", "Puerta abierta"],
                "respuestaCorrecta": 1,
                "explicacion": "Ante esta luz se debe detener el motor inmediatamente para evitar fundirlo."
            }
        ]
    },
    "GESTION_AMBIENTAL": {
        "titulo": "Gestión Ambiental en Transporte",
        "preguntas": [
            {
                "pregunta": "¿Qué se debe hacer con los aceites usados del motor?",
                "opciones": ["Tirarlos al desagüe", "Entregarlos a un recolector de residuos peligrosos certificado", "Quemarlos", "Enterrarlos"],
                "respuestaCorrecta": 1,
                "explicacion": "Son residuos peligrosos y su disposición final está regulada por ley."
            }
        ]
    },
    "RCP_2026": {
        "titulo": "RCP - Último Consenso Internacional",
        "preguntas": [
            {
                "pregunta": "Profundidad de las compresiones en un adulto:",
                "opciones": ["1 cm", "Entre 5 y 6 cm", "10 cm", "No importa"],
                "respuestaCorrecta": 1,
                "explicacion": "Debe ser suficiente para comprimir el corazón contra la columna."
            }
        ]
    },
    "ETICA_RESPONSABILIDAD": {
        "titulo": "Ética y Responsabilidad del Conductor",
        "preguntas": [
            {
                "pregunta": "Responsabilidad civil en un siniestro:",
                "opciones": ["Solamente del dueño del vehículo", "Del conductor y solidariamente del dueño/empresa", "Nadie es responsable", "Solo de la aseguradora"],
                "respuestaCorrecta": 1,
                "explicacion": "El conductor es siempre responsable directo de su accionar tras el volante."
            }
        ]
    }
}
