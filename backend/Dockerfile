FROM node:18

WORKDIR /app

COPY package*.json ./

# Install dependencies first
RUN npm install

# Copy project files
COPY . .

# Ensure both prisma & client are present
RUN npm install prisma @prisma/client --save-dev && \
    chmod +x node_modules/.bin/prisma && \
    npx prisma generate

EXPOSE 8080

CMD ["npm", "run", "start"]
