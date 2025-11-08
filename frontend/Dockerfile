# --- Stage 1: Build the React app ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy all project files
COPY . .

# Explicitly inject Render environment variable
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build React app for production
RUN npm run build


# --- Stage 2: Serve with NGINX ---
FROM nginx:stable-alpine

# Copy built files to NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port for Render
EXPOSE 4173

# Run NGINX
CMD ["nginx", "-g", "daemon off;"]
