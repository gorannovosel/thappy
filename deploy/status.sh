#!/bin/bash

# Complete status check using both CLIs with enhanced formatting
clear

DO_CONTEXT="thappy"

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Unicode symbols
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
GEAR="⚙️"

print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}           THAPPY PRODUCTION STATUS DASHBOARD       ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo -e "${PURPLE}$1${NC}"
    echo -e "${BLUE}─────────────────────────────────────────${NC}"
}

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "ok" ]; then
        echo -e "${GREEN}${CHECK} $message${NC}"
    elif [ "$status" = "error" ]; then
        echo -e "${RED}${CROSS} $message${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}${WARNING} $message${NC}"
    else
        echo -e "${CYAN}${INFO} $message${NC}"
    fi
}

check_prerequisites() {
    local all_good=true

    if ! command -v doctl &> /dev/null; then
        print_status "error" "doctl not found. Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
        all_good=false
    fi

    if ! command -v gh &> /dev/null; then
        print_status "warning" "GitHub CLI not found. Some features unavailable."
    fi

    if ! doctl auth switch --context $DO_CONTEXT 2>/dev/null; then
        print_status "error" "Digital Ocean context '$DO_CONTEXT' not found. Run 'make do-setup'."
        all_good=false
    fi

    if [ "$all_good" = false ]; then
        echo ""
        echo -e "${RED}Prerequisites not met. Please fix the above issues.${NC}"
        exit 1
    fi
}

get_droplet_info() {
    if doctl compute droplet list --format Name --no-header --context $DO_CONTEXT | grep -q "thappy-prod"; then
        DROPLET_INFO=$(doctl compute droplet get thappy-prod --format Status,PublicIPv4,Memory,VCPUs,Region,CreatedAt --no-header --context $DO_CONTEXT)
        DROPLET_STATUS=$(echo $DROPLET_INFO | awk '{print $1}')
        DROPLET_IP=$(echo $DROPLET_INFO | awk '{print $2}')
        DROPLET_MEMORY=$(echo $DROPLET_INFO | awk '{print $3}')
        DROPLET_VCPUS=$(echo $DROPLET_INFO | awk '{print $4}')
        DROPLET_REGION=$(echo $DROPLET_INFO | awk '{print $5}')
        DROPLET_CREATED=$(echo $DROPLET_INFO | awk '{print $6}')
        DROPLET_EXISTS=true
    else
        DROPLET_EXISTS=false
    fi
}

print_header

# Check prerequisites
print_section "${GEAR} SYSTEM CHECKS"
check_prerequisites
print_status "ok" "All prerequisites met"
echo ""

# Get droplet information
get_droplet_info

# Digital Ocean Status
print_section "🌊 DIGITAL OCEAN STATUS"
if [ "$DROPLET_EXISTS" = true ]; then
    if [ "$DROPLET_STATUS" = "active" ]; then
        print_status "ok" "Droplet: thappy-prod ($DROPLET_STATUS)"
    else
        print_status "error" "Droplet: thappy-prod ($DROPLET_STATUS)"
    fi
    echo -e "${CYAN}   IP Address: $DROPLET_IP${NC}"
    echo -e "${CYAN}   Resources: $DROPLET_VCPUS vCPUs, ${DROPLET_MEMORY}MB RAM${NC}"
    echo -e "${CYAN}   Region: $DROPLET_REGION${NC}"
    echo -e "${CYAN}   Created: $DROPLET_CREATED${NC}"
else
    print_status "error" "Droplet 'thappy-prod' not found"
fi
echo ""

# GitHub Actions Status
print_section "🐙 GITHUB ACTIONS STATUS"
if command -v gh &> /dev/null && gh auth status >/dev/null 2>&1; then
    LATEST_RUN=$(gh run list --workflow=deploy.yml --limit 1 --json status,conclusion,createdAt,headSha,displayTitle 2>/dev/null || echo "[]")
    if [ "$LATEST_RUN" != "[]" ] && [ "$LATEST_RUN" != "" ]; then
        DEPLOY_TIME=$(echo $LATEST_RUN | jq -r '.[0].createdAt' 2>/dev/null || echo "Unknown")
        DEPLOY_STATUS=$(echo $LATEST_RUN | jq -r '.[0].conclusion // .[0].status' 2>/dev/null || echo "unknown")
        DEPLOY_COMMIT=$(echo $LATEST_RUN | jq -r '.[0].headSha' 2>/dev/null | cut -c1-7 || echo "unknown")
        DEPLOY_TITLE=$(echo $LATEST_RUN | jq -r '.[0].displayTitle' 2>/dev/null || echo "Unknown")

        case $DEPLOY_STATUS in
            "success") print_status "ok" "Latest deployment: $DEPLOY_STATUS" ;;
            "failure"|"cancelled") print_status "error" "Latest deployment: $DEPLOY_STATUS" ;;
            "in_progress") print_status "warning" "Latest deployment: $DEPLOY_STATUS" ;;
            *) print_status "info" "Latest deployment: $DEPLOY_STATUS" ;;
        esac

        echo -e "${CYAN}   Time: $DEPLOY_TIME${NC}"
        echo -e "${CYAN}   Commit: $DEPLOY_COMMIT${NC}"
        echo -e "${CYAN}   Title: $DEPLOY_TITLE${NC}"
    else
        print_status "warning" "No deployment runs found"
    fi
