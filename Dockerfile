FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./
COPY tsconfig.json drizzle.config.ts ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY src ./src
COPY schema ./schema
COPY sample-data ./sample-data
COPY drizzle ./drizzle

# Build TypeScript
RUN pnpm run build

# Expose application port
EXPOSE 3000

# Run database setup and start application
CMD pnpm db:setup && pnpm start
