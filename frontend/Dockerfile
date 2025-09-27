# Multi-stage build for React frontend
# Stage 1: Build the application
FROM node:18-alpine as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --force

# Copy source code
COPY . .

# Use development environment for Docker builds (override production)
COPY .env.development.docker .env.production

# Build the application (disable ESLint for Docker builds)
RUN DISABLE_ESLINT_PLUGIN=true pnpm run build

# Stage 2: Serve with Caddy
FROM caddy:2-alpine

# Copy built application
COPY --from=build /app/build /usr/share/caddy

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Start Caddy (default command)
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]