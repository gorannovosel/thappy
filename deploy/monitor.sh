#!/bin/bash

# Complete monitoring dashboard using doctl and gh
clear
echo "═══════════════════════════════════════════════════"
echo "           THAPPY PRODUCTION STATUS DASHBOARD       "
echo "═══════════════════════════════════════════════════"
echo ""

DO_CONTEXT="thappy"

# Check if doctl is available and context exists
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl not found. Please install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

if ! doctl auth switch --context $DO_CONTEXT 2>/dev/null; then
    echo "❌ Digital Ocean context '$DO_CONTEXT' not found. Run 'make do-setup' first."
    exit 1
fi

# Digital Ocean Status
echo "🌊 DIGITAL OCEAN STATUS"
echo "─────────────────────────────────────────"
if doctl compute droplet list --format Name,Status,PublicIPv4,Memory,VCPUs --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
    DROPLET_INFO=$(doctl compute droplet get thappy-prod --format Status,PublicIPv4,Memory,VCPUs,Region --no-header --context $DO_CONTEXT)
    DROPLET_IP=$(echo $DROPLET_INFO | awk '{print $2}')
    echo "Status: $(echo $DROPLET_INFO | awk '{print $1}')"
    echo "IP Address: $DROPLET_IP"
    echo "Memory: $(echo $DROPLET_INFO | awk '{print $3}') MB"
    echo "vCPUs: $(echo $DROPLET_INFO | awk '{print $4}')"
    echo "Region: $(echo $DROPLET_INFO | awk '{print $5}')"
else
    echo "❌ Droplet 'thappy-prod' not found"
    DROPLET_IP=""
fi
echo ""

# GitHub Actions Status
echo "🐙 GITHUB ACTIONS STATUS"
echo "─────────────────────────────────────────"
if command -v gh &> /dev/null; then
    if gh auth status >/dev/null 2>&1; then
        LATEST_RUN=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,createdAt,headSha 2>/dev/null || echo "[]")
        if [ "$LATEST_RUN" != "[]" ] && [ "$LATEST_RUN" != "" ]; then
            echo "Latest Deploy: $(echo $LATEST_RUN | jq -r '.[0].createdAt' 2>/dev/null || echo "Unknown")"
            STATUS=$(echo $LATEST_RUN | jq -r '.[0].conclusion // .[0].status' 2>/dev/null || echo "unknown")
            echo "Status: $STATUS"
            COMMIT=$(echo $LATEST_RUN | jq -r '.[0].headSha' 2>/dev/null | cut -c1-7 || echo "unknown")
            echo "Commit: $COMMIT"
        else
            echo "No deployment runs found"
        fi
    else
        echo "❌ GitHub CLI not authenticated. Run 'gh auth login'"
    fi
else
    echo "❌ GitHub CLI not found. Please install: https://cli.github.com/"
fi
echo ""

