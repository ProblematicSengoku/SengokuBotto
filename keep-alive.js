// Keep-alive wrapper for Discord bot
const { spawn } = require('child_process');

function startBot() {
    console.log('Starting Discord bot...');
    
    const bot = spawn('node', ['bot.js'], {
        stdio: ['inherit', 'pipe', 'pipe']
    });

    bot.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    bot.stderr.on('data', (data) => {
        process.stderr.write(data);
    });

    bot.on('close', (code) => {
        console.log(`Bot process exited with code ${code}`);
        console.log('Restarting bot in 3 seconds...');
        setTimeout(startBot, 3000);
    });

    bot.on('error', (err) => {
        console.error('Failed to start bot process:', err);
        setTimeout(startBot, 5000);
    });
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down...');
    process.exit(0);
});

console.log('Discord Bot Keep-Alive Manager Starting...');
startBot();