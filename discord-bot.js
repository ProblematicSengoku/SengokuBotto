const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Keep the process alive
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    client.destroy();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit, just log the error
});

// Grade mapping (A=5, B=4, C=3, D=2, E=1, F=0)
const grades = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'E': 1,
    'F': 0
};

// Stat order (clockwise from top)
const statOrder = ['POWER', 'SPEED', 'RANGE', 'DURABILITY', 'PRECISION', 'POTENTIAL'];

async function generateStatWheel(stats) {
    try {
        // Create canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Load base wheel image
        const baseImage = await loadImage('assets/base_wheel.png');
        
        // Draw base wheel
        ctx.drawImage(baseImage, 0, 0, 512, 512);

        // Calculate radar chart points
        const center = { x: 256, y: 256 };
        const radius = 130;
        const points = [];

        // Convert stats to values
        const values = stats.map(stat => grades[stat.toUpperCase()] || 0);

        // Calculate points for each stat
        for (let i = 0; i < 6; i++) {
            const angle = (360 / 6) * i - 90; // Start from top, go clockwise
            const angleRad = (angle * Math.PI) / 180;
            const value = values[i];
            const r = (value / 5.0) * radius;
            
            const x = center.x + r * Math.cos(angleRad);
            const y = center.y + r * Math.sin(angleRad);
            points.push({ x, y });
        }

        // Draw radar chart
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        
        // Fill the radar chart
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Load and draw overlay if it exists
        try {
            const overlayImage = await loadImage('assets/overlay.png');
            ctx.drawImage(overlayImage, 0, 0, 512, 512);
        } catch (error) {
            console.log('No overlay image found, skipping...');
        }

        return canvas.toBuffer();
    } catch (error) {
        console.error('Error generating stat wheel:', error);
        throw error;
    }
}

client.on('ready', () => {
    console.log(`Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`Bot is in ${client.guilds.cache.size} servers`);
    
    // Keep alive heartbeat
    setInterval(() => {
        console.log(`Heartbeat: ${new Date().toISOString()} - Bot is alive`);
    }, 60000); // Every minute
});

client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if message starts with !stats
    if (message.content.toLowerCase().startsWith('!stats')) {
        try {
            console.log(`Received stats command from ${message.author.tag}: ${message.content}`);
            
            // Parse the stats from the message
            const content = message.content.slice(6).trim(); // Remove "!stats"
            const stats = content.split(',').map(s => s.trim().toUpperCase());

            // Validate we have exactly 6 stats
            if (stats.length !== 6) {
                await message.reply('Please provide exactly 6 stats in the format: `!stats A, B, C, D, E, F`');
                return;
            }

            // Validate all stats are valid grades
            const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
            const invalidStats = stats.filter(stat => !validGrades.includes(stat));
            
            if (invalidStats.length > 0) {
                await message.reply(`Invalid grades: ${invalidStats.join(', ')}. Please use only A, B, C, D, E, F.`);
                return;
            }

            // Generate the stat wheel
            console.log('Generating stat wheel...');
            const imageBuffer = await generateStatWheel(stats);
            
            // Create attachment
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'stat_wheel.png' });
            
            // Create info message
            const statInfo = statOrder.map((stat, index) => `${stat}: ${stats[index]}`).join('\n');
            
            await message.reply({
                content: `**D&D Character Stats:**\n\`\`\`${statInfo}\`\`\``,
                files: [attachment]
            });

            console.log('Stat wheel generated and sent successfully');

        } catch (error) {
            console.error('Error processing stats command:', error);
            await message.reply('An error occurred while generating the stat wheel. Please try again.');
        }
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('Discord client warning:', warning);
});

// Login to Discord
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN environment variable is required!');
    process.exit(1);
}

console.log('Starting Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});