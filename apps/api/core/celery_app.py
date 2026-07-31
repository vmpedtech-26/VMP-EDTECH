import os
from celery import Celery
from core.config import settings

# In case someone runs celery directly, we need to make sure the sys path is right,
# but since it's inside apps/api, we should run it from apps/api directory.
# Example: celery -A core.celery_app worker --loglevel=info

celery_app = Celery(
    "vmp_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["workers.cron_jobs"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Argentina/Buenos_Aires",
    enable_utc=True,
    # Celery Beat settings for Cron Jobs
    beat_schedule={
        "check-expiring-credentials-daily": {
            "task": "workers.cron_jobs.check_expiring_credentials",
            "schedule": 86400.0, # Every 24 hours
        },
    }
)