else
    print_status "warning" "GitHub CLI not available or not authenticated"
fi
echo ""

# Application Health
print_section "🏥 APPLICATION HEALTH"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    # Backend Health Check
    echo -n "Backend API: "
    if curl -s --connect-timeout 10 http://$DROPLET_IP:8081/health >/dev/null 2>&1; then
        print_status "ok" "Responding"
        # Try to get detailed health info
        HEALTH_RESPONSE=$(curl -s --connect-timeout 5 http://$DROPLET_IP:8081/health 2>/dev/null || echo "{}")
        if echo $HEALTH_RESPONSE | jq . >/dev/null 2>&1; then
            HEALTH_STATUS=$(echo $HEALTH_RESPONSE | jq -r '.status // "OK"' 2>/dev/null)
            echo -e "${CYAN}   Status: $HEALTH_STATUS${NC}"
        fi
    else
        print_status "error" "Not responding"
    fi

    # Frontend Health Check
    echo -n "Frontend: "
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 http://$DROPLET_IP 2>/dev/null || echo "000")
    case $FRONTEND_STATUS in
        "200"|"304") print_status "ok" "Responding (HTTP $FRONTEND_STATUS)" ;;
        "000") print_status "error" "Connection failed" ;;
        *) print_status "warning" "Unexpected response (HTTP $FRONTEND_STATUS)" ;;
    esac

    # Database Health Check
    echo -n "Database: "
    DB_CHECK=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "timeout 10 docker exec thappy-postgres-prod pg_isready -U thappy -d thappy" 2>/dev/null || echo "failed")
    if echo "$DB_CHECK" | grep -q "accepting connections"; then
        print_status "ok" "Accepting connections"
    else
        print_status "error" "Not responding"
    fi

    # SSL Check
    echo -n "SSL Certificate: "
    SSL_CHECK=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "timeout 10 echo | openssl s_client -connect localhost:443 -servername localhost 2>/dev/null | grep 'Verify return code'" 2>/dev/null || echo "failed")
    if echo "$SSL_CHECK" | grep -q "ok"; then
        print_status "ok" "Valid"
    elif echo "$SSL_CHECK" | grep -q "failed" || [ "$SSL_CHECK" = "failed" ]; then
        print_status "warning" "No SSL configured"
    else
        print_status "warning" "Check manually"
    fi
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Container Status
print_section "🐳 CONTAINER STATUS"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    CONTAINERS_RAW=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy 2>/dev/null && docker-compose -f docker-compose.production.yml ps --format 'table {{.Name}}\t{{.State}}\t{{.Status}}' 2>/dev/null" 2>/dev/null || echo "")

    if [ -n "$CONTAINERS_RAW" ]; then
        echo "$CONTAINERS_RAW" | tail -n +2 | while IFS=$'\t' read -r name state status; do
            if [ -n "$name" ]; then
                case $state in
                    "running") print_status "ok" "$name: $state" ;;
                    "exited") print_status "error" "$name: $state" ;;
                    *) print_status "warning" "$name: $state" ;;
                esac
            fi
        done
    else
        print_status "warning" "Unable to fetch container status"
    fi
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Resource Usage
print_section "📊 RESOURCE USAGE"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    # Memory Usage
    MEMORY_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "free -h | grep Mem | awk '{print \$3\"/\"\$2\" (\" (100-(\$7/\$2)*100) \"% used)\"}'" 2>/dev/null || echo "Unable to fetch")
    echo -e "${CYAN}Memory: $MEMORY_INFO${NC}"

    # Disk Usage
    DISK_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "df -h / | tail -1 | awk '{print \$3\"/\"\$2\" (\" \$5 \" used)\"}'" 2>/dev/null || echo "Unable to fetch")
    echo -e "${CYAN}Disk: $DISK_INFO${NC}"

    # CPU Load
    LOAD_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "uptime | awk -F'load average:' '{print \$2}' | sed 's/^[ ]*//' | sed 's/[ ]*$//' | cut -d',' -f1-3" 2>/dev/null || echo "Unable to fetch")
    echo -e "${CYAN}Load Average: $LOAD_INFO${NC}"

    # Uptime
    UPTIME_INFO=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "uptime | awk -F'up ' '{print \$2}' | awk -F',' '{print \$1}'" 2>/dev/null || echo "Unable to fetch")
    echo -e "${CYAN}Uptime: $UPTIME_INFO${NC}"
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Recent Activity
print_section "📈 RECENT ACTIVITY"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    # Check for recent restarts
    RECENT_RESTARTS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy 2>/dev/null && docker-compose -f docker-compose.production.yml logs --since 24h 2>/dev/null | grep -i 'started\|stopped\|restart' | tail -3" 2>/dev/null || echo "")
    if [ -n "$RECENT_RESTARTS" ]; then
        echo -e "${CYAN}Recent container activity:${NC}"
        echo "$RECENT_RESTARTS" | sed 's/^/  /'
    else
        print_status "ok" "No recent container restarts"
    fi

    # Check for errors in logs
    ERROR_COUNT=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "cd /opt/thappy 2>/dev/null && docker-compose -f docker-compose.production.yml logs --since 1h 2>/dev/null | grep -ic 'error\|exception\|fail' || echo 0" 2>/dev/null || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        print_status "warning" "$ERROR_COUNT errors in the last hour"
    else
        print_status "ok" "No errors in the last hour"
    fi
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Backup Status
print_section "💾 BACKUP STATUS"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    # Latest database backup
    LATEST_DB_BACKUP=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "ls -t /opt/thappy/backups/thappy-db-*.sql.gz 2>/dev/null | head -1 | xargs ls -lh | awk '{print \$6\" \"\$7\" \"\$8\" \"\$9\" (\" \$5 \")\"}'" 2>/dev/null || echo "None found")
    echo -e "${CYAN}Latest DB backup: $LATEST_DB_BACKUP${NC}"

    # Snapshot count
    SNAPSHOT_COUNT=$(doctl compute snapshot list --resource droplet --context $DO_CONTEXT --format Name --no-header 2>/dev/null | grep -c thappy || echo "0")
    echo -e "${CYAN}Available snapshots: $SNAPSHOT_COUNT${NC}"

    if [ "$SNAPSHOT_COUNT" -gt 0 ]; then
        LATEST_SNAPSHOT=$(doctl compute snapshot list --resource droplet --context $DO_CONTEXT --format Name,CreatedAt --no-header 2>/dev/null | grep thappy | head -1)
        echo -e "${CYAN}Latest snapshot: $LATEST_SNAPSHOT${NC}"
    fi
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Security Status
print_section "🔒 SECURITY STATUS"
if [ "$DROPLET_EXISTS" = true ] && [ "$DROPLET_STATUS" = "active" ]; then
    # Firewall status
    FIREWALL_STATUS=$(doctl compute firewall list --format Name,Status --no-header --context $DO_CONTEXT 2>/dev/null | grep thappy || echo "")
    if [ -n "$FIREWALL_STATUS" ]; then
        print_status "ok" "Firewall: $(echo $FIREWALL_STATUS | awk '{print $2}')"
    else
        print_status "warning" "No firewall configured"
    fi

    # SSH attempts (fail2ban)
    SSH_ATTEMPTS=$(doctl compute ssh thappy-prod --context $DO_CONTEXT --ssh-command "journalctl -u ssh --since '1 day ago' 2>/dev/null | grep -c 'Failed password' || echo 0" 2>/dev/null || echo "0")
    if [ "$SSH_ATTEMPTS" -gt 10 ]; then
        print_status "warning" "$SSH_ATTEMPTS failed SSH attempts in 24h"
    else
        print_status "ok" "$SSH_ATTEMPTS failed SSH attempts in 24h"
    fi
else
    print_status "error" "Cannot check - droplet not available"
fi
echo ""

# Quick Actions
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}🚀 QUICK ACTIONS${NC}"
echo -e "${BLUE}─────────────────────────────────────────${NC}"
echo -e "${GREEN}  make deploy${NC}              - Deploy latest code"
echo -e "${GREEN}  make deploy-rollback${NC}     - Rollback deployment"
echo -e "${GREEN}  make do-logs${NC}             - View live logs"
echo -e "${GREEN}  make do-ssh${NC}              - SSH to server"
echo -e "${GREEN}  make backup${NC}              - Create backup"
echo -e "${GREEN}  make monitor${NC}             - Live monitoring"
echo ""
echo -e "${PURPLE}📊 DETAILED CHECKS${NC}"
echo -e "${BLUE}─────────────────────────────────────────${NC}"
echo -e "${CYAN}  make deploy-health${NC}       - Detailed health check"
echo -e "${CYAN}  make gh-deploy-status${NC}    - GitHub Actions status"
echo -e "${CYAN}  make do-status${NC}           - Digital Ocean status"
echo -e "${CYAN}  make do-snapshot${NC}         - Create snapshot"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

echo ""
echo -e "${GREEN}Status check completed at $(date)${NC}"