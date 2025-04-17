# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the server's package.json and package-lock.json (if it exists)
COPY server/package*.json ./

# Install ONLY server dependencies
RUN npm install --omit=dev 

# Copy the rest of the server-specific files from the build context
# Assumes the build context is the root ExacqMobileApp directory
COPY server/public ./public
COPY server/server.js ./

# Make port 8080 available (Cloud Run default)
EXPOSE 8080

# Command to run the application
CMD [ "node", "server.js" ] 