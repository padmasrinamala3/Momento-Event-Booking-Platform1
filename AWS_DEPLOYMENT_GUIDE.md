# 🚀 MomentO — AWS Deployment Guide

This guide will walk you through deploying your **MomentO** project to AWS. We will use **AWS Amplify** for your React frontend and **AWS App Runner** for your Express backend.

---

## 🏗️ Phase 1: Deploy the Backend (AWS App Runner)

AWS App Runner is the easiest way to run your Node.js API from your GitHub repository.

1.  **Login to AWS Console**: Go to [App Runner Console](https://console.aws.amazon.com/apprunner).
2.  **Create Service**:
    *   **Source**: Source code repository.
    *   **Connect GitHub**: Connect your GitHub account and select the `Momento-Event-Booking-Platform1` repository.
    *   **Branch**: Select `main`.
    *   **Deployment Settings**: Automatic (this will re-deploy every time you push to GitHub).
3.  **Configure Build**:
    *   **Runtime**: `Nodejs 18` (or 20).
    *   **Build Command**: `cd backend && npm install`.
    *   **Start Command**: `cd backend && node server.js`.
    *   **Port**: `5000`.
4.  **Configure Service**:
    *   **Environment Variables**: Add the following (Copy from your `.env`):
        *   `MONGO_URI`: (Your Atlas URI)
        *   `JWT_SECRET`: `momento_super_secret_key_2025`
        *   `EMAIL_USER`: (Your email)
        *   `EMAIL_PASS`: (Your app password)
        *   `PORT`: `5000`
5.  **Review & Create**: Click **Create & Deploy**. 
    *   *Wait for deployment to finish.* You will get a URL like `https://xxxx.awsapprunner.com`. **Copy this URL.**

---

## 🎨 Phase 2: Deploy the Frontend (AWS Amplify)

1.  **Go to AWS Amplify**: Search for "Amplify" in the AWS Console.
2.  **New App**: Click **Deploy an app**.
3.  **Select Source**: Choose **GitHub**.
4.  **Connect Repo**: Select your `Momento-Event-Booking-Platform1` repository and `main` branch.
5.  **Build Settings**:
    *   Amplify will automatically detect your `amplify.yml` file.
    *   **IMPORTANT**: Under "Environment variables", add:
        *   `REACT_APP_API_URL`: Paste your **App Runner URL** from Phase 1 + `/api`.
        *   *(Example: `https://xxxx.awsapprunner.com/api`)*
6.  **Save & Deploy**: Click **Save and Deploy**. 
    *   Amplify will build your React app and host it on a global CDN.

---

## 🔒 Phase 3: Whitelist AWS on MongoDB Atlas

Your backend needs permission to talk to Atlas from the AWS cloud.

1.  **Go to MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com).
2.  **Network Access**: Click **Network Access** in the left sidebar.
3.  **Add IP Address**:
    *   Click **Add IP Address**.
    *   Click **Allow Access From Anywhere** (IP `0.0.0.0/0`) OR whitelist your specific App Runner outgoing IPs if you want higher security. 
    *   *Note: Using `0.0.0.0/0` is the easiest for your first deployment.*
4.  **Confirm**: Wait for the status to become "Active".

---

## 🏎️ Phase 4: Advanced EC2 Deployment (Alternative)

If you want more control, higher performance, and a single URL for both Frontend and Backend, use an **EC2 Instance (Ubuntu)**.

### 1. Launch Instance
1.  Go to [EC2 Console](https://console.aws.amazon.com/ec2).
2.  **Launch Instance**: 
    *   **AMI**: Ubuntu 22.04 LTS.
    *   **Instance Type**: `t2.micro` (Free Tier) or `t3.small`.
    *   **Security Groups**: Allow **HTTP (80)**, **HTTPS (443)**, and **SSH (22)**.

### 2. Connect & Deploy
Connect to your instance via SSH and run these commands:

```bash
# Clone your repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Make the deployment script executable and run it
chmod +x deploy_ec2.sh
./deploy_ec2.sh
```

### 3. Key Files Explained
-   **`deploy_ec2.sh`**: Automatically installs Node.js, Nginx, and PM2. It builds your React app and starts the backend service.
-   **`momento_nginx.conf`**: Configures Nginx to serve the React `build` folder at the root (`/`) and proxy API requests to the backend (`/api`).

---

## ✅ Final Verification

1.  Open your **AWS Amplify URL** or your **EC2 Public IP**.
2.  Go to the "Contact" or "Login" section.
3.  Try to sign in or send a review.
4.  If everything works, your project is officially live on AWS! 🎉

---

### Need Help? 
If you run into any "Network Error" messages:
- **For App Runner**: Check the **CloudWatch Logs** in your service.
- **For EC2**: Run `pm2 logs momento-backend` to see the backend errors, or `sudo tail -f /var/log/nginx/error.log` for web server issues.

