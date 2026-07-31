import asyncio
from datetime import datetime, timedelta
from celery import shared_task
from core.database import prisma

async def check_expiring_credentials_async():
    try:
        if not prisma.is_connected():
            await prisma.connect()
        
        # Check credentials expiring in the next 30 days
        thirty_days_from_now = datetime.now() + timedelta(days=30)
        
        expiring_creds = await prisma.credencial.find_many(
            where={
                "fechaVencimiento": {
                    "lte": thirty_days_from_now,
                    "gt": datetime.now() # Not already expired
                }
            },
            include={
                "alumno": True,
                "curso": True
            }
        )
        
        # Here we would send emails/whatsapp
        for cred in expiring_creds:
            print(f"[CRON] Credential {cred.numero} for {cred.alumno.email} expires on {cred.fechaVencimiento}. Sending reminder.")
            # await send_email(cred.alumno.email, ...)
            
    except Exception as e:
        print(f"Error checking expiring credentials: {e}")
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

@shared_task(name="workers.cron_jobs.check_expiring_credentials")
def check_expiring_credentials():
    print("Running check_expiring_credentials task...")
    asyncio.run(check_expiring_credentials_async())
