const { Client, GatewayIntentBits, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const express = require('express');

// Create Express app to keep Replit alive
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <h1>D&D Stat Wheel Discord Bot</h1>
        <p>Bot Status: ${client.isReady() ? 'Online' : 'Offline'}</p>
        <p>Bot Tag: ${client.user ? client.user.tag : 'Not logged in'}</p>
        <p>Servers: ${client.guilds ? client.guilds.cache.size : 0}</p>
        <p>Uptime: ${process.uptime().toFixed(0)} seconds</p>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Web server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Grade mapping
const grades = {
    'S.S.S.': 5, 'S.S.': 5, 'S.': 5, 
    'A.+': 5, 'A.-': 5, 'A.': 5,
    'B.+': 4, 'B.-': 4, 'B.': 4,
    'C.+': 3, 'C.-': 3, 'C.': 3,
    'D.+': 2, 'D.-': 2, 'D.': 2,
    'E.+': 1, 'E.-': 1, 'E.': 1,
    'F.': 0
};

const statOrder = ['POWER', 'SPEED', 'RANGE', 'DURABILITY', 'PRECISION', 'POTENTIAL'];

async function generateStatWheel(stats) {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    // First layer: Draw underlay (overlay.png) at the bottom
    try {
        const underlayImage = await loadImage('assets/overlay.png');
        ctx.drawImage(underlayImage, 0, 0, 512, 512);
    } catch (error) {
        console.log('Underlay not found, continuing without it');
    }

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

    // Second layer: Draw red radar chart
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

    // Third layer: Draw base wheel on top
    const baseImage = await loadImage('assets/base_wheel.png');
    ctx.drawImage(baseImage, 0, 0, 512, 512);

    return canvas.toBuffer();
}

client.on('ready', () => {
    console.log(`Discord bot ready! Logged in as ${client.user.tag}`);
    console.log(`Connected to ${client.guilds.cache.size} servers`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().startsWith('!stats')) {
        try {
            const content = message.content.slice(6).trim();
            const stats = content.split(',').map(s => s.trim().toUpperCase());

            if (stats.length !== 6) {
                await message.reply('Please provide exactly 6 stats: `!stats S.S.S., A.+, A.-, A., B., C., D., E., F.`');
                return;
            }

            const validGrades = [
                'S.S.S.', 'S.S.', 'S.', 
                'A.+', 'A.-', 'A.',
                'B.+', 'B.-', 'B.',
                'C.+', 'C.-', 'C.',
                'D.+', 'D.-', 'D.',
                'E.+', 'E.-', 'E.',
                'F.'
            ];
            const invalidStats = stats.filter(stat => !validGrades.includes(stat));
            
            if (invalidStats.length > 0) {
                await message.reply(`Invalid grades: ${invalidStats.join(', ')}. Use grades like: S.S.S., A.+, A.-, A., B., etc.`);
                return;
            }

            // Generate the stat wheel image
            const imageBuffer = await generateStatWheel(stats);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'stat_wheel.png' });
            
            // Combined message: Statistics title with stats and image
            const statsEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Red color to match the radar chart
                .setTitle('__***𝐒𝐭𝐚𝐭𝐢𝐬𝐭𝐢𝐜𝐬***__')
                .setDescription(`**𝐏𝐨𝐰𝐞𝐫:**  *\` ${stats[0]} \`*
**𝐒𝐩𝐞𝐞𝐝:**  *\` ${stats[1]} \`*
**𝐑𝐚𝐧𝐠𝐞:**  *\` ${stats[2]} \`*
**𝐃𝐮𝐫𝐚𝐛𝐢𝐥𝐢𝐭𝐲:**  *\` ${stats[3]} \`*
**𝐏𝐫𝐞𝐜𝐢𝐬𝐢𝐨𝐧:**  *\` ${stats[4]} \`*
**𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥:**  *\` ${stats[5]} \`*`)
                .setImage('attachment://stat_wheel.png');

            await message.channel.send({
                embeds: [statsEmbed],
                files: [attachment]
            });

        } catch (error) {
            console.error('Error:', error);
            await message.reply('Error generating stat wheel. Please try again.');
        }
    }
});

// Start Discord bot
client.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);