import os
import psycopg2
import json
import uuid
from datetime import datetime

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    if not DATABASE_URL:
        print("❌ DATABASE_URL no encontrada.")
        return

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        print("🌱 Iniciando carga de contenido educativo (Direct SQL)...")

        # 1. Obtener Cursos
        cur.execute("SELECT id, codigo, nombre FROM cursos;")
        cursos = cur.fetchall()
        curso_map = {c[1]: c[0] for c in cursos}

        # --- CURSO: Manejo Defensivo Livianos (MDL-001) ---
        if "MDL-001" in curso_map:
            curso_id = curso_map["MDL-001"]
            
            # Crear Módulo de Teoría
            modulo_teoria_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO modulos (id, curso_id, titulo, orden, tipo, contenido_html, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """, (modulo_teoria_id, curso_id, "Conceptos Fundamentales de Manejo Defensivo", 1, "TEORIA", 
                  "<h1>Manejo Defensivo</h1><p>El manejo defensivo consiste en conducir evitando accidentes a pesar de las acciones incorrectas de los demás y de las condiciones adversas.</p>",
                  datetime.now(), datetime.now()))

            # Crear Módulo Quiz
            modulo_quiz_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO modulos (id, curso_id, titulo, orden, tipo, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (modulo_quiz_id, curso_id, "Evaluación Teórica: Seguridad Vial", 2, "QUIZ",
                  datetime.now(), datetime.now()))

            # Preguntas
            preguntas = [
                ("¿Cuál es la distancia de seguridad recomendada entre vehículos en condiciones normales?", 
                 ["1 metro por cada 10km/h", "La regla de los 2-3 segundos", "Media cuadra", "5 metros"], 1, 
                 "La regla de los 2-3 segundos permite tener tiempo de reacción ante frenadas bruscas."),
                ("En caso de lluvia fuerte, ¿qué debe hacer un conductor defensivo?", 
                 ["Encender balizas y seguir igual", "Reducir la velocidad y aumentar la distancia de seguridad", "Frenar en seco si pierde visibilidad", "Aumentar la velocidad para salir rápido de la tormenta"], 1, 
                 "La lluvia reduce la adherencia y la visibilidad, por lo que bajar la velocidad es crítico."),
                ("¿Qué es el 'Punto Ciego' en un vehículo liviano?", 
                 ["La zona que no cubren los espejos retrovisores", "El área debajo del motor", "Cuando el sol encandila de frente", "La parte trasera del baúl"], 0, 
                 "Los puntos ciegos son áreas que el conductor no puede observar directamente ni por los espejos.")
            ]

            for p, opts, correct, expl in preguntas:
                cur.execute("""
                    INSERT INTO preguntas (id, modulo_id, pregunta, opciones, respuesta_correcta, explicacion, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, (str(uuid.uuid4()), modulo_quiz_id, p, json.dumps(opts), correct, expl, datetime.now()))

        # --- CURSO: Manejo Defensivo Pesados (MDP-001) ---
        if "MDP-001" in curso_map:
            curso_id = curso_map["MDP-001"]
            modulo_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO modulos (id, curso_id, titulo, orden, tipo, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (modulo_id, curso_id, "Examen de Manejo de Carga y Pesados", 1, "QUIZ",
                  datetime.now(), datetime.now()))

            preguntas = [
                ("¿Cómo debe realizarse un frenado prolongado en pendientes descendentes con un camión?", 
                 ["Usando solo el freno de servicio", "Combinando freno motor y marchas bajas", "Apagando el motor", "Usando el freno de mano"], 1, 
                 "El freno motor evita el recalentamiento de las cintas de freno (fading)."),
                ("¿Cuál es el riesgo principal de una carga mal estibada?", 
                 ["Mayor consumo de combustible", "Desplazamiento del centro de gravedad y vuelco", "Multas de tránsito", "Desgaste de cubiertas"], 1, 
                 "La inestabilidad de la carga afecta directamente la maniobrabilidad del vehículo pesado.")
            ]

            for p, opts, correct, expl in preguntas:
                cur.execute("""
                    INSERT INTO preguntas (id, modulo_id, pregunta, opciones, respuesta_correcta, explicacion, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, (str(uuid.uuid4()), modulo_id, p, json.dumps(opts), correct, expl, datetime.now()))

        # --- CURSO: Primeros Auxilios (PA-001) ---
        if "PA-001" in curso_map:
            curso_id = curso_map["PA-001"]
            modulo_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO modulos (id, curso_id, titulo, orden, tipo, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """, (modulo_id, curso_id, "Examen de Socorrismo Básico", 1, "QUIZ",
                  datetime.now(), datetime.now()))

            preguntas = [
                ("¿Qué significan las siglas P.A.S. en emergencias?", 
                 ["Prevenir, Ayudar, Salir", "Proteger, Alertar, Socorrer", "Parar, Avisar, Saltar", "Prudencia, Atención, Seguridad"], 1, 
                 "Es el protocolo estándar de actuación ante un accidente."),
                ("¿Cuál es la frecuencia recomendada de compresiones en RCP para adultos?", 
                 ["60 a 80 por minuto", "100 a 120 por minuto", "150 por minuto", "Lo más rápido posible"], 1, 
                 "El ritmo debe ser constante y permitir la re-expansión del tórax.")
            ]

            for p, opts, correct, expl in preguntas:
                cur.execute("""
                    INSERT INTO preguntas (id, modulo_id, pregunta, opciones, respuesta_correcta, explicacion, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, (str(uuid.uuid4()), modulo_id, p, json.dumps(opts), correct, expl, datetime.now()))

        conn.commit()
        print("✅ Carga finalizada con éxito.")
        cur.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
