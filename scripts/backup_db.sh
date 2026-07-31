#!/bin/bash
# Backup script for VMP EDTECH (SQLite)
# Copies vmp.db to a backups directory with timestamp

# Configuration
DB_PATH="/data/vmp.db"
BACKUP_DIR="/data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="$BACKUP_DIR/vmp_backup_$TIMESTAMP.db"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

echo "🚀 Starting backup of $DB_PATH..."

if [ -f "$DB_PATH" ]; then
    # Use sqlite3 .backup for a safe hot backup
    sqlite3 "$DB_PATH" ".backup '$BACKUP_PATH'"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: $BACKUP_PATH"
        
        # Keep only the last 7 days of backups
        find "$BACKUP_DIR" -name "vmp_backup_*.db" -mtime +7 -delete
        echo "🧹 Old backups cleaned up (keeping 7 days)."
    else
        echo "❌ Error: Failed to create backup."
        exit 1
    fi
else
    echo "⚠️ Warning: Database file not found at $DB_PATH. If this is a local environment, check the path."
fi
