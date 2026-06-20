# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production: serve with nginx
FROM nginx:alpine AS runner
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html
# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# Expose port
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
