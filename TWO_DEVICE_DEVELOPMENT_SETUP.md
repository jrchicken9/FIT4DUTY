# 🖥️ Two-Device Development Setup Guide

## 📋 Overview

This guide sets up a **two-device development workflow** where:
- **MacBook**: Development machine (coding, editing)
- **Desktop PC**: Server machine (running app 24/7)
- **GitHub**: Bridge between devices (auto-sync)

## 🎯 Workflow

```
MacBook (Development) → GitHub → Desktop PC (Server)
     ↓                      ↓              ↓
   Code Changes        Auto-Sync      Live App
```

## 🖥️ Desktop PC Setup (Server Machine)

### **Step 1: Install Required Software**
```bash
# Install Node.js (https://nodejs.org/)
# Install Git (https://git-scm.com/)
# Install Cursor (https://cursor.sh/) - Optional
```

### **Step 2: Clone the Repository**
```bash
# Clone your project
git clone https://github.com/jrchicken9/rork-fit4duty.git
cd rork-fit4duty

# Install dependencies
npm install
```

### **Step 3: Configure Environment**
```bash
# Copy .env file from MacBook to Desktop PC
# You'll need to transfer this manually (USB, email, cloud storage)
```

### **Step 4: Edit Auto-Pull Script**
```bash
# Edit the script with your actual project path
# Open: scripts/auto_pull_server.bat (Windows) or scripts/auto_pull_server.sh (Mac/Linux)

# Change this line:
# set PROJECT_DIR=C:\path\to\your\project
# To your actual project path, e.g.:
# set PROJECT_DIR=C:\Users\YourName\Desktop\rork-fit4duty
```

### **Step 5: Start Auto-Pull Server**
```bash
# Windows:
scripts\auto_pull_server.bat

# Mac/Linux:
./scripts/auto_pull_server.sh
```

## 💻 MacBook Setup (Development Machine)

### **Step 1: Use Quick Push Script**
```bash
# After making changes on MacBook, run:
./scripts/quick_push.sh

# This will:
# 1. Show what files changed
# 2. Ask for commit message
# 3. Commit and push to GitHub
# 4. Desktop PC will automatically pull changes
```

### **Step 2: Manual Push (Alternative)**
```bash
# If you prefer manual control:
git add .
git commit -m "Your commit message"
git push origin main
```

## 🔄 How It Works

### **Automatic Sync Process:**
1. **MacBook**: You make code changes
2. **MacBook**: Run `./scripts/quick_push.sh`
3. **GitHub**: Changes are pushed to repository
4. **Desktop PC**: Auto-pull script detects changes (every 30 seconds)
5. **Desktop PC**: Automatically pulls updates and restarts server
6. **Result**: Your app is live with latest changes!

### **Timeline:**
- **0 seconds**: You push from MacBook
- **0-30 seconds**: Desktop PC detects changes
- **30-60 seconds**: Desktop PC pulls and restarts
- **60+ seconds**: App is live with your changes

## 🚀 Usage Examples

### **Example 1: Quick Fix**
```bash
# On MacBook:
# 1. Fix a bug in your code
# 2. Run: ./scripts/quick_push.sh
# 3. Enter: "Fix login bug"
# 4. Done! App updates automatically on desktop
```

### **Example 2: New Feature**
```bash
# On MacBook:
# 1. Add new workout feature
# 2. Test locally
# 3. Run: ./scripts/quick_push.sh
# 4. Enter: "Add new workout tracking feature"
# 5. Feature is live on desktop server!
```

### **Example 3: Multiple Changes**
```bash
# On MacBook:
# 1. Make several changes
# 2. Run: ./scripts/quick_push.sh
# 3. Enter: "Update UI and add new exercises"
# 4. All changes sync to desktop
```

## ⚙️ Configuration Options

### **Check Interval (Desktop PC)**
```bash
# Edit scripts/auto_pull_server.bat or scripts/auto_pull_server.sh
# Change CHECK_INTERVAL=30 to your preferred interval (in seconds)
# Options:
# - 10 seconds: Very responsive, more CPU usage
# - 30 seconds: Balanced (recommended)
# - 60 seconds: Less responsive, less CPU usage
```

### **Server Options (Desktop PC)**
```bash
# In the auto-pull script, you can change:
# npx expo start --tunnel    # Public access
# npx expo start --host 0.0.0.0  # Local network only
# npx expo start --port 8081  # Custom port
```

## 🔧 Troubleshooting

### **Desktop PC Not Updating**
```bash
# Check if auto-pull script is running
# Check internet connection
# Check if GitHub repository is accessible
# Check project directory path in script
```

### **MacBook Push Fails**
```bash
# Check internet connection
# Check GitHub credentials
# Try: git status
# Try: git pull origin main --rebase
```

### **Server Not Starting**
```bash
# Check if Node.js is installed
# Check if dependencies are installed: npm install
# Check .env file is present
# Check port 8081 is not in use
```

## 📱 Testing Your Setup

### **Test 1: Basic Sync**
1. Make a small change on MacBook
2. Push to GitHub
3. Watch desktop PC auto-update
4. Verify change appears in live app

### **Test 2: Server Restart**
1. Make a change that requires server restart
2. Push to GitHub
3. Watch desktop PC restart server
4. Verify app is accessible

### **Test 3: Multiple Updates**
1. Make several quick changes
2. Push each change
3. Verify desktop PC handles multiple updates

## 🎯 Benefits

### **For Development:**
- ✅ **MacBook**: Best development experience
- ✅ **Desktop PC**: Always-on server
- ✅ **Automatic Sync**: No manual deployment
- ✅ **Real-time Updates**: See changes immediately

### **For Demos:**
- ✅ **Always Available**: Desktop PC runs 24/7
- ✅ **Public Access**: Tunnel mode for global access
- ✅ **Instant Updates**: Changes go live quickly
- ✅ **Reliable**: No dependency on MacBook being on

### **For Collaboration:**
- ✅ **Share URL**: Anyone can access your app
- ✅ **Live Demos**: Show real-time changes
- ✅ **Client Access**: Share with clients instantly
- ✅ **Team Testing**: Multiple people can test simultaneously

## 🚀 Next Steps

1. **Set up Desktop PC** with the auto-pull script
2. **Test the workflow** with a small change
3. **Configure your preferences** (check interval, server options)
4. **Start developing** on MacBook with confidence!

Your two-device development setup is ready! 🎉
