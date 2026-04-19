# AWS Deployment Guide for LinkUp

## ========================================
## PHASE 1: AWS SETUP (Prerequisites)
## ========================================

### 1.1 AWS Account & Credentials

```bash
# Install AWS CLI (if not already installed)
# Windows: https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt install awscli

# Configure AWS credentials
aws configure

# Enter when prompted:
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region: us-east-1
# Default output format: json

# Verify setup
aws s3 ls
```

### 1.2 Create S3 Bucket for Media Storage

```bash
# Create bucket (bucket names must be globally unique)
aws s3 mb s3://linkup-media-bucket-2026 --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket linkup-media-bucket-2026 \
  --versioning-configuration Status=Enabled

# Enable public read access
aws s3api put-bucket-acl \
  --bucket linkup-media-bucket-2026 \
  --acl public-read
```

### 1.3 Create S3 Bucket Policy (Allow Public Read)

Create file: `s3-policy.json`
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

Apply policy:
```bash
aws s3api put-bucket-policy \
  --bucket linkup-media-bucket-2026 \
  --policy file://s3-policy.json
```

### 1.4 Create IAM User for EC2 (S3 Access)

In AWS Console:
1. Go to IAM → Users → Create User
2. Name: `linkup-ec2-user`
3. Select "Access key - Programmatic access"
4. Attach policies: `AmazonS3FullAccess`
5. Copy Access Key ID and Secret Access Key

---

## ========================================
## PHASE 2: UPDATE BACKEND CODE FOR S3
## ========================================

### 2.1 Install AWS Dependencies

```bash
cd backend
npm install @aws-sdk/client-s3 multer multer-s3 dotenv
npm install --save-dev @types/aws-sdk
```

### 2.2 Update Environment Variables

Create `.env` file in backend:
```env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/linkup

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
NODE_ENV=production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026

# Frontend URL
FRONTEND_URL=https://yourdomain.amplify.app
SOCKET_ORIGIN=https://yourdomain.amplify.app
```

### 2.3 Update Controllers to Use S3

#### Example: Update User Controller

Find this in `controllers/user.controller.js`:
```javascript
export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // OLD CODE (disk storage):
    const newUser = await User.updateOne({ _id: user._id }, {
      profilePicture: req.file.filename 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

Replace with:
```javascript
import { uploadToS3, deleteFromS3 } from '../config/s3.js';

