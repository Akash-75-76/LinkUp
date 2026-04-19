# 🎯 AWS Console UI Deployment - Quick Reference Card

**Keep this handy while deploying!**

---

## 📋 What You Need Before Starting

```
✅ AWS Account (with billing enabled)
✅ GitHub Account (with LinkUp repository)
✅ Browser (Chrome, Firefox, Safari, Edge)
✅ Text editor (to save credentials)
✅ Time: 90 minutes total
```

---

## 🌐 AWS URLs You'll Visit

### Main Console Pages:

| What | URL |
|------|-----|
| AWS Home | https://console.aws.amazon.com |
| S3 Dashboard | console.aws.amazon.com → Search "S3" |
| EC2 Dashboard | console.aws.amazon.com → Search "EC2" |
| Amplify Dashboard | console.aws.amazon.com → Search "Amplify" |

---

## 🔧 Tools & Files You Need

### Created for You:
- ✅ `AWS_CONSOLE_UI_GUIDE.md` (Step-by-step guide - **START HERE**)
- ✅ `AWS_CONSOLE_UI_CHECKLIST.md` (Checkbox list to track progress)
- ✅ `AWS_CONSOLE_UI_VISUAL_GUIDE.md` (Exact screen screenshots & descriptions)
- ✅ `backend/.env.example` (Environment variables template)
- ✅ `backend/config/s3.js` (S3 upload/download code)

### In Your EC2 Terminal (Installed):
- Node.js 20 LTS
- npm (package manager)
- PM2 (process manager)
- Nginx (web server)
- Git (version control)

---

## 📍 Critical Information to Save

### After Phase 1 (S3):
```
Bucket Name: linkup-media-bucket-2026
Region: us-east-1
```

### After Phase 2 (EC2):
```
Instance Name: linkup-backend
Instance Type: t2.medium
Region: us-east-1
Key File: linkup-key.pem ⚠️ SAVE SAFELY
Public IP: 54.123.456.789 (save this!)
```

### After Phase 4 (Amplify):
```
App Name: linkup
GitHub Repo: LinkUp
Branch: main
Domain: https://main.dxxxxxxxxxxxxx.amplify.app
```

---

## 📝 Environment Variables (.env) Template

**Create this in EC2 terminal at `~/apps/linkup/backend/.env`**

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/linkup

# Authentication
JWT_SECRET=your_jwt_secret_key_here_make_it_strong

# Server
PORT=5000
NODE_ENV=production

# AWS S3
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026

# Frontend URLs (from Amplify)
FRONTEND_URL=https://main.dxxxxxxxxxxxxx.amplify.app
SOCKET_ORIGIN=https://main.dxxxxxxxxxxxxx.amplify.app
```

---

## 🎯 5 Phases at a Glance

### Phase 1: S3 Bucket (15 min)
```
1. Go to S3
2. Create bucket: linkup-media-bucket-2026
3. Enable versioning
4. Enable public access (conditional)
5. Add bucket policy
```

### Phase 2: EC2 Instance (10 min)
```
1. Go to EC2
2. Launch instance
3. Name: linkup-backend
4. OS: Ubuntu 22.04 LTS
5. Instance: t2.medium
6. Create key pair (download .pem)
7. Security group: ports 22, 80, 443, 5000
8. Launch!
```

### Phase 3: Backend Setup (30 min)
```
1. Connect via EC2 Instance Connect (browser terminal)
2. Install: Node.js, PM2, Nginx
3. Clone repository
4. Install npm dependencies
5. Create .env file
6. Start backend with PM2
```

### Phase 4: Frontend Deploy (15 min)
```
1. Go to Amplify
2. Create new app
3. Connect GitHub
4. Select LinkUp repo, main branch
5. Add environment variables:
   - NEXT_PUBLIC_BACKEND_URL = http://ec2-ip:5000
   - NEXT_PUBLIC_SOCKET_URL = http://ec2-ip:5000
6. Deploy!
```

### Phase 5: Test Everything (15 min)
```
1. Test backend: http://ec2-ip:5000
2. Test frontend: Amplify domain
3. Test login
4. Test profile picture upload
5. Check S3 bucket for images
6. View logs for errors
```

---

## 🚨 Critical Things NOT to Forget

### ❌ Don't:
- ❌ Leave key file (linkup-key.pem) unencrypted
- ❌ Push AWS credentials to GitHub
- ❌ Use weak JWT_SECRET
- ❌ Enable "Block all public access" if you want public S3 reads
- ❌ Deploy without environment variables
- ❌ Use free tier t2.micro if you need stable backend (t2.small minimum)

### ✅ Do:
- ✅ Save EC2 public IP address (you'll need it!)
- ✅ Save Amplify domain URL
- ✅ Test after each phase
- ✅ Check logs if something fails
- ✅ Monitor AWS costs (watch your free tier!)

---

## 🔑 Key AWS Console Shortcuts

### For S3:
- Search box → type "S3"
- Click service name
- Click bucket name to configure

### For EC2:
- Search box → type "EC2"
- Click service name
- Look for "Instances" in left sidebar
- Click instance → Connect button

### For Amplify:
- Search box → type "Amplify"
- Click service name
- Look for "Hosting" in left menu
- Create new app → Host web app

---

## 📊 File Locations

### On Your Computer:
```
d:\ApnaCollege\LinkUp\
├── AWS_CONSOLE_UI_GUIDE.md ← Read this first!
├── AWS_CONSOLE_UI_CHECKLIST.md ← Use this to track
├── AWS_CONSOLE_UI_VISUAL_GUIDE.md ← See UI screenshots
├── backend/
│   ├── .env.example ← Template
│   ├── config/s3.js ← S3 code
│   └── ...
└── frontend/
    ├── amplify.yml ← Build config
    └── ...
