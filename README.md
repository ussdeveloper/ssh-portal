# SSH Portal

A command-line tool for executing commands on remote SSH servers.

## Installation

```bash
npm install
```

# SSH Portal

SSH Portal to narzędzie CLI umożliwiające wykonywanie poleceń na zdalnych serwerach przez SSH. Pozwala na szybkie zarządzanie wieloma połączeniami i automatyzację zadań administracyjnych.

## Funkcje
- Wykonywanie poleceń na zdalnych hostach przez SSH
- Obsługa wielu połączeń i konfiguracji
- Prosta konfiguracja przez plik lub parametry CLI
- Możliwość budowania aplikacji do postaci binarnej (Windows)

## Szybki start
1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom narzędzie:
   ```bash
   npm start -- --host <host> --user <user> --password <haslo> [--port <port>]
   ```
3. Zbuduj wersję binarną (Windows):
   ```bash
   npm run build
   ```
   Plik wykonywalny pojawi się w katalogu `dist/`.

## Skrypty npm
- `npm start` – uruchamia aplikację w trybie produkcyjnym
- `npm run dev` – uruchamia aplikację w trybie deweloperskim
- `npm run build` – buduje aplikację do pliku EXE (Windows, wymaga `pkg`)

## Konfiguracja
Możesz podać dane połączenia przez parametry CLI lub plik konfiguracyjny (`src/config-manager.js`).

**Uwaga:** Domyślne hasło w konfiguracji to `changeme` – zmień je przed użyciem w środowisku produkcyjnym!

## Wymagania
- Node.js >= 20
- Windows (dla wersji EXE)

## Licencja
MIT
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
