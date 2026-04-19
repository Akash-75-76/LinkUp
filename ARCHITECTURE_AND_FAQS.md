# LinkUp AWS Deployment - Architecture & FAQs

## 🏗️ Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        USERS                             │
│                   (Web Browser)                          │
└─────────────────────┬──────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
   ┌────▼────────┐         ┌───────▼───────┐
   │  Amplify    │         │   CloudFront  │
   │  (Frontend) │◄────────│  (CDN) + S3   │
   │  Next.js    │         │  (Images)     │
   │             │         │               │
   │ ✅ Auto     │         │ ✅ Fast       │
   │ ✅ Scalable │         │ ✅ Global     │
   └────┬────────┘         └───────────────┘
        │
   ┌────▼──────────────────────────────┐
   │  Route 53 / Nginx (Domain)        │
   │  (DNS Resolution & Routing)       │
   └────┬──────────────────────────────┘
        │
   ┌────▼──────────────────────────────┐
   │    EC2 Instance (t2.medium)       │
   │  ┌─────────────────────────────┐  │
   │  │  Nginx (Reverse Proxy)      │  │
   │  ├─────────────────────────────┤  │
   │  │  PM2 (Process Manager)      │  │
   │  │  └─ Node.js Server          │  │
   │  │     - /user routes          │  │
   │  │     - /post routes          │  │
   │  │     - /chat routes          │  │
   │  │     - Socket.IO             │  │
   │  └─────────────────────────────┘  │
   │                                   │
   │  ✅ Auto-restart on crash         │
   │  ✅ SSL/HTTPS enabled             │
   │  ✅ Load balancing ready          │
   └────┬──────────────────────────────┘
        │
   ┌────┴──────────────────────────────┐
   │                                   │
┌──▼───────────┐  ┌────────────┐  ┌───▼────────┐
│  MongoDB     │  │  S3 Bucket │  │ CloudWatch │
│  Atlas       │  │  (Media)   │  │  (Logs)    │
│              │  │            │  │            │
│ ✅ Database  │  │ ✅ Images  │  │ ✅ Monitor │
│ ✅ Backup    │  │ ✅ Videos  │  │ ✅ Alerts  │
│ ✅ Replicas  │  │ ✅ Global  │  │            │
└──────────────┘  └────────────┘  └────────────┘
```

---

## 📊 Data Flow

### 1. User Login
```
Browser → Amplify → EC2 Backend → MongoDB
         (Form)    (API Call)    (Query)
         ←─────────←─────────────←
```

### 2. Profile Picture Upload
```
Browser → Amplify → EC2 Backend → S3 Bucket
         (File)    (Process)    (Store)
         ←─────────←─────────────←
         Backend stores S3 URL in MongoDB
```

### 3. View Profile
```
Browser → Amplify → EC2 Backend → MongoDB
         (GET)     (Query)      (User Data)
         ←─────────←─────────────←
         S3 URL from DB
         Browser loads image directly from S3/CloudFront
```

### 4. Real-time Chat
```
Browser ←─────► EC2 Backend
        WebSocket (Socket.IO)
        ←──────────────→
        Duplex connection for real-time messages
```

---

## 💰 Cost Breakdown

### Monthly Estimated Costs

| Service | Usage | Cost |
|---------|-------|------|
| **EC2** | t2.medium (730 hrs) | $30-50 |
| **Amplify** | 50GB bandwidth | $10-20 |
| **S3** | 10GB storage, 100GB transfer | $2-8 |
| **MongoDB Atlas** | M0 Free (or M5 $50) | $0-50 |
| **Data Transfer** | Between services | $5-15 |
| **Miscellaneous** | SSL, Route53, etc | $2-5 |
| **TOTAL** | - | **$50-150/month** |

### Cost Optimization Tips

1. **Use EC2 Spot Instances** (70% cheaper, but can be interrupted)
2. **Enable S3 Intelligent-Tiering** (auto-optimize storage)
3. **Setup AWS Budget Alerts** (avoid overspending)
4. **Use CloudFront for S3** (cheaper data transfer)
5. **Compress images** (reduce S3 storage)
6. **Auto-scale with auto groups** (pay for what you use)

---

## 🔐 Security Considerations

### 1. Environment Variables
```bash
# ✅ DO: Store secrets in .env (NOT in git)
.env (in .gitignore)

# ❌ DON'T: Hardcode credentials
process.env.SECRET_KEY
```

### 2. AWS IAM Best Practices
```
✅ Create specific IAM user for EC2 (not root)
✅ Use S3 bucket policies (not public)
✅ Rotate credentials every 90 days
✅ Enable MFA on AWS account
✅ Use VPC security groups
```

### 3. Backend Security
```javascript
// ✅ Always validate JWT tokens
// ✅ Use HTTPS/SSL
// ✅ Enable CORS only for frontend domain
// ✅ Rate limit API endpoints
// ✅ Validate file uploads
```

### 4. Database Security
```
✅ Use strong MongoDB password
✅ Whitelist EC2 IP in MongoDB Atlas
✅ Enable encryption at rest
✅ Regular backups enabled
```

---

## ❓ Frequently Asked Questions (FAQs)

### Q1: How do I update my backend code after deployment?

**A:** The easiest way is to use git on EC2:
```bash
# SSH into EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Navigate to backend
cd ~/apps/linkup/backend

