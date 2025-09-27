# 🧪 CI/CD Pipeline Testing Plan

Comprehensive testing strategy to validate the complete Digital Ocean + GitHub Actions CI/CD pipeline.

## 📋 Testing Overview

### Test Phases
1. **Prerequisites & Setup Validation**
2. **Local Development Testing**
3. **Digital Ocean Infrastructure Testing**
4. **GitHub Actions CI/CD Testing**
5. **Production Deployment Testing**
6. **Monitoring & Alerting Testing**
7. **Backup & Recovery Testing**
8. **Security & Performance Testing**
9. **Rollback & Disaster Recovery Testing**

---

## 🔧 Phase 1: Prerequisites & Setup Validation

### 1.1 CLI Tools Installation Test
```bash
# Test doctl installation and authentication
make install-tools
doctl version
doctl auth switch --context thappy || echo "❌ Need to run: doctl auth init --context thappy"

# Test GitHub CLI
gh version
gh auth status || echo "❌ Need to run: gh auth login"

# Test Docker
docker version
docker-compose version

# Expected Results:
✅ All tools installed and working
✅ Authentication configured
✅ No version conflicts
```

### 1.2 Project Setup Test
```bash
# Test project initialization
make setup
make env-check

# Test dependency installation
make install-deps

# Expected Results:
✅ .env file created
✅ Dependencies installed
✅ Development tools available
```

---

## 🔧 Phase 2: Local Development Testing

### 2.1 Local Build Test
```bash
# Test local development environment
make dev-local &
DEV_PID=$!
sleep 10

# Test backend health
curl http://localhost:8081/health
curl_code=$?

# Test frontend
curl -I http://localhost:3004
frontend_code=$?

# Cleanup
kill $DEV_PID 2>/dev/null

# Expected Results:
✅ Backend starts on port 8081
✅ Frontend starts on port 3004
✅ Health endpoint responds
✅ No port conflicts
```

### 2.2 Docker Build Test
```bash
# Test Docker builds locally
make docker-build

# Test production compose
make prod &
PROD_PID=$!
sleep 30

# Test services
docker ps | grep thappy
curl http://localhost:8081/health

# Cleanup
make prod-stop

# Expected Results:
✅ Docker images build successfully
✅ All containers start
✅ Services respond correctly
✅ No build errors
```

### 2.3 Code Quality Pipeline Test
```bash
# Test CI pipeline locally
make ci

# Expected Results:
✅ Format check passes
✅ Linting passes
✅ Type checking passes
✅ All tests pass
```

---

## 🌊 Phase 3: Digital Ocean Infrastructure Testing

### 3.1 Authentication & Context Test
```bash
# Test DO authentication
make do-setup

# Expected Results:
✅ Context switches to 'thappy'
✅ Can list resources
✅ No authentication errors
```

### 3.2 Droplet Creation Test
```bash
# Test droplet creation (THIS COSTS MONEY - BE CAREFUL)
make do-create-droplet

# Wait for completion and test
sleep 60
make do-status

# Test SSH access
make do-ssh "echo 'SSH test successful'"

# Expected Results:
✅ Droplet created successfully
✅ SSH access works
✅ Correct region and size
✅ Public IP assigned
```

### 3.3 Server Setup Test
```bash
# Test server configuration
make setup-server

# Verify installation via SSH
make do-ssh "docker --version && docker-compose --version"
make do-ssh "systemctl status docker"
make do-ssh "ufw status"

# Expected Results:
✅ Docker installed and running
✅ UFW firewall configured
✅ Required directories created
✅ Backup scripts installed
```

### 3.4 Firewall Test
```bash
# Test firewall setup
make do-firewall-setup

# Verify firewall rules
doctl compute firewall list --context thappy

# Test connectivity
DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context thappy | grep thappy-prod | awk '{print $1}')
nmap -p 22,80,443,8081 $DROPLET_IP

# Expected Results:
✅ Firewall created and applied
✅ Required ports open
✅ Unnecessary ports closed
```

---

## 🐙 Phase 4: GitHub Actions CI/CD Testing

### 4.1 Secrets Configuration Test
```bash
# Test secrets setup
make gh-setup-secrets

# Verify secrets
make gh-list-secrets

# Expected Results:
✅ All required secrets configured
✅ DO_ACCESS_TOKEN set
✅ SSH keys configured
✅ Database credentials set
```

### 4.2 GitHub Environment Test
```bash
# Test environment creation
make gh-create-environment

# Verify environments
make gh-environments

# Expected Results:
✅ Production environment created
✅ Protection rules applied
✅ Required reviewers set
```

### 4.3 Manual Workflow Trigger Test
```bash
# Test manual deployment trigger
make gh-deploy

# Watch deployment
make gh-deploy-watch

# Check logs
make gh-deploy-logs

# Expected Results:
✅ Workflow triggers successfully
✅ All jobs pass
✅ Deployment completes
✅ Logs show no errors
```

