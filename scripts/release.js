const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class ReleaseManager {
  constructor() {
    this.packagePath = path.join(process.cwd(), 'package.json');
    this.changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  }

  async createRelease(versionType = 'patch', description = '') {
    try {
      console.log('🚀 SSH Portal Release Manager');
      console.log('================================\n');

      // Get current version
      const packageJson = await fs.readJson(this.packagePath);
      const currentVersion = packageJson.version;
      console.log(`📋 Current version: ${currentVersion}`);

      // Calculate new version
      let newVersion;
      if (versionType.match(/^\d+\.\d+\.\d+$/)) {
        newVersion = versionType;
      } else {
        // Use npm version to calculate
        const versionOutput = execSync(`npm version ${versionType} --no-git-tag-version`, { encoding: 'utf8' });
        newVersion = versionOutput.trim().replace('v', '');
      }

      console.log(`🎯 New version: ${newVersion}\n`);

      // Update CHANGELOG.md
      await this.updateChangelog(newVersion, description);
      console.log('📝 Updated CHANGELOG.md');

      // Clean and build
      console.log('🧹 Cleaning previous builds...');
      execSync('npm run clean', { stdio: 'inherit' });

      console.log('📦 Building executable...');
      execSync('npm run build', { stdio: 'inherit' });

      // Verify build
      const exePath = path.join(process.cwd(), 'dist', 'ssh-portal.exe');
      if (!await fs.pathExists(exePath)) {
        throw new Error('Build failed - executable not found');
      }
      console.log('✅ Build successful\n');

      // Git operations
      console.log('📋 Committing changes...');
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "Release v${newVersion}: ${description || 'Release update'}"`, { stdio: 'inherit' });

      console.log('🏷️ Creating git tag...');
      const tagMessage = this.createTagMessage(newVersion, description);
      execSync(`git tag -a "v${newVersion}" -m "${tagMessage}"`, { stdio: 'inherit' });

      console.log('🚀 Pushing to GitHub...');
      execSync('git push origin main', { stdio: 'inherit' });
      execSync(`git push origin "v${newVersion}"`, { stdio: 'inherit' });

      console.log('\n✅ Release created successfully!');
      console.log(`🌐 View release: https://github.com/ussdeveloper/ssh-portal/releases/tag/v${newVersion}`);
      console.log('\n📋 Next steps:');
      console.log('1. Go to GitHub Releases page');
      console.log('2. Edit the release notes if needed');
      console.log('3. Upload additional assets if required');
      console.log('4. Publish the release');

    } catch (error) {
      console.error('❌ Release failed:', error.message);
      process.exit(1);
    }
  }

  async updateChangelog(version, description) {
    const date = new Date().toISOString().split('T')[0];
    const changelogEntry = `## [${version}] - ${date}

### Added
- Release version ${version}

### Changed
${description || 'Release update'}

`;

    if (await fs.pathExists(this.changelogPath)) {
      const content = await fs.readFile(this.changelogPath, 'utf8');
      const lines = content.split('\n');
      
      // Find where to insert (after header)
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('## [')) {
          insertIndex = i;
          break;
        }
        if (i > 10) { // Safety check
          insertIndex = 3;
          break;
        }
      }

      // Insert new entry
      lines.splice(insertIndex, 0, changelogEntry);
      await fs.writeFile(this.changelogPath, lines.join('\n'));
    }
  }

  createTagMessage(version, description) {
    const nodeVersion = process.version;
    return `SSH Portal v${version}

${description || 'Release update'}

📦 Release Assets:
- ssh-portal.exe - Windows x64 executable

🔧 Built with:
- Node.js ${nodeVersion}
- npm $(npm --version)

See CHANGELOG.md for complete release notes.`;
  }
}

// CLI usage
if (require.main === module) {
  const versionType = process.argv[2] || 'patch';
  const description = process.argv.slice(3).join(' ') || '';
  
  const releaseManager = new ReleaseManager();
  releaseManager.createRelease(versionType, description);
}

module.exports = ReleaseManager;
