#!/bin/bash

# This script runs locally, not on the droplet
echo "🚀 Setting up Digital Ocean Droplet for Thappy"

DO_CONTEXT="thappy"

# Switch to thappy context
echo "🔧 Switching to Digital Ocean context: $DO_CONTEXT"
doctl auth switch --context $DO_CONTEXT

# Check if droplet exists
if doctl compute droplet list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
    echo "✅ Droplet thappy-prod already exists"
    DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
    echo "📍 Droplet IP: $DROPLET_IP"
else
    echo "❌ Droplet not found. Create with: make do-create-droplet"
    exit 1
fi

# Setup firewall if needed
echo "🔒 Setting up firewall..."
if ! doctl compute firewall list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-firewall"; then
    echo "Creating firewall..."
    doctl compute firewall create --name thappy-firewall \
        --inbound-rules "protocol:tcp,ports:22,sources:address:0.0.0.0/0 protocol:tcp,ports:80,sources:address:0.0.0.0/0 protocol:tcp,ports:443,sources:address:0.0.0.0/0 protocol:tcp,ports:8081,sources:address:0.0.0.0/0" \
        --outbound-rules "protocol:tcp,ports:all,destinations:address:0.0.0.0/0 protocol:udp,ports:all,destinations:address:0.0.0.0/0" \
        --context $DO_CONTEXT

    DROPLET_ID=$(doctl compute droplet list --format ID,Name --no-header --context $DO_CONTEXT | grep thappy-prod | awk '{print $1}')
    FIREWALL_ID=$(doctl compute firewall list --format ID,Name --no-header --context $DO_CONTEXT | grep thappy-firewall | awk '{print $1}')
    doctl compute firewall add-droplets $FIREWALL_ID --droplet-ids $DROPLET_ID --context $DO_CONTEXT
    echo "✅ Firewall created and applied"
else
    echo "✅ Firewall already exists"
fi

# SSH into droplet and setup
echo "🖥️ Configuring droplet..."
doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "bash -s" << 'ENDSSH'
    # Update system
    echo "📦 Updating system packages..."
    apt-get update -y
    apt-get upgrade -y

    # Install required packages
    echo "📦 Installing required packages..."
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git \
        make \
        jq \
        htop \
        ufw \
        fail2ban

    # Install Docker if not already installed
    if ! command -v docker &> /dev/null; then
        echo "🐳 Installing Docker..."
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        systemctl enable docker
        systemctl start docker
        usermod -aG docker root
        echo "✅ Docker installed"
    else
        echo "✅ Docker already installed"
    fi

    # Install Docker Compose if not already installed
    if ! command -v docker-compose &> /dev/null; then
        echo "📦 Installing Docker Compose..."
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
        echo "✅ Docker Compose installed"
    else
        echo "✅ Docker Compose already installed"
    fi

    # Setup directories
    echo "📁 Setting up directories..."
    mkdir -p /opt/thappy
    mkdir -p /opt/thappy/backups
    mkdir -p /opt/thappy/logs
    mkdir -p /opt/thappy/ssl
    chown -R root:root /opt/thappy

    # Setup UFW firewall
    echo "🔒 Setting up UFW firewall..."
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 8081/tcp
    ufw --force enable

    # Setup fail2ban
    echo "🛡️ Setting up fail2ban..."
    systemctl enable fail2ban
    systemctl start fail2ban

    # Setup log rotation
    echo "📝 Setting up log rotation..."
    cat > /etc/logrotate.d/thappy << EOF
/opt/thappy/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        /usr/bin/docker-compose -f /opt/thappy/docker-compose.production.yml restart nginx || true
    endscript
}
EOF

    # Setup backup cron job
    echo "⏰ Setting up backup cron job..."
    cat > /etc/cron.d/thappy-backup << EOF
# Daily database backup at 2 AM
0 2 * * * root /opt/thappy/scripts/backup.sh > /opt/thappy/logs/backup.log 2>&1

# Weekly system backup at 3 AM on Sunday
0 3 * * 0 root /opt/thappy/scripts/system-backup.sh > /opt/thappy/logs/system-backup.log 2>&1
EOF

    # Create backup scripts directory
    mkdir -p /opt/thappy/scripts

    # Create basic backup script
    cat > /opt/thappy/scripts/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/thappy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_BACKUP_FILE="$BACKUP_DIR/database_$TIMESTAMP.sql"

echo "Starting backup at $(date)"

# Create database backup
if docker ps | grep -q thappy-postgres-prod; then
    echo "Creating database backup..."
    docker exec thappy-postgres-prod pg_dump -U thappy thappy > "$DB_BACKUP_FILE"
    gzip "$DB_BACKUP_FILE"
    echo "Database backup created: ${DB_BACKUP_FILE}.gz"
else
    echo "Warning: PostgreSQL container not running"
fi

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "database_*.sql.gz" -mtime +7 -delete

echo "Backup completed at $(date)"
EOF

    chmod +x /opt/thappy/scripts/backup.sh

    # Create system backup script
    cat > /opt/thappy/scripts/system-backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/thappy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Starting system backup at $(date)"

# Create system configuration backup
tar -czf "$BACKUP_DIR/system_config_$TIMESTAMP.tar.gz" \
    /opt/thappy/docker-compose.production.yml \
    /opt/thappy/.env.production \
    /etc/nginx/sites-available/ \
    /etc/ssl/certs/ \
    /etc/systemd/system/ \
    2>/dev/null || true

# Cleanup old system backups (keep last 4 weeks)
find $BACKUP_DIR -name "system_config_*.tar.gz" -mtime +28 -delete

echo "System backup completed at $(date)"
EOF

    chmod +x /opt/thappy/scripts/system-backup.sh

    # Setup monitoring script
    cat > /opt/thappy/scripts/health-check.sh << 'EOF'
#!/bin/bash

HEALTH_URL="http://localhost:8081/health"
LOG_FILE="/opt/thappy/logs/health-check.log"

echo "$(date): Performing health check..." >> $LOG_FILE

if curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "$(date): ✅ Health check passed" >> $LOG_FILE
else
    echo "$(date): ❌ Health check failed" >> $LOG_FILE
    # Restart services if health check fails
    cd /opt/thappy
    docker-compose -f docker-compose.production.yml restart backend
    echo "$(date): 🔄 Restarted backend service" >> $LOG_FILE
fi
EOF

    chmod +x /opt/thappy/scripts/health-check.sh

    # Add health check to cron (every 5 minutes)
    echo "*/5 * * * * root /opt/thappy/scripts/health-check.sh" >> /etc/cron.d/thappy-backup

    echo "✅ Server setup completed successfully!"
    echo "📊 System Information:"
    echo "  OS: $(lsb_release -d | cut -f2)"
    echo "  Docker: $(docker --version)"
    echo "  Docker Compose: $(docker-compose --version)"
    echo "  Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "  Disk: $(df -h / | tail -1 | awk '{print $2}')"
ENDSSH

echo "✅ Droplet setup complete!"
echo "📝 Next steps:"
echo "  1. Run 'make gh-setup-secrets' to configure GitHub secrets"
echo "  2. Run 'make deploy' to deploy the application"
echo "  3. Setup domain and SSL with 'make ssl-setup'"

# Display connection info
echo ""
echo "🔗 Connection Information:"
echo "  SSH: doctl compute ssh thappy-prod --context $DO_CONTEXT"
echo "  IP:  $DROPLET_IP"
echo "  Web: http://$DROPLET_IP (after deployment)"