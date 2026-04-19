# 🖼️ AWS Console UI - Visual Step-by-Step Guide

**This guide shows exactly what buttons and screens you'll see.**

---

## 🌐 LOGIN & NAVIGATE

### Step 1: AWS Console Login

```
URL: https://console.aws.amazon.com

┌─────────────────────────────────────┐
│   AWS Sign In                       │
├─────────────────────────────────────┤
│                                     │
│  Email address:  [_________________] │
│  Password:       [_________________] │
│                                     │
│  [Sign In] button (yellow/orange)   │
│                                     │
└─────────────────────────────────────┘

✅ Click Sign In
```

---

### Step 2: AWS Console Home

After login, you see:

```
┌─────────────────────────────────────────────┐
│  AWS Console Home                           │
├─────────────────────────────────────────────┤
│                                             │
│  [Search box] "Search services, docs..."   │
│                                             │
│  Recent services:                          │
│  ├─ EC2                                    │
│  ├─ S3                                     │
│  ├─ RDS                                    │
│  └─ ...                                    │
│                                             │
│  Featured services:                        │
│  ├─ Compute                                │
│  ├─ Storage                                │
│  ├─ Database                               │
│  └─ ...                                    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📦 S3 BUCKET CREATION

### Step 3: Navigate to S3

```
┌──────────────────────────────────────┐
│  Search services, docs...            │
│  [________________]                  │
│   ▼ Suggestions:                     │
│   │ S3                               │ ← Click here
│   │ Systems Manager                  │
│   │ Secrets Manager                  │
│   └─ ...                             │
└──────────────────────────────────────┘
```

---

### Step 4: S3 Dashboard

```
┌──────────────────────────────────────────────────┐
│  S3 Dashboard                                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Create bucket] ← Yellow/Orange button          │
│  [Upload] [Create folder] [Copy] [Delete]       │
│                                                  │
│  Buckets:                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ (Empty - no buckets yet)                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 5: Create Bucket Dialog

```
Click [Create bucket] button

┌──────────────────────────────────────────────────┐
│  Create bucket                                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Bucket name *                                   │
│  [linkup-media-bucket-2026____________]         │
│                                                  │
│  AWS Region *                                    │
│  [Dropdown: us-east-1 ▼]  ← Select this         │
│                                                  │
│  Copy settings from existing bucket              │
│  ◯ Do not copy settings                          │
│  ◯ Copy settings from bucket [Dropdown]         │
│                                                  │
│  Scroll down ↓                                   │
│                                                  │
└──────────────────────────────────────────────────┘

↓ Scroll down ↓

│  ┌────────────────────────────────────────────┐  │
│  │ Block Public Access settings               │  │
│  ├────────────────────────────────────────────┤  │
│  │                                            │  │
│  │ Uncheck: "Block all public access"        │  │
│  │ (If you want public read - leave checked  │  │
│  │  if you want private)                     │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Tags (optional)                                 │
│  [+Add tag]                                      │
│                                                  │
│  [Create bucket] ← Orange button at bottom      │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 6: Bucket Created!

```
Success! Page redirects to S3 Dashboard

┌──────────────────────────────────────────────────┐
│  S3 Dashboard                                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  Buckets:                                        │
│  ┌──────────────────────────────────────────┐   │
│  │ 📦 linkup-media-bucket-2026             │   │
│  │    Region: us-east-1                    │   │
│  │    Created: Apr 19, 2026                │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘

✅ Click bucket name to configure it
```

---

### Step 7: Configure S3 Bucket - Enable Versioning

```
Click bucket name: linkup-media-bucket-2026

┌──────────────────────────────────────────────────┐
│  linkup-media-bucket-2026                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  Tabs: [ Objects ] [ Properties ] [ Permissions ]
│                      ↑ Click here                │
│                                                  │
└──────────────────────────────────────────────────┘

After clicking Properties:

┌──────────────────────────────────────────────────┐
│  Properties Tab                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Versioning                                      │
│  ├─ Status: Disabled                            │
│  └─ [Edit] ← Click here                         │
│                                                  │
│  Scroll down to see more options...              │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 8: Enable Versioning Dialog

```
Click [Edit] under Versioning

┌──────────────────────────────────────────────────┐
│  Edit versioning                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Versioning                                      │
│  ◯ Suspend versioning (keep current version)    │
│  ◉ Enable versioning   ← Select this            │
│                                                  │
│  [Save changes] ← Orange button                 │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 9: Configure Public Access

```
Still in bucket page, go to: [ Permissions ] tab

