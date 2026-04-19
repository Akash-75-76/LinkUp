# ✅ AWS Deployment - Console UI Only Checklist

**Use this checklist to deploy LinkUp using ONLY the AWS Console - No CLI!**

---

## PHASE 1: AWS Account & S3 Setup ☁️

### Setup (5 minutes)

- [ ] Open browser → https://console.aws.amazon.com
- [ ] Login to your AWS account
- [ ] Search for "S3" in search bar
- [ ] Click S3 in results

### Create S3 Bucket (10 minutes)

**In S3 Dashboard:**
- [ ] Click **Create bucket** button
- [ ] Bucket name: `linkup-media-bucket-2026`
- [ ] Region: **us-east-1**
- [ ] Click **Create bucket**

### Configure S3 Bucket (10 minutes)

**Enable Versioning:**
- [ ] Click bucket name
- [ ] Go to **Properties** tab
- [ ] Find **Versioning**
- [ ] Click **Edit**
- [ ] Select **Enable**
- [ ] Click **Save changes**

**Enable Public Access:**
- [ ] Go to **Permissions** tab
- [ ] Click **Edit** under "Block public access"
- [ ] Uncheck: "Block all public access"
- [ ] Check confirmation box
- [ ] Click **Save changes**

**Add Bucket Policy:**
- [ ] Still in **Permissions** tab
- [ ] Find **Bucket policy**
- [ ] Click **Edit**
- [ ] Paste the policy (see guide)
- [ ] Click **Save changes**

✅ **S3 Setup Complete!**

---

## PHASE 2: EC2 Instance Setup 🖥️

### Launch EC2 Instance (10 minutes)

**In AWS Console:**
- [ ] Search for "EC2"
- [ ] Click EC2 in results
- [ ] Click **Launch instances** button

**Configuration:**
- [ ] Instance name: `linkup-backend`
- [ ] OS: **Ubuntu Server 22.04 LTS**
- [ ] Instance type: **t2.medium** (or t2.micro for testing)

**Key Pair:**
- [ ] Click **Create new key pair**
- [ ] Name: `linkup-key`
- [ ] Type: **RSA**
- [ ] Format: **.pem**
- [ ] Click **Create key pair**
- [ ] **Save the downloaded file safely!**

**Security Group:**
- [ ] Click **Create security group**
- [ ] Name: `linkup-backend-sg`
- [ ] Add inbound rules:

| Rule | Port | Source |
|------|------|--------|
| SSH | 22 | 0.0.0.0/0 |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| Custom TCP | 5000 | 0.0.0.0/0 |

- [ ] Click **Launch instance**

**Wait for Instance to Start:**
- [ ] Wait 2-3 minutes
- [ ] Go to Instances
- [ ] Wait for State: **running**
- [ ] Copy **Public IPv4 address**

✅ **EC2 Instance Ready!**

---

## PHASE 3: Connect to EC2 & Setup Backend 🔧

### Connect via Browser Terminal (5 minutes)

**In EC2 Dashboard:**
- [ ] Click your instance: `linkup-backend`
- [ ] Click **Connect** button (top right)
- [ ] Go to tab: **EC2 Instance Connect**
- [ ] Click **Connect**

✅ **Browser terminal is now open! Type commands below:**

### Install Node.js & Tools (10 minutes)

In browser terminal, copy & paste these commands one by one:

```bash
# Update system
sudo apt update && sudo apt upgrade -y
```
- [ ] Wait for completion

```bash
# Install Node.js 20
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```
- [ ] Wait for completion

```bash
# Verify Node.js
node --version
npm --version
```
- [ ] Check versions display

```bash
# Install PM2
sudo npm install -g pm2
```
- [ ] Wait for completion

```bash
# Install Nginx
sudo apt install -y nginx
```
- [ ] Wait for completion

```bash
# Install Git
sudo apt install -y git
```
- [ ] Wait for completion

✅ **All tools installed!**

### Clone & Setup Backend (10 minutes)

```bash
# Create app directory
mkdir -p ~/apps && cd ~/apps

# Clone your backend
git clone https://github.com/yourusername/linkup.git
cd linkup/backend

# Install dependencies
npm install --production
```
- [ ] Wait for dependencies to install

✅ **Backend code ready!**

### Create .env File (5 minutes)

```bash
# Create .env file
nano .env
```
- [ ] Opens text editor
- [ ] Type the following (replace values with yours):

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

**Save file:**
- [ ] Press: **Ctrl + X**
- [ ] Press: **Y** (yes)
- [ ] Press: **Enter**

✅ **.env file saved!**

### Start Backend with PM2 (5 minutes)

```bash
# Start backend
pm2 start server.js --name "linkup-backend"
```
- [ ] Backend started

```bash
# Configure auto-start
pm2 startup
pm2 save
```
- [ ] Auto-start configured

```bash
# Check status
pm2 status
```
- [ ] Should show: "linkup-backend" with status "online"

```bash
# View logs (check for errors)
pm2 logs linkup-backend --lines 10
```
- [ ] Check if any errors appear

✅ **Backend is running!**

