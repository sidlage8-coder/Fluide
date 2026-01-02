FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.server.json ./

# Install dependencies
RUN npm ci --omit=dev && npm install typescript tsx

# Copy server folder and db schema
COPY server ./server
COPY src/db ./src/db

# Build TypeScript
RUN npx tsc -p tsconfig.server.json

# Expose port
EXPOSE 3001

ENV NODE_ENV=production

# Start server
CMD ["node", "dist-server/index.js"]
