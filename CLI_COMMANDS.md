# 🚀 Thappy CLI Commands Reference

Complete reference for managing your Thappy production deployment using CLI tools.

## 📋 Quick Start

### Prerequisites
```bash
# Install required tools
brew install doctl gh  # macOS
# or
sudo apt install doctl gh  # Linux

# Authenticate
doctl auth init --context thappy
gh auth login
```

### Initial Setup
```bash
make setup-production     # Complete production setup
make deploy               # Deploy application
```

---

## 🌊 Digital Ocean Commands (`doctl`)

### Context Management
```bash
make do-setup                    # Initialize DO context
doctl auth switch --context thappy   # Switch to thappy context
doctl auth list                  # List all contexts
```

### Droplet Operations
```bash
make do-create-droplet          # Create production droplet
make do-ssh                     # SSH into production
make do-status                  # Check droplet status
make do-destroy-droplet         # Destroy droplet (DANGEROUS!)

# Direct doctl commands
doctl compute droplet list --context thappy
doctl compute droplet get thappy-prod --context thappy
doctl compute ssh thappy-prod --context thappy
```

### Snapshots & Backups
```bash
make do-snapshot               # Create droplet snapshot
make do-list-snapshots         # List all snapshots
make backup                    # Full backup (DB + snapshot)

# Direct doctl commands
doctl compute snapshot list --resource droplet --context thappy
doctl compute droplet-action snapshot DROPLET_ID --snapshot-name "backup-name"
```

### Networking & Security
```bash
make do-firewall-setup         # Setup firewall rules
make ssl-setup                 # Setup SSL certificates

# Direct doctl commands
doctl compute firewall list --context thappy
doctl compute firewall create --name thappy-firewall \
  --inbound-rules "protocol:tcp,ports:22,sources:address:0.0.0.0/0"
```

### Monitoring & Logs
```bash
make do-logs                   # View production logs
make monitor                   # Full monitoring dashboard

# Direct doctl commands
doctl compute ssh thappy-prod --ssh-command "docker logs container-name"
doctl monitoring alert list --context thappy
```

---

## 🐙 GitHub Commands (`gh`)

### Secrets Management
```bash
make gh-setup-secrets          # Setup all deployment secrets
make gh-list-secrets           # List configured secrets

# Individual secret management
gh secret set SECRET_NAME --body "value"
gh secret delete SECRET_NAME
gh secret list
```

### Deployment Management
```bash
make gh-deploy                 # Trigger deployment
make gh-deploy-watch           # Watch deployment progress
make gh-deploy-status          # Check deployment status
make gh-deploy-logs            # View deployment logs

# Direct gh commands
gh workflow run deploy --ref main
gh run list --workflow=deploy.yml
gh run watch
gh run view RUN_ID --log
```

### Environment Management
```bash
make gh-environments           # List environments
make gh-create-environment     # Create production environment

# Direct gh commands
gh api repos/OWNER/REPO/environments
gh api repos/OWNER/REPO/environments/production/variables
```

---

## 🔄 Combined Deployment Commands

### Primary Operations
```bash
make deploy                    # Complete deployment process
make deploy-status             # Check complete status
make deploy-rollback           # Rollback to previous version
make deploy-health             # Detailed health check
```

### Setup & Maintenance
```bash
make setup-production          # Initial production setup
make setup-server              # Setup server dependencies
make monitor                   # Live monitoring dashboard
make backup                    # Create full backup
```

---

## 🏥 Monitoring & Health Commands

### Status Checks
```bash
make status                    # Local development status
make deploy-status             # Production status overview
make deploy-health             # Detailed health check
./deploy/status.sh             # Comprehensive status dashboard
```

### Live Monitoring
```bash
make monitor                   # Interactive monitoring dashboard
./deploy/monitor.sh            # Advanced monitoring with auto-refresh
make do-logs                   # Live container logs
```

### Health Endpoints
```bash
# Backend health
curl http://DROPLET_IP:8081/health

# Frontend health
curl http://DROPLET_IP/

# Database health (via SSH)
make do-ssh
docker exec thappy-postgres-prod pg_isready -U thappy
```

---

## 💾 Backup & Recovery Commands

### Creating Backups
```bash
make backup                    # Full automated backup
make do-snapshot               # Droplet snapshot only
make db-backup                 # Database backup only

# Manual backup commands
./deploy/backup.sh             # Comprehensive backup script
```

### Restoring Backups
```bash
make db-restore                # Restore database from backup

# Manual restore
doctl compute droplet create thappy-restore \
  --image SNAPSHOT_ID --context thappy
```

### Backup Management
```bash
make do-list-snapshots         # List available snapshots
ls /opt/thappy/backups/        # List local backups (via SSH)

# Cleanup old backups (automatic in backup script)
find /opt/thappy/backups/ -name "*.sql.gz" -mtime +7 -delete
```

