FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate

USER node
EXPOSE 3001

CMD ["node", "src/index.js"]
