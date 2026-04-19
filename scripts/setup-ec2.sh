#!/bin/bash

# LinkUp Backend Setup Script for EC2
# This script automates the Node.js and backend setup on Ubuntu 22.04

set -e  # Exit on error

echo "🚀 Starting LinkUp Backend Setup on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
echo "📥 Installing Node.js 20 LTS..."
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2
echo "📥 Installing PM2 (Process Manager)..."
sudo npm install -g pm2
pm2 completion install

# Install Git
echo "📥 Installing Git..."
sudo apt install -y git

# Install Nginx
echo "📥 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot (for SSL)
echo "📥 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
echo "📁 Creating app directory..."
mkdir -p ~/apps
cd ~/apps

# Clone repository (user needs to provide token or use SSH key)
# For now, just show instructions
echo ""
echo "📝 Next Steps:"
echo "1. Clone your repository:"
echo "   cd ~/apps"
echo "   git clone https://github.com/yourusername/linkup.git"
echo "2. Setup backend:"
echo "   cd linkup/backend"
echo "   npm install --production"
echo "3. Create .env file with your AWS credentials"
echo "4. Start with PM2:"
echo "   pm2 start server.js --name 'linkup-backend'"
echo "   pm2 save"
echo ""
echo "✅ System setup complete! Ready for LinkUp deployment."
