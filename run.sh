#!/bin/bash
echo "Starting Discord Bot..."
while true; do
    node bot.js
    echo "Bot crashed, restarting in 5 seconds..."
    sleep 5
done