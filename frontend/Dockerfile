# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Fix permissions just in case (Windows Git issue)
RUN chmod +x ./node_modules/.bin/vite || true

# Build using Node instead of relying on shell execution
RUN node ./node_modules/vite/bin/vite.js build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
