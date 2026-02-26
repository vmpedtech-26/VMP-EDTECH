# Evaluation Templates for VMP - EDTECH

EVALUATION_TEMPLATES = {
    "MANEJO_DEFENSIVO_LIVIANO": {
        "titulo": "Evaluación: Manejo Defensivo Livianos",
        "preguntas": [
            {
                "pregunta": "¿Cuál es la distancia de seguridad recomendada entre vehículos en condiciones normales?",
                "opciones": ["1 metro por cada 10km/h", "La regla de los 2-3 segundos", "Media cuadra", "5 metros"],
                "respuestaCorrecta": 1,
                "explicacion": "La regla de los 2-3 segundos permite tener tiempo de reacción ante frenadas bruscas."
            },
            {
                "pregunta": "En caso de lluvia fuerte, ¿qué debe hacer un conductor defensivo?",
                "opciones": ["Encender balizas y seguir igual", "Reducir la velocidad y aumentar la distancia de seguridad", "Frenar en seco si pierde visibilidad", "Aumentar la velocidad para salir rápido de la tormenta"],
                "respuestaCorrecta": 1,
                "explicacion": "La lluvia reduce la adherencia y la visibilidad, por lo que bajar la velocidad es crítico."
            },
            {
                "pregunta": "¿Qué es el 'Punto Ciego' en un vehículo liviano?",
                "opciones": ["La zona que no cubren los espejos retrovisores", "El área debajo del motor", "Cuando el sol encandila de frente", "La parte trasera del baúl"],
                "respuestaCorrecta": 0,
                "explicacion": "Los puntos ciegos son áreas que el conductor no puede observar directamente ni por los espejos."
            }
        ]
    },
    "MANEJO_DEFENSIVO_PESADO": {
        "titulo": "Evaluación: Manejo Defensivo Pesados",
        "preguntas": [
            {
                "pregunta": "¿Cómo debe realizarse un frenado prolongado en pendientes descendentes con un camión?",
                "opciones": ["Usando solo el freno de servicio", "Combinando freno motor y marchas bajas", "Apagando el motor", "Usando el freno de mano"],
                "respuestaCorrecta": 1,
                "explicacion": "El freno motor evita el recalentamiento de las cintas de freno (fading)."
            },
            {
                "pregunta": "¿Cuál es el riesgo principal de una carga mal estibada?",
                "opciones": ["Mayor consumo de combustible", "Desplazamiento del centro de gravedad y vuelco", "Multas de tránsito", "Desgaste de cubiertas"],
                "respuestaCorrecta": 1,
                "explicacion": "La inestabilidad de la carga afecta directamente la maniobrabilidad del vehículo pesado."
            }
        ]
    },
    "PRIMEROS_AUXILIOS": {
        "titulo": "Evaluación: Socorrismo Básico y RCP",
        "preguntas": [
            {
                "pregunta": "¿Qué significan las siglas P.A.S. en emergencias?",
                "opciones": ["Prevenir, Ayudar, Salir", "Proteger, Alertar, Socorrer", "Parar, Avisar, Saltar", "Prudencia, Atención, Seguridad"],
                "respuestaCorrecta": 1,
                "explicacion": "Es el protocolo estándar de actuación ante un accidente."
            },
            {
                "pregunta": "¿Cuál es la frecuencia recomendada de compresiones en RCP para adultos?",
                "opciones": ["60 a 80 por minuto", "100 a 120 por minuto", "150 por minuto", "Lo más rápido posible"],
                "respuestaCorrecta": 1,
                "explicacion": "El ritmo debe ser constante y permitir la re-expansión del tórax."
            }
        ]
    }
}