# Pull latest code
git pull origin main

# Reinstall dependencies (if package.json changed)
npm install --production

# Restart with PM2
pm2 restart linkup-backend
```

Or use the deploy script:
```bash
./scripts/deploy-ec2.sh your-ec2-ip your-key.pem
```

---

### Q2: How do I view backend logs?

**A:** Use PM2:
```bash
# Watch logs in real-time
pm2 logs linkup-backend

# View last 100 lines
pm2 logs linkup-backend --lines 100

# Monitor CPU/Memory
pm2 monit
```

Or use Nginx logs:
```bash
# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

---

### Q3: How do I handle database migrations on EC2?

**A:** Since you're using MongoDB (schema-less), you don't need traditional migrations:
```javascript
// Just update your models/schemas in code
// MongoDB will auto-create new fields

// For breaking changes, use a script:
db.users.updateMany({}, { $set: { newField: defaultValue } })
```

---

### Q4: Can I use a custom domain instead of Amplify URL?

**A:** Yes! Use Route 53 or your domain provider:

1. **In Route 53** (if using AWS):
   ```
   Create A record pointing to Amplify IP
   ```

2. **In Your Domain Provider** (GoDaddy, Namecheap, etc):
   ```
   Create CNAME record pointing to Amplify domain
   your-domain.com → your-domain.amplify.app
   ```

3. **Update SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

### Q5: What happens if my EC2 instance crashes?

**A:** PM2 handles this automatically:

```bash
# PM2 will restart the process
# Check status
pm2 status

# If still down, manually restart
pm2 restart linkup-backend

# Enable auto-restart on system reboot
pm2 startup
pm2 save
```

For high availability, use **Auto Scaling Groups** to automatically launch new instances.

---

### Q6: How do I increase EC2 storage?

**A:** SSH into EC2 and expand volume:
```bash
# Check current disk space
df -h

# If near full, request volume increase in AWS Console:
# EC2 → Volumes → Select volume → Modify volume → Increase size

# Then expand partition (requires restart)
sudo growpart /dev/xvda 1
sudo resize2fs /dev/xvda1
```

---

### Q7: How do I backup my MongoDB?

**A:** MongoDB Atlas handles backups automatically:
```
MongoDB Atlas Console → 
Backup → 
Auto-backup enabled (with daily snapshots)
```

For manual backup:
```bash
# From EC2 or local machine
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/linkup" \
  --out=./backup-$(date +%Y%m%d)

# To restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/linkup" \
  ./backup-20260419
```

---

### Q8: How do I setup continuous deployment (CD)?

**A:** Use GitHub Actions:

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.EC2_KEY }}" > ~/.ssh/deploy.key
          chmod 600 ~/.ssh/deploy.key
          ssh -i ~/.ssh/deploy.key ubuntu@${{ secrets.EC2_IP }} << 'EOF'
            cd ~/apps/linkup/backend
            git pull origin main
            npm install --production
            pm2 restart linkup-backend
          EOF
```

---

### Q9: How do I monitor costs?

**A:** Setup AWS Budgets:
```
AWS Console → 
Budgets → 
Create Budget → 
Set threshold ($100/month) → 
Enable email alerts
```

Or use AWS Cost Explorer:
```
AWS Console → 
Cost Management → 
Cost Explorer →
View costs by service
```

---

### Q10: Can I use a CDN for the backend API (not just S3)?

**A:** Yes, use **CloudFront with EC2**:

1. Create CloudFront distribution
2. Set origin to: `your-domain.com:5000`
3. This caches API responses (be careful with real-time data)
4. Better for static/cacheable endpoints

---

## 🚀 Performance Optimization

### 1. Enable Gzip Compression
```bash
# In Nginx config
gzip on;
gzip_types text/plain application/json;
gzip_min_length 1000;
```

### 2. Setup Connection Pooling
```javascript
// In MongoDB connection
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000
};

mongoose.connect(MONGO_URI, options);
```

### 3. Implement Redis Caching
```bash
# Install Redis on EC2
sudo apt install redis-server

# Use in Node.js
import redis from 'redis';
const client = redis.createClient();

// Cache user profiles for 1 hour
client.setex(`user:${id}`, 3600, JSON.stringify(userData));
```

### 4. Optimize Database Queries
```javascript
// ✅ DO: Use indexes and lean()
const users = await User.find({}).lean();

// ❌ DON'T: Fetch unnecessary fields
const users = await User.find({});

// ✅ DO: Populate selectively
const user = await User.findById(id).populate('profile', 'bio education');
```

---

## 📱 Mobile Deployment (Future)

When ready to deploy mobile app:

1. Build React Native app
2. Deploy to AWS AppStore/PlayStore
3. Update FRONTEND_URL in backend to allow mobile requests
4. Consider API Gateway for better mobile performance

---

## 🛠️ Maintenance Schedule

| Task | Frequency | Command |
|------|-----------|---------|
| Check disk space | Weekly | `df -h` |
| Review logs | Daily | `pm2 logs` |
| Restart services | Monthly | `pm2 restart all` |
| Update packages | Monthly | `npm update` |
| Check certificates | Quarterly | `certbot renew --dry-run` |
| Database backup | Daily | Auto (Atlas) |
| Security patches | As needed | `sudo apt upgrade` |

---

**Need more help? Check AWS documentation or reach out!**
