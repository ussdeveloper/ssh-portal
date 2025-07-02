# SSH Portal

A command-line tool for executing commands on remote SSH servers.

## Installation

```bash
npm install
```

# SSH Portal

A powerful CLI tool for executing commands on remote servers via SSH. Streamlines remote server management with support for multiple connections and automated administrative tasks.

## Features

- Execute commands on remote hosts via SSH
- Support for multiple connections and configurations
- Simple configuration via file or CLI parameters
- Binary build support for Windows deployment
- Secure connection management with configurable authentication
- Cross-platform compatibility
- **AI Assistant Integration** - Perfect for AI agents and automated deployment tasks
- **Server Configuration Automation** - Ideal for infrastructure setup and management
- **Development & Testing** - Excellent for local server deployment and testing scenarios

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ussdeveloper/ssh-portal.git
   cd ssh-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Command Line Interface

```bash
# Basic usage
npm start -- --host <hostname> --user <username> --password <password> [--port <port>]

# Example
npm start -- --host example.com --user admin --password mypassword --port 22
```

### Available Options

- `--host, -h`: SSH hostname or IP address (required)
- `--user, -u`: SSH username (required)
- `--password, -p`: SSH password (required)
- `--port`: SSH port (default: 22)
- `--help`: Show help information

## Scripts

The following npm scripts are available:

- `npm start` - Run the application in production mode
- `npm run dev` - Run the application in development mode
- `npm run build` - Build standalone executable for Windows
- `npm run build:all` - Build executables for all supported platforms
- `npm run clean` - Clean build artifacts
- `npm test` - Run tests (placeholder)

## Building

### Windows Executable

To build a standalone Windows executable:

```bash
npm run build
```

The executable will be generated in the `dist/` directory as `ssh-portal.exe`.

### Multi-platform Build

To build for all supported platforms:

```bash
npm run build:all
```

This will generate executables for:
- Windows (x64)
- Linux (x64)
- macOS (x64)

## Configuration

You can provide connection details in two ways:

1. **CLI Parameters** (recommended for one-time use)
2. **Configuration File** (`src/config-manager.js`)

### Configuration File Format

The configuration manager supports key-value pairs:

```
host=example.com
user=admin
password=changeme
port=22
```

**Security Note:** The default password in configuration is `changeme` - change it before production use!

## AI Assistant & Copilot Integration

SSH Portal is designed to work seamlessly with AI assistants and development copilots, making it an excellent tool for automated server management and deployment tasks.

### 🤖 **AI Agent Integration**

SSH Portal can serve as a **pseudo-SSH-agent** for AI systems, enabling:

- **Automated Deployment** - AI assistants can deploy applications to local or remote servers
- **Server Configuration** - Copilots can configure server settings, install packages, and manage services
- **Infrastructure as Code** - AI can execute infrastructure setup commands and read results
- **Real-time Server Management** - Assistants can monitor, troubleshoot, and maintain server systems

### 🔧 **Use Cases for AI Development**

#### **Local Server Deployment**
```bash
# AI assistant can deploy applications locally
ssh-portal --host localhost --user developer --password mypass "docker-compose up -d"
ssh-portal --host localhost --user developer --password mypass "systemctl restart nginx"
```

#### **Server Configuration Automation**
```bash
# AI can configure server settings
ssh-portal --host server.local --user admin --password pass "apt update && apt install -y nodejs"
ssh-portal --host server.local --user admin --password pass "ufw enable && ufw allow 80,443"
```

#### **Development Environment Setup**
```bash
# Copilot can set up development environments
ssh-portal --host devserver --user dev --password pass "git clone https://github.com/user/project.git"
ssh-portal --host devserver --user dev --password pass "cd project && npm install && npm run build"
```

#### **System Monitoring & Diagnostics**
```bash
# AI can gather system information
ssh-portal --host production --user monitor --password pass "df -h"
ssh-portal --host production --user monitor --password pass "systemctl status nginx"
ssh-portal --host production --user monitor --password pass "tail -n 50 /var/log/nginx/error.log"
```

### 🎯 **AI Assistant Benefits**

- **Command Execution with Results** - AI can execute commands and read the output for decision making
- **Multi-Server Management** - Assistants can manage multiple servers simultaneously
- **Error Handling** - AI can detect errors and take corrective actions based on command output
- **Automation Workflows** - Create complex deployment and configuration workflows
- **Testing Scenarios** - Perfect for testing deployment scripts and server configurations