---

## 🛠️ Development Commands

### Local Development
```bash
make setup                     # Initialize project
make dev                       # Start development environment
make dev-local                 # Start services locally (no Docker)
make clean                     # Clean development environment
```

### Testing & Quality
```bash
make test                      # Run all tests
make test-backend              # Backend tests only
make test-frontend             # Frontend tests only
make ci                        # Complete CI pipeline
make lint                      # Run linters
make format                    # Format code
```

### Database Operations
```bash
make migrate-up                # Run migrations
make migrate-create NAME=name  # Create new migration
make db-shell                  # Connect to database
```

---

## 🔧 Configuration Commands

### Environment Setup
```bash
make env-setup                 # Create .env from example
make install-deps              # Install all dependencies
make install-tools             # Install development tools
```

### Docker Operations
```bash
make docker-build             # Build Docker images
make prod                      # Start production locally
make prod-stop                 # Stop production environment
make prod-logs                 # View production logs
```

---

## 🚨 Emergency Commands

### Quick Fixes
```bash
# Restart services
make do-ssh
cd /opt/thappy
docker-compose -f docker-compose.production.yml restart

# Emergency rollback
make deploy-rollback

# Check service status
make deploy-health
```

### Disaster Recovery
```bash
# Restore from snapshot
doctl compute droplet create thappy-recovery \
  --image SNAPSHOT_ID \
  --size s-2vcpu-2gb \
  --region fra1 \
  --context thappy

# Database recovery
make db-restore
```

---

## 📊 Common Workflows

### Daily Operations
```bash
# Morning check
make deploy-status

# Deploy new changes
git push origin main
make gh-deploy-watch

# Evening backup
make backup
```

### Weekly Maintenance
```bash
# Create snapshot
make do-snapshot

# Check system health
./deploy/status.sh

# Update dependencies
make deps-update
```

### Monthly Tasks
```bash
# SSL certificate renewal
make ssl-setup

# Security audit
make do-ssh
apt update && apt upgrade

# Cleanup old backups
make backup  # Auto-cleanup included
```

---

## 🔍 Troubleshooting Commands

### Debugging Issues
```bash
# Check all logs
make do-logs

# SSH into server
make do-ssh

# Check container status
docker ps
docker logs container-name

# Check resource usage
htop
df -h
free -h
```

### Network Issues
```bash
# Test connectivity
curl -I http://DROPLET_IP:8081/health
curl -I http://DROPLET_IP/

# Check firewall
doctl compute firewall list --context thappy
ufw status  # On server
```

### Database Issues
```bash
# Check database
make db-shell
\l  # List databases
\dt # List tables

# Check connections
docker exec thappy-postgres-prod pg_stat_activity -U thappy
```

---

## 📱 Mobile-Friendly Commands

### Quick Status (One-liners)
```bash
# Overall health
make deploy-health | grep -E "✅|❌"

# Container status
make do-ssh -c "docker ps --format 'table {{.Names}}\t{{.Status}}'"

# Resource usage
make do-ssh -c "free -h && df -h /"
```

---

## 🎯 Pro Tips

### Aliases
Add to your `.bashrc` or `.zshrc`:
```bash
alias thappy-status='make deploy-status'
alias thappy-deploy='make deploy'
alias thappy-ssh='make do-ssh'
alias thappy-logs='make do-logs'
alias thappy-backup='make backup'
alias thappy-monitor='make monitor'
```

### Keyboard Shortcuts
```bash
# Quick deployment
git push && make deploy

# Status check
make deploy-status

# Emergency access
make do-ssh
```

### Automation
```bash
# Cron job for daily backups
0 2 * * * cd /path/to/thappy && make backup > /tmp/thappy-backup.log 2>&1

# Health check script
*/5 * * * * curl -f http://DROPLET_IP:8081/health || mail -s "Thappy Down" admin@thappy.com
```

---

## 📞 Support Commands

### Getting Help
```bash
make help                      # Show all available commands
doctl --help                   # Digital Ocean CLI help
gh --help                      # GitHub CLI help

# Command-specific help
doctl compute droplet --help
gh workflow --help
```

### Version Information
```bash
doctl version
gh version
docker --version
docker-compose --version
```

---

## ⚡ Power User Commands

### Batch Operations
```bash
# Multiple environment setup
for env in staging production; do
  doctl compute droplet create thappy-$env --context thappy
done

# Bulk secret management
cat secrets.txt | while read secret; do
  gh secret set "$secret" --body "$(pass $secret)"
done
```

### Advanced Monitoring
```bash
# Real-time metrics
watch -n 5 'make deploy-health'

# Custom alerts
make monitor | grep -E "❌|⚠️" && notify-send "Thappy Alert"
```

---

**📝 Remember:** Always test commands in a safe environment first. Keep your CLI tools updated and maintain regular backups!