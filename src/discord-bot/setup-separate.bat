@echo off
echo ========================================
echo CAPSERA DISCORD BOT - SEPARATE SETUP
echo ========================================
echo.

echo Creating separate directory for Discord bot...
cd ..
if not exist "Capsera-bot" mkdir Capsera-bot
cd Capsera-bot

echo.
echo Copying Discord bot files...
if not exist "src" mkdir src
xcopy "D:\Caption generator\src\discord-bot" "src\discord-bot\" /E /I /H /Y

echo.
echo Copying package.json...
copy "D:\Caption generator\package.json" "package.json" /Y

echo.
echo Copying .env file...
copy "D:\Caption generator\.env" ".env" /Y

echo.
echo Renaming package.json to Discord-specific version...
copy "src\discord-bot\package-discord.json" "package.json" /Y

echo.
echo Installing dependencies...
npm install

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Your Discord bot is now in: D:\Capsera-bot\
echo.
echo To run the bot:
echo   cd D:\Capsera-bot
echo   npm run discord:dev
echo.
echo ========================================
pause
