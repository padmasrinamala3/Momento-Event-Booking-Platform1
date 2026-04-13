#!/bin/bash

# ═════════════════════════════════════════════════════════════════════
#  MomentO — EC2 Automated Deployment Script (Ubuntu)
# ═════════════════════════════════════════════════════════════════════

set -e # Exit on error

echo "🚀 Starting MomentO Automated Deployment..."

# 1. System Preparation
echo "🔄 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Nginx & Git (if missing)
echo "📦 Installing Nginx and Git..."
sudo apt-get install -y nginx git

# 3. Install Node.js 18 & PM2
if ! command -v node &> /dev/null
then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "📦 Installing PM2 globally..."
sudo npm install -g pm2

# 4. Directory & Permissions
APP_DIR="/var/www/momento"
echo "📂 Setting up directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 5. Sync Project Files
# Assuming this script is run from the directory where the source code is cloned
echo "🚚 Syncing files to $APP_DIR..."
cp -r . $APP_DIR/

# 6. Build Frontend
cd $APP_DIR
echo "🏗️ Installing frontend dependencies and building..."
npm install
npm run build

# 7. Setup Backend
cd $APP_DIR/backend
echo "⚙️ Installing backend dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️ WARNING: backend/.env not found! Creating from example..."
    cp .env.example .env
    echo "❗ PLEASE EDIT $APP_DIR/backend/.env with your MongoDB URI later."
fi

echo "🚀 Starting backend with PM2..."
pm2 delete momento-backend 2>/dev/null || true
pm2 start server.js --name "momento-backend"
pm2 save

# 8. Nginx Configuration
echo "🌐 Configuring Nginx..."
# Copy the specialized nginx config
sudo cp $APP_DIR/momento_nginx.conf /etc/nginx/sites-available/momento
sudo ln -sf /etc/nginx/sites-available/momento /etc/nginx/sites-enabled/
# Remove default nginx config to avoid conflicts
sudo rm -f /etc/nginx/sites-enabled/default

echo "🔍 Testing Nginx configuration..."
sudo nginx -t
sudo systemctl restart nginx

# 9. Setup PM2 Startup
echo "🔄 Setting up PM2 to start on boot..."
pm2 startup | tail -n 1 | bash
pm2 save

echo "═════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "📍 Access your app at: http://$(curl -s ifconfig.me)"
echo "🔐 Reminder: Setup SSL using Certbot (sudo snap install --classic certbot)"
echo "═════════════════════════════════════════════════════════════════════"
