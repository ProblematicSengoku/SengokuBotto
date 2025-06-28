# D&D Stat Wheel Discord Bot

## Overview

A Discord bot that generates D&D character stat visualization wheels with radar charts and image layering. The bot processes commands like `!stats A, B, C, D, E, F` and creates visual representations of character stats using a 6-point radar chart system.

## System Architecture

- **Bot Framework**: Discord.js v14
- **Image Processing**: Node.js Canvas API
- **Runtime**: Node.js 20
- **Deployment**: Replit-hosted environment

## Key Components

- **bot.js**: Main Discord bot application with command handling and image generation
- **assets/**: Image assets folder containing base wheel template and overlay images
- **Canvas Integration**: Node.js canvas library for generating radar chart visualizations
- **Discord Command Handler**: Processes `!stats` commands with 6 stat parameters

## Data Flow

1. **Discord Message**: User sends `!stats A, B, C, D, E, F` command
2. **Command Processing**: Bot parses 6 stat grades (A-F scale)
3. **Grade Conversion**: Maps grades to numeric values (A=5, B=4, C=3, D=2, E=1, F=0)
4. **Radar Chart Generation**: Calculates 6 points on radar chart using trigonometry
5. **Image Layering**: Combines base wheel, radar chart overlay, and optional top layer
6. **Discord Response**: Returns generated image with stat breakdown

## External Dependencies

- **discord.js**: Discord API wrapper for bot functionality
- **canvas**: Node.js image generation and manipulation library
- **DISCORD_BOT_TOKEN**: Environment variable required for bot authentication

## Deployment Strategy

The project is set up for deployment on the Replit platform. Specific deployment configurations will be added to the `.replit` file as the project architecture is defined.

**Current deployment approach:**
- Replit-hosted environment
- Configuration through `.replit` file
- Hot-reload development environment

## Changelog

```
Changelog:
- June 26, 2025: Initial setup
- June 26, 2025: Discord bot implementation completed
  - Created bot.js with full command handling
  - Implemented radar chart generation with canvas
  - Added image layering system (base wheel + stats + overlay)
  - Successfully tested image generation
  - Bot authenticated and ready for Discord commands
- June 26, 2025: Updated message formatting with special Unicode characters
  - Added dual-message system (Statistics header + Stats with image)
  - Implemented exact user-specified formatting with bold Unicode text
  - Configured run button to start main.js automatically
- June 26, 2025: Combined Statistics messages into single embed
  - Merged separate "Statistics" header and stats list into one Discord embed
  - Statistics title now appears as embed title with stats and image below
  - Maintained blue sidebar and Unicode formatting
- June 26, 2025: Updated embed sidebar color to match radar chart
  - Changed sidebar color from blue (0x0099FF) to red (0xFF0000)
  - Sidebar now matches the red color used in the radar chart visualization
- June 26, 2025: Restructured image layering order
  - Changed drawing sequence: underlay → red radar chart → base wheel
  - Underlay (overlay.png) now renders behind the red radar chart
  - Base wheel now renders above the red radar chart
- June 26, 2025: Added S-tier rating system
  - Added S, S.S, and S.S.S grades alongside existing A-F system
  - All S-tier grades have same radar chart position as A (maximum value)
  - Updated validation and help messages to include new grades
- June 26, 2025: Implemented stylized grading with accuracy modifiers
  - Added period styling: S.S.S., S.S., S., A., B., C., D., E.
  - Added accuracy modifiers: A.*, A.- (and B-E variants)
  - Accuracy modifiers maintain same chart positions as base grades
  - S.S.S. tier excludes accuracy modifiers as requested
- June 26, 2025: Standardized all grades to use period styling
  - All regular stats now require periods: A., B., C., D., E., F.
  - Removed non-period versions for consistency
  - Complete grade set: S.S.S., S.S., S., A.+, A.-, A., B.+, B.-, B., etc.
- June 26, 2025: Changed accuracy modifier symbol from * to +
  - Updated all positive accuracy modifiers: A.+, B.+, C.+, D.+, E.+
  - Maintained negative accuracy modifiers: A.-, B.-, C.-, D.-, E.-
  - Updated validation and help messages to reflect + symbol
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Next Steps

Since this is a fresh project, the following decisions need to be made:

1. **Technology Stack**: Choose frontend and backend frameworks
2. **Database Solution**: Select appropriate data storage (may include Drizzle ORM with PostgreSQL)
3. **Project Structure**: Establish directory organization
4. **Development Dependencies**: Install necessary packages and tools
5. **Configuration**: Set up proper `.replit` configuration for the chosen stack

The code agent should work with the user to determine the project requirements and implement the appropriate architecture based on those needs.