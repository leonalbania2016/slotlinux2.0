# --- Stage 1: Build the React app ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (force proper file permissions)
RUN npm ci --no-audit --no-fund && chmod +x node_modules/.bin/vite

# Copy all project files
COPY . .

# Explicitly inject Render environment variable
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Fix permissions again just to be safe
RUN chmod +x node_modules/.bin/*

# Build React app for production
RUN npm run build


# --- Stage 2: Serve with NGINX ---
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Render default static port
EXPOSE 4173

# Launch nginx
CMD ["nginx", "-g", "daemon off;"]
