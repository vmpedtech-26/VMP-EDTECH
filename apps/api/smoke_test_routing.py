import asyncio
import os
import sys
import json
from datetime import datetime

# Set up paths so we can import from core and main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import httpx
from main import app
from auth.dependencies import get_current_user
from core.database import prisma

class MockUser:
    def __init__(self, id, email, rol, empresaId=None):
        self.id = id
        self.email = email
        self.rol = rol
        self.empresaId = empresaId
        self.nombre = "Test"
        self.apellido = "User"
        self.dni = "12345678"
        self.puesto = "HSE Engineer"

async def run_tests():
    print("🎬 STARTING PROGRAMMATIC SMOKE TESTS (PRUEBA DE FUEGO)...")
    
    # 1. Connect Prisma DB
    print("\nConnecting to local database via Prisma...")
    await prisma.connect()
    print("✅ Database connected.")
    
    try:
        # Let's find an existing instructor and alumno in the database
        print("\nSearching database for existing users...")
        instructor = await prisma.user.find_first(where={"rol": "INSTRUCTOR"})
        if not instructor:
            print("No instructor found, creating mock...")
            instructor = await prisma.user.create(data={
                "email": "test-instructor-smoke@vmp.com",
                "passwordHash": "fake-hash",
                "nombre": "Pedro",
                "apellido": "Instructor",
                "dni": "99999991",
                "rol": "INSTRUCTOR"
            })
        print(f"Using Instructor ID: {instructor.id} ({instructor.email})")

        alumno = await prisma.user.find_first(where={"rol": "ALUMNO"})
        if not alumno:
            print("No alumno found, creating mock...")
            alumno = await prisma.user.create(data={
                "email": "test-alumno-smoke@vmp.com",
                "passwordHash": "fake-hash",
                "nombre": "Gervasio",
                "apellido": "Alumno",
                "dni": "88888882",
                "rol": "ALUMNO",
                "puesto": "Conductor Profesional"
            })
        print(f"Using Alumno ID: {alumno.id} ({alumno.email})")

        # Let's ensure there is a course, module, and a quiz in the DB to test the final quiz submission
        print("\nEnsuring training structures exist in the database...")
        curso = await prisma.curso.find_first()
        if not curso:
            print("No course found, seeding dummy course...")
            curso = await prisma.curso.create(data={
                "nombre": "Conducción Segura de Prueba",
                "descripcion": "Curso para prueba de fuego",
                "codigo": "SMOKE-101",
                "duracionHoras": 8,
                "vigenciaMeses": 12,
                "activo": True
            })
        print(f"Using Course ID: {curso.id} ({curso.nombre})")

        modulo = await prisma.modulo.find_first(where={"cursoId": curso.id, "tipo": "QUIZ"})
        if not modulo:
            print("No quiz module found, seeding dummy quiz module...")
            modulo = await prisma.modulo.create(data={
                "cursoId": curso.id,
                "titulo": "Examen Final Defensivo",
                "orden": 1,
                "tipo": "QUIZ"
            })
            # Add a question
            await prisma.pregunta.create(data={
                "moduloId": modulo.id,
                "pregunta": "¿Qué es la distancia de frenado?",
                "opciones": json.dumps(["La distancia recorrida al frenar", "El tiempo de reacción", "La velocidad"]),
                "respuestaCorrecta": 0,
                "explicacion": "Es la distancia física que recorre el vehículo."
            })
        
        # Verify there is a question under this module
        preguntas = await prisma.pregunta.find_many(where={"moduloId": modulo.id})
        print(f"Using Quiz Module ID: {modulo.id} ({len(preguntas)} questions)")

        # Ensure alumno is enrolled in this course
        inscripcion = await prisma.inscripcion.find_first(where={"alumnoId": alumno.id, "cursoId": curso.id})
        if not inscripcion:
            print("Enrolling alumno in the course...")
            inscripcion = await prisma.inscripcion.create(data={
                "alumnoId": alumno.id,
                "cursoId": curso.id,
                "progreso": 0,
                "estado": "NO_INICIADO"
            })
        
        # Clean up previous test runs for Alumno to make the test 100% idempotent
        print("Cleaning up previous test runs for Alumno...")
        await prisma.credencial.delete_many(where={"alumnoId": alumno.id, "cursoId": curso.id})
        await prisma.examen.delete_many(where={"alumnoId": alumno.id, "cursoId": curso.id})
        
        # Reset the enrollment progress to 0 and modulosCompletados to empty list
        await prisma.inscripcion.update_many(
            where={"alumnoId": alumno.id, "cursoId": curso.id},
            data={
                "progreso": 0,
                "estado": "NO_INICIADO",
                "modulosCompletados": "[]",
                "finDate": None
            }
        )
        # Fetch fresh inscripcion state
        inscripcion = await prisma.inscripcion.find_first(where={"alumnoId": alumno.id, "cursoId": curso.id})
        print(f"Using Enrollment ID: {inscripcion.id}")

        # Instantiate AsyncClient
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            # ----------------------------------------------------
            # TEST 1: INSTRUCTOR MEET-LINK GET & PUT
            # ----------------------------------------------------
            print("\n--- TEST 1: MANAGING INSTRUCTOR MEETING LINK (MEET-LINK) ---")
            
            # Override dependency to mock the instructor
            app.dependency_overrides[get_current_user] = lambda: MockUser(
                id=instructor.id, 
                email=instructor.email, 
                rol="INSTRUCTOR"
            )
            
            # Save a new meet link
            new_link = "https://meet.google.com/xyz-qprs-tuv"
            print(f"Setting meet link to: {new_link}")
            put_resp = await client.put("/api/users/me/meet-link", json={"link": new_link})
            print(f"PUT Response Status: {put_resp.status_code}")
            print(f"PUT Response Body: {put_resp.json()}")
            assert put_resp.status_code == 200, "PUT meet-link failed!"
            assert put_resp.json().get("link") == new_link, "Returned link does not match!"
            
            # Get the meet link
            get_resp = await client.get("/api/users/me/meet-link")
            print(f"GET Response Status: {get_resp.status_code}")
            print(f"GET Response Body: {get_resp.json()}")
            assert get_resp.status_code == 200, "GET meet-link failed!"
            assert get_resp.json().get("link") == new_link, "GET returned incorrect link!"
            print("✅ TEST 1 PASSED: Instructor virtual classroom links are saved and queried successfully without 404!")

            # ----------------------------------------------------
            # TEST 2: ALUMNO SUBMITS QUIZ & AUTO-GENERATES CREDENTIAL
            # ----------------------------------------------------
            print("\n--- TEST 2: SUBMITTING QUIZ & AUTO-GENERATING CREDENTIAL ---")
            
            # Override dependency to mock the student
            app.dependency_overrides[get_current_user] = lambda: MockUser(
                id=alumno.id, 
                email=alumno.email, 
                rol="ALUMNO"
            )
            
            # Prepare answers dict
            answers = {p.id: p.respuestaCorrecta for p in preguntas}
            payload = {
                "cursoId": curso.id,
                "moduloId": modulo.id,
                "respuestas": answers
            }
            
            print(f"Submitting answers to final quiz ({len(answers)} correct answers)...")
            quiz_resp = await client.post("/api/examenes/enviar-quiz", json=payload)
            print(f"POST Quiz Status: {quiz_resp.status_code}")
            
            response_data = quiz_resp.json()
            print(f"Quiz Evaluation Result:")
            print(f"  Calificación: {response_data.get('calificacion')}%")
            print(f"  Aprobado: {response_data.get('aprobado')}")
            print(f"  Mensaje: {response_data.get('message')}")
            print(f"  Credencial Generada: {response_data.get('credencialInfo') is not None}")
            
            assert quiz_resp.status_code == 200, "Quiz submission failed!"
            assert response_data.get("aprobado") is True, "Student should have passed!"
            assert response_data.get("calificacion") == 100.0, "Score should be 100%!"
            
            cred_info = response_data.get("credencialInfo")
            assert cred_info is not None, "Credential info was not returned!"
            
            # Verify the physical PDF file exists on disk!
            pdf_relative_url = cred_info.get("pdfUrl")
            print(f"Credential PDF URL: {pdf_relative_url}")
            
            # The URL returned is /storage/credenciales/VMP-YYYY-XXXXX.pdf
            filename = pdf_relative_url.split("/")[-1]
            pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage", "credenciales", filename)
            
            print(f"Checking physical PDF path: {pdf_path}")
            pdf_exists = os.path.exists(pdf_path)
            print(f"  Physical File Exists: {pdf_exists}")
            if pdf_exists:
                print(f"  PDF File Size: {os.path.getsize(pdf_path)} bytes")
                
            assert pdf_exists is True, f"Physical PDF file was not created at: {pdf_path}!"
            print("✅ TEST 2 PASSED: Capacitación engine approved, marked 100%, and successfully generated physical custom PDF certificate!")

            # Reset overrides
            app.dependency_overrides.clear()
            print("\n🎉 ALL SMOKE TESTS COMPLETED SUCCESSFULLY! SYSTEM ENGINE IS 100% HEALTHY.")

    except Exception as e:
        print(f"\n❌ TEST RUN ENCOUNTERED AN ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        print("\nDisconnecting Prisma...")
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(run_tests())