### 4.4 Automatic Trigger Test
```bash
# Test git push trigger
echo "# CI/CD Test $(date)" >> TEST.md
git add TEST.md
git commit -m "test: trigger CI/CD pipeline"
git push origin main

# Monitor deployment
make gh-deploy-watch

# Expected Results:
✅ Push triggers workflow
✅ Tests run successfully
✅ Deployment executes
✅ Status updates correctly
```

---

## 🚀 Phase 5: Production Deployment Testing

### 5.1 Full Deployment Test
```bash
# Complete deployment test
make deploy

# Verify deployment
DROPLET_IP=$(doctl compute droplet list --format PublicIPv4,Name --no-header --context thappy | grep thappy-prod | awk '{print $1}')

# Test all services
curl http://$DROPLET_IP:8081/health
curl -I http://$DROPLET_IP/
curl -I http://$DROPLET_IP/health

# Expected Results:
✅ All containers running
✅ Backend API responding
✅ Frontend serving
✅ Database connected
```

### 5.2 Container Health Test
```bash
# Test container status
make do-ssh "docker ps"
make do-ssh "docker stats --no-stream"

# Test health checks
make do-ssh "docker inspect thappy-backend-prod | grep Health -A 10"

# Expected Results:
✅ All containers healthy
✅ Resource usage normal
✅ Health checks passing
```

### 5.3 Database Migration Test
```bash
# Test database setup
make do-ssh "docker exec thappy-postgres-prod psql -U thappy -d thappy -c '\dt'"

# Test database connectivity
curl http://$DROPLET_IP:8081/api/health

# Expected Results:
✅ Database tables exist
✅ Migrations applied
✅ API connects to DB
```

### 5.4 Application Functionality Test
```bash
# Test API endpoints
curl -X GET http://$DROPLET_IP:8081/api/articles
curl -X GET http://$DROPLET_IP:8081/api/therapists

# Test frontend routes
curl -I http://$DROPLET_IP/articles
curl -I http://$DROPLET_IP/therapists

# Expected Results:
✅ API endpoints respond
✅ Frontend routes work
✅ Data loads correctly
```

---

## 📊 Phase 6: Monitoring & Alerting Testing

### 6.1 Monitoring Dashboard Test
```bash
# Test monitoring scripts
./deploy/monitor.sh
./deploy/status.sh

# Test make commands
make monitor
make deploy-status
make deploy-health

# Expected Results:
✅ All status checks pass
✅ Resource usage displayed
✅ Health indicators correct
✅ No critical alerts
```

### 6.2 Log Aggregation Test
```bash
# Test log access
make do-logs
make prod-logs

# Test log rotation
make do-ssh "ls -la /opt/thappy/logs/"

# Expected Results:
✅ Logs accessible
✅ Log rotation working
✅ No disk space issues
```

### 6.3 Health Check Test
```bash
# Test health endpoints
make deploy-health

# Test automated health checks
make do-ssh "cat /opt/thappy/logs/health-check.log"

# Simulate failure and recovery
make do-ssh "docker stop thappy-backend-prod"
sleep 30
make deploy-health
make do-ssh "docker start thappy-backend-prod"

# Expected Results:
✅ Health checks detect issues
✅ Automated recovery works
✅ Alerts generated
```

---

## 💾 Phase 7: Backup & Recovery Testing

### 7.1 Backup Creation Test
```bash
# Test full backup
make backup

# Verify backups created
make do-ssh "ls -la /opt/thappy/backups/"

# Test database backup
make db-backup

# Expected Results:
✅ Database backup created
✅ Application backup created
✅ Snapshot created
✅ Old backups cleaned up
```

### 7.2 Backup Restoration Test
```bash
# Test database restore
BACKUP_FILE=$(make do-ssh "ls -t /opt/thappy/backups/thappy-db-*.sql.gz | head -1")
make db-restore

# Test snapshot restore (create test droplet)
SNAPSHOT_ID=$(doctl compute snapshot list --resource droplet --context thappy --format ID,Name --no-header | grep thappy | head -1 | awk '{print $1}')
doctl compute droplet create thappy-test \
  --image $SNAPSHOT_ID \
  --size s-1vcpu-1gb \
  --region fra1 \
  --context thappy

# Expected Results:
✅ Database restores successfully
✅ Snapshot restoration works
✅ No data loss
✅ Applications start correctly
```

---

## 🔒 Phase 8: Security & Performance Testing

### 8.1 Security Test
```bash
# Test firewall rules
nmap -p 1-1000 $DROPLET_IP

# Test SSL configuration (if configured)
curl -I https://$DROPLET_IP

# Test fail2ban
make do-ssh "fail2ban-client status"

# Expected Results:
✅ Only required ports open
✅ SSL working (if configured)
✅ Fail2ban active
✅ No security vulnerabilities
```

### 8.2 Performance Test
```bash
# Load test backend
for i in {1..100}; do
  curl -s http://$DROPLET_IP:8081/health > /dev/null &
done
wait

# Monitor resources during load
make do-ssh "top -b -n 1"

# Expected Results:
✅ API handles concurrent requests
✅ Resource usage acceptable
✅ No memory leaks
✅ Response times reasonable
```

