const express = require('express');
const path = require('path');
const app = express();
// Use port specified by environment variable (for Cloud Run) or default to 3000
const port = process.env.PORT || 3000;

// In-memory state for the door
let isDoorOpen = false;
let doorCloseTimeout = null; // Timeout ID for auto-close
let doorOpenTimestamp = null; // Timestamp when door was opened
const DOOR_OPEN_DURATION_MS = 60 * 1000; // 60 seconds

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// Endpoint to get the current door status and remaining time
app.get('/status', (req, res) => {
  let responseData = { isOpen: isDoorOpen };
  if (isDoorOpen && doorOpenTimestamp) {
    const elapsedMs = Date.now() - doorOpenTimestamp;
    const remainingMs = DOOR_OPEN_DURATION_MS - elapsedMs;
    responseData.remainingTime = Math.max(0, Math.round(remainingMs / 1000)); // Remaining seconds
  }
  console.log('[Server Status] Sending:', responseData); // Log the response data
  res.json(responseData);
});

// Endpoint to set the door status
app.post('/set-status', (req, res) => {
  const { isOpen } = req.body;
  if (typeof isOpen === 'boolean') {
    
    // Clear any existing timeout first
    if (doorCloseTimeout) {
      clearTimeout(doorCloseTimeout);
      doorCloseTimeout = null;
    }

    if (isOpen) {
      // Open the door
      if (!isDoorOpen) { // Log only if state changes to open
        console.log(`Door status set to: Open (for ${DOOR_OPEN_DURATION_MS / 1000}s)`);
      }
      isDoorOpen = true;
      doorOpenTimestamp = Date.now();
      // Set a new timeout to close the door automatically
      doorCloseTimeout = setTimeout(() => {
        console.log('Auto-closing door after timeout.');
        isDoorOpen = false;
        doorOpenTimestamp = null;
        doorCloseTimeout = null; 
      }, DOOR_OPEN_DURATION_MS);
    } else {
      // Close the door
      if (isDoorOpen) { // Log only if state changes to closed
         console.log(`Door status set to: Closed`);
      }
      isDoorOpen = false;
      doorOpenTimestamp = null;
    }

    res.json({ success: true, isOpen: isDoorOpen });
  } else {
    res.status(400).json({ success: false, message: 'Invalid status provided. Send { "isOpen": boolean }' });
  }
});

// Fallback to serve index.html for any other routes (useful for single-page apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  // Updated log message to show the actual port being used
  console.log(`Door status server listening at http://localhost:${port}`);
}); 