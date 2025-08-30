# ========================================
# CAPSERA DISCORD BOT - SEPARATE SETUP (PowerShell)
# ========================================

Write-Host "========================================" -ForegroundColor Green
Write-Host "CAPSERA DISCORD BOT - SEPARATE SETUP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Creating separate directory for Discord bot..." -ForegroundColor Yellow
Set-Location ..
if (-not (Test-Path "Capsera-bot")) {
    New-Item -ItemType Directory -Name "Capsera-bot"
}
Set-Location "Capsera-bot"

Write-Host ""
Write-Host "Copying Discord bot files..." -ForegroundColor Yellow
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Name "src"
}
Copy-Item "D:\Caption generator\src\discord-bot" "src\discord-bot\" -Recurse -Force

Write-Host ""
Write-Host "Copying package.json..." -ForegroundColor Yellow
Copy-Item "D:\Caption generator\package.json" "package.json" -Force

Write-Host ""
Write-Host "Copying .env file..." -ForegroundColor Yellow
Copy-Item "D:\Caption generator\.env" ".env" -Force

Write-Host ""
Write-Host "Renaming package.json to Discord-specific version..." -ForegroundColor Yellow
Copy-Item "src\discord-bot\package-discord.json" "package.json" -Force

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Discord bot is now in: D:\Capsera-bot\" -ForegroundColor Cyan
Write-Host ""
Write-Host "To run the bot:" -ForegroundColor Cyan
Write-Host "  cd D:\Capsera-bot" -ForegroundColor White
Write-Host "  npm run discord:dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to continue..."
