# 🏗️ LinkUp AWS Deployment - Visual Reference Guide

## Complete System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           🌍 INTERNET / USERS                              │
└────────────────┬─────────────────────────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┐
     │           │           │
     ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        🌐 DNS & DOMAIN LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Route 53 (AWS DNS)         OR    Your Domain Provider                     │
│  ├─ your-domain.com              ├─ GoDaddy                               │
│  ├─ www.your-domain.com          ├─ Namecheap                             │
│  └─ api.your-domain.com          └─ Any registrar                          │
│                                                                              │
│  Points To: Elastic IP of EC2 + Amplify Domain                            │
└────────────┬────────────────────────────────────────────────────────┬───────┘
             │                                                        │
    ┌────────▼────────────┐                              ┌──────────▼──────────┐
    │    FRONTEND PATH    │                              │   BACKEND PATH      │
    └────────┬────────────┘                              └──────────┬──────────┘
             │                                                      │
             ▼                                                      ▼
    ╔═════════════════╗                              ╔══════════════════════╗
    ║  AWS Amplify    ║                              ║   AWS EC2 Instance   ║
    ║  (Next.js App)  ║                              ║   (t2.medium)        ║
    ║                 ║                              ║                      ║
    ║  ✓ Auto-deploy  ║                              ║  ┌────────────────┐  ║
    ║  ✓ Scaling      ║                              ║  │  Nginx Server  │  ║
    ║  ✓ CDN          ║                              ║  │  (Reverse      │  ║
    ║  ✓ HTTPS        ║                              ║  │   Proxy)       │  ║
    ║                 ║                              ║  └────────┬───────┘  ║
    ║  Domain:        ║                              ║           │          ║
    ║  yourapp        ║                              ║  ┌────────▼───────┐  ║
    ║  .amplify.app   ║                              ║  │  PM2 Manager   │  ║
    ║                 ║                              ║  │  (Auto-restart)│  ║
    ║  CDN Enabled ✓  ║                              ║  └────────┬───────┘  ║
    ║                 ║                              ║           │          ║
    ║  Cache: S3 ──────┼──────────┐                  ║  ┌────────▼───────┐  ║
    ║  Images          ║          │                  ║  │  Node.js       │  ║
    ║                  ║          │                  ║  │  Backend API   │  ║
    ║  HTTPS: ✓        ║          │                  ║  │                │  ║
    ║  HTTP → HTTPS    ║          │                  ║  │ Routes:        │  ║
    ║  Redirect ✓      ║          │                  ║  │ /user          │  ║
    ╚═════════════════╝          │                  ║  │ /post          │  ║
         │                        │                  ║  │ /chat          │  ║
         │                        │                  ║  │ /userStatus    │  ║
         │                        │                  ║  │                │  ║
         │                        │                  ║  │ Socket.IO ✓    │  ║
         │                        │                  ║  │ Real-time      │  ║
         │                        │                  ║  └────────┬───────┘  ║
         │                        │                  ║           │          ║
         │                        │                  ║ Ports:    │          ║
         │                        │                  ║ 5000 (internal)      ║
         │                        │                  ║ 80/443 (Nginx)       ║
         │                        │                  ║                      ║
         │                        │                  ║ Monitoring:          ║
         │                        │                  ║ CloudWatch ✓         ║
         │                        │                  ║ PM2 Logs ✓           ║
         │                        │                  ║ Nginx Logs ✓         ║
         │                        │                  ╚══════════════════════╝
         │                        │                           │
         │                        │                           ▼
         │                        │              ┌──────────────────────┐
         │                        │              │  Security Groups     │
         │                        │              ├──────────────────────┤
         │                        │              │ Inbound:             │
         │                        │              │ 22 SSH               │
         │                        │              │ 80 HTTP              │
         │                        │              │ 443 HTTPS            │
         │                        │              │ 5000 (from Amplify)  │
         │                        │              │ Outbound: Allow All  │
         │                        │              └──────────────────────┘
         │                        │
         │                        │  ┌────────────────────────────────────┐
         │                        │  │   SSL Certificate                  │
         │                        │  ├────────────────────────────────────┤
         │                        │  │ Certbot (Let's Encrypt)            │
         │                        │  │ ✓ Auto-renewal                     │
         │                        │  │ ✓ HTTPS enabled                    │
         │                        │  │ ✓ HTTP → HTTPS redirect            │
         │                        │  └────────────────────────────────────┘
         │                        │
         │         ┌──────────────┴──────────────┐
         │         │                             │
         ▼         ▼                             ▼
    ╔════════════════════════════════════════════════════════════╗
    ║                  ☁️  AWS STORAGE & DATABASE                 ║
    ╠════════════════════════════════════════════════════════════╣
    │                                                             │
    │  ┌──────────────────────┐    ┌──────────────────────┐      │
    │  │  S3 Bucket           │    │  CloudFront CDN      │      │
    │  │  (File Storage)      │    │  (Content Delivery)  │      │
    │  ├──────────────────────┤    ├──────────────────────┤      │
    │  │ Name: linkup-media   │    │ Origin: S3 Bucket    │      │
    │  │ Public Read: ✓       │    │ Cache: 24 hours      │      │
    │  │ Versioning: ✓        │    │ Compression: ✓       │      │
    │  │ Encryption: ✓        │    │ HTTPS: ✓             │      │
    │  │ CORS: Configured     │    │ Global Locations     │      │
    │  │                      │    │                      │      │
    │  │ Folders:             │    │ Serves to:           │      │
    │  │ ├─ profile-pictures/ │    │ ├─ HTML/CSS/JS       │      │
    │  │ ├─ post-images/      │    │ ├─ Images            │      │
    │  │ └─ uploads/          │    │ └─ Videos            │      │
    │  │                      │    │                      │      │
    │  │ Cost:                │    │ Cost: Varies by      │      │
    │  │ $0.023/GB stored     │    │ transfer out         │      │
    │  └──────────────────────┘    └──────────────────────┘      │
    │           │                           │                     │
    │           └──────────────┬────────────┘                     │
    │                          │                                  │
    │  ┌──────────────────────────────────────┐                  │
    │  │   MongoDB Atlas (Cloud Database)     │                  │
    │  ├──────────────────────────────────────┤                  │
    │  │ Cluster: linkup-production           │                  │
    │  │ Type: Shared Cluster (M0 Free/M5)   │                  │
    │  │ Region: us-east-1                    │                  │
    │  │ Replicas: 3 (High Availability)     │                  │
    │  │ Backup: Daily snapshots              │                  │
    │  │ Encryption: At Rest & In Transit     │                  │
    │  │                                      │                  │
    │  │ Collections:                         │                  │
    │  │ ├─ users                             │                  │
    │  │ ├─ posts                             │                  │
    │  │ ├─ comments                          │                  │
    │  │ ├─ chats                             │                  │
    │  │ ├─ connections                       │                  │
    │  │ ├─ follows                           │                  │
    │  │ └─ profiles                          │                  │
    │  │                                      │                  │
    │  │ Connection: EC2 Backend connects     │                  │
    │  │ via Mongoose ORM                     │                  │
    │  └──────────────────────────────────────┘                  │
    │                                                             │
    ╚═════════════════════════════════════════════════════════════╝
         │
         ▼
    ╔═════════════════════════════════════════════════════════════╗
    ║              📊 MONITORING & LOGGING                         ║
    ╠═════════════════════════════════════════════════════════════╣
    │                                                             │
    │  CloudWatch (AWS Monitoring)                              │
    │  ├─ Metrics: CPU, Memory, Disk, Network                   │
    │  ├─ Logs: Application logs, Nginx logs, PM2 logs         │
    │  ├─ Alarms: High CPU, High Memory, API errors            │
    │  └─ Dashboard: Real-time monitoring                       │
    │                                                             │
    │  PM2 Logs (Backend Process Manager)                       │
    │  ├─ Real-time application logs                            │
    │  ├─ Auto-restart on crash                                 │
    │  └─ Process status monitoring                             │
    │                                                             │
    │  Nginx Logs                                                │
    │  ├─ Access logs: /var/log/nginx/access.log               │
    │  ├─ Error logs: /var/log/nginx/error.log                 │
    │  └─ Performance metrics                                    │
    │                                                             │
    ╚═════════════════════════════════════════════════════════════╝
```

---

## 🔄 Data Flow Diagrams

### 1. User Login Flow

```
┌─────────────┐
│   Browser   │
│ (Amplify)   │
└──────┬──────┘
       │ POST /user/login
       │ (username, password)
       ▼
┌───────────────────────────┐
│   Frontend (Next.js)      │
│   - Form validation       │
│   - Axios HTTP client     │
└──────┬────────────────────┘
       │ HTTPS
       ▼
┌──────────────────────────────────────┐
│   Nginx (Reverse Proxy)              │
│   - SSL termination                  │
│   - Request routing                  │
└──────┬───────────────────────────────┘
       │ HTTP (internal)
       ▼
┌──────────────────────────────────────┐
│   Node.js Backend (PM2)              │
│   - Route: POST /user/login          │
│   - Controller: userController       │
│   - Hash password with bcrypt        │
│   - Generate JWT token               │
└──────┬───────────────────────────────┘
       │ Query
       ▼
┌──────────────────────────────────────┐
│   MongoDB Atlas                      │
│   - Find user by email               │
│   - Compare password hash            │
│   - Return user data                 │
└──────┬───────────────────────────────┘
       │ Response: { token, user }
       ▼
┌──────────────────────────────────────┐
│   Browser                            │
│   - Store token in localStorage      │
│   - Redirect to /dashboard           │
│   - Show user profile                │
└──────────────────────────────────────┘
```

### 2. Profile Picture Upload Flow

```
┌──────────────────┐
│   Browser        │
│   (File Input)   │
└────────┬─────────┘
         │ Select image file
         │ Create FormData
         ▼
┌──────────────────────────────────────┐
│   Frontend Component                 │
│   - Show file preview                │
│   - Show upload progress             │
│   - Send to backend                  │
└────────┬─────────────────────────────┘
         │ POST /user/update_profile_pic
         │ Content-Type: multipart/form-data
         │ Body: FormData + file buffer
         ▼
┌──────────────────────────────────────┐
│   Nginx                              │
│   - Receive multipart data           │
│   - Forward to backend               │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Node.js Backend                    │
│   - Multer (memory storage)          │
│   - Validate file type               │
│   - File in req.file.buffer          │
└────────┬─────────────────────────────┘
         │ Call uploadToS3()
         ▼
┌──────────────────────────────────────┐
│   AWS SDK (S3 Client)                │
│   - PutObjectCommand                 │
│   - Upload to S3                     │
│   - ACL: public-read                 │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   S3 Bucket                          │
│   - Store file                       │
│   - Key: profile-pictures/timestamp  │
│   - Generate public URL              │
└────────┬─────────────────────────────┘
         │ Return S3 URL
         ▼
┌──────────────────────────────────────┐
│   Backend Controller                 │
│   - Store S3 URL in MongoDB          │
│   - Update user.profilePicture       │
│   - Return S3 URL to frontend        │
└────────┬─────────────────────────────┘
         │ Response: { profilePicture: URL }
         ▼
┌──────────────────────────────────────┐
│   Frontend                           │
│   - Display image from S3            │
│   - Show success message             │
│   - Update profile view              │
└──────────────────────────────────────┘
```

### 3. Post Creation with Image Flow

```
User creates post with image

┌─────────────────────┐
│  Browser            │
│  - Select image     │
│  - Write caption    │
│  - Click post       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Frontend (Create Post Component)   │
│  - Create FormData                  │
│  - Add image file                   │
│  - Add caption text                 │
│  - Add user token                   │
└────────┬────────────────────────────┘
         │ POST /post/create_post
         │ multipart/form-data
         ▼
┌─────────────────────────────────────┐
│  Backend (Post Controller)          │
│  - Validate user token              │
│  - Validate caption                 │
│  - Upload image to S3               │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   S3 Upload                          │
│   - Store in post-images/ folder     │
│   - Get public URL                   │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   MongoDB                            │
│   - Create post document             │
│   - userId: user ID                  │
│   - caption: text                    │
│   - media: S3 URL                    │
│   - createdAt: timestamp             │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Socket.IO Event (Real-time)        │
│   - Emit new post to all clients     │
│   - Broadcast to followers           │
│   - Update feeds in real-time        │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│   Connected Users                    │
│   - Receive new post event           │
│   - Display in feed                  │
│   - Load image from S3               │
│   - Show in real-time (no refresh)   │
└──────────────────────────────────────┘
```

---

## 🔐 Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│              SECURITY LAYERS                               │
└────────────────────────────────────────────────────────────┘

Layer 1: Transport Security
├─ HTTPS/TLS Encryption
│  └─ Certbot + Let's Encrypt
│     └─ Auto-renewal ✓
├─ Certificate: *.your-domain.com
├─ HTTP → HTTPS Redirect (Nginx)
└─ All data encrypted in transit ✓

Layer 2: API Authentication
├─ JWT Tokens
│  └─ Header: Authorization: Bearer <token>
├─ Token validation on every request
├─ Token expiration (24-48 hours)
└─ Refresh token mechanism ✓

Layer 3: Database Security
├─ MongoDB password-protected
├─ IP whitelisting (EC2 IP)
├─ Encryption at rest ✓
├─ Encryption in transit ✓
└─ Regular backups ✓

Layer 4: AWS IAM Security
├─ EC2 security groups
│  └─ Only necessary ports open
├─ S3 bucket policies
│  └─ Public read, private write
├─ IAM user (not root)
└─ Access keys rotated periodically ✓

Layer 5: Application Security
├─ Input validation
├─ File type validation
├─ File size limits (50MB)
├─ SQL injection prevention (MongoDB)
├─ CORS configured
└─ Rate limiting (optional) ✓

Layer 6: Environment Security
├─ .env file (NOT in git)
│  └─ .gitignore ✓
├─ No hardcoded secrets
├─ AWS secrets stored locally
└─ CI/CD environment variables ✓
```

---

## 📊 Request/Response Cycle

```
REQUEST CYCLE (Step-by-step)

1. User Action
   └─ Click button / Form submission

2. Frontend Processing
   └─ React component state update
   └─ Form validation
   └─ Prepare request data

3. HTTP Request
   └─ Method: GET/POST/PUT/DELETE
   └─ URL: https://your-domain.com/api/endpoint
   └─ Headers: Content-Type, Authorization
   └─ Body: JSON or FormData

4. TLS/SSL Encryption
   └─ HTTPS layer
   └─ Certificate verification

5. Nginx Reverse Proxy
   └─ Receive encrypted request
   └─ Terminate SSL
   └─ Add X-Forwarded-* headers
   └─ Forward to backend (http://127.0.0.1:5000)

6. Node.js Backend
   ├─ Route matching
   ├─ Middleware execution
   │  ├─ CORS check
   │  ├─ Request logging
   │  └─ File upload (multer)
   ├─ JWT validation
   ├─ Controller execution
   ├─ Database query (MongoDB)
   └─ File operations (S3)

7. Database Operations
   ├─ Query execution
   ├─ Data validation
   ├─ Update/Insert/Delete
   └─ Return results

8. S3 Operations (if file upload)
   ├─ Upload file
   ├─ Generate URL
   └─ Return public URL

9. Response Preparation
   ├─ Status code
   ├─ Response headers
   └─ JSON body

10. Nginx (Response)
    ├─ Receive from backend
    ├─ Encrypt with SSL
    └─ Send to client

11. Frontend Processing
    ├─ Receive response
    ├─ Update state
    ├─ Re-render component
    └─ Show result to user

12. User Sees Result
    └─ Success/Error message
    └─ Updated UI
    └─ Navigation (if needed)
```

---

## 🚀 Scaling Architecture (Future)

```
CURRENT (Single EC2):
    Users → Amplify → EC2 (Single) → MongoDB → S3

SCALED (Multiple EC2s):
    Users → Amplify → Load Balancer (ALB)
                            ├─ EC2 #1 (Backend)
                            ├─ EC2 #2 (Backend)
                            ├─ EC2 #3 (Backend)
                            └─ Auto Scaling Group
                                 ↓
                            MongoDB → S3
                            
Benefits:
✓ High Availability
✓ Automatic failover
✓ Load distribution
✓ Easy scaling up/down
✓ 99.99% uptime

Plus:
✓ ElastiCache (Redis) for caching
✓ RDS (MySQL/Postgres) for structured data
✓ DynamoDB for sessions
✓ SNS for notifications
✓ SQS for async tasks
```

---

## 💾 Backup & Disaster Recovery

```
DAILY BACKUP STRATEGY

┌─────────────────────────────┐
│  MongoDB Atlas              │
│  - Daily snapshots          │
│  - 30-day retention         │
│  - Point-in-time restore    │
│  - Automatic backups ✓      │
└─────────────────────────────┘

┌─────────────────────────────┐
│  S3 Versioning              │
│  - File versions preserved  │
│  - Recover deleted files    │
│  - 30-day storage          │
│  - Cost: Low              │
└─────────────────────────────┘

┌─────────────────────────────┐
│  EC2 AMI Snapshots          │
│  - System snapshots         │
│  - Configuration backup     │
│  - Fast recovery            │
└─────────────────────────────┘

┌─────────────────────────────┐
│  Git Repository             │
│  - Code version control     │
│  - Full history             │
│  - Disaster recovery        │
└─────────────────────────────┘

Disaster Recovery:
- RTO: Recovery Time Objective (15-30 min)
- RPO: Recovery Point Objective (1 day)
- Can recover from major failures
```

---

**This is your complete visual reference guide for LinkUp's AWS architecture!**

Use this whenever you need to:
- Understand how data flows
- Explain architecture to others
- Debug connectivity issues
- Plan for scaling
- Understand security layers

