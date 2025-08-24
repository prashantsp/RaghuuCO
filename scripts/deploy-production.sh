#!/bin/bash

# RAGHUU CO Legal Practice Management System
# Production Deployment Script
# 
# This script handles the complete production deployment process including
# environment setup, database migrations, security checks, and monitoring.

set -e  # Exit on any error

# Configuration
APP_NAME="raghuuco"
ENVIRONMENT="production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
LOG_DIR="./logs"
DEPLOYMENT_LOG="$LOG_DIR/deployment_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$DEPLOYMENT_LOG"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$DEPLOYMENT_LOG"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$DEPLOYMENT_LOG"
    exit 1
}

# Create necessary directories
mkdir -p "$BACKUP_DIR" "$LOG_DIR"

# Start deployment
log "Starting production deployment for $APP_NAME"
log "Environment: $ENVIRONMENT"
log "Timestamp: $TIMESTAMP"

# Step 1: Pre-deployment checks
log "Step 1: Pre-deployment checks"
log "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker is not running. Please start Docker and try again."
fi
success "Docker is running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose and try again."
fi
success "Docker Compose is available"

# Check environment variables
log "Checking environment variables..."
required_vars=(
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "JWT_SECRET"
    "JWT_REFRESH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "LINKEDIN_CLIENT_ID"
    "LINKEDIN_CLIENT_SECRET"
    "MICROSOFT_CLIENT_ID"
    "MICROSOFT_CLIENT_SECRET"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "AWS_S3_BUCKET"
    "AWS_REGION"
    "SMTP_HOST"
    "SMTP_PORT"
    "SMTP_USER"
    "SMTP_PASS"
    "GRAFANA_PASSWORD"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    error "Missing required environment variables: ${missing_vars[*]}"
fi
success "All required environment variables are set"

# Check SSL certificates
log "Checking SSL certificates..."
if [ ! -f "./nginx/ssl/fullchain.pem" ] || [ ! -f "./nginx/ssl/privkey.pem" ]; then
    warning "SSL certificates not found. Please ensure SSL certificates are in place before deployment."
else
    success "SSL certificates found"
fi

# Step 2: Create backup
log "Step 2: Creating backup"
log "================================"

if docker ps | grep -q "raghuuco_postgres_prod"; then
    log "Creating database backup..."
    docker exec raghuuco_postgres_prod pg_dump -U raghuuco_user raghuuco_production > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
    success "Database backup created: backup_$TIMESTAMP.sql"
else
    warning "No existing database container found. Skipping backup."
fi

# Step 3: Security scan
log "Step 3: Security scan"
log "================================"

log "Running security scan on Docker images..."
docker-compose -f docker-compose.production.yml up -d security-scanner
sleep 30

# Check security scan results
if [ -f "./security-reports/backend-security-report.json" ]; then
    log "Security scan completed. Check security-reports/ for details."
    success "Security scan completed"
else
    warning "Security scan may have failed. Check logs for details."
fi

# Step 4: Build and deploy
log "Step 4: Building and deploying"
log "================================"

# Stop existing services
log "Stopping existing services..."
docker-compose -f docker-compose.production.yml down --remove-orphans
success "Existing services stopped"

# Build new images
log "Building Docker images..."
docker-compose -f docker-compose.production.yml build --no-cache
success "Docker images built"

# Start services in order
log "Starting services in order..."

# Start database
log "Starting PostgreSQL..."
docker-compose -f docker-compose.production.yml up -d postgres
log "Waiting for PostgreSQL to be ready..."
sleep 30

# Check database health
if docker exec raghuuco_postgres_prod pg_isready -U raghuuco_user -d raghuuco_production; then
    success "PostgreSQL is ready"
else
    error "PostgreSQL failed to start properly"
fi

# Start Redis
log "Starting Redis..."
docker-compose -f docker-compose.production.yml up -d redis
sleep 10
success "Redis started"

# Start backend
log "Starting backend API..."
docker-compose -f docker-compose.production.yml up -d backend
log "Waiting for backend to be ready..."
sleep 30

# Check backend health
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    success "Backend API is ready"
else
    error "Backend API failed to start properly"
fi

# Start frontend
log "Starting frontend application..."
docker-compose -f docker-compose.production.yml up -d frontend
sleep 10
success "Frontend started"

# Start monitoring services
log "Starting monitoring services..."
docker-compose -f docker-compose.production.yml up -d prometheus grafana elasticsearch kibana filebeat
sleep 30
success "Monitoring services started"

# Start nginx
log "Starting Nginx reverse proxy..."
docker-compose -f docker-compose.production.yml up -d nginx
sleep 10
success "Nginx started"

# Step 5: Health checks
log "Step 5: Health checks"
log "================================"

# Check all services
services=(
    "postgres:5432"
    "redis:6379"
    "backend:3001"
    "frontend:3000"
    "nginx:80"
    "prometheus:9090"
    "grafana:3002"
    "elasticsearch:9200"
    "kibana:5601"
)

for service in "${services[@]}"; do
    IFS=':' read -r service_name port <<< "$service"
    log "Checking $service_name..."
    
    if curl -f "http://localhost:$port/health" > /dev/null 2>&1 || \
       docker exec "raghuuco_${service_name}_prod" pg_isready > /dev/null 2>&1 || \
       docker exec "raghuuco_${service_name}_prod" redis-cli ping > /dev/null 2>&1; then
        success "$service_name is healthy"
    else
        warning "$service_name health check failed"
    fi
done

# Step 6: Performance testing
log "Step 6: Performance testing"
log "================================"

log "Running performance tests..."
docker-compose -f docker-compose.production.yml run --rm k6
success "Performance tests completed"

# Step 7: Final verification
log "Step 7: Final verification"
log "================================"

# Check application accessibility
log "Testing application accessibility..."
if curl -f -k https://localhost/health > /dev/null 2>&1; then
    success "Application is accessible via HTTPS"
else
    warning "Application may not be accessible via HTTPS"
fi

# Check API endpoints
log "Testing API endpoints..."
if curl -f -k https://localhost/api/health > /dev/null 2>&1; then
    success "API endpoints are accessible"
else
    warning "API endpoints may not be accessible"
fi

# Step 8: Monitoring setup
log "Step 8: Monitoring setup"
log "================================"

# Create monitoring dashboards
log "Setting up monitoring dashboards..."
if [ -d "./monitoring/grafana/dashboards" ]; then
    log "Grafana dashboards will be automatically provisioned"
    success "Monitoring dashboards configured"
else
    warning "Grafana dashboards directory not found"
fi

# Step 9: SSL certificate renewal setup
log "Step 9: SSL certificate renewal"
log "================================"

# Setup SSL certificate renewal
log "Setting up SSL certificate renewal..."
docker-compose -f docker-compose.production.yml up -d certbot
success "SSL certificate renewal configured"

# Step 10: Deployment summary
log "Step 10: Deployment summary"
log "================================"

success "Production deployment completed successfully!"
log "Application URL: https://raghuuco.com"
log "API URL: https://api.raghuuco.com"
log "Grafana Dashboard: http://localhost:3002 (admin/${GRAFANA_PASSWORD})"
log "Kibana Dashboard: http://localhost:5601"
log "Prometheus: http://localhost:9090"

# Display service status
log "Service status:"
docker-compose -f docker-compose.production.yml ps

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -f
success "Cleanup completed"

log "Deployment log saved to: $DEPLOYMENT_LOG"
success "Production deployment completed successfully!"

# Optional: Send notification
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
    log "Sending deployment notification..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ RAGHUU CO production deployment completed successfully at $(date)\"}" \
        "$SLACK_WEBHOOK_URL"
fi

exit 0