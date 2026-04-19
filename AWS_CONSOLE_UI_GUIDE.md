# 🖱️ AWS Deployment Using AWS Console UI Only

**Complete step-by-step guide using ONLY the AWS Console - No CLI commands needed!**

---

## 📋 Table of Contents

1. [Phase 1: Create S3 Bucket (UI Only)](#phase-1-create-s3-bucket)
2. [Phase 2: Launch EC2 Instance (UI Only)](#phase-2-launch-ec2-instance)
3. [Phase 3: Deploy Backend to EC2](#phase-3-deploy-backend)
4. [Phase 4: Deploy Frontend to Amplify](#phase-4-deploy-frontend)
5. [Phase 5: Testing & Verification](#phase-5-testing)

---

## PHASE 1: Create S3 Bucket (UI Only)

### Step 1.1 - Login to AWS Console

1. Open browser → `https://console.aws.amazon.com`
2. Enter your AWS account email and password
3. Click **Sign in**

✅ You're now in AWS Console

---

### Step 1.2 - Navigate to S3

1. In the top search bar, type: **S3**
2. Click **S3** in the dropdown results
3. You're now in S3 Dashboard

---

### Step 1.3 - Create a New Bucket

**In S3 Dashboard:**

1. Click **Create bucket** button (orange/yellow button)

**Bucket Details Screen:**

| Field | Value |
|-------|-------|
| Bucket name | `linkup-media-bucket-2026` |
| AWS Region | Select: **us-east-1** |
| Copy settings | Leave unchecked |

2. Click **Create bucket** at bottom

✅ Bucket created!

---

### Step 1.4 - Configure Bucket Permissions

1. Click on your new bucket name: **linkup-media-bucket-2026**

**You're in Bucket Dashboard:**

#### Enable Versioning:
1. Go to tab: **Properties**
2. Scroll down → Find **Versioning**
3. Click **Edit** (on right side)
4. Select: **Enable**
5. Click **Save changes**

✅ Versioning enabled

#### Configure Public Read Access:
1. Go to tab: **Permissions**
2. Scroll down → Find **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck**: "Block all public access"
5. A warning appears → Check the confirmation box
6. Click **Save changes**

✅ Public access allowed

#### Add Bucket Policy (Allow Public Read):
1. Still in **Permissions** tab
2. Find: **Bucket policy**
3. Click **Edit**
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::linkup-media-bucket-2026/*"
    }
  ]
}
```

5. Click **Save changes**

✅ S3 Bucket fully configured!

---

## PHASE 2: Launch EC2 Instance (UI Only)

### Step 2.1 - Navigate to EC2

1. In top search bar, type: **EC2**
2. Click **EC2** in dropdown
3. You're in EC2 Dashboard

---

### Step 2.2 - Launch Instance

1. Click **Launch instances** button (orange/yellow)

**Name and tags:**
- Instance name: `linkup-backend`
- Tags: Add any tags you want (optional)

**Application and OS Images:**
- Search for: **Ubuntu**
- Click on: **Ubuntu Server 22.04 LTS**
- Click **Select**

**Instance Type:**
- Select: **t2.medium** (for production)
  - Or **t2.micro** for testing (free tier)
- Click **Next** or continue

**Key pair (login):**
1. Click **Create new key pair**
2. Key pair name: `linkup-key`
3. Key pair type: **RSA**
4. Private key file format: **.pem**
5. Click **Create key pair**
6. A file downloads automatically (save it safely!)

**Network settings:**
1. Click **Edit** (if needed)
2. Auto-assign public IP: **Enable**
3. Keep default VPC

**Firewall (Security group):**
1. Click **Create security group**
2. Security group name: `linkup-backend-sg`
3. Description: `Security group for LinkUp backend`

**Add Inbound Rules:**

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | 0.0.0.0/0 (or your IP) |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 |

**For each rule:**
1. Type is auto-filled
2. Port Range: enter port
3. Source: select from dropdown
4. Click **Add rule** to add another

**Storage (keep defaults):**
- Size: 20 GB
- Type: GP3
- Delete on termination: Checked

**Click: Launch instance**

✅ EC2 Instance launching! Wait 2-3 minutes...

---

### Step 2.3 - Wait for Instance to Start

1. You'll see: "Instances launching"
2. Click **View instances**
3. Find your instance: **linkup-backend**
4. Wait for State: **running** ✅
5. Once running, copy the **Public IPv4 address** (e.g., 54.123.456.789)

✅ EC2 Instance ready!

---

## PHASE 3: Deploy Backend to EC2

### Step 3.1 - Connect to EC2 via Browser (EC2 Instance Connect)

**In EC2 Dashboard:**

1. Select your instance: **linkup-backend**
2. Click **Connect** button (top right)
3. Go to tab: **EC2 Instance Connect**
4. Click **Connect**

A browser terminal opens! 🎉

Now you can type commands like you're SSH'd into the server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Create app directory
mkdir -p ~/apps && cd ~/apps

# Clone your backend
git clone https://github.com/yourusername/linkup.git
cd linkup/backend

# Install dependencies
npm install --production
```

✅ All tools installed!

---

### Step 3.2 - Create .env File

Still in browser terminal:

```bash
# Create .env file
nano .env
```

A text editor appears. Type:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/linkup
JWT_SECRET=your_jwt_secret_key_here_change_this
PORT=5000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
FRONTEND_URL=https://linkup.yourdomain.amplify.app
SOCKET_ORIGIN=https://linkup.yourdomain.amplify.app
```

To save:
1. Press: `Ctrl + X`
2. Press: `Y` (yes)
3. Press: `Enter`

✅ .env file saved!

---

### Step 3.3 - Start Backend with PM2

In browser terminal:

```bash
# Start backend
pm2 start server.js --name "linkup-backend"

# Configure to start on system reboot
pm2 startup
pm2 save

# Check status
pm2 status

# View logs
pm2 logs linkup-backend
```

✅ Backend is running!

---

### Step 3.4 - Setup Nginx Reverse Proxy (Optional but Recommended)

In browser terminal:

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/linkup
```

Paste this:

```nginx
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80 default_server;
    server_name _;

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

Save: `Ctrl + X` → `Y` → `Enter`

Then:

```bash
# Enable Nginx config
sudo ln -s /etc/nginx/sites-available/linkup /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Start Nginx
sudo systemctl restart nginx
```

✅ Nginx configured and running!

---

## PHASE 4: Deploy Frontend to Amplify (UI Only)

### Step 4.1 - Navigate to Amplify

1. In AWS Console search bar, type: **Amplify**
2. Click **AWS Amplify** in results
3. You're in Amplify Dashboard

---

### Step 4.2 - Create New App

1. Click **Create new app** button
2. Choose: **Host web app**

---

### Step 4.3 - Connect Your Repository

**Select repository provider:**
- Choose: **GitHub** (or GitLab/Bitbucket)

**Authorize AWS Amplify:**
- Click **GitHub** button
- A GitHub login page appears
- Login to your GitHub account
- Click **Authorize aws-amplify**

**Select repository:**
1. Choose your GitHub user
2. Select repository: **LinkUp**
3. Click **Next**

---

### Step 4.4 - Select Branch

1. Branch: Select **main**
2. Click **Next**

---

### Step 4.5 - Configure Build Settings

**App name:**
- `linkup` (or your preferred name)

**Environment:**
- Frontend framework: **Next.js**
- Build command: (auto-detected) `npm run build`
- Output directory: (auto-detected) `.next`

**Leave defaults, click: Next**

---

### Step 4.6 - Add Environment Variables

Click **Add environment variable** button

**Add these variables:**

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_BACKEND_URL | `http://your-ec2-ip:5000` |
| NEXT_PUBLIC_SOCKET_URL | `http://your-ec2-ip:5000` |

(Replace `your-ec2-ip` with your actual EC2 public IP)

After adding both:
1. Click **Next**

---

### Step 4.7 - Review & Deploy

1. Review settings
2. Click **Save and deploy**

Amplify starts building! ⏳ Wait 5-10 minutes...

You'll see:
- Build logs
- Deployment progress
- Final Amplify URL

✅ Frontend deployed!

---

## PHASE 5: Testing & Verification

### Step 5.1 - Test Backend

1. Open browser
2. Go to: `http://your-ec2-public-ip:5000/`
3. Should see backend response

✅ Backend responding

---

### Step 5.2 - Test Frontend

1. Go to your Amplify URL (from deployment)
2. Example: `https://main.dxxxxx.amplify.app`
3. Should see LinkUp frontend

✅ Frontend loading

---

### Step 5.3 - Test Login

1. On frontend, go to `/login`
2. Try to login
3. Check if you can access dashboard

✅ Login working

---

### Step 5.4 - Test Profile Picture Upload

1. Go to profile settings
2. Try to upload a profile picture
3. Check AWS S3 Console if image appears:
   - Go to S3 → linkup-media-bucket-2026
   - Should see image in **profile-pictures** folder

✅ S3 uploads working

---

### Step 5.5 - Monitor Logs (EC2 Instance Connect)

Go back to EC2 Instance Connect browser terminal:

```bash
# View backend logs
pm2 logs linkup-backend

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check server status
pm2 status
```

✅ All systems operational!

---

## 🔗 Quick AWS Console Shortcuts

### To quickly navigate:

| Task | Path in Console |
|------|-----------------|
| S3 Buckets | Search "S3" → Click result |
| EC2 Instances | Search "EC2" → Click "Instances" |
| Connect to EC2 | EC2 Dashboard → Select instance → Click "Connect" |
| Amplify Apps | Search "Amplify" → View apps |
| View Logs | EC2 Instance Connect terminal |

---

## ✅ Completion Checklist

- [ ] S3 Bucket created
- [ ] S3 public read access enabled
- [ ] EC2 Instance launched
- [ ] Security groups configured
- [ ] Connected to EC2 via browser
- [ ] Node.js, PM2, Nginx installed
- [ ] Backend running on EC2
- [ ] Frontend deployed to Amplify
- [ ] Environment variables set
- [ ] Test login successful
- [ ] Profile picture upload to S3 works
- [ ] Logs show no errors

---

## 🆘 Troubleshooting (Using Console UI)

### Backend not responding?

1. Go to EC2 Dashboard
2. Find your instance
3. Click **Connect** → **EC2 Instance Connect**
4. Check status:
   ```bash
   pm2 status
   pm2 logs linkup-backend
   ```

### Can't upload to S3?

1. Go to S3 → Your bucket
2. Go to **Permissions** tab
3. Check:
   - [ ] Public access enabled
   - [ ] Bucket policy set correctly
   - [ ] Versioning enabled

### Frontend can't connect to backend?

1. Go to Amplify Dashboard
2. Click your app
3. Go to **Environment variables**
4. Check if NEXT_PUBLIC_BACKEND_URL matches your EC2 IP
5. Redeploy if changed

### Port 5000 not accessible?

1. Go to EC2 Dashboard
2. Click your instance
3. Go to **Security groups**
4. Edit security group
5. Add inbound rule for port 5000
6. Save

---

## 📊 Your Final Deployment

```
After completing all steps:

✅ S3 Bucket: linkup-media-bucket-2026
   └─ Stores profile pictures and post images

✅ EC2 Instance: Running at http://your-public-ip:5000
   ├─ Backend API
   ├─ Socket.IO real-time
   └─ Nginx reverse proxy

✅ Amplify Frontend: https://your-domain.amplify.app
   └─ Connected to backend

✅ MongoDB Atlas: (unchanged, already in cloud)

🎉 LinkUp is LIVE on AWS!
```

---

**Ready to get started? Open AWS Console and follow the steps above!**
