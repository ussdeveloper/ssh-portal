#!/bin/bash

# SSH Portal Release Script
# Usage: ./scripts/release.sh [version] [description]

set -e

VERSION=${1:-"patch"}
DESCRIPTION=${2:-""}

echo "🚀 SSH Portal Release Script"
echo "================================"

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Calculate new version
if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NEW_VERSION=$VERSION
else
    # Use npm version to bump
    NEW_VERSION=$(npm version $VERSION --no-git-tag-version | sed 's/v//')
fi

echo "New version: $NEW_VERSION"

# Update CHANGELOG.md
DATE=$(date +"%Y-%m-%d")
CHANGELOG_ENTRY="## [$NEW_VERSION] - $DATE

### Added
- Release version $NEW_VERSION

### Changed
$DESCRIPTION

"

# Prepend to CHANGELOG.md after the header
if [ -f "CHANGELOG.md" ]; then
    # Create temp file with new entry
    echo "$CHANGELOG_ENTRY" > temp_changelog.md
    # Add existing content after the first few lines
    tail -n +4 CHANGELOG.md >> temp_changelog.md
    # Replace original with temp
    head -n 3 CHANGELOG.md > CHANGELOG.md.new
    echo "" >> CHANGELOG.md.new
    echo "$CHANGELOG_ENTRY" >> CHANGELOG.md.new
    tail -n +4 CHANGELOG.md >> CHANGELOG.md.new
    mv CHANGELOG.md.new CHANGELOG.md
    rm -f temp_changelog.md
fi

echo "📝 Updated CHANGELOG.md"

# Clean and build
echo "🧹 Cleaning previous builds..."
npm run clean

echo "📦 Building executable..."
npm run build

# Verify build
if [ ! -f "dist/ssh-portal.exe" ]; then
    echo "❌ Build failed - executable not found"
    exit 1
fi

echo "✅ Build successful"

# Git operations
echo "📋 Committing changes..."
git add .
git commit -m "Release v$NEW_VERSION: $DESCRIPTION"

echo "🏷️ Creating git tag..."
git tag -a "v$NEW_VERSION" -m "SSH Portal v$NEW_VERSION

$DESCRIPTION

📦 Release Assets:
- ssh-portal.exe - Windows x64 executable

🔧 Built with:
- Node.js $(node --version)
- npm $(npm --version)

See CHANGELOG.md for complete release notes."

echo "🚀 Pushing to GitHub..."
git push origin main
git push origin "v$NEW_VERSION"

echo ""
echo "✅ Release v$NEW_VERSION created successfully!"
echo "🌐 View release: https://github.com/ussdeveloper/ssh-portal/releases/tag/v$NEW_VERSION"
echo ""
echo "Next steps:"
echo "1. Go to GitHub Releases page"
echo "2. Edit the release notes if needed"
echo "3. Upload additional assets if required"
echo "4. Publish the release"
