# Script to kill process on port 5000
Write-Host "🔍 Checking for processes on port 5000..." -ForegroundColor Yellow

$connection = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    
    if ($process) {
        Write-Host "❌ Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
        Write-Host "🛑 Killing process..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Write-Host "✅ Process killed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port 5000 is in use but process not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Port 5000 is free!" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now start the server with: npm run dev" -ForegroundColor Cyan

