# AI Agent Marketplace - Development Server Starter
# Run this script with: .\start-dev.ps1

Write-Host "🚀 AI Agent Marketplace - Starting Development Server" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Set location to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📁 Working Directory: " -NoNewline
Write-Host $scriptPath -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js Version: " -NoNewline -ForegroundColor Green
    Write-Host $nodeVersion -ForegroundColor White
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm Version: " -NoNewline -ForegroundColor Green
    Write-Host $npmVersion -ForegroundColor White
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Kill any existing processes on common ports
Write-Host "🔍 Checking for port conflicts..." -ForegroundColor Cyan
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "⚠️  Port 3000 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-Process -Id $port3000.OwningProcess -Force -ErrorAction SilentlyContinue
}

if ($port5173) {
    Write-Host "⚠️  Port 5173 is in use. Attempting to free it..." -ForegroundColor Yellow
    Stop-Process -Id $port5173.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🎯 Starting Development Server..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 The app will open automatically in your browser" -ForegroundColor Cyan
Write-Host "🌐 Or manually visit: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev

