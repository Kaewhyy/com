# E-commerce Platform - Deployment Guide

## AWS Deployment (EC2 + RDS + S3)

### Prerequisites
- AWS account
- AWS CLI configured
- Domain (optional)

### 1. RDS (PostgreSQL)
```bash
# Create RDS PostgreSQL 15 instance
# - Multi-AZ for production
# - Enable encryption
# - Configure security group (port 5432)
# - Note: endpoint, username, password
```

### 2. ElastiCache (Redis)
```bash
# Create Redis cluster
# - Single node for dev, cluster for prod
# - Configure security group
```

### 3. S3 Bucket
```bash
aws s3 mb s3://your-ecommerce-uploads
aws s3api put-bucket-cors --bucket your-ecommerce-uploads --cors-configuration file://cors.json
```

### 4. EC2 Instance
```bash
# Launch Ubuntu 22.04 instance
# - t3.medium minimum for production
# - Attach IAM role with S3, RDS access
# - Security group: 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### 5. Install on EC2
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
```

### 6. Deploy Backend
```bash
cd backend
npm ci --production
npx prisma migrate deploy
npm run build
PORT=3001 node dist/main.js
# Or use PM2: pm2 start dist/main.js --name api
```

### 7. Deploy Web
```bash
cd web
npm ci
npm run build
npm start
# Or: pm2 start npm --name web -- start
```

### 8. Nginx
```bash
sudo apt install nginx
sudo cp nginx.conf /etc/nginx/sites-available/ecommerce
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 9. SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 10. Environment Variables
Create `.env` on server with:
- DATABASE_URL (RDS connection string)
- REDIS_URL (ElastiCache endpoint)
- JWT_SECRET, JWT_REFRESH_SECRET
- AWS credentials for S3
- Stripe/Razorpay keys

## Docker Compose (Single Server)
```bash
docker-compose up -d
```

## Load Testing
Use k6 or Artillery:
```bash
# Example k6 script
k6 run --vus 100 --duration 30s load-test.js
```
