@echo off
echo Fixing Next.js Chunk Loading Errors...
echo.

echo Stopping any running Next.js processes...
taskkill /f /im node.exe 2>nul

echo Cleaning build cache...
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f tsconfig.tsbuildinfo

echo Reinstalling dependencies...
npm install

echo Starting development server...
npm run dev

echo.
echo Chunk loading errors should now be fixed!
pause
