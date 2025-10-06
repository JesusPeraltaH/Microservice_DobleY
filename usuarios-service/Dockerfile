# Usuarios Service Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Env and port
ENV NODE_ENV=production
ENV PORT=3003
EXPOSE 3003

# Start
CMD ["node", "index.js"]

