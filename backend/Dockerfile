# Use full Node (not Alpine) for Prisma compatibility
FROM node:18

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies (includes @prisma/client if listed)
RUN npm ci

# Copy the rest of your project
COPY . .

# Ensure both prisma & client exist and generate Prisma client
RUN npm install --save-dev prisma @prisma/client && \
    npx prisma generate

# Expose backend port
EXPOSE 8080

# Start your backend
CMD ["npm", "run", "start"]
