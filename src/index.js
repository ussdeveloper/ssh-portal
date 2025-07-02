#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const SSHPortal = require('./ssh-portal');
const ConfigManager = require('./config-manager');
const path = require('path');

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [command] [options]')
  .example('$0 "pwd"', 'Execute pwd command on remote server')
  .example('$0 --quiet "ls -la"', 'Execute ls command without welcome messages')
  .example('$0 --transfer file.txt /remote/path/', 'Transfer file to remote server')
  .example('$0 --create-config', 'Create configuration template')
  .command('$0 [command]', 'Execute command on remote SSH server', (yargs) => {
    yargs.positional('command', {
      describe: 'Command to execute on remote server',
      type: 'string'
    });
  })
  .group(['host', 'user', 'password', 'port'], 'Connection Options:')
  .option('host', {
    type: 'string',
    describe: 'SSH host address (e.g., 192.168.1.100 or server.example.com)'
  })
  .option('user', {
    alias: 'u',
    type: 'string',
    describe: 'SSH username (account name on remote server)'
  })
  .option('password', {
    alias: 'p',
    type: 'string',
    describe: 'SSH password (for authentication)'
  })
  .option('port', {
    type: 'number',
    default: 22,
    describe: 'SSH port number (default: 22)'
  })
  .group(['config', 'create-config'], 'Configuration:')
  .option('config', {
    alias: 'c',
    type: 'string',
    default: '.ssh-portal',
    describe: 'Configuration file path (stores connection settings)'
  })
  .option('create-config', {
    type: 'boolean',
    describe: 'Create configuration template file (with default settings)'
  })
  .group(['transfer'], 'File Operations:')
  .option('transfer', {
    alias: 't',
    type: 'array',
    describe: 'Transfer file to remote server (usage: --transfer local_file remote_path)'
  })
  .group(['log', 'verbose', 'quiet'], 'Output Options:')
  .option('log', {
    alias: 'l',
    type: 'string',
    describe: 'Log terminal responses to file (saves session output)'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    describe: 'Execute each step and report status (detailed output)'
  })
  .option('quiet', {
    alias: 'q',
    type: 'boolean',
    describe: 'Suppress SSH welcome messages and system info (clean output)'
  })
  .help(false)
  .version('1.0.0')
  .wrap(yargs().terminalWidth())
  .showHelpOnFail(false)
  .option('help', {
    alias: 'h',
    type: 'boolean',
    describe: 'Show help'
  })
  .epilog('For more information, visit: https://github.com/ssh-portal')
  .middleware((argv) => {
    // Custom help formatting
    if (argv.help) {
      console.log(`
SSH Portal - Execute commands on remote servers via SSH

Usage: ssh-portal [command] [options]

Connection Options:
  --host              SSH host address (e.g., 192.168.1.100 or server.example.com)
  -u, --user          SSH username (account name on remote server)
  -p, --password      SSH password (for authentication)
  --port              SSH port number (default: 22)

Configuration:
  -c, --config        Configuration file path (stores connection settings, default: .ssh-portal)
  --create-config     Create configuration template file (with default settings)

File Operations:
  -t, --transfer      Transfer file to remote server (usage: --transfer local_file remote_path)

Output Options:
  -l, --log           Log terminal responses to file (saves session output)
  -v, --verbose       Execute each step and report status (detailed output)
  -q, --quiet         Suppress SSH welcome messages and system info (clean output)

Examples:
  ssh-portal "pwd"                              Execute pwd command on remote server
  ssh-portal "|@|ls -l|@|"                      Execute command using alternative delimiter
  ssh-portal --quiet "ls -la"                   Execute ls command without welcome messages
  ssh-portal --transfer file.txt /remote/path/  Transfer file to remote server
  ssh-portal --create-config                    Create configuration template

For more information, visit: https://github.com/ssh-portal
`);
      process.exit(0);
    }
  })
  .argv;

async function main() {
  try {
    const configManager = new ConfigManager(argv.config);

    // Handle --create-config option
    if (argv['create-config']) {
      await configManager.createTemplate();
      console.log(`Configuration template created: ${argv.config}`);
      process.exit(0);
    }

    // Load configuration
    const config = await configManager.loadConfig();
    
    // Override config with command line arguments
    const connectionConfig = {
      host: argv.host || config.host,
      user: argv.user || config.user,
      password: argv.password || config.password,
      port: argv.port || config.port || 22,
      auto_accept_cert: config.auto_accept_cert !== false
    };

    // Validate required parameters
    if (!connectionConfig.host || !connectionConfig.user || !connectionConfig.password) {
      console.error('Error: Missing required connection parameters (host, user, password)');
      console.error('Use --create-config to create a configuration file or provide parameters via command line');
      process.exit(1);
    }

    const options = {
      verbose: argv.verbose || false,
      logFile: argv.log || null,
      quiet: argv.quiet || false
    };

    const sshPortal = new SSHPortal(connectionConfig, options);
    
    // Handle file transfer
    if (argv.transfer && argv.transfer.length === 2) {
      const [localPath, remotePath] = argv.transfer;
      await sshPortal.transferFile(localPath, remotePath);
    } else if (argv.command) {
      // Parse command - handle alternative delimiter |@|command|@|
      let command = argv.command;
      if (command.startsWith('|@|') && command.endsWith('|@|')) {
        command = command.slice(3, -3); // Remove |@| from both ends
      }
      
      // Execute single command and exit
      await sshPortal.executeCommand(command);
    } else {
      // Interactive mode
      console.log('SSH Portal - Interactive mode (Ctrl+C to exit)');
      await sshPortal.startInteractiveMode();
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (argv.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
