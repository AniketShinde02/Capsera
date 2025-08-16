@echo off
REM Maintenance Helper Script for CaptionCraft (Windows)

echo 🔧 CaptionCraft Maintenance Helper
echo ==================================

if "%1"=="changelog" (
    echo 📝 Opening changelog for editing...
    start "" "docs\new_features.md"
) else if "%1"=="api-docs" (
    echo 🔌 Opening API documentation...
    start "" "docs\API_DOCUMENTATION.md"
) else if "%1"=="troubleshooting" (
    echo 🛠️ Opening troubleshooting guide...
    start "" "docs\TROUBLESHOOTING.md"
) else if "%1"=="env-vars" (
    echo ⚙️ Opening environment variables...
    start "" "docs\env.example"
) else if "%1"=="deployment" (
    echo 🚀 Opening deployment guides...
    start "" "VERCEL_DEPLOYMENT_GUIDE.md"
) else if "%1"=="maintenance" (
    echo 📚 Opening maintenance guide...
    start "" "docs\MAINTENANCE_GUIDE.md"
) else if "%1"=="all" (
    echo 📚 Opening all documentation files...
    start "" "docs\"
    start "" "README.md"
    start "" "VERCEL_DEPLOYMENT_GUIDE.md"
) else (
    echo Usage: maintenance-helper.bat [changelog^|api-docs^|troubleshooting^|env-vars^|deployment^|maintenance^|all]
    echo.
    echo Available options:
    echo   changelog      - Open feature changelog for updates
    echo   api-docs       - Open API documentation
    echo   troubleshooting - Open troubleshooting guide
    echo   env-vars       - Open environment variables template
    echo   deployment     - Open deployment guides
    echo   maintenance    - Open this maintenance guide
    echo   all            - Open all documentation files
)
