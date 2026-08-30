# Production Dockerfile for CipherStream Native WebSocket Signaling Gateway
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root and package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/signaling ./apps/signaling
COPY packages ./packages

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --filter @cipherstream/signaling...

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "apps/signaling/src/main.js"]
