# NexaNova Clean Start Script
# Automatically stops processes on ports 5000 and 3000, then starts servers

Write-Host "🛑 Stopping all existing processes..." -ForegroundColor Yellow

# Stop all Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Stop processes on port 5000
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    foreach ($conn in $port5000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Stopped all processes on port 5000" -ForegroundColor Green
}

# Stop processes on port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    foreach ($conn in $port3000) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "✅ Stopped all processes on port 3000" -ForegroundColor Green
}

Start-Sleep -Seconds 2

Write-Host "`n🚀 Starting NexaNova servers..." -ForegroundColor Cyan
Write-Host "   ⏳ This will take 30-60 seconds to compile..." -ForegroundColor Yellow
Write-Host ""

# Start servers using the dev script
Write-Host "   Backend will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "   Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm run dev