┌──────────────────────────────────────────────────┐
│  Permissions Tab                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  Block public access (bucket settings)          │
│  ├─ Edit ← Click here                           │
│  ├─ Settings: All blocked ✓                     │
│  └─ [Confirm] button visible below              │
│                                                  │
│  Bucket policy                                   │
│  [Empty - will add next]                        │
│                                                  │
│  Bucket ACL                                      │
│  [Private]                                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 10: Edit Block Public Access

```
Click [Edit] under "Block public access"

┌──────────────────────────────────────────────────┐
│  Edit Block public access settings               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ☑ Block all public access                      │
│  ☑ Ignore all public ACLs                       │
│  ☑ Restrict public bucket policies              │
│  ☑ Restrict public access to buckets...         │
│                                                  │
│  Uncheck all ☐ (if you want public read)       │
│  OR keep checked ☑ (if you want private)       │
│                                                  │
│  I acknowledge... checkbox                      │
│  ☑ I acknowledge...  ← Check this               │
│                                                  │
│  [Save changes] ← Orange button                 │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 11: Add Bucket Policy

```
In Permissions tab, find: Bucket policy section

Current state shows:
┌──────────────────────────────────────────────────┐
│  Bucket policy                                   │
│  [Edit] ← Click here                            │
│  The bucket policy is public.                   │
└──────────────────────────────────────────────────┘

Click [Edit]:

┌──────────────────────────────────────────────────┐
│  Edit bucket policy                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  Policy editor:                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ [Paste JSON policy here]                   │ │
│  │                                            │ │
│  │ {                                          │ │
│  │   "Version": "2012-10-17",                 │ │
│  │   "Statement": [{                          │ │
│  │     "Sid": "PublicReadGetObject",         │ │
│  │     "Effect": "Allow",                     │ │
│  │     "Principal": "*",                      │ │
│  │     "Action": "s3:GetObject",             │ │
│  │     "Resource":                            │ │
│  │ "arn:aws:s3:::linkup-media-bucket-2026/*" │ │
│  │   }]                                       │ │
│  │ }                                          │ │
│  │                                            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  [Save changes] ← Orange button                 │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🖥️ EC2 INSTANCE SETUP

### Step 12: Navigate to EC2

```
Search box: "EC2"

┌──────────────────────────────────────────┐
│  Search services, docs...                │
│  [________________]                      │
│   ▼ Suggestions:                         │
│   │ EC2                          ← Click │
│   │ EC2 Image Builder                    │
│   └─ ...                                 │
└──────────────────────────────────────────┘
```

---

### Step 13: EC2 Dashboard

```
┌──────────────────────────────────────────────────┐
│  EC2 Dashboard                                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Launch instances                                │
│  [Launch instances] ← Yellow/Orange button       │
│                                                  │
│  Instances (1 running)                          │
│  └─ (empty or existing instances)               │
│                                                  │
│  Volumes, Security Groups, Key Pairs, etc.      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 14: Launch Instance - Name & Image

```
Click [Launch instances]

┌──────────────────────────────────────────────────┐
│  Launch an instance                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  Name and tags                                   │
│  Instance name: [linkup-backend________]       │
│                                                  │
│  Application and OS Images (Amazon Machine      │
│  Image)                                         │
│  Search for AMI: [ubuntu________]              │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ 🔍 Results:                                │ │
│  │ ┌──────────────────────────────────────┐  │ │
│  │ │ Ubuntu Server 22.04 LTS (ami-xxxxx) │  │ │
│  │ │ AMI ID: ami-xxxxx                    │  │ │
│  │ │ [Select] ← Click here               │  │ │
│  │ └──────────────────────────────────────┘  │ │
│  │ ┌──────────────────────────────────────┐  │ │
│  │ │ Ubuntu Server 24.04 LTS (ami-xxxxx) │  │ │
│  │ └──────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 15: Instance Type & Key Pair

```
Scroll down...

┌──────────────────────────────────────────────────┐
│  Instance type                                   │
│  t2.medium ✓ (3.75 GB memory)  ← Select this   │
│  t2.micro  (1 GB memory - free tier)            │
│  t2.small  (2 GB memory)                        │
│  ...                                             │
│                                                  │
│  Key pair (login)                                │
│  [Create new key pair] ← Click to create new   │
│  OR [Select existing]                           │
│                                                  │
│  Click [Create new key pair]:                   │
│  ┌──────────────────────────────────────────┐   │
│  │  Key pair name: [linkup-key_____]       │   │
│  │  Type: RSA ✓                             │   │
│  │  Format: .pem ✓                          │   │
│  │  [Create key pair] ← Button              │   │
│  └──────────────────────────────────────────┘   │
│  File downloads: linkup-key.pem                │
│  ✅ SAVE THIS FILE SAFELY!                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 16: Network & Security Groups

```
Scroll down...

