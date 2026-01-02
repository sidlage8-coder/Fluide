# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Force development mode for npm ci to install devDependencies
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./
COPY tsconfig.server.json ./

# Install ALL dependencies
RUN npm ci

# Copy server folder and db schema
COPY server ./server
COPY src/db ./src/db

# Build TypeScript
RUN npm run build:server

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist-server ./dist-server

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "dist-server/index.js"]
