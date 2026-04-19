#!/bin/bash

# Deploy LinkUp Backend to EC2
# Usage: ./deploy.sh your-ec2-public-ip your-key.pem

if [ $# -lt 2 ]; then
    echo "Usage: ./deploy.sh <EC2_PUBLIC_IP> <PATH_TO_KEY.PEM>"
    echo "Example: ./deploy.sh 54.123.456.789 ~/my-key.pem"
    exit 1
fi

EC2_IP=$1
KEY_FILE=$2
EC2_USER="ubuntu"

echo "🚀 Deploying LinkUp Backend to EC2..."
echo "📍 Target: $EC2_IP"

# Step 1: Upload files to EC2
echo "📤 Uploading backend files..."
scp -i "$KEY_FILE" -r backend/* "$EC2_USER@$EC2_IP:~/apps/linkup/backend/"

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << 'EOF'
  cd ~/apps/linkup/backend
  npm install --production
  echo "✅ Dependencies installed"
EOF

# Step 3: Restart backend
echo "🔄 Restarting backend server..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << 'EOF'
  pm2 restart linkup-backend || pm2 start server.js --name 'linkup-backend'
  pm2 save
  echo "✅ Backend restarted"
EOF

# Step 4: Verify deployment
echo "🔍 Verifying deployment..."
ssh -i "$KEY_FILE" "$EC2_USER@$EC2_IP" << 'EOF'
  pm2 status
  echo ""
  echo "Backend logs (last 10 lines):"
  pm2 logs linkup-backend --lines 10 --nostream
EOF

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your backend is running at: http://$EC2_IP:5000"
