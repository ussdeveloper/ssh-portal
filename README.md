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
