# RAGHUU CO Legal Practice Management System - Backend Dockerfile
# 
# @author RAGHUU CO Development Team
# @version 1.0.0
# @since 2025-01-15
# 
# @description Multi-stage Docker build for the backend API server
# with Node.js 18, TypeScript compilation, and production optimization

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY backend/ ./backend/

# Build the application
WORKDIR /app/backend
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/backend/dist ./dist

# Copy environment file template
COPY --from=builder /app/backend/.env.example ./.env.example

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js || exit 1

# Start the application
CMD ["node", "dist/index.js"]