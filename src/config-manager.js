const fs = require('fs-extra');
const path = require('path');

class ConfigManager {
  constructor(configPath = '.ssh-portal') {
    this.configPath = configPath;
  }

  async createTemplate() {
    const template = `# SSH Portal Configuration File
host=example.com
port=22
user=username
password=password
auto_accept_cert=true`;

    await fs.writeFile(this.configPath, template, 'utf8');
  }

  async loadConfig() {
    try {
      if (!await fs.pathExists(this.configPath)) {
        return {};
      }

      const content = await fs.readFile(this.configPath, 'utf8');
      const config = {};

      // Parse simple key=value format
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            
            // Convert boolean strings
            if (value.toLowerCase() === 'true') {
              config[key.trim()] = true;
            } else if (value.toLowerCase() === 'false') {
              config[key.trim()] = false;
            } else if (!isNaN(value)) {
              config[key.trim()] = parseInt(value);
            } else {
              config[key.trim()] = value;
            }
          }
        }
      }

      return config;
    } catch (error) {
      console.error(`Warning: Could not load config file ${this.configPath}:`, error.message);
      return {};
    }
  }
}

module.exports = ConfigManager;