┌──────────────────────────────────────────────────┐
│  Network settings                                │
│  ├─ VPC: (default) ✓                            │
│  ├─ Subnet: (default) ✓                         │
│  └─ Auto-assign public IP: Enable ✓             │
│                                                  │
│  Firewall (security groups)                      │
│  ◉ Create security group  ← Select this        │
│  ◯ Select existing security group               │
│                                                  │
│  Security group name: [linkup-backend-sg__]    │
│  Description: [Security group for LinkUp...]   │
│                                                  │
│  Inbound security group rules                    │
│  [Add security group rule]  ← Click to add      │
│                                                  │
│  Add these 4 rules:                              │
│  ┌──────────┬──────────┬──────────────────────┐ │
│  │ Type     │ Port     │ Source               │ │
│  ├──────────┼──────────┼──────────────────────┤ │
│  │ SSH      │ 22       │ 0.0.0.0/0            │ │
│  │ HTTP     │ 80       │ 0.0.0.0/0            │ │
│  │ HTTPS    │ 443      │ 0.0.0.0/0            │ │
│  │ Custom   │ 5000     │ 0.0.0.0/0            │ │
│  └──────────┴──────────┴──────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 17: Storage & Launch

```
Scroll down...

┌──────────────────────────────────────────────────┐
│  Configure storage                               │
│  ├─ Size: 20 GB ✓                              │
│  ├─ Type: gp3 ✓                                │
│  └─ Delete on termination: ✓                   │
│                                                  │
│  Advanced details (can skip)                    │
│  ...                                             │
│                                                  │
│  [Launch instance] ← Big yellow/orange button   │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘

After clicking Launch:

┌──────────────────────────────────────────────────┐
│  Success!                                        │
│  Your instances are launching                   │
│  Instance ID: i-1234567890abcdef0                │
│                                                  │
│  [View instances] ← Click to see your instance  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 18: Wait for Instance to Start

```
Click [View instances]

┌──────────────────────────────────────────────────┐
│  Instances                                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  ✓ Instance: linkup-backend                     │
│  ├─ Instance ID: i-1234567890abcdef0            │
│  ├─ State: pending... (wait 2-3 min)           │
│  ├─ Public IPv4: (pending...)                   │
│  └─ (Status checks will appear when ready)      │
│                                                  │
│  Refresh page after 2-3 minutes...              │
│                                                  │
│  Eventually shows:                               │
│  ✓ Instance: linkup-backend                     │
│  ├─ State: running ✓                            │
│  ├─ Public IPv4: 54.123.456.789  ← SAVE THIS   │
│  └─ Status checks: 2/2 passed ✓                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🔗 CONNECT TO EC2 VIA BROWSER

### Step 19: Connect Button

```
With instance selected (linkup-backend):

┌──────────────────────────────────────────────────┐
│  Instance Details                                │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Connect] ← Button (top right)                 │
│  [Stop] [Reboot] [Terminate]                   │
│                                                  │
│  Instance information:                          │
│  ├─ ID: i-1234567890abcdef0                     │
│  ├─ State: running                              │
│  ├─ Public IPv4: 54.123.456.789                │
│  └─ ...                                         │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 20: Connect Tab

```
Click [Connect]

┌──────────────────────────────────────────────────┐
│  Connect to instance                             │
├──────────────────────────────────────────────────┤
│                                                  │
│  [EC2 Instance Connect] ← Click this tab       │
│  [Session Manager]                              │
│  [SSH client]                                   │
│                                                  │
│  EC2 Instance Connect tab content:              │
│  ├─ EC2 Instance Connect provides browser-      │
│  │  based terminal access                       │
│  │                                              │
│  └─ [Connect] ← Click to open terminal         │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 21: Browser Terminal Opens!

```
Click [Connect]

┌──────────────────────────────────────────────────┐
│  [Instance Connect Terminal]                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  ec2-user@ip-172-31-10-101 $                    │
│                                                  │
│  (Blinking cursor - ready for commands!)        │
│                                                  │
│  This is like SSH! Type commands here:         │
│  $ sudo apt update                              │
│  $ sudo apt install nodejs                      │
│  $ ... etc                                      │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 AMPLIFY DEPLOYMENT

### Step 22: Navigate to Amplify

```
Search: "Amplify"

┌──────────────────────────────────────────┐
│  [Search services, docs...]              │
│  [________________]                      │
│   ▼ Suggestions:                         │
│   │ AWS Amplify          ← Click         │
│   │ Amplify Hosting                      │
│   └─ ...                                 │
└──────────────────────────────────────────┘
```

---

### Step 23: Amplify Dashboard

```
┌──────────────────────────────────────────────────┐
│  AWS Amplify                                     │
├──────────────────────────────────────────────────┤
│                                                  │
│  [Create new app] ← Yellow/orange button        │
│                                                  │
│  Recent apps:                                    │
│  ┌──────────────────────────────────────────┐   │
│  │ (empty if first time)                    │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 24: Create App Flow

