FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
COPY src ./src
ENV NODE_ENV=production
RUN npx prisma generate
EXPOSE 8080
CMD ["node", "src/index.js"]