```

### On EC2 Instance:
```
~/apps/linkup/
├── backend/
│   ├── .env ← You create this
│   ├── server.js ← Main backend
│   ├── package.json
│   └── ...
├── frontend/
│   ├── amplify.yml
│   └── ...
└── ...
```

### In AWS Console:
```
S3:
  └── linkup-media-bucket-2026/
      └─ profile-pictures/ (auto-created)
      └─ posts/ (auto-created)

EC2:
  └── Instance: linkup-backend
      └─ Public IP: 54.123.456.789

Amplify:
  └── App: linkup
      └─ Domain: https://main.dxxxxxxxxxxxxx.amplify.app
```

---

## 💬 What to Look For - Success Indicators

### Backend Running?
```
✅ pm2 status shows "linkup-backend" with status "online"
✅ http://54.123.456.789:5000/ shows response (even if error)
✅ pm2 logs shows no critical errors
```

### Frontend Deployed?
```
✅ Amplify shows "Deployment successful" with green checkmark
✅ Amplify domain is accessible in browser
✅ You see LinkUp home page
```

### S3 Working?
```
✅ S3 bucket exists and shows in console
✅ After upload, image appears in bucket
✅ Public URL of image works in browser
```

### Everything Connected?
```
✅ Can login on frontend
✅ Profile picture upload works
✅ Image appears in S3 bucket
✅ Frontend connects to backend
✅ Real-time chat works (if WebSocket connected)
```

---

## 🆘 Quick Troubleshooting

### "Can't connect to S3"
→ Check AWS credentials in .env file
→ Check S3 bucket policy
→ Check IAM user has S3 permissions

### "Backend won't start"
→ Check .env file syntax
→ Run: `pm2 logs linkup-backend`
→ Check Node version: `node --version` (should be v20.x)
→ Check port 5000 is open

### "Frontend can't reach backend"
→ Check environment variables in Amplify
→ Make sure IP address is correct
→ Make sure port 5000 is open in security group

### "Amplify deployment failed"
→ Check build logs in Amplify console
→ Make sure amplify.yml exists
→ Make sure GitHub branch is main
→ Try triggering redeploy

---

## ⏱️ Timeline Estimate

| Phase | Activity | Time |
|-------|----------|------|
| 1 | S3 Setup | 15 min |
| 2 | EC2 Launch | 10 min |
| 3 | Backend Deploy | 30 min |
| 4 | Frontend Deploy | 15 min |
| 5 | Testing | 15 min |
| **Total** | **From start to live** | **~85 minutes** |

---

## 📖 When to Use Each Guide

| Situation | Use This Guide |
|-----------|----------------|
| First time? | AWS_CONSOLE_UI_GUIDE.md |
| Want to see exact screens? | AWS_CONSOLE_UI_VISUAL_GUIDE.md |
| Tracking your progress? | AWS_CONSOLE_UI_CHECKLIST.md |
| Need to configure .env? | This file + backend/.env.example |
| Need quick lookups? | This file (you're reading it!) |

---

## 🎓 Learning Resources

### AWS Services Used:
- **S3**: https://aws.amazon.com/s3/
- **EC2**: https://aws.amazon.com/ec2/
- **Amplify**: https://aws.amazon.com/amplify/

### LinkUp Project:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Next.js + React
- **Real-time**: Socket.IO for chat
- **Files**: AWS S3 for storage

---

## ✅ Pre-Deployment Checklist

Before you start, make sure:

```
☐ AWS account is active (billing enabled)
☐ GitHub account has LinkUp repository
☐ You have AWS IAM user with S3/EC2 permissions
☐ Backend code is pushed to GitHub
☐ Frontend code is pushed to GitHub
☐ MongoDB Atlas connection string is ready
☐ JWT secret is ready
☐ You understand basic AWS console navigation
```

---

## 🚀 Ready to Deploy?

**Start here:**
1. Open: `AWS_CONSOLE_UI_GUIDE.md`
2. Follow Phase 1 (S3)
3. Use `AWS_CONSOLE_UI_CHECKLIST.md` to track
4. Reference `AWS_CONSOLE_UI_VISUAL_GUIDE.md` for screenshots
5. Come back here for quick lookups

---

**Good luck! You've got this! 🎉**

*Questions? Check the troubleshooting section or review the full AWS_CONSOLE_UI_GUIDE.md*

