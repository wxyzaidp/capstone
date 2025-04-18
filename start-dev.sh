#!/bin/bash

# Get the absolute path to the directory containing this script
# SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
# Use the known absolute path for simplicity here
APP_DIR="/Users/wyxzaid/Desktop/Cursor/Project/capstone/ExacqMobileApp"
# SERVER_DIR="${APP_DIR}/server" # No longer needed

# Use single quotes around paths for osascript compatibility
# SERVER_CMD="cd '${SERVER_DIR}' && echo '--- Starting Node Server ---' && node server.js" # No longer needed
EXPO_CMD="cd '${APP_DIR}' && echo '--- Starting Expo --- ' && npx expo start --clear"

echo "Opening new Terminal tab for Expo..."

# Use osascript -e for each step
# Activate terminal and run the Expo command
osascript -e 'tell application "Terminal" to activate' \
          -e "tell application \"Terminal\" to do script \"${EXPO_CMD}\""

# Remove commands for starting the server and creating the second tab
# sleep 2 # Increase delay slightly to ensure the first command starts
# Tell System Events to create a new tab
# osascript -e 'tell application "System Events" to keystroke "t" using {command down}'
# sleep 2 # Increase delay slightly for the new tab to open and become active
# Run the second command (Expo) in the newly opened tab (which should be frontmost in window 1)
# osascript -e "tell application \"Terminal\" to do script \"${EXPO_CMD}\" in window 1"

echo "Expo launched in new Terminal tab." 

# --- ADDED: Open Server URL in Browser ---
SERVER_URL="https://exacq-server-263977944028.us-central1.run.app"
echo "Opening server base page (${SERVER_URL}) in default browser..."
open "${SERVER_URL}" # Open the base URL
# --- END ADDED --- 