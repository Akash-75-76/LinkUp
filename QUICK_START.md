# 🚀 LinkUp AWS Deployment - QUICK START GUIDE

**Read this first! Then follow the detailed guides.**

---

## 📋 What You Need

Before starting, gather:
- [ ] AWS Account (with billing enabled)
- [ ] AWS Access Key & Secret Key
- [ ] GitHub/GitLab repository link
- [ ] MongoDB Atlas connection string
- [ ] Domain name (optional but recommended)
- [ ] EC2 key file (.pem) (we'll create this)

---

## ⚡ 5-Minute Setup Overview

### 1️⃣ Create S3 Bucket (5 min)

```bash
# Run these commands on your local machine
aws configure  # Enter your AWS credentials

aws s3 mb s3://linkup-media-bucket-2026

aws s3api put-bucket-policy \
  --bucket linkup-media-bucket-2026 \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::linkup-media-bucket-2026/*"
    }]
  }'
```

✅ **S3 Bucket ready!**

---

### 2️⃣ Launch EC2 Instance (10 min)

**In AWS Console:**
1. EC2 → Launch Instance
2. Select: **Ubuntu Server 22.04 LTS**
3. Instance Type: **t2.medium**
4. Storage: **20 GB**
5. Security Group - Allow:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 5000 (Backend)
6. Create/Download key file: **save as `linkup.pem`**
7. Launch!

⏳ Wait 2-3 minutes for instance to start...

✅ **EC2 Instance ready!**

---

### 3️⃣ Setup Backend on EC2 (15 min)

```bash
# On your local machine:
chmod 400 linkup.pem

# SSH into EC2 (replace IP with your EC2 IP)
ssh -i linkup.pem ubuntu@YOUR_EC2_IP

# Now on EC2:
# Install Node.js, Nginx, PM2
sudo apt update && sudo apt upgrade -y
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

sudo npm install -g pm2

# Clone your backend
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/yourusername/linkup.git
cd linkup/backend

# Install dependencies
npm install --production

# Create .env file
cat > .env << 'EOF'
MONGO_URI=YOUR_MONGODB_ATLAS_URL
JWT_SECRET=your-secret-key-change-this
PORT=5000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
FRONTEND_URL=http://YOUR_EC2_IP:3000
SOCKET_ORIGIN=http://YOUR_EC2_IP:3000
EOF

# Start backend
pm2 start server.js --name linkup-backend
pm2 startup
pm2 save

# Check it's running
pm2 status
```

✅ **Backend running on EC2!**

---

### 4️⃣ Deploy Frontend to Amplify (10 min)

**In AWS Console:**
1. Amplify → New App → Host Web App
2. Select your GitHub/GitLab repository
3. Choose branch: `main`
4. Configure build:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Environment variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=http://YOUR_EC2_IP:5000
   NEXT_PUBLIC_SOCKET_URL=http://YOUR_EC2_IP:5000
   ```
6. Deploy!

⏳ Wait 5-10 minutes for first deploy...

✅ **Frontend deployed to Amplify!**

---

### 5️⃣ Test Everything (5 min)

```bash
# Test backend
curl http://YOUR_EC2_IP:5000/

# Test from local machine
# Open browser: http://YOUR_AMPLIFY_URL
# Try to login
# Upload profile picture
# Check if image appears
```

✅ **Deployment complete!**

---

## 🔄 After Initial Deployment

### Update Backend Code

```bash
# SSH into EC2
ssh -i linkup.pem ubuntu@YOUR_EC2_IP

# Update code
cd ~/apps/linkup/backend
git pull origin main
npm install --production

# Restart
pm2 restart linkup-backend
```

### Update Frontend Code

Frontend auto-deploys when you push to main! Just commit and push:
```bash
git add .
git commit -m "Update feature"
git push origin main

# Check Amplify console for deploy status
```

---

## 📊 Check Status Anytime

```bash
# Backend status
pm2 status

# View backend logs
pm2 logs linkup-backend

# EC2 connection
ssh -i linkup.pem ubuntu@YOUR_EC2_IP
```

---

## 💾 Important Files Created

| File | Purpose |
|------|---------|
| `AWS_DEPLOYMENT_GUIDE.md` | Detailed step-by-step instructions |
| `DEPLOYMENT_CHECKLIST.md` | Complete checklist to follow |
| `ARCHITECTURE_AND_FAQS.md` | Architecture diagram & common questions |
| `backend/config/s3.js` | S3 upload utilities |
| `backend/.env.example` | Environment template |

---

## ❌ Common Issues & Fixes

### "Cannot connect to backend"
```bash
# Check if backend is running
ssh -i linkup.pem ubuntu@YOUR_EC2_IP
pm2 status

# Restart if needed
pm2 restart linkup-backend
```

### "Image upload failing"
```bash
# Check AWS credentials
aws s3 ls s3://linkup-media-bucket-2026

# Check backend logs
pm2 logs linkup-backend
```

### "CORS error"
```bash
# Update FRONTEND_URL in backend .env
# Must match your Amplify URL exactly
FRONTEND_URL=https://your-amplify-domain.app
```

---

## 📞 Need Help?

1. **Check the full guides:**
   - `AWS_DEPLOYMENT_GUIDE.md` - Detailed steps
   - `ARCHITECTURE_AND_FAQS.md` - Common questions

2. **Check logs:**
   ```bash
   pm2 logs linkup-backend
   ```

3. **AWS Console:**
   - Check EC2 instance status
   - Check S3 bucket exists
   - Check Amplify deploy status

---

## 💰 Estimated Costs

**First Month:**
- EC2: $30-50
- Amplify: $10-20
- S3: $2-5
- MongoDB Atlas: $0-50
- **Total: $42-125/month**

---

## ✅ Quick Checklist

- [ ] AWS credentials configured
- [ ] S3 bucket created
- [ ] EC2 instance launched
- [ ] SSH connection works
- [ ] Backend running on EC2
- [ ] Frontend deployed to Amplify
- [ ] Can login on frontend
- [ ] Profile picture upload works
- [ ] Images loading from S3

---

**🎉 Once all boxes are checked, you're deployed to AWS!**

Next steps:
1. Setup custom domain (Route 53)
2. Enable SSL certificate (Certbot)
3. Monitor with CloudWatch
4. Setup auto-scaling for production

---

**For detailed instructions, see:**
- 📖 `AWS_DEPLOYMENT_GUIDE.md`
- ✅ `DEPLOYMENT_CHECKLIST.md`
- 🏗️ `ARCHITECTURE_AND_FAQS.md`
