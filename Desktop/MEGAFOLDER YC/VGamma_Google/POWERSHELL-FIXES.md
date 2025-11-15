# PowerShell Troubleshooting Guide

## 🔧 Common PowerShell Errors & Fixes

### Error 1: "Execution Policy" Error

**Error Message:**
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Fix:**
```powershell
# Check current policy
Get-ExecutionPolicy

# Set execution policy (choose one):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# OR for temporary fix:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

---

### Error 2: "npm command not found"

**Fix:**
```powershell
# Refresh environment variables
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify npm works
npm --version
```

---

### Error 3: Port Already in Use

**Error Message:**
```
Port 3000 is already in use
Port 5173 is already in use
```

**Fix:**
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force

# OR kill all node processes
Get-Process node | Stop-Process -Force
```

---

### Error 4: Path Too Long Error

**Error Message:**
```
EPERM: operation not permitted
ENAMETOOLONG: name too long
```

**Fix:**
```powershell
# Enable long paths in Windows
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# OR move project to shorter path
# Example: C:\Projects\ai-marketplace
```

---

### Error 5: npm install Fails

**Fix:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall
npm install
```

---

### Error 6: Permission Denied

**Error Message:**
```
EACCES: permission denied
```

**Fix:**
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell icon → "Run as Administrator"

# OR change npm's default directory
mkdir $env:APPDATA\npm
npm config set prefix $env:APPDATA\npm
$env:Path += ";$env:APPDATA\npm"
```

---

### Error 7: "vite" command not found

**Fix:**
```powershell
# Install dependencies first
npm install

# Then run with npx
npx vite

# OR use npm scripts
npm run dev
```

---

## ✅ Complete Setup Commands for PowerShell

```powershell
# 1. Navigate to project directory
cd "C:\Users\Darren Wu\Desktop\MEGAFOLDER YC\VAlpha-1_Google"

# 2. Set execution policy if needed
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Verify Node.js and npm
node --version
npm --version

# 4. Clear any previous installations
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 5. Install dependencies
npm install

# 6. Start development server
npm run dev
```

---

## 🚀 Quick Start (PowerShell)

```powershell
# One-line install and run
npm install; npm run dev

# If that fails, run separately:
npm install
npm run dev
```

---

## 🔍 Diagnostic Commands

```powershell
# Check if Node.js is installed
node --version
npm --version

# Check if ports are available
Test-NetConnection -ComputerName localhost -Port 3000
Test-NetConnection -ComputerName localhost -Port 5173

# List all node processes
Get-Process node -ErrorAction SilentlyContinue

# Check current directory
Get-Location

# List files in current directory
Get-ChildItem
```

---

## 🛠️ Alternative: Use WSL (Windows Subsystem for Linux)

If PowerShell continues to have issues:

```powershell
# Install WSL2
wsl --install

# Restart computer

# Open WSL terminal and run:
cd /mnt/c/Users/Darren\ Wu/Desktop/MEGAFOLDER\ YC/VAlpha-1_Google
npm install
npm run dev
```

---

## 📝 Create Helper Script

Save this as `start.ps1`:

```powershell
# start.ps1
Write-Host "Starting AI Agent Marketplace..." -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start dev server
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev
```

Run it:
```powershell
.\start.ps1
```

---

## 🔥 Nuclear Option (Complete Reset)

If nothing works:

```powershell
# 1. Stop all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clear npm cache
npm cache clean --force

# 3. Remove all node-related folders
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 4. Fresh install
npm install

# 5. Try running
npm run dev
```

---

## 🌐 If Dev Server Doesn't Open Browser

Manually open:
- Vite default: `http://localhost:5173`
- Custom port: `http://localhost:3000`

Check console output for actual URL.

---

## 📊 Check Build Works

```powershell
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🆘 Still Having Issues?

1. **Check antivirus** - May be blocking Node.js
2. **Check firewall** - May be blocking ports
3. **Update Node.js** - Download latest from nodejs.org
4. **Use Command Prompt** instead of PowerShell:
   ```cmd
   npm install
   npm run dev
   ```

---

## 📞 Error Code Reference

| Error Code | Meaning | Fix |
|------------|---------|-----|
| EACCES | Permission denied | Run as Administrator |
| EPERM | Operation not permitted | Check file permissions |
| ENOENT | File not found | Check path, reinstall |
| EEXIST | File already exists | Delete and retry |
| EADDRINUSE | Port in use | Kill process on port |
| ERR_MODULE_NOT_FOUND | Dependency missing | npm install |

---

## ✅ Verify Everything Works

```powershell
# Should see no errors
npm run dev

# Expected output:
#   VITE v5.x.x ready in xxx ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose
```

---

**Need more help?** Check the console output and share the specific error message!

