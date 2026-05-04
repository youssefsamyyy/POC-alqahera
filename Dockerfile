# Stage 1: Build the application
FROM node:20-slim AS build

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the production assets
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create a custom Nginx configuration to handle SPA routing
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
