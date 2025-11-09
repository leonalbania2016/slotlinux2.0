# Build backend
FROM node:18

WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .

# Prisma fix
RUN npm install prisma --save-dev && chmod +x node_modules/.bin/prisma && npx prisma generate

EXPOSE 8080
CMD ["npm", "run", "start"]
