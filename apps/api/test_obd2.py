import asyncio
from database.client import prisma

async def test_obd2():
    await prisma.connect()
    print("Conectado a DB.")

    # 1. Buscar o crear un usuario y curso (Inscripcion) para prueba
    user = await prisma.user.find_first()
    curso = await prisma.curso.find_first()
    
    if not user or not curso:
        print("No hay usuarios o cursos. Creando dummy...")
        user = await prisma.user.create({"email": "testobd2@vmp.com", "passwordHash": "test", "nombre": "Test", "apellido": "OBD2", "dni": "99999999"})
        curso = await prisma.curso.create({"nombre": "Curso OBD2", "descripcion": "Test", "codigo": "OBD2-01", "duracionHoras": 10})
        
    inscripcion = await prisma.inscripcion.find_first(where={"alumnoId": user.id, "cursoId": curso.id})
    if not inscripcion:
        inscripcion = await prisma.inscripcion.create({
            "alumnoId": user.id,
            "cursoId": curso.id,
            "estado": "EN_CURSO"
        })
        
    print(f"Inscripción usada: {inscripcion.id}")
    
    # 2. Insertar una métrica
    print("Insertando métrica OBD2...")
    session = await prisma.obd2session.create(data={
        "inscripcionId": inscripcion.id,
        "fuerzaFrenado": 0.85,
        "aceleracion": 1.2,
        "curvasScore": 95.5,
        "esquivoAlce": True,
        "rawData": '{"rpm": 3000, "speed": 60}'
    })
    print(f"Sesión OBD2 creada con éxito: {session.id}")
    
    # 3. Leer métrica
    sessions = await prisma.obd2session.find_many(where={"inscripcionId": inscripcion.id})
    print(f"Sesiones encontradas: {len(sessions)}")
    
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(test_obd2())
