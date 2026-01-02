FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.server.json ./

# Install ALL dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy server folder and db schema
COPY server ./server
COPY src/db ./src/db

# Build TypeScript
RUN ./node_modules/.bin/tsc -p tsconfig.server.json

# Expose port
EXPOSE 3001

ENV NODE_ENV=production

# Start server
CMD ["node", "dist-server/index.js"]
