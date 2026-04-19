# 🚀 LinkUp AWS Deployment - Quick Checklist

## 📋 Pre-Deployment Checklist

### ✅ AWS Account Preparation
- [ ] AWS Account created with billing enabled
- [ ] AWS CLI installed locally: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] Can list S3 buckets: `aws s3 ls`

### ✅ Git Repository Ready
- [ ] Code pushed to GitHub/GitLab
- [ ] `.env.example` file created
- [ ] `.env` files added to `.gitignore`
- [ ] No sensitive keys in repository

### ✅ Database Ready
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Connection string: `mongodb+srv://user:pass@cluster.mongodb.net/linkup`
- [ ] IP whitelist configured (allow EC2 IP or 0.0.0.0/0)

---

## 🏗️ DEPLOYMENT PHASE 1: AWS INFRASTRUCTURE

### Step 1: Create S3 Bucket

```bash
# Create bucket (globally unique name)
aws s3 mb s3://linkup-media-bucket-2026 --region us-east-1

# Apply policy for public read
aws s3api put-bucket-policy \
  --bucket linkup-media-bucket-2026 \
  --policy file://s3-policy.json

# ✅ Verify: https://linkup-media-bucket-2026.s3.amazonaws.com/test.txt
```

**Checklist:**
- [ ] S3 bucket created
- [ ] Bucket policy applied
- [ ] Public read access enabled
- [ ] Versioning enabled

---

### Step 2: Create EC2 Instance

**AWS Console → EC2 → Launch Instance**

Configuration:
- [ ] **AMI**: Ubuntu Server 22.04 LTS
- [ ] **Instance Type**: `t2.medium` (or t2.micro for testing)
- [ ] **Storage**: 20GB GP3
- [ ] **Security Group** (Inbound Rules):
  - [ ] SSH (22) from your IP
  - [ ] HTTP (80) from 0.0.0.0/0
  - [ ] HTTPS (443) from 0.0.0.0/0
  - [ ] Custom 5000 from 0.0.0.0/0
- [ ] **Key Pair**: Download `.pem` file (save safely!)
- [ ] **Launch** ✅

**After Launch:**
- [ ] Copy EC2 public IP address
- [ ] Store in safe location: `EC2_IP=54.xxx.xxx.xxx`

---

### Step 3: Setup Node.js on EC2

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Run setup script (from this repo)
curl -fsSL https://your-repo-url/scripts/setup-ec2.sh | bash

# OR manually:
sudo apt update && sudo apt upgrade -y
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx pm2 git
```

**Checklist:**
- [ ] SSH connection works
- [ ] Node.js installed: `node --version`
- [ ] NPM installed: `npm --version`
- [ ] PM2 installed: `pm2 -v`
- [ ] Nginx installed: `sudo systemctl status nginx`

---

## 💻 DEPLOYMENT PHASE 2: BACKEND CODE

### Step 4: Clone and Setup Backend

```bash
# On EC2:
cd ~
mkdir -p apps && cd apps
git clone https://github.com/yourusername/linkup.git
cd linkup/backend

# Install dependencies
npm install --production
```

**Checklist:**
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] No npm errors

---

### Step 5: Configure Environment Variables

```bash
# Create .env on EC2
nano .env
```

Add:
```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/linkup
JWT_SECRET=your_secret_key_here_change_this
PORT=5000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
FRONTEND_URL=https://linkup.yourdomain.amplify.app
SOCKET_ORIGIN=https://linkup.yourdomain.amplify.app
```

**Checklist:**
- [ ] `.env` file created
- [ ] All values filled in
- [ ] No typos in credentials
- [ ] File permissions: `chmod 600 .env`

---

### Step 6: Start Backend with PM2

```bash
# Test start
npm run prod

# If working, stop (Ctrl+C)
pm2 start server.js --name "linkup-backend"
pm2 startup
pm2 save

# Verify
pm2 status
pm2 logs linkup-backend
```

**Checklist:**
- [ ] PM2 process started
- [ ] Backend running: `pm2 status`
- [ ] No errors in logs: `pm2 logs`
- [ ] PM2 startup configured: `pm2 startup`

---

### Step 7: Setup Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/linkup
```

Paste (replace your-domain.com):
```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/linkup /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test
sudo nginx -t

# Start
sudo systemctl restart nginx
```

