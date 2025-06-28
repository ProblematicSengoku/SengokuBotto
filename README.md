# D&D Stat Wheel Discord Bot

A Discord bot that generates D&D character stat visualization wheels with radar charts and image layering.

## Features

- Generates radar chart visualizations for D&D character stats
- Supports 6 stats: Power, Speed, Range, Durability, Precision, Potential
- Uses grade system: A=5, B=4, C=3, D=2, E=1, F=0
- Layers images for enhanced visual appeal
- Easy Discord command interface

## Usage

Use the bot with the following command format:
```
!stats A, B, C, D, E, F
```

Example:
```
!stats A, C, B, D, E, A
```

This will generate a stat wheel with:
- Power: A (5/5)
- Speed: C (3/5)
- Range: B (4/5)
- Durability: D (2/5)
- Precision: E (1/5)
- Potential: A (5/5)

## Setup

1. Create a Discord bot on the Discord Developer Portal
2. Get your bot token
3. Set the `DISCORD_BOT_TOKEN` environment variable
4. Run the bot with `node bot.js`

## Required Images

Place these images in the `assets/` folder:
- `base_wheel.png` - The base wheel template with stat labels
- `overlay.png` - Optional overlay image (appears on top)

## Dependencies

- discord.js - Discord API wrapper
- canvas - Image generation and manipulation