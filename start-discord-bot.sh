#!/bin/bash

# Kill any existing bot processes
pkill -f "discord-bot.js" 2>/dev/null || true
sleep 2

# Start the bot with output redirection
echo "Starting Discord Bot..."
nohup node discord-bot.js > bot_output.log 2>&1 &
BOT_PID=$!

# Save the PID
echo $BOT_PID > bot_running.pid

# Wait a moment and check if it's running
sleep 3

if ps -p $BOT_PID > /dev/null 2>&1; then
    echo "Discord bot started successfully with PID: $BOT_PID"
    echo "Log file: bot_output.log"
    echo "To stop the bot, run: kill $BOT_PID"
else
    echo "Failed to start Discord bot"
    echo "Check bot_output.log for errors"
    exit 1
fi