### 📋 **Integration Examples**

#### **Copilot Server Setup Workflow**
```bash
# 1. Check server status
ssh-portal --host newserver --user root --password pass "uptime && free -h"

# 2. Install required software
ssh-portal --host newserver --user root --password pass "apt update"
ssh-portal --host newserver --user root --password pass "apt install -y docker.io nginx"

# 3. Configure services
ssh-portal --host newserver --user root --password pass "systemctl enable docker nginx"
ssh-portal --host newserver --user root --password pass "systemctl start docker nginx"

# 4. Deploy application
ssh-portal --transfer app.tar.gz /opt/
ssh-portal --host newserver --user root --password pass "cd /opt && tar -xzf app.tar.gz"
```

#### **AI-Driven Troubleshooting**
```bash
# AI can diagnose issues step by step
ssh-portal --host problematic-server --user admin --password pass "systemctl status apache2"
ssh-portal --host problematic-server --user admin --password pass "tail -n 100 /var/log/apache2/error.log"
ssh-portal --host problematic-server --user admin --password pass "netstat -tlnp | grep :80"
```

### 🔒 **Security for AI Integration**

- **Isolated Testing** - Use for development and testing environments
- **Limited Privileges** - Create dedicated users with minimal required permissions
- **Session Logging** - Use `--log` option to track all AI-executed commands
- **Configuration Management** - Store connection details in config files for consistency

### 💡 **Best Practices for AI Usage**

1. **Validate Commands** - AI should verify command syntax before execution
2. **Error Handling** - Implement proper error checking and recovery mechanisms  
3. **Logging** - Always log AI interactions for debugging and audit purposes
4. **Incremental Deployment** - Break complex tasks into smaller, verifiable steps
5. **Rollback Procedures** - Have rollback commands ready for critical operations

## Requirements

- Node.js >= 20.0.0
- SSH access to target servers
- For Windows builds: Windows 10 or later

## Dependencies

- `ssh2` - SSH2 client for Node.js
- `yargs` - Command line argument parsing
- `fs-extra` - Enhanced file system operations

## Development Dependencies

- `pkg` - Package Node.js applications into executables

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

- Always use secure passwords and consider key-based authentication
- Keep your SSH credentials secure and never commit them to version control
- Regularly update dependencies to patch security vulnerabilities

## Support

For support, issues, or feature requests, please open an issue on GitHub.
### File Transfer
```bash
ssh-portal --transfer local_file.txt /home/user/remote_file.txt
```

### Quiet Mode (Filter Welcome Messages)
```bash
ssh-portal --quiet "pwd"
```

### Interactive Mode
```bash
ssh-portal
```

## Configuration File

The configuration file (`.ssh-portal` by default) uses simple key=value format:

```
host=10.3.0.213
port=22
user=sulaco
password=7beber
auto_accept_cert=true
```

## Options

- `--host, -h`: SSH host address
- `--user, -u`: SSH username  
- `--password, -p`: SSH password
- `--port`: SSH port (default: 22)
- `--config, -c`: Configuration file path (default: .ssh-portal)
- `--create-config`: Create configuration template file
- `--log, -l`: Log terminal responses to file
- `--verbose, -v`: Execute each step and report status
- `--transfer, -t`: Transfer file to remote server
- `--quiet, -q`: Suppress SSH welcome messages and system info
- `--help`: Show help
- `--version`: Show version

## Features

- Execute single commands or enter interactive mode
- Transparent terminal response (UTF-8 encoding)
- Support for interactive commands (top, htop, nano, etc.)
- Configuration file support
- Command-line parameter override
- Logging capabilities
- File transfer via SFTP
- Quiet mode to filter SSH welcome messages
- Verbose mode for debugging
- Standalone executable (no Node.js required after build)

## Examples

```bash
# Execute a simple command
ssh-portal "pwd"

# Check disk space
ssh-portal "df -h"

# Run interactive top command
ssh-portal "top"

# With logging
ssh-portal --log server.log "ps aux"

# Verbose mode
ssh-portal --verbose "systemctl status docker"

# File transfer
ssh-portal --transfer document.pdf /home/user/documents/

# Quiet mode (no welcome messages)
ssh-portal --quiet "ls -la"
```