### Setup Nginx (Optional) (5 minutes)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/linkup
```
- [ ] Opens text editor

**Paste this:**
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

**Save file:**
- [ ] Press: **Ctrl + X** → **Y** → **Enter**

```bash
# Enable Nginx config
sudo ln -s /etc/nginx/sites-available/linkup /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
```
- [ ] Should show "successful" or "OK"

```bash
# Start Nginx
sudo systemctl restart nginx
```
- [ ] Nginx restarted

✅ **Nginx configured!**

---

## PHASE 4: Deploy Frontend to Amplify 🚀

### Setup Amplify App (10 minutes)

**In AWS Console:**
- [ ] Search for "Amplify"
- [ ] Click **AWS Amplify**
- [ ] Click **Create new app**
- [ ] Click **Host web app**

**Connect Repository:**
- [ ] Choose: **GitHub**
- [ ] Click **GitHub** to authenticate
- [ ] Authorize AWS Amplify
- [ ] Select repository: **LinkUp**
- [ ] Click **Next**

**Select Branch:**
- [ ] Branch: **main**
- [ ] Click **Next**

**Configure Build:**
- [ ] Leave defaults (auto-detected)
- [ ] App name: `linkup`
- [ ] Click **Next**

**Add Environment Variables:**
- [ ] Click **Add environment variable**

**Variable 1:**
- [ ] Key: `NEXT_PUBLIC_BACKEND_URL`
- [ ] Value: `http://your-ec2-public-ip:5000`
- [ ] Click **Add environment variable** again

**Variable 2:**
- [ ] Key: `NEXT_PUBLIC_SOCKET_URL`
- [ ] Value: `http://your-ec2-public-ip:5000`
- [ ] Click **Next**

**Review & Deploy:**
- [ ] Review settings
- [ ] Click **Save and deploy**

**Wait for Deployment:**
- [ ] Watch build logs
- [ ] Wait 5-10 minutes
- [ ] Look for green checkmark (success)
- [ ] Copy your **Amplify domain URL** (example: `https://main.dxxxxx.amplify.app`)

✅ **Frontend deployed to Amplify!**

---

## PHASE 5: Testing & Verification 🧪

### Test Backend (5 minutes)

**In browser:**
- [ ] Go to: `http://your-ec2-public-ip:5000/`
- [ ] Should see response (even if error, shows backend is running)

### Test Frontend (5 minutes)

**In browser:**
- [ ] Go to your Amplify URL (from Phase 4)
- [ ] Should see LinkUp frontend

### Test Login (5 minutes)

**On frontend:**
- [ ] Click Login
- [ ] Try with test credentials
- [ ] Should either login or show error (shows app is working)

### Test Profile Picture Upload (10 minutes)

**On frontend:**
- [ ] Go to profile/settings
- [ ] Try to upload a profile picture
- [ ] Wait for upload

**Verify in S3:**
- [ ] Go to S3 → linkup-media-bucket-2026
- [ ] Look for **profile-pictures** folder
- [ ] Should see your uploaded image

✅ **S3 upload working!**

### Check Logs for Errors (5 minutes)

**Go back to EC2 Instance Connect:**
- [ ] View backend logs:
```bash
pm2 logs linkup-backend --lines 20
```
- [ ] Check for errors
- [ ] If errors, note them for troubleshooting

✅ **Testing complete!**

---

## 🎉 SUCCESS CHECKLIST

When you see ALL these, you're done! ✅

- [ ] S3 bucket created and configured
- [ ] EC2 instance running
- [ ] Can access: `http://ec2-ip:5000/` (backend)
- [ ] Can access Amplify URL (frontend)
- [ ] Can see LinkUp login page
- [ ] Can try to login
- [ ] Can upload profile picture
- [ ] Image appears in S3 bucket
- [ ] No critical errors in logs

---

## 📍 What You Have Now

```
✅ S3 Bucket: linkup-media-bucket-2026
   └─ Stores all images

✅ EC2 Instance: 54.xxx.xxx.xxx
   ├─ Running Node.js backend
   ├─ Running PM2 process manager
   ├─ Running Nginx reverse proxy
   └─ Listening on port 5000

✅ Amplify: https://main.dxxxxx.amplify.app
   └─ Running Next.js frontend

✅ MongoDB Atlas: (already set up)
   └─ Database for your app

🎊 LinkUp is LIVE on AWS!
```

---

## 📞 If Something Goes Wrong

### Backend won't start?
1. Go to EC2 Instance Connect
2. Type: `pm2 logs linkup-backend`
3. Look at error messages
4. Check .env file values are correct

### Can't upload to S3?
1. Go to S3 console
2. Check bucket permissions
3. Check bucket policy is correct
4. Check AWS credentials in .env

### Frontend can't connect?
1. Check environment variables in Amplify
2. Make sure IP address is correct
3. Trigger a redeploy if needed

### Port 5000 not accessible?
1. Go to EC2 security groups
2. Add inbound rule for port 5000
3. Wait a minute for it to take effect

---

## 💾 Important Notes

- **Save your EC2 key file safely** (linkup-key.pem)
- **Save your EC2 public IP address** (you'll need it)
- **Save your Amplify URL** (your app is here)
- **Don't share AWS credentials** (keep .env private)
- **Remember your MongoDB password** (in MONGO_URI)

---

**You've successfully deployed LinkUp to AWS using only the Console UI! 🎉**

Next steps:
- Setup custom domain (Route 53)
- Enable SSL certificate
- Monitor your application
- Scale as needed

