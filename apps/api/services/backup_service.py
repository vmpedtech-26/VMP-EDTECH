import os
import subprocess
from datetime import datetime
import logging
from core.config import settings

logger = logging.getLogger(__name__)

BACKUP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backups")

class BackupService:
    @staticmethod
    def ensure_backup_dir():
        if not os.path.exists(BACKUP_DIR):
            os.makedirs(BACKUP_DIR)
            logger.info(f"Created backup directory: {BACKUP_DIR}")

    @staticmethod
    async def create_backup():
        """
        Generates a .sql backup using pg_dump.
        """
        BackupService.ensure_backup_dir()
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"vmp_backup_{timestamp}.sql"
        filepath = os.path.join(BACKUP_DIR, filename)
        
        # In Railway, DATABASE_URL is available
        db_url = settings.DATABASE_URL
        if not db_url:
            raise Exception("DATABASE_URL is not configured")

        try:
            # We use pg_dump directly. 
            # Note: In production, we assume pg_dump is available in the environment.
            # cmd = f"pg_dump {db_url} > {filepath}"
            
            # Using subprocess for better control
            process = subprocess.Popen(
                ["pg_dump", db_url, "-f", filepath],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                logger.error(f"Backup failed: {stderr}")
                raise Exception(f"Error executing pg_dump: {stderr}")

            file_size = os.path.getsize(filepath)
            logger.info(f"Backup created successfully: {filename} ({file_size} bytes)")
            
            return {
                "filename": filename,
                "size": file_size,
                "timestamp": timestamp,
                "status": "success"
            }
        except Exception as e:
            logger.error(f"Backup exception: {str(e)}")
            if os.path.exists(filepath):
                os.remove(filepath)
            raise e

    @staticmethod
    def list_backups():
        BackupService.ensure_backup_dir()
        backups = []
        for f in os.listdir(BACKUP_DIR):
            if f.endswith(".sql"):
                path = os.path.join(BACKUP_DIR, f)
                stats = os.stat(path)
                backups.append({
                    "filename": f,
                    "size": stats.st_size,
                    "created_at": datetime.fromtimestamp(stats.st_ctime).isoformat()
                })
        # Sort by creation date desc
        backups.sort(key=lambda x: x["created_at"], reverse=True)
        return backups

    @staticmethod
    def delete_backup(filename: str):
        filepath = os.path.join(BACKUP_DIR, filename)
        if os.path.exists(filepath) and filename.endswith(".sql"):
            os.remove(filepath)
            return True
        return False

    @staticmethod
    def get_backup_path(filename: str):
        filepath = os.path.join(BACKUP_DIR, filename)
        if os.path.exists(filepath) and filename.endswith(".sql"):
            return filepath
        return None
