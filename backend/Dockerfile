# ══════════════════════════════════════════════
#  MomentO Backend — Dockerfile (AWS EC2/ECS)
# ══════════════════════════════════════════════

# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
