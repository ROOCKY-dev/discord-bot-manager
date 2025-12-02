# AWS Deployment Guide

This guide provides step-by-step instructions for deploying the Discord Bot Manager to Amazon AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Docker installed locally
- Git repository with the project code
- Discord Bot Token
- MySQL database (RDS or self-managed)

## Architecture Overview

The recommended AWS architecture consists of:

1. **EC2 Instance** or **ECS Cluster** - Application server
2. **RDS MySQL** - Managed database
3. **ALB** (Application Load Balancer) - Traffic distribution
4. **CloudWatch** - Logging and monitoring
5. **ECR** (Elastic Container Registry) - Docker image storage

## Option 1: EC2 Deployment (Simple)

### Step 1: Create EC2 Instance

1. Navigate to AWS EC2 Dashboard
2. Click "Launch Instances"
3. Select Amazon Linux 2 or Ubuntu 22.04 LTS
4. Choose instance type (t3.medium recommended for production)
5. Configure security group:
   - Allow SSH (port 22)
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
   - Allow port 3000 (application)

### Step 2: Connect and Setup

```bash
# SSH into your instance
ssh -i your-key.pem ec2-user@your-instance-public-ip

# Update system
sudo yum update -y  # For Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd discord-bot-manager

# Create .env file
cat > .env << EOF
DATABASE_URL=mysql://user:password@rds-endpoint:3306/discord_bot
DISCORD_BOT_TOKEN=your_bot_token
JWT_SECRET=$(openssl rand -hex 32)
VITE_APP_ID=your_app_id
NODE_ENV=production
EOF

# Build and run with Docker Compose
docker-compose up -d
```

### Step 4: Setup Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo yum install nginx -y  # Amazon Linux
# or
sudo apt install nginx -y  # Ubuntu

# Create Nginx config
sudo tee /etc/nginx/conf.d/discord-bot.conf > /dev/null << EOF
upstream discord_bot {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://discord_bot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y  # Amazon Linux
# or
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Option 2: ECS Deployment (Recommended for Production)

### Step 1: Create RDS Database

1. Navigate to RDS Dashboard
2. Click "Create Database"
3. Select MySQL 8.0
4. Configure:
   - DB instance identifier: `discord-bot-db`
   - Master username: `admin`
   - Master password: (generate strong password)
   - Instance class: `db.t3.micro` (or larger)
   - Storage: 20 GB (adjust as needed)
5. Configure security group to allow port 3306 from ECS security group
6. Create database

### Step 2: Create ECR Repository

```bash
# Create repository
aws ecr create-repository --repository-name discord-bot-manager --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t discord-bot-manager:latest .
docker tag discord-bot-manager:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest
```

### Step 3: Create ECS Cluster

1. Navigate to ECS Dashboard
2. Click "Create Cluster"
3. Select "EC2" launch type
4. Configure cluster settings
5. Create cluster

### Step 4: Create Task Definition

1. Click "Create new Task Definition"
2. Select "EC2" launch type
3. Configure:
   - Task Definition Name: `discord-bot-manager`
   - Task Role: (create new if needed)
   - Container Name: `discord-bot-manager`
   - Image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/discord-bot-manager:latest`
   - Memory: 512 MB
   - Port Mappings: 3000:3000

4. Add environment variables:
   - `DATABASE_URL`: `mysql://admin:password@rds-endpoint:3306/discord_bot`
   - `DISCORD_BOT_TOKEN`: Your bot token
   - `JWT_SECRET`: Generated secret
   - `NODE_ENV`: `production`

5. Create task definition

### Step 5: Create Service

1. In cluster, click "Create Service"
2. Configure:
   - Launch type: EC2
   - Task Definition: discord-bot-manager
   - Service name: discord-bot-manager-service
   - Desired count: 2 (for high availability)
3. Configure load balancer:
   - Load balancer type: Application Load Balancer
   - Container port: 3000
4. Create service

### Step 6: Setup Auto Scaling

1. Go to Service settings
2. Click "Auto Scaling"
3. Configure:
   - Minimum tasks: 1
   - Desired: 2
   - Maximum: 4
4. Set scaling policies based on CPU/Memory

## Monitoring and Logging

### CloudWatch Logs

```bash
# View logs
aws logs tail /ecs/discord-bot-manager --follow

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name discord-bot-high-cpu \
  --alarm-description "Alert when CPU is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### Health Checks

Configure health check endpoint in load balancer:
- Path: `/api/health`
- Interval: 30 seconds
- Timeout: 5 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

## Database Backups

### Automated RDS Backups

1. Go to RDS instance settings
2. Configure:
   - Backup retention period: 7 days
   - Backup window: 03:00 UTC
   - Multi-AZ deployment: Yes (for production)

### Manual Snapshots

```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier discord-bot-db \
  --db-snapshot-identifier discord-bot-backup-$(date +%Y%m%d)
```

## Scaling Considerations

### Vertical Scaling
- Increase EC2 instance type
- Increase RDS instance class
- Increase memory allocation

### Horizontal Scaling
- Use ECS auto-scaling
- Add more EC2 instances to cluster
- Use RDS read replicas for read-heavy workloads

## Cost Optimization

1. **Use Reserved Instances** for predictable workloads
2. **Use Spot Instances** for non-critical tasks
3. **Enable RDS auto-scaling** for variable load
4. **Use CloudFront** for static assets
5. **Monitor with Cost Explorer** regularly

## Security Best Practices

1. **Secrets Management**
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly
   - Never commit secrets to git

2. **Network Security**
   - Use VPC with private subnets
   - Use Security Groups restrictively
   - Enable VPC Flow Logs

3. **Database Security**
   - Enable encryption at rest
   - Enable encryption in transit
   - Use IAM database authentication
   - Regular security patches

4. **Application Security**
   - Keep dependencies updated
   - Use HTTPS everywhere
   - Implement rate limiting
   - Regular security audits

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker logs <container-id>

# Check environment variables
docker inspect <container-id>

# Verify database connection
mysql -h <rds-endpoint> -u admin -p
```

### Database Connection Issues

```bash
# Test connectivity
telnet <rds-endpoint> 3306

# Check security group rules
aws ec2 describe-security-groups --group-ids <sg-id>
```

### High CPU Usage

1. Check CloudWatch metrics
2. Review application logs
3. Optimize database queries
4. Increase instance size or add replicas

## Disaster Recovery

### Backup Strategy
- Daily automated RDS snapshots
- Weekly manual snapshots
- Cross-region replication

### Recovery Procedure
1. Restore RDS from snapshot
2. Update database endpoint in environment
3. Restart application containers
4. Verify functionality

## Support and Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [Docker on AWS](https://aws.amazon.com/docker/)
