#!/bin/bash

# Automated backup using doctl
set -e

DO_CONTEXT="thappy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting backup process at $(date)"

# Check if doctl is available and context exists
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl not found. Please install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

if ! doctl auth switch --context $DO_CONTEXT 2>/dev/null; then
    echo "❌ Digital Ocean context '$DO_CONTEXT' not found. Run 'make do-setup' first."
    exit 1
fi

# Check if droplet exists
if ! doctl compute droplet list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
    echo "❌ Droplet 'thappy-prod' not found"
    exit 1
fi

DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
DROPLET_ID=$(doctl compute droplet list --format ID,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')

echo "📍 Droplet IP: $DROPLET_IP"
echo "🆔 Droplet ID: $DROPLET_ID"

# 1. Database backup
echo ""
echo "💾 Creating database backup..."
DB_BACKUP_NAME="thappy-db-$TIMESTAMP.sql"

if doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker ps | grep -q thappy-postgres-prod"; then
    doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
        mkdir -p /opt/thappy/backups
        docker exec thappy-postgres-prod pg_dump -U thappy thappy > /opt/thappy/backups/$DB_BACKUP_NAME
        gzip /opt/thappy/backups/$DB_BACKUP_NAME
        echo 'Database backup created: ${DB_BACKUP_NAME}.gz'
        ls -lh /opt/thappy/backups/${DB_BACKUP_NAME}.gz
    "
    echo "✅ Database backup completed"
else
    echo "⚠️  PostgreSQL container not running - skipping database backup"
fi

# 2. Application files backup
echo ""
echo "📁 Creating application files backup..."
APP_BACKUP_NAME="thappy-app-$TIMESTAMP.tar.gz"

doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
    cd /opt/thappy
    tar -czf backups/$APP_BACKUP_NAME \
        --exclude=backups \
        --exclude=.git \
        --exclude=node_modules \
        --exclude=*.log \
        .
    echo 'Application backup created: $APP_BACKUP_NAME'
    ls -lh backups/$APP_BACKUP_NAME
"
echo "✅ Application files backup completed"

# 3. Configuration backup
echo ""
echo "⚙️ Creating configuration backup..."
CONFIG_BACKUP_NAME="thappy-config-$TIMESTAMP.tar.gz"

doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
    tar -czf /opt/thappy/backups/$CONFIG_BACKUP_NAME \
        /opt/thappy/.env.production \
        /etc/nginx/sites-available/ \
        /etc/ssl/certs/ \
        /etc/systemd/system/ \
        /etc/cron.d/thappy-backup \
        /etc/logrotate.d/thappy \
        2>/dev/null || true
    echo 'Configuration backup created: $CONFIG_BACKUP_NAME'
    ls -lh /opt/thappy/backups/$CONFIG_BACKUP_NAME
"
echo "✅ Configuration backup completed"

# 4. Create droplet snapshot
echo ""
echo "📸 Creating droplet snapshot..."
SNAPSHOT_NAME="thappy-snapshot-$TIMESTAMP"

echo "Creating snapshot: $SNAPSHOT_NAME"
doctl compute droplet-action snapshot $DROPLET_ID \
    --snapshot-name "$SNAPSHOT_NAME" \
    --wait \
    --context $DO_CONTEXT

echo "✅ Droplet snapshot created: $SNAPSHOT_NAME"

# 5. Cleanup old backups
echo ""
echo "🧹 Cleaning up old backups..."

doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
    cd /opt/thappy/backups

    # Keep last 7 days of database backups
    find . -name 'thappy-db-*.sql.gz' -mtime +7 -delete 2>/dev/null || true

    # Keep last 7 days of application backups
    find . -name 'thappy-app-*.tar.gz' -mtime +7 -delete 2>/dev/null || true

    # Keep last 7 days of config backups
    find . -name 'thappy-config-*.tar.gz' -mtime +7 -delete 2>/dev/null || true

    echo 'Old backups cleaned up'
    echo 'Current backup files:'
    ls -lht | head -10
"

# 6. Cleanup old snapshots (keep last 7)
echo ""
echo "🧹 Cleaning up old snapshots..."

SNAPSHOTS_TO_DELETE=$(doctl compute snapshot list --resource droplet --context $DO_CONTEXT --format ID,Name,CreatedAt --no-header | grep "thappy-snapshot-" | sort -k3 -r | tail -n +8 | awk '{print $1}')

if [ -n "$SNAPSHOTS_TO_DELETE" ]; then
    echo "Deleting old snapshots:"
    echo "$SNAPSHOTS_TO_DELETE" | while read snapshot_id; do
        if [ -n "$snapshot_id" ]; then
            SNAPSHOT_NAME=$(doctl compute snapshot get $snapshot_id --format Name --no-header --context $DO_CONTEXT)
            echo "Deleting: $SNAPSHOT_NAME ($snapshot_id)"
            doctl compute snapshot delete $snapshot_id --force --context $DO_CONTEXT
        fi
    done
    echo "✅ Old snapshots cleaned up"
else
    echo "✅ No old snapshots to clean up"
fi

# 7. Optional: Upload to Spaces (if configured)
echo ""
if doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "command -v s3cmd >/dev/null 2>&1" 2>/dev/null; then
    echo "☁️ Uploading to Digital Ocean Spaces..."
    doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
        cd /opt/thappy/backups
        for file in thappy-*-$TIMESTAMP.*; do
            if [ -f \"\$file\" ]; then
                echo \"Uploading \$file...\"
                s3cmd put \"\$file\" s3://thappy-backups/ 2>/dev/null || echo \"Failed to upload \$file\"
            fi
        done
    "
    echo "✅ Uploads completed"
else
    echo "ℹ️ s3cmd not configured - skipping cloud upload"
fi

# 8. Backup summary
echo ""
echo "📊 BACKUP SUMMARY"
echo "═══════════════════════════════════════════════════"
echo "Timestamp: $TIMESTAMP"
echo "Droplet: thappy-prod ($DROPLET_IP)"
echo ""

# List recent backups
echo "📁 Recent local backups:"
doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "
    cd /opt/thappy/backups
    echo 'Database backups:'
    ls -lht thappy-db-*.sql.gz 2>/dev/null | head -3 || echo 'None found'
    echo ''
    echo 'Application backups:'
    ls -lht thappy-app-*.tar.gz 2>/dev/null | head -3 || echo 'None found'
    echo ''
    echo 'Configuration backups:'
    ls -lht thappy-config-*.tar.gz 2>/dev/null | head -3 || echo 'None found'
"

echo ""
echo "📸 Recent snapshots:"
doctl compute snapshot list --resource droplet --context $DO_CONTEXT --format Name,CreatedAt --no-header | grep thappy | head -3

echo ""
echo "✅ Backup process completed successfully at $(date)"
echo ""
echo "💡 To restore from backup:"
echo "  Database: make db-restore"
echo "  Snapshot: doctl compute droplet create thappy-restore --image <snapshot-id>"
echo ""
echo "📱 To view backup status: make monitor"