export const uploadProfilePic = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Delete old profile picture if it exists
    if (user.profilePicture && !user.profilePicture.includes('default')) {
      try {
        await deleteFromS3(user.profilePicture);
      } catch (err) {
        console.error('Error deleting old profile pic:', err);
      }
    }
    
    // Upload to S3
    const fileUrl = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      'profile-pictures'
    );
    
    // Update user with S3 URL
    await User.updateOne(
      { _id: user._id },
      { profilePicture: fileUrl }
    );
    
    return res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: fileUrl
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return res.status(500).json({ message: error.message });
  }
};
```

#### Example: Update Post Controller

Find this in `controllers/post.controller.js`:
```javascript
export const createPost = async (req, res) => {
  try {
    // ... existing code ...
    
    // OLD CODE:
    const mediaPath = req.file?.filename || null;
    
    // NEW CODE:
    let mediaUrl = null;
    if (req.file) {
      mediaUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        'post-images'
      );
    }
    
    const newPost = new Post({
      userId,
      caption,
      media: mediaUrl  // Store S3 URL instead of filename
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

### 2.4 Update Routes to Use Memory Storage Multer

#### Update `routes/user.routes.js`:
```javascript
import upload from '../middleware/fileUpload.js';

router.post(
  "/update_profile_pic",
  upload.single("profile_pic"),
  uploadProfilePic
);
```

#### Update `routes/post.routes.js`:
```javascript
import upload from '../middleware/fileUpload.js';

router.post('/create_post', upload.single("media"), createPost);
```

### 2.5 Update server.js for Production

Find this in `server.js`:
```javascript
// Attach io to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});
```

Add after:
```javascript
// CORS Configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## ========================================
## PHASE 3: SETUP EC2 INSTANCE
## ========================================

### 3.1 Create EC2 Instance

In AWS Console:
1. Go to EC2 → Instances → Launch Instance
2. Select: **Ubuntu Server 22.04 LTS**
3. Instance Type: **t2.medium** (Free tier: t2.micro, but small)
4. Storage: **20 GB** (GP3)
5. Security Group (Inbound Rules):
   - SSH (22): Allow from your IP
   - HTTP (80): Allow from 0.0.0.0/0
   - HTTPS (443): Allow from 0.0.0.0/0
   - Custom (5000): Allow from 0.0.0.0/0 (or Amplify CIDR)

6. Key Pair: Create new → Download `.pem` file (save safely)
7. Launch!

### 3.2 Connect to EC2

```bash
# Change permissions on key file
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ec2-user@your-ec2-public-ip
# OR for Ubuntu:
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 3.3 Setup Node.js on EC2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS)
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 3.4 Clone Backend & Setup

```bash
# Create app directory
mkdir -p ~/apps
cd ~/apps

# Clone your repository
git clone https://github.com/yourusername/linkup.git
cd linkup/backend

# Install dependencies
npm install --production

# Create .env file with production values
cat > .env << EOF
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/linkup
JWT_SECRET=your_secure_jwt_secret
PORT=5000
NODE_ENV=production
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=linkup-media-bucket-2026
FRONTEND_URL=https://linkup.yourdomain.amplify.app
SOCKET_ORIGIN=https://linkup.yourdomain.amplify.app
EOF
```

### 3.5 Start Backend with PM2

```bash
# Start Node.js server
pm2 start server.js --name "linkup-backend"

# Configure PM2 to start on system boot
pm2 startup
pm2 save

# View logs
pm2 logs linkup-backend

# Monitor
pm2 monit
```

### 3.6 Setup Nginx as Reverse Proxy

```bash
sudo apt install -y nginx

# Create Nginx config
sudo cat > /etc/nginx/sites-available/linkup << EOF
upstream backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/linkup /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.7 Setup SSL Certificate (Optional but recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## ========================================
## PHASE 4: DEPLOY FRONTEND TO AMPLIFY
## ========================================

### 4.1 Update Next.js Frontend

Update `frontend/next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'linkup-media-bucket-2026.s3.amazonaws.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
```

### 4.2 Update Frontend Environment

Create `frontend/.env.production`:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
```

### 4.3 Update API calls to use Backend URL

In frontend components, use:
```javascript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

// Example API call
const response = await axios.post(
  `${BACKEND_URL}/user/upload_profile_pic`,
  formData,
  { headers: { 'Content-Type': 'multipart/form-data' } }
);
```

### 4.4 Deploy to AWS Amplify

```bash
cd frontend

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify (if not already done)
amplify init

# Deploy
amplify publish
```

OR manually in AWS Console:

1. Go to AWS Amplify
2. New App → GitHub/GitLab → Select Repository
3. Connect branch (main)
4. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. Set environment variables:
```
NEXT_PUBLIC_BACKEND_URL=https://your-domain.com
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com
```

6. Deploy!

---

## ========================================
## PHASE 5: VERIFICATION & TESTING
## ========================================

### 5.1 Test Backend APIs

```bash
# Test server health
curl http://your-ec2-public-ip:5000/

# Test with Postman or API client
# POST http://your-ec2-public-ip:5000/user/login
```

### 5.2 Test S3 Upload

```bash
# Upload test file
curl -X POST http://your-ec2-public-ip:5000/user/update_profile_pic \
  -F "profile_pic=@test-image.jpg" \
  -F "token=your_test_token"
```

### 5.3 Test Frontend

Visit: `https://your-amplify-domain`

Test:
- ✅ Login/Register
- ✅ Upload profile picture
- ✅ Create post with image
- ✅ Real-time chat
- ✅ View all images loading from S3

### 5.4 Monitor EC2

```bash
# Check backend status
pm2 status

# View logs
pm2 logs linkup-backend

# Monitor memory/CPU
pm2 monit

# Check Nginx
sudo systemctl status nginx
```

---

## ========================================
## PHASE 6: OPTIMIZATION & SCALING
## ========================================

### 6.1 Setup Auto-Scaling Group (Optional)

For multiple EC2 instances with load balancing (future)

### 6.2 Setup CloudFront CDN

Route S3 bucket through CloudFront for faster image delivery

### 6.3 Setup Route 53 DNS

Domain management and routing

### 6.4 Monitoring with CloudWatch

Create alarms for:
- High CPU usage
- High memory usage
- API errors
- Slow response times

---

## ========================================
## TROUBLESHOOTING
## ========================================

### Backend won't start

```bash
# Check logs
pm2 logs linkup-backend

# Check if port is in use
sudo lsof -i :5000

# Restart
pm2 restart linkup-backend
```

### S3 upload failing

```bash
# Check AWS credentials
aws s3 ls

# Verify bucket exists
aws s3 ls s3://linkup-media-bucket-2026

# Check IAM permissions
```

### Frontend can't connect to backend

```bash
# Check CORS in backend
# Check backend URL in frontend .env
# Verify security groups allow traffic
aws ec2 describe-security-groups --group-names launch-wizard-1
```

### Socket.IO not working

```bash
# Check Socket.IO origins in server.js
# Verify SOCKET_ORIGIN in .env matches frontend domain
# Check browser console for WebSocket errors
```

---

## ========================================
## COSTS SUMMARY
## ========================================

| Service | Monthly Cost |
|---------|------------|
| EC2 (t2.medium) | $30-50 |
| Amplify | $10-20 |
| S3 (1GB/month) | $0.50-5 |
| Data transfer | $5-20 |
| **Total** | **$45-95** |

---

## ========================================
## NEXT STEPS
## ========================================

1. ✅ Complete PHASE 1: AWS Setup
2. ✅ Complete PHASE 2: Update Backend Code
3. ✅ Complete PHASE 3: EC2 Setup
4. ✅ Complete PHASE 4: Amplify Setup
5. ✅ Complete PHASE 5: Testing
6. Monitor and optimize performance

---

**Questions? Issues?**
- Check AWS documentation
- Review PM2 logs for backend errors
- Check browser console for frontend errors
- Verify environment variables are set correctly