---

## 🔄 Phase 9: Rollback & Disaster Recovery Testing

### 9.1 Rollback Test
```bash
# Create a test change
echo "console.log('Rollback test');" >> frontend/src/App.tsx
git add . && git commit -m "test: rollback test change"
git push origin main

# Wait for deployment
make gh-deploy-watch

# Test rollback
make deploy-rollback

# Verify rollback
make gh-deploy-watch

# Expected Results:
✅ Rollback triggers successfully
✅ Previous version deployed
✅ Services remain available
✅ No data loss
```

### 9.2 Disaster Recovery Test
```bash
# Simulate container failure
make do-ssh "docker stop thappy-backend-prod"

# Test recovery
make deploy-health
sleep 60
make deploy-health

# Simulate database failure
make do-ssh "docker stop thappy-postgres-prod"
make deploy-health

# Manual recovery
make do-ssh "docker start thappy-postgres-prod"

# Expected Results:
✅ Automatic recovery works
✅ Health checks detect issues
✅ Manual recovery possible
✅ Data integrity maintained
```

---

## 📋 Test Execution Checklist

### Pre-Test Setup
- [ ] All CLI tools installed (`doctl`, `gh`, `docker`)
- [ ] Authentication configured
- [ ] Test environment prepared
- [ ] Budget limits set for DO resources

### Phase 1: Prerequisites
- [ ] CLI tools working
- [ ] Project setup complete
- [ ] Dependencies installed

### Phase 2: Local Development
- [ ] Local builds work
- [ ] Docker builds successful
- [ ] CI pipeline passes locally

### Phase 3: Infrastructure
- [ ] DO authentication works
- [ ] Droplet creation successful
- [ ] Server setup complete
- [ ] Firewall configured

### Phase 4: GitHub Actions
- [ ] Secrets configured
- [ ] Environment created
- [ ] Manual triggers work
- [ ] Automatic triggers work

### Phase 5: Production Deployment
- [ ] Full deployment successful
- [ ] All containers healthy
- [ ] Database migrations applied
- [ ] Application functional

### Phase 6: Monitoring
- [ ] Monitoring dashboards work
- [ ] Logs accessible
- [ ] Health checks functional

### Phase 7: Backup & Recovery
- [ ] Backups created successfully
- [ ] Restoration tested
- [ ] Data integrity verified

### Phase 8: Security & Performance
- [ ] Security measures active
- [ ] Performance acceptable
- [ ] Load testing passed

### Phase 9: Rollback & Disaster Recovery
- [ ] Rollback functional
- [ ] Disaster recovery tested
- [ ] Business continuity maintained

---

## 🚨 Test Failure Scenarios

### Common Issues & Solutions

#### Authentication Failures
```bash
# Fix DO auth
doctl auth init --context thappy

# Fix GitHub auth
gh auth login --scopes repo,workflow
```

#### Container Start Failures
```bash
# Check logs
make do-logs

# Check resources
make do-ssh "free -h && df -h"

# Restart services
make do-ssh "cd /opt/thappy && docker-compose -f docker-compose.production.yml restart"
```

#### Network Connectivity Issues
```bash
# Check firewall
doctl compute firewall list --context thappy

# Check DNS
nslookup $DROPLET_IP

# Check ports
nmap -p 80,443,8081 $DROPLET_IP
```

---

## 🎯 Success Criteria

### Overall Pipeline Health
- ✅ **100% automated deployment** from git push
- ✅ **Zero-downtime deployments** achieved
- ✅ **Complete monitoring coverage**
- ✅ **Backup/restore verified**
- ✅ **Security controls active**
- ✅ **Rollback capability proven**

### Performance Benchmarks
- ✅ **Deployment time**: < 10 minutes
- ✅ **Health check response**: < 2 seconds
- ✅ **Recovery time**: < 5 minutes
- ✅ **Backup completion**: < 15 minutes

### Reliability Targets
- ✅ **99.9% uptime** during deployments
- ✅ **Zero data loss** during rollbacks
- ✅ **100% backup success rate**
- ✅ **Automated recovery** for common failures

---

## 📊 Test Report Template

```bash
# Generate test report
cat > CICD_TEST_REPORT.md << EOF
# CI/CD Pipeline Test Report

**Date**: $(date)
**Tester**: $(whoami)
**Environment**: Production

## Test Results Summary
- Prerequisites: ✅/❌
- Local Development: ✅/❌
- Infrastructure: ✅/❌
- GitHub Actions: ✅/❌
- Production Deployment: ✅/❌
- Monitoring: ✅/❌
- Backup/Recovery: ✅/❌
- Security: ✅/❌
- Rollback: ✅/❌

## Performance Metrics
- Deployment Time: X minutes
- Health Check Response: X seconds
- Recovery Time: X minutes

## Issues Found
1. [Issue description]
2. [Issue description]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Overall Assessment: PASS/FAIL
EOF
```

---

**🎯 Remember**: Test in phases, document everything, and clean up test resources to avoid unexpected costs!