```
Click [Create new app]

Options:
[ Host web app ]  ← Click this
[ Build serverless backends ]
[ Connect app ]

┌──────────────────────────────────────────────────┐
│  Deploy to Amplify Hosting                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Choose a repository service:                    │
│  ┌──────────┬──────────┬──────────────────────┐ │
│  │ GitHub   │ GitLab   │ Bitbucket            │ │
│  │          │          │                      │ │
│  │ [Connect]│ [Connect]│ [Connect]            │ │
│  └──────────┴──────────┴──────────────────────┘ │
│                                                  │
│  Click [Connect] for your service (GitHub)     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 25: Select Repository

```
After GitHub authentication:

┌──────────────────────────────────────────────────┐
│  Create app - GitHub                             │
├──────────────────────────────────────────────────┤
│                                                  │
│  GitHub account:   [Your Name ▼]               │
│  Repository:       [ LinkUp ▼] ← Select        │
│  Branch:           [ main ▼]                   │
│                                                  │
│  [Next] ← Button                                │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 26: Build Settings

```
After clicking Next:

┌──────────────────────────────────────────────────┐
│  App settings                                    │
├──────────────────────────────────────────────────┤
│                                                  │
│  App name: [linkup________________]             │
│  Environment: [Next.js ▼]  ← Auto-detected    │
│                                                  │
│  Build and test settings:                        │
│  Build command: npm run build                   │
│  Output directory: .next                        │
│  (Leave defaults - usually correct!)            │
│                                                  │
│  Create a new service role?                     │
│  ◉ Yes (creates IAM role automatically)        │
│  ◯ No (use existing role)                      │
│                                                  │
│  Environment variables:                         │
│  [Add environment variable] ← Click             │
│                                                  │
│  [Save and deploy] ← Orange button              │
│  [Cancel]                                        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

### Step 27: Add Environment Variables

```
Click [Add environment variable]

For each variable:

┌──────────────────────────────────────────────────┐
│  Add environment variable                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  Variable name:  [NEXT_PUBLIC_BACKEND_URL__]   │
│  Value:          [http://54.123.456.789:5000]  │
│                                                  │
│  [Add] ← Button                                 │
│                                                  │
│  Variable name:  [NEXT_PUBLIC_SOCKET_URL____]  │
│  Value:          [http://54.123.456.789:5000]  │
│                                                  │
│  [Add] ← Button                                 │
│                                                  │
└──────────────────────────────────────────────────┘

After adding both, you see them listed:
✓ NEXT_PUBLIC_BACKEND_URL = http://54.123.456.789:5000
✓ NEXT_PUBLIC_SOCKET_URL = http://54.123.456.789:5000
```

---

### Step 28: Deploy

```
Click [Save and deploy]

┌──────────────────────────────────────────────────┐
│  Deployment in progress...                       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Build logs:                                     │
│  ├─ Cloning repository...        [⏳ In progress] │
│  ├─ Installing dependencies...   [⏳ In progress] │
│  ├─ Building application...      [⏳ In progress] │
│  ├─ Uploading artifacts...       [⏳ In progress] │
│  ├─ Deploying to CDN...          [⏳ In progress] │
│  └─ Finalizing deployment...     [⏳ In progress] │
│                                                  │
│  Deployment domain:                              │
│  https://main.dxxxxxxxxxxxxx.amplify.app        │
│                                                  │
│  Wait 5-10 minutes for deployment to complete   │
│                                                  │
└──────────────────────────────────────────────────┘

After deployment completes:

┌──────────────────────────────────────────────────┐
│  Deployment successful! ✓                        │
├──────────────────────────────────────────────────┤
│                                                  │
│  [✓] Deployment completed successfully          │
│                                                  │
│  Domain:                                         │
│  https://main.dxxxxxxxxxxxxx.amplify.app        │
│                                                  │
│  [View app] ← Button to see your app            │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## ✅ FINAL CHECKS

### What You Should See:

```
✅ S3 Dashboard shows: linkup-media-bucket-2026

✅ EC2 Dashboard shows:
   └─ Instance: linkup-backend (running)
      └─ Public IPv4: 54.123.456.789

✅ Browser terminal open with $ prompt

✅ Amplify Dashboard shows: Deployment successful
   └─ Domain: https://main.dxxxxxxxxxxxxx.amplify.app

✅ Visiting Amplify domain shows LinkUp home page
```

---

**🎉 You're done! LinkUp is now live on AWS using only the Console UI!**

