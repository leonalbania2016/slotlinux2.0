FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy app files
COPY . .

# Run Prisma setup at build time
RUN npx prisma generate

# Expose API port
EXPOSE 8080

# Run migrations automatically when container starts
CMD npx prisma migrate deploy && npm start
