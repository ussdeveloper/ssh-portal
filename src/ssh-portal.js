const { Client } = require('ssh2');
const fs = require('fs-extra');
const readline = require('readline');

class SSHPortal {
  constructor(connectionConfig, options = {}) {
    this.config = connectionConfig;
    this.options = options;
    this.client = new Client();
    this.stream = null;
    this.logStream = null;
    this.isConnected = false;
    this.isInteractive = false;
    this.welcomeMessageReceived = false;
    this.outputBuffer = '';
    this.lastOutputTime = 0;

    if (options.logFile) {
      this.setupLogging();
    }
  }

  async setupLogging() {
    try {
      this.logStream = fs.createWriteStream(this.options.logFile, { flags: 'a' });
      this.log(`\n=== SSH Portal Session Started: ${new Date().toISOString()} ===\n`);
    } catch (error) {
      console.error(`Warning: Could not create log file: ${error.message}`);
    }
  }

  log(message) {
    if (this.logStream) {
      this.logStream.write(message);
    }
  }

  verbose(message) {
    if (this.options.verbose) {
      console.log(`[VERBOSE] ${message}`);
    }
  }

  removeDuplicateLines(text) {
    const lines = text.split('\n');
    const uniqueLines = [];
    const seen = new Set();
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        uniqueLines.push(line);
      } else if (!trimmed) {
        uniqueLines.push(line); // Keep empty lines
      }
    }
    
    return uniqueLines.join('\n');
  }

  filterWelcomeMessage(data) {
    // Skip welcome messages in quiet mode or always filter them by default
    if (!this.welcomeMessageReceived) {
      const lines = data.split('\n');
      let filteredLines = [];
      let foundPrompt = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Look for shell prompt patterns - more comprehensive
        if (line.match(/[$#]\s*$/) || 
            line.match(/\w+@\w+.*[$#]\s*$/) || 
            line.includes('@') && line.includes(':~') && line.match(/[$#]/)) {
          foundPrompt = true;
          this.welcomeMessageReceived = true;
          filteredLines.push(line);
          
          // Add remaining lines after prompt is found
          for (let j = i + 1; j < lines.length; j++) {
            filteredLines.push(lines[j]);
          }
          break;
        } else if (this.welcomeMessageReceived || foundPrompt) {
          filteredLines.push(line);
        }
      }
      
      return foundPrompt ? filteredLines.join('\n') : '';
    }
    return data;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.verbose('Connecting to SSH server...');
      
      this.client.on('ready', () => {
        this.verbose('SSH connection established');
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (error) => {
        this.verbose(`SSH connection error: ${error.message}`);
        reject(error);
      });

      this.client.on('end', () => {
        this.verbose('SSH connection ended');
        this.isConnected = false;
      });

      this.client.connect({
        host: this.config.host,
        port: this.config.port,
        username: this.config.user,
        password: this.config.password,
        readyTimeout: 20000,
        algorithms: {
          kex: ['diffie-hellman-group14-sha256', 'diffie-hellman-group16-sha512', 'diffie-hellman-group-exchange-sha256'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
          hmac: ['hmac-sha2-256', 'hmac-sha2-512'],
          compress: ['none']
        }
      });
    });
  }

  async createShell() {
    return new Promise((resolve, reject) => {
      this.verbose('Creating shell session...');
      
      this.client.shell((err, stream) => {
        if (err) {
          this.verbose(`Failed to create shell: ${err.message}`);
          reject(err);
          return;
        }

        this.verbose('Shell session created');
        this.stream = stream;

        // Set UTF-8 encoding
        stream.setEncoding('utf8');
        
        // Handle stream events
        stream.on('close', () => {
          this.verbose('Shell session closed');
          this.isConnected = false;
        });

        stream.on('data', (data) => {
          // Log all output
          this.log(data);
          
          // Always filter welcome messages, regardless of quiet mode
          const filteredData = this.filterWelcomeMessage(data);
          
          // In non-interactive mode, just print the filtered data (avoid duplicates)
          if (!this.isInteractive && filteredData && this.welcomeMessageReceived) {
            process.stdout.write(filteredData);
          }
        });

        resolve(stream);
      });
    });
  }

  async transferFile(localPath, remotePath) {
    try {
      this.verbose(`Transferring file: ${localPath} -> ${remotePath}`);
      
      await this.connect();
      
      return new Promise((resolve, reject) => {
        this.client.sftp((err, sftp) => {
          if (err) {
            this.verbose(`SFTP connection failed: ${err.message}`);
            reject(err);
            return;
          }

          this.verbose('SFTP connection established');
          
          // Check if local file exists
          const fs = require('fs');
          if (!fs.existsSync(localPath)) {
            const error = new Error(`Local file not found: ${localPath}`);
            reject(error);
            return;
          }

          // Transfer the file
          sftp.fastPut(localPath, remotePath, (err) => {
            if (err) {
              this.verbose(`File transfer failed: ${err.message}`);
              reject(err);
            } else {
              this.verbose(`File transferred successfully: ${localPath} -> ${remotePath}`);
              console.log(`File transferred: ${localPath} -> ${remotePath}`);
              resolve();
            }
            
            sftp.end();
            this.client.end();
            if (this.logStream) {
              this.logStream.end();
            }
          });
        });
      });

    } catch (error) {
      this.verbose(`File transfer failed: ${error.message}`);
      throw error;
    }
  }

  isInteractiveCommand(command) {
    const interactiveCommands = [
      'top', 'htop', 'nano', 'vi', 'vim', 'emacs', 'less', 'more', 
      'tail -f', 'watch', 'mc', 'lynx', 'tmux', 'screen', 'man'
    ];
    
    return interactiveCommands.some(cmd => 
      command.startsWith(cmd) || 
      command.includes(' ' + cmd + ' ') ||
      command.endsWith(' ' + cmd)
    );
  }

  async executeCommand(command) {
    try {
      this.verbose(`Executing command: ${command}`);
      
      await this.connect();
      
      // Check if command is interactive
      if (this.isInteractiveCommand(command)) {
        this.verbose('Detected interactive command, using shell mode');
        return this.executeInteractiveCommand(command);
      } else {
        this.verbose('Using exec mode for non-interactive command');
        return this.executeNonInteractiveCommand(command);
      }

    } catch (error) {
      this.verbose(`Command execution failed: ${error.message}`);
      throw error;
    }
  }

  async executeNonInteractiveCommand(command) {
    return new Promise((resolve, reject) => {
      // Use exec for cleaner output without shell prompts
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        let output = '';
        let errorOutput = '';

        stream.on('close', (code, signal) => {
          this.verbose(`Command completed with code: ${code}`);
          
          // Clean the output and remove duplicates
          const lines = output.split('\n');
          const uniqueLines = [...new Set(lines)];
          const cleanLines = uniqueLines.filter(line => {
            const trimmed = line.trim();
            return trimmed && 
                   trimmed !== command && 
                   !this.isWelcomeMessage(trimmed);
          });
          
          // Output only the actual result
          for (const line of cleanLines) {
            console.log(line);
          }
          
          this.client.end();
          if (this.logStream) {
            this.logStream.end();
          }
          
          if (code !== 0) {
            reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
          } else {
            resolve(output);
          }
        });

        stream.on('data', (data) => {
          const text = data.toString();
          output += text;
          this.log(text);
        });

        stream.stderr.on('data', (data) => {
          const text = data.toString();
          errorOutput += text;
          this.log('STDERR: ' + text);
        });

        stream.on('error', (error) => {
          this.client.end();
          if (this.logStream) {
            this.logStream.end();
          }
          reject(error);
        });
      });
    });
  }

  async executeInteractiveCommand(command) {
    const stream = await this.createShell();
    
    return new Promise((resolve, reject) => {
      let commandSent = false;
      let output = '';
      let rl = null;

      const onData = (data) => {
        output += data;
        this.log(data);
        
        // Wait for prompt before sending command
        if (!commandSent && data.includes('$')) {
          setTimeout(() => {
            this.verbose(`Sending interactive command: ${command}`);
            // Set terminal size and disable line wrapping for better display
            stream.write('stty cols 120 rows 30\n');
            setTimeout(() => {
              stream.write(command + '\n');
              commandSent = true;
            }, 200);
          }, 500);
          return;
        }
        
        // For interactive commands, show all output after command is sent
        if (commandSent) {
          // Filter out welcome messages but show interactive output
          const filteredData = this.filterWelcomeMessage(data);
          if (filteredData && this.welcomeMessageReceived) {
            process.stdout.write(filteredData);
          }
        }
      };

      const cleanup = () => {
        this.verbose('Cleaning up interactive command...');
        if (rl) {
          rl.close();
          rl = null;
        }
        stream.removeListener('data', onData);
        
        // Send exit signal to ensure clean termination
        try {
          stream.write('\x03'); // Ctrl+C
          setTimeout(() => {
            stream.write('exit\n'); // Try exit command
          }, 100);
        } catch (e) {
          // Ignore errors during cleanup
        }
        
        setTimeout(() => {
          try {
            stream.end();
            this.client.end();
            if (this.logStream) {
              this.logStream.end();
            }
          } catch (e) {
            // Ignore errors during cleanup
          }
        }, 300);
      };

      stream.on('data', onData);
      
      stream.on('close', () => {
        this.verbose('Interactive stream closed');
        cleanup();
        resolve(output);
      });

      stream.on('error', (error) => {
        this.verbose(`Interactive stream error: ${error.message}`);
        cleanup();
        reject(error);
      });

      // Setup readline for interactive input
      const readline = require('readline');
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      // Forward user input to SSH
      rl.on('line', (input) => {
        if (commandSent && stream.writable) {
          try {
            stream.write(input + '\n');
            this.log('USER INPUT: ' + input + '\n');
          } catch (e) {
            // Stream might be closed
            cleanup();
            resolve(output);
          }
        }
      });

      // Handle Ctrl+C to exit interactive command
      const handleExit = () => {
        console.log('\nExiting interactive command...');
        cleanup();
        setTimeout(() => {
          resolve(output);
          process.exit(0);
        }, 500);
      };

      process.on('SIGINT', handleExit);

      // Auto-cleanup after reasonable timeout for interactive commands
      setTimeout(() => {
        if (commandSent) {
          this.verbose('Interactive command timeout reached');
          cleanup();
          resolve(output);
        }
      }, 300000); // 5 minutes timeout
    });
  }

  isWelcomeMessage(line) {
    const welcomePatterns = [
      'Welcome to Ubuntu',
      'Documentation:',
      'Management:',
      'Support:',
      'System information',
      'System load:',
      'Usage of /',
      'Memory usage:',
      'Swap usage:',
      'Processes:',
      'Users logged in:',
      'IPv4 address',
      'Strictly confined',
      'Expanded Security',
      'updates can be applied',
      'apt list --upgradable',
      'ESM Apps',
      'New release',
      'do-release-upgrade',
      'Last login:'
    ];
    
    return welcomePatterns.some(pattern => line.includes(pattern));
  }

  async startInteractiveMode() {
    try {
      this.isInteractive = true;
      this.verbose('Starting interactive mode...');
      
      await this.connect();
      const stream = await this.createShell();

      // Setup readline for user input
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      });

      // Set better terminal size for interactive mode
      setTimeout(() => {
        stream.write('stty cols 120 rows 30\n');
      }, 1000);

      // Handle user input
      stream.on('data', (data) => {
        // Filter welcome messages if quiet mode is enabled
        const filteredData = this.filterWelcomeMessage(data);
        if (filteredData) {
          process.stdout.write(filteredData);
        }
      });

      // Forward user input to SSH
      rl.on('line', (input) => {
        if (stream.writable) {
          try {
            stream.write(input + '\n');
            this.log(input + '\n');
          } catch (e) {
            console.log('\nConnection lost. Exiting...');
            this.cleanup(rl, stream);
            process.exit(0);
          }
        }
      });

      // Handle Ctrl+C and cleanup
      const handleExit = () => {
        console.log('\nExiting SSH Portal...');
        this.cleanup(rl, stream);
        process.exit(0);
      };

      process.on('SIGINT', handleExit);
      process.on('SIGTERM', handleExit);

      // Keep the connection alive
      return new Promise((resolve) => {
        stream.on('close', () => {
          this.cleanup(rl, stream);
          resolve();
        });

        stream.on('error', (error) => {
          this.verbose(`Interactive stream error: ${error.message}`);
          this.cleanup(rl, stream);
          resolve();
        });
      });

    } catch (error) {
      this.verbose(`Interactive mode failed: ${error.message}`);
      throw error;
    }
  }

  cleanup(rl, stream) {
    try {
      if (rl) {
        rl.close();
      }
      if (stream && stream.writable) {
        stream.end();
      }
      if (this.client && this.isConnected) {
        this.client.end();
      }
      if (this.logStream) {
        this.logStream.end();
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

module.exports = SSHPortal;
