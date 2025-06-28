const { spawn } = require('child_process');
const fs = require('fs');

let botProcess = null;
let restartCount = 0;
const maxRestarts = 10;
let isShuttingDown = false;

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    
    // Also write to log file
    fs.appendFileSync('bot-daemon.log', `[${timestamp}] ${message}\n`);
}

function startBot() {
    if (isShuttingDown) return;
    
    log(`Starting Discord bot (attempt ${restartCount + 1})`);
    
    botProcess = spawn('node', ['discord-bot.js'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false
    });

    botProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
        fs.appendFileSync('bot-daemon.log', data);
    });

    botProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
        fs.appendFileSync('bot-daemon.log', data);
    });

    botProcess.on('close', (code, signal) => {
        log(`Bot process closed with code ${code} and signal ${signal}`);
        
        if (!isShuttingDown) {
            restartCount++;
            
            if (restartCount < maxRestarts) {
                log(`Restarting bot in 5 seconds... (${restartCount}/${maxRestarts})`);
                setTimeout(startBot, 5000);
            } else {
                log(`Maximum restart attempts (${maxRestarts}) reached. Stopping daemon.`);
                process.exit(1);
            }
        }
    });

    botProcess.on('error', (err) => {
        log(`Bot process error: ${err.message}`);
        
        if (!isShuttingDown && restartCount < maxRestarts) {
            restartCount++;
            log(`Restarting bot in 10 seconds due to error... (${restartCount}/${maxRestarts})`);
            setTimeout(startBot, 10000);
        }
    });

    // Reset restart count on successful run
    setTimeout(() => {
        if (botProcess && !botProcess.killed) {
            restartCount = 0;
            log('Bot has been running successfully, reset restart counter');
        }
    }, 60000); // 1 minute
}

// Handle shutdown signals
function shutdown() {
    if (isShuttingDown) return;
    
    isShuttingDown = true;
    log('Shutting down bot daemon...');
    
    if (botProcess && !botProcess.killed) {
        botProcess.kill('SIGTERM');
        
        setTimeout(() => {
            if (!botProcess.killed) {
                log('Force killing bot process...');
                botProcess.kill('SIGKILL');
            }
        }, 5000);
    }
    
    setTimeout(() => {
        process.exit(0);
    }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`Uncaught exception in daemon: ${error.message}`);
    log(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled rejection in daemon: ${reason}`);
});

// Start the daemon
log('Discord Bot Daemon starting...');
log(`PID: ${process.pid}`);

// Write daemon PID
fs.writeFileSync('daemon.pid', process.pid.toString());

startBot();

// Keep the daemon alive
setInterval(() => {
    if (!isShuttingDown) {
        log('Daemon heartbeat - still running');
    }
}, 300000); // Every 5 minutes