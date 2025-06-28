const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const http = require('http');

// Create a simple HTTP server to keep the process alive
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Discord Bot is running!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Keep-alive server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
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
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        const baseImage = await loadImage('assets/base_wheel.png');
        ctx.drawImage(baseImage, 0, 0, 512, 512);

        const center = { x: 256, y: 256 };
        const radius = 130;
        const points = [];

        const values = stats.map(stat => grades[stat.toUpperCase()] || 0);

        for (let i = 0; i < 6; i++) {
            const angle = (360 / 6) * i - 90;
            const angleRad = (angle * Math.PI) / 180;
            const value = values[i];
            const r = (value / 5.0) * radius;
            
            const x = center.x + r * Math.cos(angleRad);
            const y = center.y + r * Math.sin(angleRad);
            points.push({ x, y });
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fill();
        
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 3;
        ctx.stroke();

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
    
    // Send periodic heartbeat
    setInterval(() => {
        console.log(`[${new Date().toISOString()}] Heartbeat: Bot is alive and connected`);
    }, 60000);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith('!stats')) {
        try {
            console.log(`Received stats command from ${message.author.tag}: ${message.content}`);
            
            const content = message.content.slice(6).trim();
            const stats = content.split(',').map(s => s.trim().toUpperCase());

            if (stats.length !== 6) {
                await message.reply('Please provide exactly 6 stats in the format: `!stats A, B, C, D, E, F`');
                return;
            }

            const validGrades = ['A', 'B', 'C', 'D', 'E', 'F'];
            const invalidStats = stats.filter(stat => !validGrades.includes(stat));
            
            if (invalidStats.length > 0) {
                await message.reply(`Invalid grades: ${invalidStats.join(', ')}. Please use only A, B, C, D, E, F.`);
                return;
            }

            console.log('Generating stat wheel...');
            const imageBuffer = await generateStatWheel(stats);
            
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'stat_wheel.png' });
            
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

client.on('disconnect', () => {
    console.log('Bot disconnected, attempting to reconnect...');
});

client.on('reconnecting', () => {
    console.log('Bot reconnecting...');
});

// Handle process signals
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    client.destroy();
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    client.destroy();
    server.close();
    process.exit(0);
});

// Prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Login to Discord
if (!process.env.DISCORD_BOT_TOKEN) {
    console.error('DISCORD_BOT_TOKEN environment variable is required!');
    process.exit(1);
}

console.log('Starting persistent Discord bot...');
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});