# Application Health
echo "🏥 APPLICATION HEALTH"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    # Backend Health Check
    echo -n "Backend API: "
    if curl -s --connect-timeout 5 http://$DROPLET_IP:8081/health >/dev/null 2>&1; then
        echo "✅ Healthy"
        # Get more detailed health info if available
        HEALTH_RESPONSE=$(curl -s --connect-timeout 5 http://$DROPLET_IP:8081/health 2>/dev/null || echo "{}")
        if echo $HEALTH_RESPONSE | jq . >/dev/null 2>&1; then
            echo "  $(echo $HEALTH_RESPONSE | jq -r '.status // "Status: OK"' 2>/dev/null)"
        fi
    else
        echo "❌ Unhealthy"
    fi

    # Frontend Health Check
    echo -n "Frontend: "
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$DROPLET_IP 2>/dev/null || echo "000")
    if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "304" ]; then
        echo "✅ Healthy (HTTP $FRONTEND_STATUS)"
    else
        echo "❌ Unhealthy (HTTP $FRONTEND_STATUS)"
    fi

    # Database Health Check (via SSH)
    echo -n "Database: "
    DB_STATUS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker exec thappy-postgres-prod pg_isready -U thappy -d thappy" 2>/dev/null | grep -q "accepting connections" && echo "healthy" || echo "unhealthy")
    if [ "$DB_STATUS" = "healthy" ]; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy"
    fi
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# Container Status
echo "🐳 CONTAINER STATUS"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    CONTAINERS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy && docker-compose -f docker-compose.production.yml ps --format 'table {{.Name}}\t{{.State}}\t{{.Status}}'" 2>/dev/null | tail -n +2 || echo "Unable to fetch container status")
    if [ "$CONTAINERS" = "Unable to fetch container status" ]; then
        echo "❌ Unable to fetch container status"
    else
        echo "$CONTAINERS"
    fi
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# Resource Usage
echo "📊 RESOURCE USAGE"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    # Memory Usage
    echo -n "Memory: "
    MEMORY_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "free -h | grep Mem" 2>/dev/null | awk '{print $3"/"$2" ("$5" free)"}' || echo "Unable to fetch")
    echo "$MEMORY_INFO"

    # Disk Usage
    echo -n "Disk: "
    DISK_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "df -h / | tail -1" 2>/dev/null | awk '{print $3"/"$2" ("$5" used)"}' || echo "Unable to fetch")
    echo "$DISK_INFO"

    # CPU Load
    echo -n "Load: "
    LOAD_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "uptime | awk -F'load average:' '{print \$2}'" 2>/dev/null | sed 's/^[ ]*//' || echo "Unable to fetch")
    echo "$LOAD_INFO"

    # Docker Resource Usage
    echo -n "Docker: "
    DOCKER_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "docker system df | grep Images" 2>/dev/null | awk '{print $2" images, "$4" disk"}' || echo "Unable to fetch")
    echo "$DOCKER_INFO"
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# Recent Logs
echo "📝 RECENT ERROR LOGS (Last 10 lines)"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    RECENT_ERRORS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy && docker-compose -f docker-compose.production.yml logs --tail=10 backend 2>&1 | grep -i 'error\|fail\|exception' | tail -5" 2>/dev/null || echo "Unable to fetch logs")
    if [ -z "$RECENT_ERRORS" ] || [ "$RECENT_ERRORS" = "Unable to fetch logs" ]; then
        echo "✅ No recent errors found"
    else
        echo "$RECENT_ERRORS"
    fi
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# SSL Certificate Status
echo "🔒 SSL CERTIFICATE STATUS"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    SSL_STATUS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "if [ -f /etc/letsencrypt/live/*/cert.pem ]; then openssl x509 -in /etc/letsencrypt/live/*/cert.pem -noout -dates 2>/dev/null | grep 'notAfter' | cut -d= -f2; else echo 'No SSL certificate found'; fi" 2>/dev/null || echo "Unable to check")
    echo "Certificate expires: $SSL_STATUS"
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# Backup Status
echo "💾 BACKUP STATUS"
echo "─────────────────────────────────────────"
if [ -n "$DROPLET_IP" ]; then
    # Recent database backups
    RECENT_BACKUPS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "ls -la /opt/thappy/backups/database_*.sql.gz 2>/dev/null | tail -3 | awk '{print \$6\" \"\$7\" \"\$8\" \"\$9}'" 2>/dev/null || echo "No backups found")
    echo "Recent DB backups:"
    echo "$RECENT_BACKUPS"

    # Droplet snapshots
    echo ""
    echo "Recent snapshots:"
    SNAPSHOTS=$(doctl compute snapshot list --resource droplet --context $DO_CONTEXT --format Name,CreatedAt --no-header 2>/dev/null | grep thappy | head -3 || echo "No snapshots found")
    echo "$SNAPSHOTS"
else
    echo "❌ Cannot check - droplet not found"
fi
echo ""

# Firewall Status
echo "🔥 FIREWALL STATUS"
echo "─────────────────────────────────────────"
FIREWALL_INFO=$(doctl compute firewall list --format Name,Status,InboundRules --no-header --context $DO_CONTEXT 2>/dev/null | grep thappy || echo "No firewall found")
echo "$FIREWALL_INFO"
echo ""

# Quick Actions Menu
echo "═══════════════════════════════════════════════════"
echo "🚀 QUICK ACTIONS"
echo "─────────────────────────────────────────"
echo "  make deploy              - Deploy latest code"
echo "  make deploy-rollback     - Rollback deployment"
echo "  make do-logs             - View live logs"
echo "  make do-ssh              - SSH to server"
echo "  make backup              - Create backup"
echo "  make deploy-health       - Detailed health check"
echo ""
echo "📊 MONITORING COMMANDS"
echo "─────────────────────────────────────────"
echo "  make gh-deploy-status    - GitHub Actions status"
echo "  make do-status           - Digital Ocean status"
echo "  make do-snapshot         - Create snapshot"
echo "═══════════════════════════════════════════════════"

# Auto-refresh option
echo ""
read -p "🔄 Auto-refresh every 30 seconds? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting auto-refresh... (Press Ctrl+C to stop)"
    while true; do
        sleep 30
        clear
        exec "$0"
    done
fi