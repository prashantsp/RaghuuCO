# Deployment Guide
## RAGHUU CO Legal Practice Management System

### Document Version: 1.0
### Date: January 15, 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Application Deployment](#application-deployment)
- [SSL Configuration](#ssl-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Backup Configuration](#backup-configuration)
- [Security Hardening](#security-hardening)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## 🎯 Overview

This guide provides comprehensive instructions for deploying the RAGHUU CO Legal Practice Management System in various environments. The system supports multiple deployment scenarios including development, staging, and production environments.

### **Deployment Scenarios:**
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment
- **Docker**: Containerized deployment
- **Cloud**: Cloud platform deployment (AWS, Azure, GCP)

### **System Architecture:**
- **Frontend**: React application with PWA capabilities
- **Backend**: Node.js API server
- **Database**: PostgreSQL with full-text search
- **Cache**: Redis for session and data caching
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Security**: JWT authentication, RBAC, audit logging

---

## 🔧 Prerequisites

### **System Requirements**

#### **Minimum Requirements**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or Windows Server 2019+

#### **Recommended Requirements**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: 100Mbps+ internet connection

### **Software Dependencies**

#### **Required Software**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 2.30+
- **Node.js**: 18.x+ (for development)
- **PostgreSQL**: 14+ (for manual setup)
- **Redis**: 7+ (for manual setup)

#### **Optional Software**
- **Nginx**: 1.20+ (for manual setup)
- **Certbot**: For SSL certificate management
- **Prometheus**: For monitoring
- **Grafana**: For visualization

### **Network Requirements**
- **Ports**: 80, 443, 3000, 3001, 5432, 6379
- **Firewall**: Configure firewall rules
- **DNS**: Domain name configuration
- **SSL**: SSL certificate management

---

## 🛠 Environment Setup

### **1. Server Preparation**

#### **Ubuntu/Debian Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL (for manual setup)
sudo apt install postgresql postgresql-contrib -y

# Install Redis (for manual setup)
sudo apt install redis-server -y

# Install Nginx (for manual setup)
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y
```

#### **CentOS/RHEL Setup**
```bash
# Update system
sudo yum update -y

# Install essential packages
sudo yum install -y curl wget git unzip

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Redis
sudo yum install redis -y
sudo systemctl start redis
sudo systemctl enable redis

# Install Nginx
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### **Windows Server Setup**
```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install docker-desktop -y

# Install Node.js
choco install nodejs -y

# Install Git
choco install git -y

# Install PostgreSQL
choco install postgresql -y

# Install Redis
choco install redis-64 -y
```

### **2. Firewall Configuration**

#### **Ubuntu/Debian (UFW)**
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application ports
sudo ufw allow 3000
sudo ufw allow 3001

# Allow database ports (if external access needed)
sudo ufw allow 5432
sudo ufw allow 6379

# Check status
sudo ufw status
```

#### **CentOS/RHEL (Firewalld)**
```bash
# Start and enable firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Allow services
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow ports
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --permanent --add-port=6379/tcp

# Reload firewall
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-all
```

### **3. Domain and DNS Setup**

#### **Domain Configuration**
```bash
# Add A record for your domain
# Example: raghuuco.com -> YOUR_SERVER_IP

# Add CNAME record for www subdomain
# Example: www.raghuuco.com -> raghuuco.com

# Add MX record for email (if using custom email)
# Example: MX -> mail.raghuuco.com (priority 10)

# Add TXT record for SSL verification
# Example: TXT -> "verification=your_verification_code"
```

#### **DNS Verification**
```bash
# Check DNS propagation
nslookup raghuuco.com
dig raghuuco.com

# Check MX records
dig MX raghuuco.com

# Check TXT records
dig TXT raghuuco.com
```

---

## 🗄 Database Setup

### **1. PostgreSQL Setup (Manual)**

#### **Installation and Configuration**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE raghuuco;
CREATE USER raghuuco_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE raghuuco TO raghuuco_user;
ALTER USER raghuuco_user CREATEDB;

# Enable required extensions
\c raghuuco
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

# Exit PostgreSQL
\q
```

#### **Configuration File**
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add/modify these settings:
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
min_wal_size = 1GB
max_wal_size = 4GB

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Add these lines:
host    raghuuco         raghuuco_user     127.0.0.1/32            md5
host    raghuuco         raghuuco_user     ::1/128                 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **2. Redis Setup (Manual)**

#### **Installation and Configuration**
```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf

# Modify these settings:
bind 127.0.0.1
port 6379
requirepass your_redis_password
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Restart Redis
sudo systemctl restart redis

# Test Redis connection
redis-cli -a your_redis_password ping
```

### **3. Database Migration**

#### **Run Migrations**
```bash
# Navigate to project directory
cd /path/to/raghuuco

# Install dependencies
npm install

# Run database migrations
npm run migrate

# Seed initial data (optional)
npm run seed
```

#### **Migration Scripts**
```bash
#!/bin/bash
# migrate.sh

echo "Starting database migration..."

# Check if database is accessible
pg_isready -h localhost -p 5432 -U raghuuco_user -d raghuuco

if [ $? -eq 0 ]; then
    echo "Database is accessible"
    
    # Run migrations
    npm run migrate
    
    if [ $? -eq 0 ]; then
        echo "Migration completed successfully"
    else
        echo "Migration failed"
        exit 1
    fi
else
    echo "Database is not accessible"
    exit 1
fi
```

---

## 🚀 Application Deployment

### **1. Docker Deployment (Recommended)**

#### **Production Deployment**
```bash
# Clone repository
git clone https://github.com/raghuuco/legal-practice-management.git
cd legal-practice-management

# Create environment file
cp .env.example .env
nano .env

# Deploy with Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

#### **Staging Deployment**
```bash
# Deploy staging environment
docker-compose -f docker-compose.staging.yml up -d

# Run tests
docker-compose -f docker-compose.staging.yml exec backend npm test
docker-compose -f docker-compose.staging.yml exec frontend npm test

# Run load tests
docker-compose -f docker-compose.staging.yml run k6-staging
```

#### **Development Deployment**
```bash
# Deploy development environment
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
# Redis: localhost:6379
```

### **2. Manual Deployment**

#### **Backend Deployment**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build application
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://raghuuco_user:password@localhost:5432/raghuuco
export REDIS_URL=redis://:password@localhost:6379
export JWT_SECRET=your_jwt_secret
export JWT_REFRESH_SECRET=your_refresh_secret

# Start application
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### **Frontend Deployment**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve with Nginx
sudo cp -r build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
```

### **3. Cloud Deployment**

#### **AWS Deployment**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure

# Deploy to ECS
aws ecs create-cluster --cluster-name raghuuco-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster raghuuco-cluster --service-name raghuuco-service --task-definition raghuuco-task:1
```

#### **Azure Deployment**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name raghuuco-rg --location eastus

# Deploy with Azure Container Instances
az container create --resource-group raghuuco-rg --name raghuuco-container --image raghuuco/app:latest --ports 3000 3001
```

#### **Google Cloud Deployment**
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize Google Cloud
gcloud init

# Deploy to Cloud Run
gcloud run deploy raghuuco-backend --source . --platform managed --region us-central1 --allow-unauthenticated
gcloud run deploy raghuuco-frontend --source . --platform managed --region us-central1 --allow-unauthenticated
```

---

## 🔒 SSL Configuration

### **1. Let's Encrypt SSL (Recommended)**

#### **Automatic SSL Setup**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d raghuuco.com -d www.raghuuco.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e

# Add this line for daily renewal check:
0 12 * * * /usr/bin/certbot renew --quiet
```

#### **Manual SSL Setup**
```bash
# Generate SSL certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/raghuuco.key \
  -out /etc/ssl/certs/raghuuco.crt \
  -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=RAGHUU CO/CN=raghuuco.com"

# Configure Nginx SSL
sudo nano /etc/nginx/sites-available/raghuuco

# Add SSL configuration:
server {
    listen 443 ssl http2;
    server_name raghuuco.com www.raghuuco.com;
    
    ssl_certificate /etc/ssl/certs/raghuuco.crt;
    ssl_certificate_key /etc/ssl/private/raghuuco.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/raghuuco /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **2. SSL Certificate Management**

#### **Certificate Renewal**
```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/raghuuco.crt -text -noout | grep "Not After"

# Renew Let's Encrypt certificate
sudo certbot renew

# Restart Nginx after renewal
sudo systemctl reload nginx
```

#### **SSL Security Configuration**
```bash
# Generate strong Diffie-Hellman parameters
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Configure SSL security in Nginx
sudo nano /etc/nginx/sites-available/raghuuco

# Add these SSL settings:
ssl_dhparam /etc/ssl/certs/dhparam.pem;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
```

---

## 📊 Monitoring Setup

### **1. Prometheus Configuration**

#### **Installation and Setup**
```bash
# Create Prometheus user
sudo useradd --no-create-home --shell /bin/false prometheus

# Download Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
tar xvf prometheus-2.45.0.linux-amd64.tar.gz
sudo cp prometheus-2.45.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-2.45.0.linux-amd64/promtool /usr/local/bin/

# Create directories
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus

# Copy configuration
sudo cp prometheus-2.45.0.linux-amd64/prometheus.yml /etc/prometheus/
sudo chown -R prometheus:prometheus /etc/prometheus
sudo chown -R prometheus:prometheus /var/lib/prometheus

# Create systemd service
sudo nano /etc/systemd/system/prometheus.service

# Add service configuration:
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.listen-address=0.0.0.0:9090

[Install]
WantedBy=multi-user.target

# Start Prometheus
sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus
```

#### **Prometheus Configuration**
```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - localhost:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'raghuuco-backend'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### **2. Grafana Setup**

#### **Installation and Configuration**
```bash
# Install Grafana
sudo apt-get install -y apt-transport-https
sudo apt-get install -y software-properties-common wget
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access Grafana
# URL: http://your-server-ip:3000
# Default credentials: admin/admin
```

#### **Dashboard Configuration**
```bash
# Import dashboards
# 1. Go to Grafana UI
# 2. Click on "+" icon
# 3. Select "Import"
# 4. Upload dashboard JSON files

# Create data sources
# 1. Go to Configuration > Data Sources
# 2. Add Prometheus data source
# 3. URL: http://localhost:9090
# 4. Access: Server (default)
```

### **3. ELK Stack Setup**

#### **Elasticsearch Installation**
```bash
# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update
sudo apt install elasticsearch

# Configure Elasticsearch
sudo nano /etc/elasticsearch/elasticsearch.yml

# Add/modify:
cluster.name: raghuuco-cluster
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: localhost
http.port: 9200
discovery.type: single-node

# Start Elasticsearch
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
```

#### **Kibana Installation**
```bash
# Install Kibana
sudo apt install kibana

# Configure Kibana
sudo nano /etc/kibana/kibana.yml

# Add/modify:
server.port: 5601
server.host: "localhost"
elasticsearch.hosts: ["http://localhost:9200"]

# Start Kibana
sudo systemctl start kibana
sudo systemctl enable kibana
```

#### **Filebeat Installation**
```bash
# Install Filebeat
sudo apt install filebeat

# Configure Filebeat
sudo nano /etc/filebeat/filebeat.yml

# Add configuration:
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/raghuuco/*.log
  fields:
    service: raghuuco
  fields_under_root: true

output.elasticsearch:
  hosts: ["localhost:9200"]

# Start Filebeat
sudo systemctl start filebeat
sudo systemctl enable filebeat
```

---

## 💾 Backup Configuration

### **1. Database Backup**

#### **Automated Backup Script**
```bash
#!/bin/bash
# backup.sh

# Configuration
BACKUP_DIR="/backups"
DB_NAME="raghuuco"
DB_USER="raghuuco_user"
DB_HOST="localhost"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/raghuuco_$(date +%Y%m%d_%H%M%S).sql"

# Create database backup
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "Backup completed: $BACKUP_FILE.gz" >> /var/log/backup.log
```

#### **Backup Scheduling**
```bash
# Add to crontab
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly full backup
0 2 * * 0 /path/to/full_backup.sh
```

### **2. File Backup**

#### **Application Files Backup**
```bash
#!/bin/bash
# file_backup.sh

# Configuration
BACKUP_DIR="/backups/files"
APP_DIR="/var/www/raghuuco"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate backup filename
BACKUP_FILE="$BACKUP_DIR/raghuuco_files_$(date +%Y%m%d_%H%M%S).tar.gz"

# Create file backup
tar -czf $BACKUP_FILE -C $APP_DIR .

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "File backup completed: $BACKUP_FILE" >> /var/log/backup.log
```

### **3. Cloud Backup**

#### **AWS S3 Backup**
```bash
#!/bin/bash
# s3_backup.sh

# Configuration
S3_BUCKET="raghuuco-backups"
BACKUP_DIR="/backups"

# Upload database backup
aws s3 sync $BACKUP_DIR s3://$S3_BUCKET/database/

# Upload file backup
aws s3 sync /var/www/raghuuco s3://$S3_BUCKET/files/

# Clean up old backups in S3
aws s3 ls s3://$S3_BUCKET/database/ | awk '{print $4}' | head -n -7 | xargs -I {} aws s3 rm s3://$S3_BUCKET/database/{}
```

---

## 🔐 Security Hardening

### **1. System Security**

#### **User Security**
```bash
# Create dedicated user for application
sudo useradd -r -s /bin/false raghuuco

# Set up SSH key authentication
mkdir ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Disable password authentication
sudo nano /etc/ssh/sshd_config

# Add/modify:
PasswordAuthentication no
PermitRootLogin no
AllowUsers your_username

# Restart SSH
sudo systemctl restart sshd
```

#### **Firewall Configuration**
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status verbose
```

### **2. Application Security**

#### **Environment Variables**
```bash
# Create secure environment file
sudo nano /etc/raghuuco/.env

# Add secure configuration:
NODE_ENV=production
DATABASE_URL=postgresql://raghuuco_user:secure_password@localhost:5432/raghuuco
REDIS_URL=redis://:secure_redis_password@localhost:6379
JWT_SECRET=your_very_long_and_secure_jwt_secret_key
JWT_REFRESH_SECRET=your_very_long_and_secure_refresh_secret_key
SESSION_SECRET=your_very_long_and_secure_session_secret

# Set proper permissions
sudo chmod 600 /etc/raghuuco/.env
sudo chown raghuuco:raghuuco /etc/raghuuco/.env
```

#### **SSL/TLS Configuration**
```bash
# Generate strong SSL parameters
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 4096

# Configure SSL security headers
sudo nano /etc/nginx/sites-available/raghuuco

# Add security headers:
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
```

### **3. Database Security**

#### **PostgreSQL Security**
```bash
# Edit PostgreSQL configuration
sudo nano /etc/postgresql/14/main/postgresql.conf

# Add security settings:
ssl = on
ssl_cert_file = '/etc/ssl/certs/raghuuco.crt'
ssl_key_file = '/etc/ssl/private/raghuuco.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on

# Configure authentication
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Restrict connections:
local   all             postgres                                peer
local   raghuuco        raghuuco_user                          md5
host    raghuuco        raghuuco_user          127.0.0.1/32    md5
host    all             all                     0.0.0.0/0       reject
```

---

## 🔧 Troubleshooting

### **1. Common Issues**

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U raghuuco_user -d raghuuco

# Check logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Common solutions:
# 1. Restart PostgreSQL: sudo systemctl restart postgresql
# 2. Check firewall: sudo ufw status
# 3. Verify credentials in .env file
# 4. Check pg_hba.conf configuration
```

#### **Application Startup Issues**
```bash
# Check application logs
docker-compose logs backend
docker-compose logs frontend

# Check system resources
htop
df -h
free -h

# Check port availability
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Common solutions:
# 1. Check environment variables
# 2. Verify database connectivity
# 3. Check disk space
# 4. Restart containers: docker-compose restart
```

#### **SSL Certificate Issues**
```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/raghuuco.crt -text -noout

# Test SSL connection
openssl s_client -connect raghuuco.com:443 -servername raghuuco.com

# Check Nginx configuration
sudo nginx -t

# Common solutions:
# 1. Renew certificate: sudo certbot renew
# 2. Check domain DNS settings
# 3. Verify Nginx configuration
# 4. Restart Nginx: sudo systemctl reload nginx
```

### **2. Performance Issues**

#### **Database Performance**
```bash
# Check slow queries
sudo tail -f /var/log/postgresql/postgresql-14-main.log | grep "duration:"

# Analyze database performance
psql -U raghuuco_user -d raghuuco -c "SELECT * FROM pg_stat_activity;"
psql -U raghuuco_user -d raghuuco -c "SELECT * FROM pg_stat_database;"

# Optimize database
psql -U raghuuco_user -d raghuuco -c "VACUUM ANALYZE;"
psql -U raghuuco_user -d raghuuco -c "REINDEX DATABASE raghuuco;"
```

#### **Application Performance**
```bash
# Check application metrics
curl http://localhost:3001/metrics

# Monitor system resources
htop
iotop
nethogs

# Check application logs for errors
docker-compose logs --tail=100 backend | grep ERROR
```

### **3. Monitoring and Alerting**

#### **Set Up Alerts**
```bash
# Configure Prometheus alerts
sudo nano /etc/prometheus/alert_rules.yml

# Add alert rules:
groups:
- name: raghuuco_alerts
  rules:
  - alert: HighCPUUsage
    expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is above 80% for 5 minutes"

  - alert: HighMemoryUsage
    expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is above 85% for 5 minutes"

# Reload Prometheus
sudo systemctl reload prometheus
```

---

## 🔄 Maintenance

### **1. Regular Maintenance Tasks**

#### **Daily Tasks**
```bash
#!/bin/bash
# daily_maintenance.sh

# Check system status
echo "=== System Status Check ==="
systemctl status postgresql redis nginx

# Check disk space
echo "=== Disk Space Check ==="
df -h

# Check application logs
echo "=== Application Logs ==="
docker-compose logs --tail=50 backend | grep ERROR

# Backup verification
echo "=== Backup Verification ==="
ls -la /backups/ | tail -5
```

#### **Weekly Tasks**
```bash
#!/bin/bash
# weekly_maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -f

# Database maintenance
psql -U raghuuco_user -d raghuuco -c "VACUUM ANALYZE;"

# Log rotation
sudo logrotate /etc/logrotate.d/raghuuco

# Security updates
sudo unattended-upgrades
```

#### **Monthly Tasks**
```bash
#!/bin/bash
# monthly_maintenance.sh

# Full system backup
./full_backup.sh

# SSL certificate renewal check
certbot certificates

# Performance analysis
./performance_analysis.sh

# Security audit
./security_audit.sh
```

### **2. Update Procedures**

#### **Application Updates**
```bash
# Backup before update
./backup.sh

# Pull latest code
git pull origin main

# Update dependencies
npm install

# Run migrations
npm run migrate

# Restart services
docker-compose restart

# Verify deployment
./health_check.sh
```

#### **System Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Update Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Restart services
sudo systemctl restart postgresql redis nginx
```

### **3. Disaster Recovery**

#### **Recovery Procedures**
```bash
#!/bin/bash
# disaster_recovery.sh

# Stop all services
docker-compose down
sudo systemctl stop postgresql redis nginx

# Restore database
pg_restore -h localhost -U raghuuco_user -d raghuuco /backups/latest_backup.sql

# Restore application files
tar -xzf /backups/latest_files.tar.gz -C /var/www/raghuuco/

# Restart services
sudo systemctl start postgresql redis nginx
docker-compose up -d

# Verify recovery
./health_check.sh
```

---

## 📞 Support

### **Deployment Support**
- **Email**: deployment-support@raghuuco.com
- **Documentation**: https://docs.raghuuco.com/deployment
- **Community Forum**: https://community.raghuuco.com
- **Emergency Contact**: +91-XXXXXXXXXX

### **Useful Commands**
```bash
# Check system status
systemctl status postgresql redis nginx docker

# View logs
docker-compose logs -f
sudo journalctl -u postgresql -f
sudo tail -f /var/log/nginx/error.log

# Monitor resources
htop
df -h
free -h

# Backup database
pg_dump -h localhost -U raghuuco_user -d raghuuco > backup.sql

# Restore database
psql -h localhost -U raghuuco_user -d raghuuco < backup.sql
```

---

**Document Version**: 1.0  
**Last Updated**: January 15, 2025  
**Next Review**: February 15, 2025

**Deployment Status**: Production Ready  
**Security Level**: Enterprise Grade  
**Maintenance Schedule**: Automated