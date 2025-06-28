const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Grade mapping (A=5, B=4, C=3, D=2, E=1, F=0)
const grades = {
    'A': 5,
    'B': 4,
    'C': 3,
    'D': 2,
    'E': 1,
    'F': 0
};

async function testImageGeneration() {
    try {
        console.log('Testing image generation...');
        
        // Test stats: A, C, B, D, E, A
        const stats = ['A', 'C', 'B', 'D', 'E', 'A'];
        
        // Create canvas
        const canvas = createCanvas(512, 512);
        const ctx = canvas.getContext('2d');

        // Load base wheel image
        console.log('Loading base wheel image...');
        const baseImage = await loadImage('assets/base_wheel.png');
        
        // Draw base wheel
        ctx.drawImage(baseImage, 0, 0, 512, 512);

        // Calculate radar chart points
        const center = { x: 256, y: 256 };
        const radius = 130;
        const points = [];

        // Convert stats to values
        const values = stats.map(stat => grades[stat.toUpperCase()] || 0);
        console.log('Stat values:', values);

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

        console.log('Radar points calculated:', points);

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
            console.log('Loading overlay image...');
            const overlayImage = await loadImage('assets/overlay.png');
            ctx.drawImage(overlayImage, 0, 0, 512, 512);
            console.log('Overlay applied successfully');
        } catch (error) {
            console.log('No overlay image found, skipping...');
        }

        // Save test image
        const buffer = canvas.toBuffer();
        fs.writeFileSync('test_output.png', buffer);
        console.log('Test image saved as test_output.png');
        
        return true;
    } catch (error) {
        console.error('Error in image generation test:', error);
        return false;
    }
}

testImageGeneration().then(success => {
    if (success) {
        console.log('✅ Image generation test passed!');
    } else {
        console.log('❌ Image generation test failed!');
    }
});