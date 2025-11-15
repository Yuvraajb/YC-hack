# 🚀 Quick Fix for PowerShell

## The Issue

You were in the wrong directory! PowerShell started in your home directory instead of the project directory.

## ✅ **The Solution**

I've created a helper script for you! 

### **Option 1: Use the Helper Script (Easiest)**

```powershell
# Navigate to your project
cd "C:\Users\Darren Wu\Desktop\MEGAFOLDER YC\VAlpha-1_Google"

# Run the helper script
.\start-dev.ps1
```

This script will:
- ✅ Check if Node.js is installed
- ✅ Check if dependencies are installed
- ✅ Kill any processes blocking the ports
- ✅ Start the development server
- ✅ Show helpful information

---

### **Option 2: Manual Commands**

```powershell
# 1. Navigate to project directory
cd "C:\Users\Darren Wu\Desktop\MEGAFOLDER YC\VAlpha-1_Google"

# 2. Install dependencies (if not done)
npm install

# 3. Start dev server
npm run dev
```

---

## 🎯 **What Just Happened**

1. ✅ Fixed the directory issue
2. ✅ Installed 180+ packages successfully
3. ✅ Dev server is now running in the background
4. ✅ Created helper scripts for future runs

---

## 🌐 **Access Your App**

The Vite dev server typically runs on one of these URLs:

- **Primary**: http://localhost:5173
- **Alternative**: http://localhost:3000

**Check your PowerShell output** for the exact URL!

---

## 📝 **If You See "Execution Policy" Error**

```powershell
# Run this command first
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the start script
.\start-dev.ps1
```

---

## 🔥 **Quick Commands Reference**

```powershell
# Navigate to project (always run this first!)
cd "C:\Users\Darren Wu\Desktop\MEGAFOLDER YC\VAlpha-1_Google"

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Stop any node process
Get-Process node | Stop-Process -Force
```

---

## 🎨 **Your App Routes**

Once the server is running, visit:

- **Task Submission**: http://localhost:5173/submit
- **Job Dashboard**: http://localhost:5173/dashboard
- **Agent Marketplace**: http://localhost:5173/marketplace
- **Developer Console**: http://localhost:5173/developer

---

## 🐛 **Still Having Issues?**

Check `POWERSHELL-FIXES.md` for comprehensive troubleshooting!

---

## 💡 **Pro Tip**

Create a Windows shortcut:
1. Right-click on Desktop → New → Shortcut
2. Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Darren Wu\Desktop\MEGAFOLDER YC\VAlpha-1_Google\start-dev.ps1"`
3. Name it: "Start AI Marketplace"
4. Double-click to run anytime!

---

**Your app should be running now! 🎉**

