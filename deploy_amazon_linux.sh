#!/bin/bash

# ═════════════════════════════════════════════════════════════════════
#  MomentO — EC2 Automated Deployment Script (Amazon Linux 2023)
# ═════════════════════════════════════════════════════════════════════

set -e # Exit on error

echo "🚀 Starting MomentO Automated Deployment for Amazon Linux..."

# 1. System Preparation
echo "🔄 Updating system packages..."
sudo dnf update -y

# 2. Install Nginx & Git
echo "📦 Installing Nginx and Git..."
sudo dnf install -y nginx git

# 3. Install Node.js 18
if ! command -v node &> /dev/null
then
    echo "📦 Installing Node.js 18..."
    sudo dnf install -y nodejs
fi

# 4. Install PM2 globally
echo "📦 Installing PM2 globally..."
sudo npm install -g pm2

# 5. Directory & Permissions
APP_DIR="/var/www/momento"
echo "📂 Setting up directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 6. Sync Project Files
echo "🚚 Syncing files to $APP_DIR..."
sudo dnf install -y rsync
sudo rsync -av --exclude='.git' --exclude='node_modules' --exclude='build' . $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# 7. Build Frontend
cd $APP_DIR
echo "🏗️ Installing frontend dependencies and building..."
npm install
npm run build

# 8. Setup Backend
cd $APP_DIR/backend
echo "⚙️ Installing backend dependencies..."
npm install

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️ WARNING: backend/.env not found! Creating from example..."
    cp .env.example .env
    echo "❗ PLEASE EDIT $APP_DIR/backend/.env with your MongoDB URI."
fi

echo "🚀 Starting backend with PM2..."
pm2 delete momento-backend 2>/dev/null || true
pm2 start server.js --name "momento-backend"
pm2 save

# 9. Nginx Configuration
echo "🌐 Configuring Nginx..."
# Amazon Linux 2023 Nginx uses /etc/nginx/conf.d/
sudo cp $APP_DIR/momento_nginx.conf /etc/nginx/conf.d/momento.conf

# Remove default server block if it conflicts (often /etc/nginx/nginx.conf has it)
# We might need to comment out the default server in nginx.conf if it's there.
# But usually adding to conf.d is enough if server_name is set.

echo "🔍 Testing Nginx configuration..."
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# 10. Setup PM2 Startup
echo "🔄 Setting up PM2 to start on boot..."
pm2 startup systemd -u $USER --hp $HOME | tail -n 1 | bash
pm2 save

echo "═════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "📍 Access your app at: http://$(curl -s ifconfig.me)"
echo "═════════════════════════════════════════════════════════════════════"
