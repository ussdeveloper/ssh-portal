@echo off
setlocal enabledelayedexpansion

REM SSH Portal Release Script for Windows
REM Usage: scripts\release.bat [version] [description]

set "VERSION=%~1"
set "DESCRIPTION=%~2"

if "%VERSION%"=="" set "VERSION=patch"
if "%DESCRIPTION%"=="" set "DESCRIPTION=Release update"

echo 🚀 SSH Portal Release Script
echo ================================

REM Get current version from package.json
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set "CURRENT_VERSION=%%i"
echo Current version: %CURRENT_VERSION%

REM Calculate new version
echo %VERSION% | findstr /r "^[0-9]*\.[0-9]*\.[0-9]*$" >nul
if %errorlevel%==0 (
    set "NEW_VERSION=%VERSION%"
) else (
    for /f "tokens=*" %%i in ('npm version %VERSION% --no-git-tag-version') do set "NEW_VERSION=%%i"
    set "NEW_VERSION=!NEW_VERSION:v=!"
)

echo New version: %NEW_VERSION%

REM Update CHANGELOG.md
for /f "tokens=2 delims= " %%i in ('date /t') do set "DATE=%%i"
set "CHANGELOG_ENTRY=## [%NEW_VERSION%] - %DATE%

### Added
- Release version %NEW_VERSION%

### Changed
%DESCRIPTION%

"

echo 📝 Updating CHANGELOG.md...

REM Clean and build
echo 🧹 Cleaning previous builds...
call npm run clean

echo 📦 Building executable...
call npm run build

REM Verify build
if not exist "dist\ssh-portal.exe" (
    echo ❌ Build failed - executable not found
    exit /b 1
)

echo ✅ Build successful

REM Git operations
echo 📋 Committing changes...
git add .
git commit -m "Release v%NEW_VERSION%: %DESCRIPTION%"

echo 🏷️ Creating git tag...
git tag -a "v%NEW_VERSION%" -m "SSH Portal v%NEW_VERSION%

%DESCRIPTION%

📦 Release Assets:
- ssh-portal.exe - Windows x64 executable

🔧 Built with Node.js and npm

See CHANGELOG.md for complete release notes."

echo 🚀 Pushing to GitHub...
git push origin main
git push origin "v%NEW_VERSION%"

echo.
echo ✅ Release v%NEW_VERSION% created successfully!
echo 🌐 View release: https://github.com/ussdeveloper/ssh-portal/releases/tag/v%NEW_VERSION%
echo.
echo Next steps:
echo 1. Go to GitHub Releases page
echo 2. Edit the release notes if needed  
echo 3. Upload additional assets if required
echo 4. Publish the release

pause