**Checklist:**
- [ ] Nginx config created
- [ ] Config syntax valid: `sudo nginx -t`
- [ ] Nginx restarted: `sudo systemctl status nginx`
- [ ] Can access: `curl http://your-ec2-ip/`

---

### Step 8: Setup SSL Certificate (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

**Checklist:**
- [ ] Certbot installed
- [ ] Certificate obtained
- [ ] HTTPS working: `https://your-domain.com`
- [ ] Auto-renewal enabled

---

## 🎨 DEPLOYMENT PHASE 3: FRONTEND TO AMPLIFY

### Step 9: Prepare Frontend

```bash
# Navigate to frontend
cd frontend

# Update next.config.mjs
# Add S3 domain to remotePatterns
# Add NEXT_PUBLIC_BACKEND_URL

# Test build locally
npm run build
npm start

# Verify no errors
```

**Checklist:**
- [ ] Frontend builds successfully
- [ ] No console errors
- [ ] API calls point to backend

---

### Step 10: Deploy to Amplify

**Option A: AWS Amplify Console (Easiest)**

1. Go to AWS Amplify Console
2. Select "New App" → "Host web app"
3. Choose GitHub/GitLab
4. Select your repository and branch
5. Configure build settings (auto-detected)
6. Add environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-domain.com
   NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
   ```
7. Deploy!

**Option B: AWS Amplify CLI**

```bash
npm install -g @aws-amplify/cli
amplify init
amplify publish
```

**Checklist:**
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Amplify URL working: `https://your-domain.amplify.app`

---

## 🧪 DEPLOYMENT PHASE 4: VERIFICATION

### Step 11: Test Everything

```bash
# Test backend API
curl http://your-ec2-ip:5000/

# Test through Nginx
curl http://your-domain.com/

# Test through Amplify
curl https://your-domain.amplify.app

# Test S3 upload (through API)
# Login on frontend and upload profile picture
# Verify image appears in S3
```

**Checklist:**
- [ ] Backend responds on EC2 IP: 5000
- [ ] Nginx reverse proxy working
- [ ] Frontend accessible on Amplify
- [ ] Login works
- [ ] Profile picture upload works
- [ ] Images loading from S3
- [ ] Real-time chat working
- [ ] No CORS errors

---

### Step 12: Monitor & Maintain

```bash
# Check backend status
pm2 status
pm2 logs linkup-backend

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Monitor in real-time
pm2 monit
```

**Checklist:**
- [ ] Backend process healthy
- [ ] Nginx running
- [ ] Disk space adequate (>5GB)
- [ ] No error logs

---

## 📊 Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Backend (Direct) | `http://EC2_IP:5000` | ✅ |
| Backend (Domain) | `https://your-domain.com` | ✅ |
| Frontend | `https://your-domain.amplify.app` | ✅ |
| S3 Bucket | `s3://linkup-media-bucket-2026` | ✅ |

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
pm2 logs linkup-backend
# Check .env file
# Check MONGO_URI connection
```

### Images not uploading?
```bash
# Check AWS credentials
aws s3 ls s3://linkup-media-bucket-2026

# Check backend logs
pm2 logs linkup-backend
```

### Frontend can't connect to backend?
```bash
# Check CORS in backend
# Check FRONTEND_URL in .env
# Check security group allows traffic
```

### Domain not resolving?
```bash
# Update Route 53 or your DNS provider
# Point to your EC2 Elastic IP
# Wait for DNS propagation (up to 48 hours)
```

---

## 📝 Notes

- **Save EC2 key file securely** - never commit to git
- **Rotate AWS credentials periodically**
- **Monitor costs** in AWS console
- **Enable backups** for database
- **Setup CloudWatch alerts** for high CPU/memory

---

## ✅ COMPLETION CHECKLIST

- [ ] S3 bucket created and configured
- [ ] EC2 instance launched with security groups
- [ ] Node.js installed on EC2
- [ ] Backend cloned and dependencies installed
- [ ] Environment variables configured
- [ ] PM2 managing backend process
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed
- [ ] Frontend deployed to Amplify
- [ ] All tests passing
- [ ] Monitoring setup complete

---

**🎉 Congratulations! LinkUp is deployed to AWS!**
