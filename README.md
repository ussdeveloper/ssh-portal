# SSH Portal

A command-line tool for executing commands on remote SSH servers.

## Installation

```bash
npm install
```

## Build Executable

```bash
npm run build
```

This will create `ssh-portal.exe` in the `dist` folder.

## Usage

### Basic Usage
```bash
ssh-portal "pwd"
ssh-portal "ls -la"
```

### Create Configuration File
```bash
ssh-portal --create-config
```

### Using Custom Configuration
```bash
ssh-portal --config my-config.conf "whoami"
```

### Command Line Parameters
```bash
ssh-portal --host 10.3.0.213 --user sulaco --password mypass "uptime"
```

### Logging Output
```bash
ssh-portal --log session.log "df -h"
```

### Verbose Mode
```bash
ssh-portal --verbose "systemctl status nginx"
```

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
